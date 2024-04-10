"use strict";

/* eslint-disable unicorn/no-array-for-each */

const {hostnameToken, showFuturePosts, redirectToHttps, siteRoot} = require("./config");
const {createHash, randomInt} = require("node:crypto");
const fs = require("node:fs").promises;
const path = require("node:path");
const Ajv = require("ajv");
const express = require("express");
const highlightJs = require("highlight.js");
const lunr = require("lunr");
const MarkdownIt = require("markdown-it");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const RSS = require("rss");
const render = require(`${siteRoot}/render.js`);
const router = express.Router({
  "caseSensitive": true,
  "strict": true
});
const markdownIt = new MarkdownIt({
  "highlight": (str, language) => {
    if (language && highlightJs.getLanguage(language)) {
      const ignoreIllegals = true;
      return highlightJs.highlight(str, {
        language,
        ignoreIllegals
      }).value;
    }
    return "";
  },
  "xhtmlOut": true
});

const baseTen = 10;
const postsDir = `${siteRoot}/posts`;
const postExtensionRe = /\.json$/u;
const postsSortedByContentDate = [];
const postsSortedByPublishDate = [];
const postsIndexedById = {};
let searchIndex = null;
const commonHtmlStopWords =
  "alt br div h1 h2 h3 h4 h5 h6 href img li ol pre src srcset ul".split(" ");
const linkRes = [
  /<(?:a|area|link)\s[^>]*href\s*=\s*"?([^">\s]+)/giu,
  /<(?:audio|embed|iframe|img|input|script|source|track|video)\s[^>]*(?:src|srcset)\s*=\s*"?([^">\s]+)/giu,
  /<object\s[^>]*data\s*=\s*"?([^">\s]+)/giu,
  /<video\s[^>]*poster\s*=\s*"?([^">\s]+)/giu
];
const yyyyMMddRe = /^\d{8}$/u;

const escapeForRegExp = (str) => str.replaceAll(/[-/\\^$*+?.()|[\]{}]/gu, "\\$&");
const hostnameTokenEscaped =
  `${escapeForRegExp(hostnameToken)}|${escapeForRegExp(encodeURIComponent(hostnameToken))}`;
const hostnameTokenRe = new RegExp(hostnameTokenEscaped, "gu");
const referenceRe = new RegExp(`(${hostnameTokenEscaped})/blog/post/([\\w-]+)`, "gu");

const formatStringForSearch = (str) => str.replaceAll(/[\W_]+/gu, " ");

const getSiteUrl =
  (req) => {
    const protocol = (redirectToHttps || req.secure) ? "https" : "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return `${protocol}://${host}`;
  };

const getPublishedPostFilter = (includeDateless, dateValue) => {
  const now = dateValue || Date.now();
  return (post) => {
    const publishDate = post.publishDate.getTime();
    return ((publishDate > 0) && (publishDate <= now)) ||
      (includeDateless && (publishDate === 0)) ||
      showFuturePosts;
  };
};

const getTagNames = () => {
  const tagSet = new Set();
  postsSortedByContentDate.
    filter(getPublishedPostFilter()).
    forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag));
    });
  const tagList = [...tagSet];
  tagList.sort((left, right) => left.localeCompare(right));
  return tagList;
};

const getArchivePeriods = () => {
  const archivePeriods = [];
  let lastPeriodValue = 0;
  postsSortedByContentDate.
    filter(getPublishedPostFilter()).
    forEach((post) => {
      const postPeriod = new Date(post.contentDate.getFullYear(), post.contentDate.getMonth());
      if (postPeriod.getTime() !== lastPeriodValue) {
        archivePeriods.push(postPeriod);
        lastPeriodValue = postPeriod.getTime();
      }
    });
  return archivePeriods;
};

const ajv = new Ajv();
const validatePostSchema = ajv.compile(require("./post-schema.json"));
const contentSchema = render.getContentJsonSchema();
const validateContentSchema = contentSchema ?
  ajv.compile(contentSchema) :
  () => true;
