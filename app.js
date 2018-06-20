const compression = require("compression");
const express = require("express");
const helmet = require("helmet");

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 60 * 60 * 24 * 7
  }
}));
app.use(compression({
  level: 9,
  threshold: 0
}));
app.use(express.static("static"));

app.use(function (req, res, next) {
  res.sendStatus(404);
});
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.sendStatus(500);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
