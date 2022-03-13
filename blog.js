"use strict";

const {hostnameToken, showFuturePosts, redirectToHttps, siteRoot} = require("./config");
const fs = require("fs").promises;
const path = require("path");
const express = require("express");
const highlightJs = require("highlight.js");
const lunr = require("lunr");
const MarkdownIt = require("markdown-it");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const RSS = require("rss");
const render = require(`${siteRoot}/render.js`);
const router = express.Router({
  "caseSensitive": true,
  "strict": true
});
const markdownIt = new MarkdownIt({
  "highlight": (str, language) => {
    if (language && highlightJs.getLanguage(language)) {
      const ignoreIllegals = true;
      return highlightJs.highlight(str, {
        language,
        ignoreIllegals
      }).value;
    }
    return "";
  },
  "xhtmlOut": true
});

const postsDir = `${siteRoot}/posts`;
const postExtension = /\.json$/u;
const postsSortedByContentDate = [];
const postsSortedByPublishDate = [];
const postsIndexedById = {};
let searchIndex = null;
const commonHtmlStopWords =
  "alt br div h1 h2 h3 h4 h5 h6 href img li ol pre src srcset ul".split(" ");
const linkRes = [
  /<(?:a|area|link)\s[^>]*href\s*=\s*"?([^">\s]+)/giu,
  // eslint-disable-next-line max-len
  /<(?:audio|embed|iframe|img|input|script|source|track|video)\s[^>]*(?:src|srcset)\s*=\s*"?([^">\s]+)/giu,
  /<object\s[^>]*data\s*=\s*"?([^">\s]+)/giu,
  /<video\s[^>]*poster\s*=\s*"?([^">\s]+)/giu
];

const escapeForRegExp = (str) => str.replace(/[-/\\^$*+?.()|[\]{}]/gu, "\\$&");
const hostnameTokenEscaped =
  `${escapeForRegExp(hostnameToken)}|${escapeForRegExp(encodeURIComponent(hostnameToken))}`;
const hostnameTokenRe = new RegExp(hostnameTokenEscaped, "gu");
const referenceRe = new RegExp(`(${hostnameTokenEscaped})/blog/post/([\\w-]+)`, "gu");

const getSiteUrl =
  (req) => {
    const protocol = (redirectToHttps || req.secure) ? "https" : "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return `${protocol}://${host}`;
  };

const getPublishedPostFilter = (includeDateless) => {
  const now = Date.now();
  return (post) => {
    const publishDate = post.publishDate.getTime();
    return ((publishDate > 0) && (publishDate <= now)) ||
      (includeDateless && (publishDate === 0)) ||
      showFuturePosts;
  };
};

const getTagNames = () => {
  const tagSet = new Set();
  postsSortedByContentDate.
    filter(getPublishedPostFilter()).
    forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag));
    });
  const tagList = [...tagSet];
  tagList.sort((left, right) => left.localeCompare(right));
  return tagList;
};

const getArchivePeriods = () => {
  const archivePeriods = [];
  let lastPeriodValue = 0;
  postsSortedByContentDate.
    filter(getPublishedPostFilter()).
    forEach((post) => {
      const postPeriod = new Date(post.contentDate.getFullYear(), post.contentDate.getMonth());
      if (postPeriod.valueOf() !== lastPeriodValue) {
        archivePeriods.push(postPeriod);
        lastPeriodValue = postPeriod.valueOf();
      }
    });
  return archivePeriods;
};

