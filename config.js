"use strict";

module.exports = {
  "port": process.env.PORT || 3000,
  "redirectToHttps": process.env.SWWB_REDIRECT_TO_HTTPS || false,
  "showFuturePosts": process.env.SWWB_SHOW_FUTURE_POSTS || false,
  "siteRoot": process.env.SWWB_SITE_ROOT || "./sites/sample-text"
};
