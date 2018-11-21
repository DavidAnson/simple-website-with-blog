"use strict";

module.exports = {
  "port": process.env.PORT || 3000,
  "acmeChallenge": process.env.SWWB_ACME_CHALLENGE || "",
  "hostnameToken": process.env.SWWB_HOSTNAME_TOKEN || "_SWWB_HOST_",
  "redirectToHttps": process.env.SWWB_REDIRECT_TO_HTTPS || false,
  "showFuturePosts": process.env.SWWB_SHOW_FUTURE_POSTS || false,
  "siteRoot": process.env.SWWB_SITE_ROOT || "./sites/sample-text"
};