// eslint-disable-next-line dot-notation
router["postsLoaded"] = fs.readdir(postsDir).
  catch((reason) => {
    if (reason.code !== "ENOENT") {
      throw reason;
    }
    return [];
  }).
  then((files) => Promise.all(files.
    filter((file) => postExtension.test(file)).
    map((file) => {
      const id = file.replace(postExtension, "");
      if (!(/[\w-]+/u).test(id)) {
        throw new Error(`Post id "${id}" contains unsupported characters.`);
      }
      const filePath = path.join(postsDir, file);
      return fs.readFile(filePath, "utf8").
        then((content) => {
          const post = JSON.parse(content);
          post.id = id;
          post.contentDate = new Date(post.contentDate || post.publishDate || 0);
          post.publishDate = new Date(post.publishDate || 0);
          post.tags = post.tags || [];
          post.tag = post.tags.join(" ");
          post.references = [];
          post.title = render.getPostTitle(post);
          return post;
        }).
        then((post) => {
          let promise = Promise.resolve();
          if (post.contentJson) {
            post.contentSearch = JSON.stringify(post.contentJson);
            const contentElements = render.getContentJsonElements(post);
            post.contentHtml = ReactDOMServer.renderToStaticMarkup(contentElements);
            post.contentSource = "json";
            delete post.contentJson;
          } else {
            const htmlFile = `${id}.html`;
            const includesHtmlFile = files.includes(htmlFile);
            const mdFile = `${id}.md`;
            const includesMdFile = files.includes(mdFile);
            if (!includesHtmlFile && !includesMdFile) {
              throw new Error(`Post id "${id}" missing 'contentJson'/${htmlFile}/${mdFile}.`);
            }
            promise =
              fs.readFile(path.join(postsDir, includesHtmlFile ? htmlFile : mdFile), "utf8").
                then((content) => {
                  post.contentSearch = content;
                  post.contentHtml = includesHtmlFile ? content : markdownIt.render(content);
                  post.contentSource = includesHtmlFile ? "html" : "markdown";
                });
          }
          return promise.
            then(() => {
              const contentHtml = post.contentHtml.replace(hostnameTokenRe, "https://example.com");
              linkRes.forEach((linkRe) => {
                let match = null;
                while ((match = linkRe.exec(contentHtml)) !== null) {
                  const [, url] = match;
                  try {
                    // eslint-disable-next-line no-new
                    new URL(url);
                  } catch (ex) {
                    throw new Error(`URL "${url}" in post "${post.id}" must be absolute for RSS.`);
                  }
                }
              });
              postsSortedByContentDate.push(post);
              postsIndexedById[post.id] = post;
            });
        });
    }))).
  then(() => {
    postsSortedByContentDate.sort((left, right) => (right.contentDate - left.contentDate) ||
      right.id.localeCompare(left.id));
    postsSortedByPublishDate.push(...postsSortedByContentDate);
    postsSortedByPublishDate.sort((left, right) => (right.publishDate - left.publishDate) ||
      right.id.localeCompare(left.id));
  }).
  then(() => {
    postsSortedByPublishDate.forEach((post) => {
      const references = [];
      let match = null;
      while ((match = referenceRe.exec(post.contentHtml)) !== null) {
        const [, , id] = match;
        const matches = postsSortedByPublishDate.filter((pst) => pst.id === id);
        if (matches.length !== 1) {
          throw new Error(`Reference "${id}" in post "${post.id}" is not valid.`);
        }
        const [target] = matches;
        references.push(target);
        target.references.push(post);
      }
      post.references = [
        ...references,
        ...post.references
      ];
    });
  }).
  then(() => {
    postsSortedByPublishDate.forEach((post) => {
      post.references = [...new Set(post.references)];
    });
  }).
  then(() => {
    searchIndex = lunr(function Config () {
      const commonHtmlStopWordFilter = lunr.generateStopWordFilter(commonHtmlStopWords);
      lunr.Pipeline.registerFunction(commonHtmlStopWordFilter, "commonHtmlStopWords");
      this.pipeline.after(lunr.stopWordFilter, commonHtmlStopWordFilter);
      this.field("title");
      this.field("contentSearch");
      this.field("tag");
      postsSortedByContentDate.forEach((post) => {
        post.contentSearch = post.contentSearch.replace(/[\W_]+/gu, " ");
        this.add(post);
        delete post.contentSearch;
      });
    });
  });

