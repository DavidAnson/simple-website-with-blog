"use strict";

// Suppress [ts] Cannot find name 'QUnit'.
// eslint-disable-next-line no-var, no-use-before-define
var QUnit = QUnit;

const assertResponseAndHeaders = (assert, response, contentType) => {
  assert.ok(response.ok);
  assert.equal(response.headers.get("Content-Encoding"), "gzip");
  assert.equal(response.headers.get("Content-Type"), contentType || "text/html; charset=utf-8");
};

const assertNotFound = (assert, response) => {
  assert.ok(!response.ok);
  assert.equal(response.status, 404);
  assert.equal(response.statusText, "Not Found");
};

const assertSingleTagText = (assert, document, tag, text) => {
  assert.equal(document.getElementsByTagName(tag).length, 1);
  assert.equal(document.getElementsByTagName(tag)[0].innerHTML, text);
};

const assertMetaAttributes = (assert, meta, name, property, content) => {
  if (name) {
    assert.equal(meta.attributes.getNamedItem("name").value, name);
  } else if (property) {
    assert.equal(meta.attributes.getNamedItem("property").value, property);
  } else {
    assert.ok(false);
  }
  assert.equal(meta.attributes.getNamedItem("content").value, content);
};

const assertPageMetadata = (assert, responseUrl, text, noindex, titlePrefix, innerTitle) => {
  const unifiedTitlePrefix = (titlePrefix || innerTitle) ? `${titlePrefix || innerTitle} - ` : "";
  const siteName = "simple-website-with-blog/test";
  const title = `${unifiedTitlePrefix}${siteName}`;
  const description = titlePrefix || innerTitle || "Test blog";
  const image = `${location.origin}/images/piechart.png`;
  assert.ok((/^<!DOCTYPE html>/u).test(text));
  const doc = new DOMParser().parseFromString(text, "application/xml");
  assertSingleTagText(assert, doc, "title", title);
  const metas = doc.getElementsByTagName("meta");
  assertMetaAttributes(assert, metas[0], "viewport", null, "width=device-width");
  assertMetaAttributes(assert, metas[1], "description", null, description);
  assertMetaAttributes(assert, metas[2], "author", null, "David Anson");
  assertMetaAttributes(assert, metas[3], "twitter:card", null, "summary");
  assertMetaAttributes(assert, metas[4], "twitter:site", null, "@DavidAns");
  assertMetaAttributes(assert, metas[5], "twitter:creator", null, "@DavidAns");
  assertMetaAttributes(assert, metas[6], null, "og:type", "article");
  assertMetaAttributes(assert, metas[7], null, "og:title", description);
  assertMetaAttributes(assert, metas[8], null, "og:url", responseUrl);
  assertMetaAttributes(assert, metas[9], null, "og:image", image);
  assertMetaAttributes(assert, metas[10], null, "og:site_name", siteName);
  assertMetaAttributes(assert, metas[11], null, "og:description", description);
  if (noindex) {
    assertMetaAttributes(assert, metas[12], "robots", null, "noindex");
  }
  assertSingleTagText(assert, doc, "h1", "Test blog");
  assertSingleTagText(assert, doc, "h2", innerTitle || "");
  return doc;
};

const assertElementNameText = (assert, element, name, text) => {
  assert.equal(element.nodeName, name);
  assert.equal(element.textContent, text);
};

const assertListTextAndLinks = (assert, doc, id, base, texts, links) => {
  const list = doc.getElementById(id) || doc.getElementsByClassName(id)[0].firstElementChild;
  assert.equal(list.children.length, texts.length);
  for (const li of list.children) {
    const value = texts.shift();
    assertElementNameText(assert, li.firstElementChild, "a", value);
    const link = `${base}${links ? links.shift() : value}`;
    assert.equal(li.firstElementChild.getAttribute("href"), link);
  }
};

