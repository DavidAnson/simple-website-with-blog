"use strict";

const fs = require("fs");
const path = require("path");
const pify = require("pify");
const express = require("express");
const ReactDOMServer = require("react-dom/server");
const render = require("./generated/render.js");
const router = express.Router();
const readdir = pify(fs.readdir);
const readFile = pify(fs.readFile);

const postsDir = "./posts";
const postExtension = /\.json$/i;
const posts = [];
readdir(postsDir).
  then((files) => Promise.all(files.
    filter((file) => postExtension.test(file)).
    map((file) => {
      const id = file.replace(postExtension, "");
      const filePath = path.join(postsDir, file);
      return readFile(filePath, "utf8").
        then((content) => {
          const post = JSON.parse(content);
          if (!post.title || !post.date || !post.contentJson) {
            throw new Error(`Post id "${id}" missing required field.`);
          } else if (Object.keys(post).length !== 3) {
            throw new Error(`Post id "${id}" has extra field.`);
          }
          post.id = id;
          post.date = new Date(post.date);
          posts.push(post);
        });
    }))).
  then(() => {
    posts.sort((left, right) => (right.date - left.date) || left.id.localeCompare(right.id));
  });

router.get("/", (req, res) => {
  const elements = render({
    posts
  });
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(elements);
  const body = `<!DOCTYPE html>${staticMarkup}`;
  res.send(body);
});

module.exports = router;