const renderPosts = (req, res, next, posts, noindex, title, period, tag, query) => {
  const siteUrl = getSiteUrl(req);
  const url = new URL(req.originalUrl, siteUrl);
  const urlHref = url.href;
  const pageParam = "page";
  const page = url.searchParams.get(pageParam);
  let currIndex = 0;
  const findIndexOfPage = (post, index) => {
    if (post.id === page) {
      currIndex = index;
      return false;
    }
    return true;
  };
  if (page && posts.every(findIndexOfPage)) {
    return next();
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
    "tags": getTagNames(),
    "archives": getArchivePeriods(),
    "noindex": noindex || (Object.keys(req.query).length > 0),
    "publishedPostFilter": getPublishedPostFilter(true),
    urlHref,
    title,
    period,
    tag,
    query,
    prevLink,
    nextLink
  });
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(elements);
  const finalMarkup = staticMarkup.replace(hostnameTokenRe, siteUrl);
  const body = `<!DOCTYPE html>${finalMarkup}`;
  return res.send(body);
};

const createPost = (id, contentHtml) => {
  const noDate = new Date(0);
  return {
    id,
    contentHtml,
    "contentDate": noDate,
    "publishDate": noDate,
    "tags": [],
    "references": []
  };
};

router.get("/", (req, res, next) => {
  const posts = postsSortedByPublishDate.filter(getPublishedPostFilter());
  return renderPosts(req, res, next, posts, false);
});

router.get("/post/:id", (req, res, next) => {
  const posts = postsSortedByContentDate.
    filter(getPublishedPostFilter(true)).
    filter((post) => post.id === req.params.id);
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(req, res, next, posts, false, posts[0].title);
});

router.get("/tag/:tag", (req, res, next) => {
  const {tag} = req.params;
  const posts = postsSortedByContentDate.
    filter(getPublishedPostFilter()).
    filter((post) => post.tags.includes(tag));
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(req, res, next, posts, true, null, null, tag);
});

router.get("/archive/:period(\\d{6})", (req, res, next) => {
  const year = parseInt(req.params.period.slice(0, 4), 10);
  const month = parseInt(req.params.period.slice(4, 6), 10) - 1;
  const posts = postsSortedByContentDate.
    filter(getPublishedPostFilter()).
    filter((post) => (post.contentDate.getFullYear() === year) &&
      (post.contentDate.getMonth() === month));
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(req, res, next, posts, true, null, new Date(year, month));
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
  if (posts.length === 0) {
    const noResults = "No results";
    const contentHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(
      React.Fragment,
      null,
      React.createElement("p", null, noResults)
    ));
    posts.push(createPost(noResults, contentHtml));
  }
  return renderPosts(req, res, next, posts, true, null, null, null, query);
});

router.get("/rss", (req, res, next) => {
  const posts = postsSortedByPublishDate.
    filter(getPublishedPostFilter()).
    filter((post, index) => index < 20);
  if (posts.length === 0) {
    return next();
  }
  const siteUrl = getSiteUrl(req);
  const {title, description, author, copyright} = render.getRssMetadata();
  const feed = new RSS({
    title,
    description,
    "feed_url": `${siteUrl}/blog/rss`,
    "site_url": `${siteUrl}/blog`,
    copyright,
    "pubDate": posts[0].publishDate,
    "ttl": 60
  });
  posts.forEach((post) => {
    feed.item({
      "title": post.title,
      "url": `${siteUrl}/blog/post/${post.id}`,
      "description": post.contentHtml.replace(hostnameTokenRe, siteUrl),
      "date": post.publishDate,
      author
    });
  });
  res.setHeader("Content-Type", "application/rss+xml");
  return res.send(feed.xml());
});

// eslint-disable-next-line no-unused-vars
router.use((req, res, next) => {
  const statusCode = 404;
  const statusText = "Not Found";
  res.status(statusCode);
  const contentHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(
    React.Fragment,
    null,
    React.createElement("strong", null, `HTTP ${statusCode}`),
    React.createElement("p", null, statusText)
  ));
  const post = createPost(statusText, contentHtml);
  return renderPosts(req, res, next, [post], true, statusText);
});

module.exports = router;