// eslint-disable-next-line dot-notation
router["postsLoaded"] = fs.readdir(postsDir).
  catch((error) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
    return [];
  }).
  // Read posts from files
  then((files) => Promise.all(files.
    filter((file) => postExtensionRe.test(file)).
    map((file) => {
      const id = file.replace(postExtensionRe, "");
      if (!(/[\w-]+/u).test(id)) {
        throw new Error(`Post id "${id}" contains unsupported characters.`);
      }
      const filePath = path.join(postsDir, file);
      return fs.readFile(filePath, "utf8").
        then((content) => {
          const post = JSON.parse(content);
          if (!validatePostSchema(post)) {
            const message = JSON.stringify(validatePostSchema.errors, null, 2);
            throw new Error(`Post schema validation error in "${file}"\n${message}`);
          }
          if (post.contentJson && !validateContentSchema(post.contentJson)) {
            const message = JSON.stringify(validateContentSchema.errors, null, 2);
            throw new Error(`Content schema validation error in "${file}"\n${message}`);
          }
          post.id = id;
          post.contentDate = new Date(post.contentDate || post.publishDate || 0);
          post.publishDate = new Date(post.publishDate || 0);
          post.tags ||= [];
          post.related ||= [];
          post.title = render.getPostTitle(post);
          return post;
        }).
        then((post) => {
          let promise = Promise.resolve();
          if (post.contentJson) {
            post.contentSearch = JSON.stringify(post.contentJson);
            const contentElements = render.getContentJsonElements(post);
            post.contentHtml = ReactDOMServer.renderToStaticMarkup(contentElements);
            post.contentSource = "json";
            delete post.contentJson;
          } else {
            const htmlFile = `${id}.html`;
            const includesHtmlFile = files.includes(htmlFile);
            const mdFile = `${id}.md`;
            const includesMdFile = files.includes(mdFile);
            if (!includesHtmlFile && !includesMdFile) {
              throw new Error(`Post id "${id}" missing 'contentJson'/${htmlFile}/${mdFile}.`);
            }
            promise =
              fs.readFile(path.join(postsDir, includesHtmlFile ? htmlFile : mdFile), "utf8").
                then((content) => {
                  post.contentSearch = content;
                  post.contentHtml = includesHtmlFile ? content : markdownIt.render(content);
                  post.contentSource = includesHtmlFile ? "html" : "markdown";
                });
          }
          return promise.
            then(() => {
              const contentHtml = post.contentHtml.replace(hostnameTokenRe, "https://example.com");
              linkRes.forEach((linkRe) => {
                let match;
                while ((match = linkRe.exec(contentHtml)) !== null) {
                  const [, url] = match;
                  try {
                    // eslint-disable-next-line no-new
                    new URL(url);
                  } catch {
                    throw new Error(`URL "${url}" in post "${post.id}" must be absolute for RSS.`);
                  }
                }
              });
              postsSortedByContentDate.push(post);
              postsIndexedById[post.id] = post;
            });
        });
    }))).
  // Sort posts by date
  then(() => {
    postsSortedByContentDate.sort((left, right) => (right.contentDate - left.contentDate) ||
      right.id.localeCompare(left.id));
    postsSortedByPublishDate.push(...postsSortedByContentDate);
    postsSortedByPublishDate.sort((left, right) => (right.publishDate - left.publishDate) ||
      right.id.localeCompare(left.id));
  }).
  // Resolve related posts
  then(() => {
    postsSortedByPublishDate.forEach((post) => {
      post.related = post.related.map((relatedPostId) => {
        const relatedPost = postsIndexedById[relatedPostId];
        if (!relatedPost) {
          throw new Error(`Related post "${relatedPostId}" in post "${post.id}" is not valid.`);
        }
        return relatedPost;
      });
    });
  }).
  // Find referenced posts
  then(() => {
    postsSortedByPublishDate.forEach((post) => {
      let match;
      while ((match = referenceRe.exec(post.contentHtml)) !== null) {
        const [, , id] = match;
        const matches = postsSortedByPublishDate.filter((pst) => pst.id === id);
        if (matches.length !== 1) {
          throw new Error(`Reference "${id}" in post "${post.id}" is not valid.`);
        }
        const [target] = matches;
        post.related.push(target);
        target.related.push(post);
      }
    });
  }).
  // Remove duplicates from related and sort
  then(() => {
    postsSortedByPublishDate.forEach((post) => {
      post.related = [...new Set(post.related)];
      post.related.sort((left, right) => left.id.localeCompare(right.id));
    });
  }).
  // Build search index
  then(() => {
    const dateFormatOptionsYearMonth = {
      "year": "numeric",
      "month": "long"
    };
    const dateFormatYearMonth = new Intl.DateTimeFormat("en-US", dateFormatOptionsYearMonth);
    searchIndex = lunr(function Config () {
      const commonHtmlStopWordFilter = lunr.generateStopWordFilter(commonHtmlStopWords);
      lunr.Pipeline.registerFunction(commonHtmlStopWordFilter, "commonHtmlStopWords");
      this.pipeline.after(lunr.stopWordFilter, commonHtmlStopWordFilter);
      this.pipeline.remove(lunr.stopWordFilter);
      this.ref("id");
      this.field("title");
      this.field("content");
      this.field("tag");
      this.field("date");
      for (const post of postsSortedByContentDate) {
        this.add({
          "id": post.id,
          "title": formatStringForSearch(post.title),
          "content": formatStringForSearch(post.contentSearch),
          "tag": post.tags,
          "date": dateFormatYearMonth.format(post.contentDate).split(" ")
        });
        delete post.contentSearch;
      }
    });
  });