const assertPostTags = (assert, doc, tags) => {
  const tagsChildren = (doc.getElementsByClassName("tags")[0] || {"children": []}).children;
  assert.equal(tagsChildren.length, tags.length);
  for (const link of tagsChildren) {
    const tag = tags.shift();
    assertElementNameText(assert, link, "a", tag);
    assert.equal(link.getAttribute("href"), `/blog/tag/${tag}`);
  }
};

QUnit.module("Prerequisites");

QUnit.test("Browser supports fetch API", (assert) => {
  assert.expect(1);
  assert.ok(fetch);
});

QUnit.test("Browser supports the iterable protocol", (assert) => {
  assert.expect(2);
  assert.ok(Symbol.iterator);
  assert.ok(document.getElementsByTagName("body")[Symbol.iterator]);
});

QUnit.module("Static");

QUnit.test("Get of / returns expected HTTP headers", (assert) => {
  assert.expect(25);
  const done = assert.async();
  fetch("/").
    then((response) => {
      const {headers} = response;
      [
        // Content headers
        [
          "Content-Encoding",
          "gzip"
        ],
        [
          "Content-Type",
          "text/html; charset=UTF-8"
        ],
        // Caching headers
        [
          "Cache-Control",
          "public, max-age=0"
        ],
        [
          "Last-Modified",
          null
        ],
        // Security headers
        [
          "Content-Security-Policy",
          "default-src 'self'; " +
            "script-src 'self' code.jquery.com; " +
            "style-src 'self' code.jquery.com; " +
            "base-uri 'none'; " +
            "frame-ancestors 'none'; " +
            "form-action 'self'"
        ],
        [
          "Referrer-Policy",
          "no-referrer-when-downgrade"
        ],
        [
          "Strict-Transport-Security",
          "max-age=604800; includeSubDomains"
        ],
        [
          "X-Content-Type-Options",
          "nosniff"
        ],
        [
          "X-DNS-Prefetch-Control",
          "off"
        ],
        [
          "X-Download-Options",
          "noopen"
        ],
        [
          "X-Frame-Options",
          "SAMEORIGIN"
        ],
        [
          "X-XSS-Protection",
          "1; mode=block"
        ]
      ].forEach((nameValue) => {
        const [
          name,
          value
        ] = nameValue;
        assert.ok(headers.has(name));
        if (value) {
          assert.equal(headers.get(name), value);
        }
      });
      assert.ok(headers.has("ETag"));
      assert.ok(headers.get("ETag").startsWith("W/\""));
    }).
    then(done);
});

QUnit.test("Get of / returns ok and compressed HTML", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/").
    then((response) => {
      assertResponseAndHeaders(assert, response, "text/html; charset=UTF-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
    }).
    then(done);
});

QUnit.test("Get of /tests.js returns ok and compressed JS", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/tests.js").
    then((response) => {
      assertResponseAndHeaders(assert, response, "application/javascript; charset=UTF-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^"use strict";/u).test(text));
    }).
    then(done);
});

QUnit.test("Get of /blog/file.txt returns ok and compressed text", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/file.txt").
    then((response) => {
      assertResponseAndHeaders(assert, response, "text/plain; charset=UTF-8");
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Hello world.");
    }).
    then(done);
});

QUnit.test("Get of /missing returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/missing").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});

QUnit.test("Get of .appcache file has correct MIME type and no caching", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/offline.appcache").
    then((response) => {
      const {headers} = response;
      assert.ok(headers.has("Content-Type"));
      assert.equal(headers.get("Content-Type"), "text/cache-manifest; charset=UTF-8");
      assert.ok(headers.has("Cache-Control"));
      assert.equal(headers.get("Cache-Control"), "no-cache");
    }).
    then(done);
});

QUnit.module("Configuration");

QUnit.test("Get of /Blog returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/Blog").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});

QUnit.test("Get of /blog/ returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});

QUnit.test("Get of /blog/Post/one returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/Post/one").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.ok(text.includes("Not Found"));
    }).
    then(done);
});

