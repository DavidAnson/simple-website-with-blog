"use strict";

const compression = require("compression");
const express = require("express");
const helmet = require("helmet");

const app = express();
app.use(helmet({
  "contentSecurityPolicy": {
    "directives": {
      "defaultSrc": ["'self'"]
    }
  },
  "hsts": {
    "maxAge": 60 * 60 * 24 * 7
  }
}));
app.use(compression({
  "level": 9,
  "threshold": 0
}));
app.use(express.static("static"));

// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  res.sendStatus(404);
});
// eslint-disable-next-line max-params, no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.sendStatus(500);
});

// eslint-disable-next-line no-process-env
const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}!`);
});