const questionQueryString = (searchParams) => {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    urlSearchParams.set(key, value);
  }
  urlSearchParams.sort();
  const str = urlSearchParams.toString();
  return str ? `?${str}` : "";
};

const renderPosts = (req, res, next, posts, noindex, title, period, tag, query) => {
  const siteUrl = getSiteUrl(req);
  const url = new URL(req.originalUrl, siteUrl);
  const urlHref = url.href;
  const pageParam = "page";
  const page = url.searchParams.get(pageParam);
  let currIndex = 0;
  const findIndexOfPage = (post, index) => {
    if (post.id === page) {
      currIndex = index;
      return false;
    }
    return true;
  };
  if (page && posts.every(findIndexOfPage)) {
    return next();
  }
  const searchParams = {};
  const queryParams = query ? {query} : null;
  const defaultCount = 10;
  const countParam = "count";
  const count =
    Math.max(Number.parseInt(url.searchParams.get(countParam), baseTen), 0) ||
    defaultCount;
  if (count !== defaultCount) {
    searchParams[countParam] = count;
  }
  const prevIndex = currIndex - count;
  const nextIndex = currIndex + count;
  let prevLink = null;
  if (currIndex > 0) {
    const prevLinkParams = {
      ...searchParams,
      ...queryParams
    };
    if (prevIndex > 0) {
      prevLinkParams[pageParam] = posts[prevIndex].id;
    }
    prevLink = `${url.pathname}${questionQueryString(prevLinkParams)}`;
  }
  let nextLink = null;
  if (nextIndex < posts.length) {
    const nextLinkParams = {
      ...searchParams,
      ...queryParams
    };
    nextLinkParams[pageParam] = posts[nextIndex].id;
    nextLink = `${url.pathname}${questionQueryString(nextLinkParams)}`;
  }
  const elements = render.getHtmlElements({
    "posts": posts.slice(currIndex, nextIndex),
    "tags": getTagNames(),
    "archives": getArchivePeriods(),
    "noindex": noindex || (Object.keys(req.query).length > 0),
    "publishedPostFilter": getPublishedPostFilter(true),
    urlHref,
    title,
    period,
    tag,
    query,
    searchParams,
    questionQueryString,
    prevLink,
    nextLink
  });
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(elements);
  const finalMarkup = staticMarkup.replace(hostnameTokenRe, siteUrl);
  const body = `<!DOCTYPE html>${finalMarkup}`;
  return res.send(body);
};

const createPost = (id, contentHtml) => {
  const noDate = new Date(0);
  return {
    id,
    contentHtml,
    "contentDate": noDate,
    "publishDate": noDate,
    "tags": [],
    "related": []
  };
};

router.get("/", (req, res, next) => {
  const posts = postsSortedByPublishDate.filter(getPublishedPostFilter());
  return renderPosts(req, res, next, posts, false);
});

