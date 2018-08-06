"use strict";

const {redirectToHttps, siteRoot} = require("./config");
const fs = require("fs");
const path = require("path");
const express = require("express");
const highlightJs = require("highlight.js");
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
const allPostsByCompareDate = [];
const allPostsByPublishDate = [];
const archives = [];

const getVisiblePostFilter = () => {
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
                post.contentHtml = includesHtmlFile ? content : markdownIt.render(content);
              });
          }
          return promise.
            then(() => allPostsByCompareDate.push(post));
        });
    }))).
  then(() => {
    allPostsByCompareDate.sort((left, right) => (right.compareDate - left.compareDate) ||
      right.id.localeCompare(left.id));
    allPostsByPublishDate.push(...allPostsByCompareDate);
    allPostsByPublishDate.sort((left, right) => (right.publishDate - left.publishDate) ||
      right.id.localeCompare(left.id));
    let lastPeriodValue = 0;
    allPostsByCompareDate.
      filter(getVisiblePostFilter()).
      forEach((post) => {
        const postPeriod = new Date(post.compareDate.getFullYear(), post.compareDate.getMonth());
        if (postPeriod.valueOf() !== lastPeriodValue) {
          archives.push(postPeriod);
          lastPeriodValue = postPeriod.valueOf();
        }
      });
  });

const renderPosts = (posts, res, title, period) => {
  const elements = render.getHtmlElements({
    posts,
    archives,
    title,
    period
  });
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(elements);
  const body = `<!DOCTYPE html>${staticMarkup}`;
  res.send(body);
};

router.get("/", (req, res) => {
  const posts = allPostsByCompareDate.filter(getVisiblePostFilter());
  return renderPosts(posts, res);
});

router.get("/post/:id", (req, res, next) => {
  const posts = allPostsByCompareDate.filter((post) => post.id === req.params.id);
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(posts, res, render.getTitle(posts[0]));
});

router.get("/archive/:period(\\d{6})", (req, res, next) => {
  const year = parseInt(req.params.period.slice(0, 4), 10);
  const month = parseInt(req.params.period.slice(4, 6), 10) - 1;
  const posts = allPostsByCompareDate.
    filter(getVisiblePostFilter()).
    filter((post) => (post.compareDate.getFullYear() === year) &&
      (post.compareDate.getMonth() === month));
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(posts, res, null, new Date(year, month));
});

router.get("/rss", (req, res, next) => {
  const posts = allPostsByPublishDate.
    filter(getVisiblePostFilter()).
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
