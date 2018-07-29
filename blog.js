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
          if (!post.title || !post.date) {
            throw new Error(`Post id "${id}" missing 'title' or 'date'.`);
          }
          post.id = id;
          post.date = new Date(post.date);
          if (post.contentDate) {
            post.contentDate = new Date(post.contentDate);
          }
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
  });

const renderPosts = (posts, res) => {
  const elements = render({
    posts
  });
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(elements);
  const body = `<!DOCTYPE html>${staticMarkup}`;
  res.send(body);
};

router.get("/", (req, res) => renderPosts(allPosts, res));

router.get("/post/:id", (req, res, next) => {
  const posts = allPosts.filter((post) => post.id === req.params.id);
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(posts, res);
});

module.exports = router;
