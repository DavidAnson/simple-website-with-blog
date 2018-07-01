"use strict";

const express = require("express");
const ReactDOMServer = require("react-dom/server");
const render = require("./generated/render.js");
const router = express.Router();

const posts = [
  {
    "title": "Title 0",
    "date": new Date(2018, 1, 1),
    "content": "Content 0..."
  },
  {
    "title": "Title 1",
    "date": new Date(2018, 3, 9),
    "content": "Content 1..."
  },
  {
    "title": "Title 2",
    "date": new Date(2018, 5, 25),
    "content": "Content 2..."
  }
];

router.get("/", (req, res) => {
  const elements = render({
    posts
  });
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(elements);
  const body = `<!DOCTYPE html>${staticMarkup}`;
  res.send(body);
});

module.exports = router;
