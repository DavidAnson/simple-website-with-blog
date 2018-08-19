"use strict";

const {redirectToHttps, siteRoot} = require("./config");
const fs = require("fs");
const path = require("path");
const {URL} = require("url");
const express = require("express");
const highlightJs = require("highlight.js");
const lunr = require("lunr");
const MarkdownIt = require("markdown-it");
const pify = require("pify");
const ReactDOMServer = require("react-dom/server");
const RSS = require("rss");
const render = require(`${siteRoot}/render.js`);
const router = express.Router();
const readdir = pify(fs.readdir);
const readFile = pify(fs.readFile);
const markdownIt = new MarkdownIt({
  "highlight": (str, lang) => {
    if (lang && highlightJs.getLanguage(lang)) {
      return highlightJs.highlight(lang, str).value;
    }
    return "";
  }
});

const postsDir = `${siteRoot}/posts`;
const postExtension = /\.json$/;
const postsSortedByCompareDate = [];
const postsSortedByPublishDate = [];
const postsIndexedById = {};
const archivePeriods = [];
let searchIndex = null;
const commonHtmlStopWords =
  "alt br div h1 h2 h3 h4 h5 h6 href img li ol pre src srcset ul".split(" ");

const getPublishedPostFilter = () => {
  const now = Date.now();
  return (post) => {
    const publishDate = post.publishDate.getTime();
    return (publishDate > 0) && (publishDate <= now);
  };
};

// eslint-disable-next-line dot-notation
router["postsLoaded"] = readdir(postsDir).
  then((files) => Promise.all(files.
    filter((file) => postExtension.test(file)).
    map((file) => {
      const id = file.replace(postExtension, "");
      const filePath = path.join(postsDir, file);
      return readFile(filePath, "utf8").
        then((content) => {
          const post = JSON.parse(content);
          post.id = id;
          post.compareDate = new Date(post.contentDate || post.publishDate || 0);
          post.publishDate = new Date(post.publishDate || 0);
          post.contentDate = new Date(post.contentDate || 0);
          return post;
        }).
        then((post) => {
          let promise = Promise.resolve();
          if (post.contentJson) {
            post.contentSearch = JSON.stringify(post.contentJson);
            const contentElements = render.getContentElements(post);
            post.contentHtml = ReactDOMServer.renderToStaticMarkup(contentElements);
            delete post.contentJson;
          } else {
            const htmlFile = `${id}.html`;
            const includesHtmlFile = files.includes(htmlFile);
            const mdFile = `${id}.md`;
            const includesMdFile = files.includes(mdFile);
            if (!includesHtmlFile && !includesMdFile) {
              throw new Error(`Post id "${id}" missing 'contentJson'/${htmlFile}/${mdFile}.`);
            }
            promise = readFile(path.join(postsDir, includesHtmlFile ? htmlFile : mdFile), "utf8").
              then((content) => {
                post.contentSearch = content;
                post.contentHtml = includesHtmlFile ? content : markdownIt.render(content);
              });
          }
          return promise.
            then(() => {
              postsSortedByCompareDate.push(post);
              postsIndexedById[post.id] = post;
            });
        });
    }))).
  then(() => {
    postsSortedByCompareDate.sort((left, right) => (right.compareDate - left.compareDate) ||
      right.id.localeCompare(left.id));
    postsSortedByPublishDate.push(...postsSortedByCompareDate);
    postsSortedByPublishDate.sort((left, right) => (right.publishDate - left.publishDate) ||
      right.id.localeCompare(left.id));
    let lastPeriodValue = 0;
    postsSortedByCompareDate.
      forEach((post) => {
        const postPeriod = new Date(post.compareDate.getFullYear(), post.compareDate.getMonth());
        if (postPeriod.valueOf() !== lastPeriodValue) {
          archivePeriods.push(postPeriod);
          lastPeriodValue = postPeriod.valueOf();
        }
      });
  }).
  then(() => {
    searchIndex = lunr(function Config () {
      this.pipeline.after(lunr.stopWordFilter, lunr.generateStopWordFilter(commonHtmlStopWords));
      this.field("title");
      this.field("contentSearch");
      postsSortedByCompareDate.forEach((post) => {
        post.contentSearch = post.contentSearch.replace(/[\W_]+/g, " ");
        this.add(post);
        delete post.contentSearch;
      });
    });
  });

