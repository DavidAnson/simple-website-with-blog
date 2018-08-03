"use strict";

const {siteRoot} = require("./config");
const fs = require("fs");
const path = require("path");
const express = require("express");
const highlightJs = require("highlight.js");
const MarkdownIt = require("markdown-it");
const pify = require("pify");
const ReactDOMServer = require("react-dom/server");
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
const allPosts = [];
const archives = [];

const getVisiblePostFilter = () => {
  const now = Date.now();
  return (post) => {
    const postDate = post.date.getTime();
    return (postDate > 0) && (postDate <= now);
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
          post.date = new Date(post.date || 0);
          post.contentDate = new Date(post.contentDate || 0);
          return post;
        }).
        then((post) => {
          let promise = Promise.resolve();
          if (!post.contentJson) {
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
            then(() => allPosts.push(post));
        });
    }))).
  then(() => {
    allPosts.sort((left, right) => (right.date - left.date) || left.id.localeCompare(right.id));
    let lastPeriod = null;
    allPosts.
      filter(getVisiblePostFilter()).
      forEach((post) => {
        const postPeriod = new Date(post.date.getFullYear(), post.date.getMonth());
        if (postPeriod !== lastPeriod) {
          archives.push(postPeriod);
          lastPeriod = postPeriod;
        }
      });
  });

const renderPosts = (posts, res, period) => {
  const elements = render({
    posts,
    archives,
    period
  });
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(elements);
  const body = `<!DOCTYPE html>${staticMarkup}`;
  res.send(body);
};

router.get("/", (req, res) => {
  const posts = allPosts.filter(getVisiblePostFilter());
  return renderPosts(posts, res);
});

router.get("/post/:id", (req, res, next) => {
  const posts = allPosts.filter((post) => post.id === req.params.id);
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(posts, res);
});

router.get("/archive/:period(\\d{6})", (req, res, next) => {
  const year = parseInt(req.params.period.slice(0, 4), 10);
  const month = parseInt(req.params.period.slice(4, 6), 10) - 1;
  const posts = allPosts.
    filter(getVisiblePostFilter()).
    filter((post) => (post.date.getFullYear() === year) && (post.date.getMonth() === month));
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(posts, res, new Date(year, month));
});

module.exports = router;