router.get("/post/:id", (req, res, next) => {
  const posts = postsSortedByContentDate.
    filter(getPublishedPostFilter(true)).
    filter((post) => post.id === req.params.id);
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(req, res, next, posts, false, posts[0].title);
});

router.get("/tag/:tag", (req, res, next) => {
  const {tag} = req.params;
  const posts = postsSortedByContentDate.
    filter(getPublishedPostFilter()).
    filter((post) => post.tags.includes(tag));
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(req, res, next, posts, true, null, null, tag);
});

router.get("/archive/:period(\\d{6})", (req, res, next) => {
  const year = Number.parseInt(req.params.period.slice(0, 4), baseTen);
  const month = Number.parseInt(req.params.period.slice(4, 6), baseTen) - 1;
  const posts = postsSortedByContentDate.
    filter(getPublishedPostFilter()).
    filter((post) => (post.contentDate.getFullYear() === year) &&
      (post.contentDate.getMonth() === month));
  if (posts.length === 0) {
    return next();
  }
  return renderPosts(req, res, next, posts, true, null, new Date(year, month));
});

router.get("/search", (req, res, next) => {
  const {query} = req.query;
  if (typeof query !== "string") {
    return next();
  }
  const posts = (query
    ? searchIndex.
      search(query).
      map((result) => postsIndexedById[result.ref])
    : postsSortedByPublishDate
  ).filter(getPublishedPostFilter());
  if (posts.length === 0) {
    const noResults = "No results";
    const contentHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(
      React.Fragment,
      null,
      React.createElement("p", null, noResults)
    ));
    posts.push(createPost(noResults, contentHtml));
  }
  return renderPosts(req, res, next, posts, true, null, null, null, query);
});

router.get("/rss", (req, res, next) => {
  const posts = postsSortedByPublishDate.
    filter(getPublishedPostFilter()).
    filter((post, index) => index < 20);
  if (posts.length === 0) {
    return next();
  }
  const siteUrl = getSiteUrl(req);
  const {title, description, author, copyright} = render.getRssMetadata();
  const feed = new RSS({
    title,
    description,
    "feed_url": `${siteUrl}/blog/rss`,
    "site_url": `${siteUrl}/blog`,
    copyright,
    "pubDate": posts[0].publishDate,
    "ttl": 60
  });
  posts.forEach((post) => {
    feed.item({
      "title": post.title,
      "url": `${siteUrl}/blog/post/${post.id}`,
      "description": post.contentHtml.replace(hostnameTokenRe, siteUrl),
      "date": post.publishDate,
      author
    });
  });
  res.setHeader("Content-Type", "application/rss+xml");
  return res.send(feed.xml());
});

router.get("/flashback", (req, res, next) => {
  const dateString = req.query.date ||
    (new Date()).
      toISOString().
      slice(0, 10).
      replaceAll("-", "");
  if (!yyyyMMddRe.test(dateString)) {
    return next();
  }
  const dateValue = (new Date(
    Number.parseInt(dateString.slice(0, 4), baseTen),
    Number.parseInt(dateString.slice(4, 6), baseTen) - 1,
    Number.parseInt(dateString.slice(6, 8), baseTen)
  )).getTime();
  const posts = postsSortedByPublishDate.
    filter(getPublishedPostFilter(false, dateValue));
  if (posts.length === 0) {
    return next();
  }
  const random =
    createHash("sha256").
      update(dateString).
      digest().
      readUInt32BE();
  const index = random % posts.length;
  const {id} = posts[index];
  return res.redirect(`/blog/post/${id}`);
});

router.get("/random", (req, res, next) => {
  const posts = postsSortedByPublishDate.filter(getPublishedPostFilter());
  if (posts.length === 0) {
    return next();
  }
  const index = randomInt(posts.length);
  const {id} = posts[index];
  return res.redirect(`/blog/post/${id}`);
});

router.use((req, res, next) => {
  const statusCode = 404;
  const statusText = "Not Found";
  res.status(statusCode);
  const contentHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(
    React.Fragment,
    null,
    React.createElement("strong", null, `HTTP ${statusCode}`),
    React.createElement("p", null, statusText)
  ));
  const post = createPost(statusText, contentHtml);
  return renderPosts(req, res, next, [post], true, statusText);
});

module.exports = router;