const renderPosts = (req, res, posts, title, period, query) => {
  const url = new URL(req.originalUrl, "https://example.org/");
  const pageParam = "page";
  const page = url.searchParams.get(pageParam);
  let currIndex = 0;
  if (page) {
    posts.every((post, index) => {
      if (post.id === page) {
        currIndex = index;
        return false;
      }
      return true;
    });
  }
  const pageSize = 10;
  const prevIndex = currIndex - pageSize;
  const nextIndex = currIndex + pageSize;
  let prevLink = null;
  if (currIndex > 0) {
    if (prevIndex > 0) {
      url.searchParams.set(pageParam, posts[prevIndex].id);
    } else {
      url.searchParams.delete(pageParam);
    }
    prevLink = `${url.pathname}${url.search}`;
  }
  let nextLink = null;
  if (nextIndex < posts.length) {
    url.searchParams.set(pageParam, posts[nextIndex].id);
    nextLink = `${url.pathname}${url.search}`;
  }
  const elements = render.getHtmlElements({
    "posts": posts.slice(currIndex, nextIndex),
    "archives": archivePeriods,
    title,
    period,
    query,
    prevLink,
    nextLink
  });
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(elements);
  const body = `<!DOCTYPE html>${staticMarkup}`;
  res.send(body);
};

router.get("/", (req, res) => {
  const posts = postsSortedByCompareDate.filter(getPublishedPostFilter());
  return renderPosts(req, res, posts);
});

router.get("/post/:id", (req, res, next) => {
  const posts = postsSortedByCompareDate.filter((post) => post.id === req.params.id);
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(req, res, posts, render.getTitle(posts[0]));
});

router.get("/archive/:period(\\d{6})", (req, res, next) => {
  const year = parseInt(req.params.period.slice(0, 4), 10);
  const month = parseInt(req.params.period.slice(4, 6), 10) - 1;
  const posts = postsSortedByCompareDate.
    filter(getPublishedPostFilter()).
    filter((post) => (post.compareDate.getFullYear() === year) &&
      (post.compareDate.getMonth() === month));
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(req, res, posts, null, new Date(year, month));
});

router.get("/search", (req, res, next) => {
  const {query} = req.query;
  if (!query) {
    return next();
  }
  const posts = searchIndex.
    search(query).
    map((result) => postsIndexedById[result.ref]).
    filter(getPublishedPostFilter());
  return renderPosts(req, res, posts, null, null, query);
});

router.get("/rss", (req, res, next) => {
  const posts = postsSortedByPublishDate.
    filter(getPublishedPostFilter()).
    filter((post, index) => index < 20);
  if (posts.length === 0) {
    return next();
  }
  const siteUrl = `${redirectToHttps ? "https" : "http"}://${req.headers.host}`;
  const {title, description, author, copyright} = render.getRssMetadata();
  const feed = new RSS({
    title,
    description,
    "feed_url": `${siteUrl}/blog/rss`,
    "site_url": siteUrl,
    copyright,
    "pubDate": posts[0].publishDate,
    "ttl": 60
  });
  posts.forEach((post) => {
    feed.item({
      "title": render.getTitle(post),
      "url": `${siteUrl}/blog/post/${post.id}`,
      "description": post.contentHtml,
      "date": post.publishDate,
      author
    });
  });
  res.setHeader("Content-Type", "application/rss+xml");
  return res.send(feed.xml());
});

module.exports = router;