QUnit.test("Get of /blog/post/one/ returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/post/one/").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.ok(text.includes("Not Found"));
    }).
    then(done);
});

QUnit.module("List");

QUnit.test("Get of /blog returns ok, compressed HTML, and 10 posts", (assert) => {
  assert.expect(53);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog").
    then((response) => {
      responseUrl = response.url;
      assertResponseAndHeaders(assert, response);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(assert, responseUrl, text, false);
      assert.equal(doc.getElementsByTagName("h3").length, 10);
      const postTitles = "one two three four five six seven eight nine ten".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerHTML, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 24);
      const nav = doc.getElementsByClassName("navigation");
      assert.equal(nav.length, 1);
      assert.equal(nav[0].childElementCount, 1);
      assertElementNameText(assert, nav[0].firstElementChild, "a", "Next Posts \u00bb");
      assert.equal(nav[0].firstElementChild.getAttribute("href"), "/blog?page=twenty");
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test("Get of /blog?page=twenty returns ok and 10 posts", (assert) => {
  assert.expect(56);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog?page=twenty").
    then((response) => {
      responseUrl = response.url;
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(assert, responseUrl, text, true);
      assert.equal(doc.getElementsByTagName("h3").length, 10);
      const postTitles =
        "twenty nineteen eighteen seventeen sixteen fifteen fourteen thirteen twelve eleven".
          split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerHTML, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 20);
      const nav = doc.getElementsByClassName("navigation");
      assert.equal(nav.length, 1);
      assert.equal(nav[0].childElementCount, 2);
      assertElementNameText(assert, nav[0].firstElementChild, "a", "\u00ab Previous Posts");
      assert.equal(nav[0].firstElementChild.getAttribute("href"), "/blog");
      assertElementNameText(assert, nav[0].lastElementChild, "a", "Next Posts \u00bb");
      assert.equal(nav[0].lastElementChild.getAttribute("href"), "/blog?page=twentyone");
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test("Get of /blog?page=twentyone returns ok and 2 posts", (assert) => {
  assert.expect(45);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog?page=twentyone").
    then((response) => {
      responseUrl = response.url;
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(assert, responseUrl, text, true);
      assert.equal(doc.getElementsByTagName("h3").length, 2);
      const postTitles = "twentyone twentytwo".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerHTML, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 13);
      const nav = doc.getElementsByClassName("navigation");
      assert.equal(nav.length, 1);
      assert.equal(nav[0].childElementCount, 1);
      assertElementNameText(assert, nav[0].firstElementChild, "a", "\u00ab Previous Posts");
      assert.equal(nav[0].firstElementChild.getAttribute("href"), "/blog?page=twenty");
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test("Get of /Blog returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/Blog").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});

QUnit.module("Post");

QUnit.test("Get of /blog/post/one (publish date) returns ok and compressed HTML", (assert) => {
  assert.expect(66);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog/post/one").
    then((response) => {
      responseUrl = response.url;
      assertResponseAndHeaders(assert, response);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(assert, responseUrl, text, false, "Test post - one");
      assertSingleTagText(assert, doc, "h3", "one");
      assertSingleTagText(assert, doc, "h4", "Test post - one");
      assertSingleTagText(assert, doc, "h5", "2018-02-28T12:00:00.000Z");
      assertSingleTagText(assert, doc, "h5", "2018-02-28T12:00:00.000Z");
      assertSingleTagText(assert, doc, "blockquote", "json");
      assert.equal(doc.getElementsByTagName("div").length, 2);
      assert.equal(doc.getElementsByTagName("div")[0].childElementCount, 3);
      const [parent] = doc.getElementsByTagName("div");
      assertElementNameText(assert, parent.childNodes[0], "p", "Content");
      assertElementNameText(assert, parent.childNodes[1], "p", "for");
      assertElementNameText(assert, parent.childNodes[2], "p", "one");
      assert.equal(doc.getElementsByTagName("a").length, 13);
      assertPostTags(
        assert,
        doc,
        [
          "Fibonacci",
          "square"
        ]
      );
      assertListTextAndLinks(
        assert,
        doc,
        "references",
        "/blog/post/",
        ["Test post - nan"],
        ["nan"]
      );
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test(
  "Get of /blog/post/eleven (publish/content dates, Markdown) returns ok and content",
  (assert) => {
    assert.expect(67);
    const done = assert.async();
    let responseUrl = null;
    fetch("/blog/post/eleven").
      then((response) => {
        responseUrl = response.url;
        assert.ok(response.ok);
        return response.text();
      }).
      then((text) => {
        const doc = assertPageMetadata(assert, responseUrl, text, false, "Test post - eleven");
        assertSingleTagText(assert, doc, "h3", "eleven");
        assertSingleTagText(assert, doc, "h4", "Test post - eleven");
        assertSingleTagText(assert, doc, "h5", "2017-11-01T12:00:00.000Z");
        assertSingleTagText(assert, doc, "h6", "2017-11-20T12:00:00.000Z");
        assertSingleTagText(assert, doc, "blockquote", "markdown");
        assert.equal(doc.getElementsByTagName("div").length, 1);
        assert.equal(doc.getElementsByTagName("div")[0].childElementCount, 1);
        const content = doc.getElementsByTagName("div")[0].firstElementChild;
        assertElementNameText(
          assert,
          content,
          "p",
          "Content for eleven\n\nText\n\nText\nLink to nan"
        );
        assertElementNameText(assert, content.firstElementChild, "strong", "eleven");
        const src = `${location.origin}/images/piechart.png`;
        assertElementNameText(assert, content.children[1], "img", "");
        assert.equal(content.children[1].getAttribute("alt"), "Pie chart");
        assert.equal(content.children[1].getAttribute("src"), src);
        assertElementNameText(assert, content.children[2], "img", "");
        assert.equal(content.children[2].getAttribute("alt"), "Another chart");
        assert.equal(content.children[2].getAttribute("src"), src);
        assertElementNameText(assert, content.lastElementChild, "a", "Link to nan");
        assert.equal(
          content.lastElementChild.getAttribute("href"),
          `${location.origin}/blog/post/nan`
        );
        assert.equal(doc.getElementsByTagName("a").length, 12);
        assertPostTags(assert, doc, []);
        assertListTextAndLinks(
          assert,
          doc,
          "references",
          "/blog/post/",
          ["Test post - nan"],
          ["nan"]
        );
        assert.equal(doc.getElementById("tags").children.length, 3);
        assert.equal(doc.getElementById("archives").children.length, 7);
      }).
      then(done);
  }
);

QUnit.test("Get of /blog/post/twenty (Markdown+code) returns ok and highlighting", (assert) => {
  assert.expect(7);
  const done = assert.async();
  fetch("/blog/post/twenty").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "application/xml");
      assert.equal(doc.getElementsByClassName("language-js").length, 1);
      assertPostTags(assert, doc, ["even"]);
    }).
    then(done);
});

QUnit.test("Get of /blog/post/nan (no dates, HTML) returns ok and content", (assert) => {
  assert.expect(64);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog/post/nan").
    then((response) => {
      responseUrl = response.url;
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(assert, responseUrl, text, false, "Test post - nan");
      assertSingleTagText(assert, doc, "h3", "nan");
      assertSingleTagText(assert, doc, "h4", "Test post - nan");
      assertSingleTagText(assert, doc, "h5", "1970-01-01T00:00:00.000Z");
      assertSingleTagText(assert, doc, "h6", "1970-01-01T00:00:00.000Z");
      assertSingleTagText(assert, doc, "blockquote", "html");
      assert.equal(doc.getElementsByTagName("div").length, 1);
      assert.equal(doc.getElementsByTagName("div")[0].childElementCount, 1);
      const content = doc.getElementsByTagName("div")[0].firstElementChild;
      assertElementNameText(assert, content, "p", "Content for nan, links to one and one");
      assertElementNameText(assert, content.firstElementChild, "i", "nan");
      assertElementNameText(assert, content.children[1], "a", "one");
      const href = `${location.origin}/blog/post/one`;
      assert.equal(content.children[1].getAttribute("href"), href);
      assertElementNameText(assert, content.children[1], "a", "one");
      assert.equal(content.lastElementChild.getAttribute("href"), href);
      assert.equal(doc.getElementsByTagName("a").length, 14);
      assertListTextAndLinks(
        assert,
        doc,
        "references",
        "/blog/post/",
        [
          "Test post - one",
          "Test post - eleven"
        ],
        [
          "one",
          "eleven"
        ]
      );
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test("Get of /blog/post/zero (unpublished) returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/post/zero").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.ok(text.includes("Not Found"));
    }).
    then(done);
});

QUnit.test("Get of /blog/post/missing (missing) returns 404 (inline)", (assert) => {
  assert.expect(53);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog/post/missing").
    then((response) => {
      responseUrl = response.url;
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(assert, responseUrl, text, true, "Not Found");
      assertSingleTagText(assert, doc, "h3", "Not Found");
      assertSingleTagText(assert, doc, "h4", "");
      assertSingleTagText(assert, doc, "h5", "1970-01-01T00:00:00.000Z");
      assertSingleTagText(assert, doc, "h5", "1970-01-01T00:00:00.000Z");
      assert.equal(doc.getElementsByTagName("div").length, 1);
      assert.equal(doc.getElementsByTagName("div")[0].childElementCount, 2);
      const [parent] = doc.getElementsByTagName("div");
      assertElementNameText(assert, parent.firstChild, "strong", "HTTP 404");
      assertElementNameText(assert, parent.lastChild, "p", "Not Found");
      assert.equal(doc.getElementsByTagName("a").length, 10);
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.module("Search");

QUnit.test("Get of /blog/search?query=tw* returns ok, compressed HTML, and 4 posts", (assert) => {
  assert.expect(45);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog/search?query=tw*").
    then((response) => {
      responseUrl = response.url;
      assertResponseAndHeaders(assert, response);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(assert, responseUrl, text, true, null, "Search: tw*");
      assert.equal(doc.getElementsByTagName("h3").length, 5);
      const postTitles = "two twentytwo twentyone twenty twelve".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerHTML, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 16);
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test(
  "Get of /blog/search?query=content&page=thirteen returns ok, compressed HTML, and 10 posts",
  (assert) => {
    assert.expect(38);
    const done = assert.async();
    let responseUrl = null;
    fetch("/blog/search?query=content&page=thirteen").
      then((response) => {
        responseUrl = response.url;
        assert.ok(response.ok);
        return response.text();
      }).
      then((text) => {
        const doc = assertPageMetadata(assert, responseUrl, text, true, null, "Search: content");
        assert.equal(doc.getElementsByTagName("h3").length, 10);
        assert.equal(doc.getElementsByTagName("a").length, 20);
        assert.equal(doc.getElementById("tags").children.length, 3);
        assert.equal(doc.getElementById("archives").children.length, 7);
      }).
      then(done);
  }
);

QUnit.test("Get of /blog/search?query=missing returns ok and 0 posts", (assert) => {
  assert.expect(38);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog/search?query=missing").
    then((response) => {
      responseUrl = response.url;
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(assert, responseUrl, text, true, null, "Search: missing");
      assert.equal(doc.getElementsByTagName("h3").length, 0);
      assert.equal(doc.getElementsByTagName("a").length, 10);
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test(
  "Get of /blog/search?query=ei*+-title%3Aeighteen returns ok, compressed HTML, and 1 post",
  (assert) => {
    assert.expect(41);
    const done = assert.async();
    let responseUrl = null;
    fetch("/blog/search?query=ei*+-title%3Aeighteen").
      then((response) => {
        responseUrl = response.url;
        assertResponseAndHeaders(assert, response);
        return response.text();
      }).
      then((text) => {
        const doc = assertPageMetadata(
          assert,
          responseUrl,
          text,
          true,
          null,
          "Search: ei* -title:eighteen"
        );
        assert.equal(doc.getElementsByTagName("h3").length, 1);
        const postTitles = "eight".split(" ");
        for (const item of doc.getElementsByTagName("h3")) {
          assert.equal(item.innerHTML, postTitles.shift());
        }
        assert.equal(doc.getElementsByTagName("a").length, 12);
        assert.equal(doc.getElementById("tags").children.length, 3);
        assert.equal(doc.getElementById("archives").children.length, 7);
      }).
      then(done);
  }
);

QUnit.test(
  "Get of /blog/search?query=ni*+-tag%3Asquare returns ok, compressed HTML, and 1 post",
  (assert) => {
    assert.expect(41);
    const done = assert.async();
    let responseUrl = null;
    fetch("/blog/search?query=ni*+-tag%3Asquare").
      then((response) => {
        responseUrl = response.url;
        assertResponseAndHeaders(assert, response);
        return response.text();
      }).
      then((text) => {
        const doc = assertPageMetadata(
          assert,
          responseUrl,
          text,
          true,
          null,
          "Search: ni* -tag:square"
        );
        assert.equal(doc.getElementsByTagName("h3").length, 1);
        const postTitles = "nineteen".split(" ");
        for (const item of doc.getElementsByTagName("h3")) {
          assert.equal(item.innerHTML, postTitles.shift());
        }
        assert.equal(doc.getElementsByTagName("a").length, 10);
        assert.equal(doc.getElementById("tags").children.length, 3);
        assert.equal(doc.getElementById("archives").children.length, 7);
      }).
      then(done);
  }
);

QUnit.test("Get of /blog/search returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/search").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.ok(text.includes("Not Found"));
    }).
    then(done);
});

QUnit.module("Tag");

QUnit.test("Get of /blog returns 3 tag links", (assert) => {
  assert.expect(12);
  const done = assert.async();
  fetch("/blog").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "application/xml");
      assertListTextAndLinks(assert, doc, "tags", "/blog/tag/", "even Fibonacci square".split(" "));
    }).
    then(done);
});

QUnit.test("Get of /blog/tag/even returns ok, compressed HTML, and 10 posts", (assert) => {
  assert.expect(55);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog/tag/even").
    then((response) => {
      responseUrl = response.url;
      assertResponseAndHeaders(assert, response);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(
        assert,
        responseUrl,
        text,
        true,
        null,
        "Posts tagged \"even\""
      );
      assert.equal(doc.getElementsByTagName("h3").length, 10);
      const postTitles =
        "two four six eight ten twelve fourteen sixteen eighteen twenty".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerHTML, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 25);
      const nav = doc.getElementsByClassName("navigation");
      assert.equal(nav.length, 1);
      assert.equal(nav[0].childElementCount, 1);
      assertElementNameText(assert, nav[0].firstElementChild, "a", "Next Posts \u00bb");
      assert.equal(nav[0].firstElementChild.getAttribute("href"), "/blog/tag/even?page=twentytwo");
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test("Get of /blog/tag/fibonacci (wrong case) returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/tag/fibonacci").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.ok(text.includes("Not Found"));
    }).
    then(done);
});

QUnit.module("Archive");

QUnit.test("Get of /blog returns 6 archive links", (assert) => {
  assert.expect(24);
  const done = assert.async();
  fetch("/blog").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "application/xml");
      const texts = ("February 2018,January 2018,December 2017,November 2017," +
        "October 2017,September 2017,August 2017").split(",");
      const links = "201802 201801 201712 201711 201710 201709 201708".split(" ");
      assertListTextAndLinks(assert, doc, "archives", "/blog/archive/", texts, links);
    }).
    then(done);
});

QUnit.test("Get of /blog/archive/201801 returns ok, compressed HTML, and 3 posts", (assert) => {
  assert.expect(43);
  const done = assert.async();
  let responseUrl = null;
  fetch("/blog/archive/201801").
    then((response) => {
      responseUrl = response.url;
      assertResponseAndHeaders(assert, response);
      return response.text();
    }).
    then((text) => {
      const doc = assertPageMetadata(
        assert,
        responseUrl,
        text,
        true,
        null,
        "Posts from January 2018"
      );
      assert.equal(doc.getElementsByTagName("h3").length, 3);
      const postTitles = "four five six".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerHTML, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 14);
      assert.equal(doc.getElementById("tags").children.length, 3);
      assert.equal(doc.getElementById("archives").children.length, 7);
    }).
    then(done);
});

QUnit.test("Get of /blog/archive/300001 (unpublished post) returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/archive/300001").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.ok(text.includes("Not Found"));
    }).
    then(done);
});

QUnit.test("Get of /blog/archive/1234 (invalid) returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/archive/1234").
    then((response) => {
      assertNotFound(assert, response);
      return response.text();
    }).
    then((text) => {
      assert.ok(text.includes("Not Found"));
    }).
    then(done);
});

QUnit.module("RSS");

QUnit.test(
  "Get of /blog/rss returns ok, compressed XML, and 20 posts with absolute URIs",
  (assert) => {
    assert.expect(95);
    const done = assert.async();
    fetch("/blog/rss").
      then((response) => {
        assertResponseAndHeaders(assert, response, "application/rss+xml; charset=utf-8");
        return response.text();
      }).
      then((text) => {
        assert.ok((/^<\?xml version="1.0" encoding="UTF-8"\?>/u).test(text));
        const doc = new DOMParser().parseFromString(text, "text/xml");
        assert.equal(doc.getElementsByTagName("title").length, 21);
        const titles = ("simple-website-with-blog/test " +
          "one two three four five six seven eight nine ten " +
          "twenty nineteen eighteen seventeen sixteen fifteen fourteen thirteen twelve eleven").
          split(" ");
        for (const item of doc.getElementsByTagName("title")) {
          assert.equal(item.textContent.replace(/^Test post - /u, ""), titles.shift());
        }
        for (const link of doc.getElementsByTagName("link")) {
          assert.ok((/^https?:\/\/[^/]+\/blog(\/post\/[a-z]+)?$/u).test(link.textContent));
        }
        const uriRe = /[^"<>[\]]+\/[^"<>[\]]+/gu;
        let match = null;
        while ((match = uriRe.exec(text)) !== null) {
          const [url] = match;
          if ((url !== "simple-website-with-blog/test") &&
              (url !== "application/rss+xml")) {
            assert.ok(new URL(url));
          }
        }
      }).
      then(done);
  }
);

QUnit.module("ACME");

QUnit.test(
  "Get of /.well-known/acme-challenge/[short] returns ok and correct content",
  (assert) => {
    assert.expect(2);
    const done = assert.async();
    const prefix = "abc";
    const suffix = "123";
    fetch(`/.well-known/acme-challenge/${prefix}`).
      then((response) => {
        assert.ok(response.ok);
        return response.text();
      }).
      then((text) => {
        assert.equal(`${prefix}.${suffix}`, text);
      }).
      then(done);
  }
);

QUnit.test(
  "Get of /.well-known/acme-challenge/[long] returns ok and correct content",
  (assert) => {
    assert.expect(2);
    const done = assert.async();
    const prefix = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG";
    const suffix = "HIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmn";
    fetch(`/.well-known/acme-challenge/${prefix}`).
      then((response) => {
        assert.ok(response.ok);
        return response.text();
      }).
      then((text) => {
        assert.equal(`${prefix}.${suffix}`, text);
      }).
      then(done);
  }
);
