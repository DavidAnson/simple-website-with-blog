"use strict";

const express = require("express");
const ReactDOMServer = require("react-dom/server");
const render = require("./generated/render.js");
const router = express.Router();

router.get("/", (req, res) => {
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(render());
  const body = `<!DOCTYPE html>${staticMarkup}`;
  res.send(body);
});

module.exports = router;
