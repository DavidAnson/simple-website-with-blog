"use strict";

const {port, acmeChallenge, redirectToHttps, siteRoot} = require("./config");
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const featurePolicy = require("feature-policy");
const blog = require("./blog");
const app = express();

// Configure app
app.enable("case sensitive routing");
app.enable("strict routing");

// Fix protocol for HTTPS requests under iisnode
app.enable("trust proxy");
app.use((req, res, next) => {
  if (!req.secure && req.headers["x-arr-ssl"] && !req.headers["x-forwarded-proto"]) {
    req.headers["x-forwarded-proto"] = "https";
  }
  next();
});

// Redirect HTTP traffic to HTTPS
if (redirectToHttps) {
  app.use((req, res, next) => {
    if (req.secure) {
      return next();
    }
    return res.redirect(`https://${req.headers.host}${req.originalUrl}`);
  });
}

// Redirect to remove "www." prefix from host name
app.use((req, res, next) => {
  const originalHostUrl = `//${req.headers.host}${req.originalUrl}`;
  const redirectHost = req.headers.host.replace(/^www\./iu, "");
  const redirectHostUrl = `//${redirectHost}${req.originalUrl}`;
  if (redirectHostUrl === originalHostUrl) {
    return next();
  }
  return res.redirect(redirectHostUrl);
});

// Add security headers and compression
app.use(helmet({
  "contentSecurityPolicy": {
    "directives": {
      "script-src": [
        "'self'",
        "code.jquery.com"
      ],
      "style-src": [
        "'self'",
        "code.jquery.com"
      ]
    }
  },
  "hsts": {
    // Set maxAge to 1 week to mitigate impact of certificate expiration
    "maxAge": 60 * 60 * 24 * 7
  },
  "permittedCrossDomainPolicies": {
    "permittedPolicies": "none"
  },
  "referrerPolicy": {
    "policy": "no-referrer-when-downgrade"
  }
}));
app.use(featurePolicy({
  "features": {
    // Disable features with security/privacy implications
    "geolocation": ["'none'"],
    "payment": ["'none'"],
    "usb": ["'none'"]
  }
}));
app.use(compression({
  "level": 9,
  "threshold": 0
}));

// Handle ACME requests (as made by Let's Encrypt, https://letsencrypt.org/)
if (acmeChallenge) {
  for (const challenge of acmeChallenge.split(",")) {
    const [path] = challenge.split(".");
    app.get(`/.well-known/acme-challenge/${path}`, (req, res) => {
      res.send(challenge);
    });
  }
}

// Handle static content
app.use(express.static(`${siteRoot}/static`, {
  "index": [
    "index.html",
    "index.htm",
    "default.html",
    "default.htm"
  ],
  "redirect": false,
  "setHeaders": (res, path, stat) => {
    if (stat.isFile() && (/\.appcache$/iu).test(path)) {
      res.setHeader("Cache-Control", "no-cache");
    }
  }
}));

// Handle blog content
app.all("/blog/", (req, res) => res.sendStatus(404));
app.use("/blog", blog);

// Handle HTTP 404/500
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

// eslint-disable-next-line dot-notation
blog["postsLoaded"].
  then(() => {
    // Start server
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`simple-website-with-blog listening on port ${port}!`);
    });
  });
