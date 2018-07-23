"use strict";

module.exports = {
  "port": process.env.PORT || 3000,
  "redirectToHttps": process.env.SWWB_REDIRECT_TO_HTTPS || false,
  "siteRoot": process.env.SWWB_SITE_ROOT || "./sites/sample-text"
};
