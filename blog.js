"use strict";

const express = require("express");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const router = express.Router();

router.get("/", (req, res) => {
  const element =
    React.createElement(
      "html",
      {
        "lang": "en"
      },
      [
        React.createElement(
          "head",
          null,
          React.createElement(
            "title",
            null,
            "simple-website-with-blog"
          )
        ),
        React.createElement(
          "body",
          null,
          "The blog of simple-website-with-blog"
        )
      ]
    );
  const renderedElement = ReactDOMServer.renderToStaticMarkup(element);
  const body = `<!DOCTYPE html>${renderedElement}`;
  res.send(body);
});

module.exports = router;
