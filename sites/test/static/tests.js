"use strict";

// Suppress [ts] Cannot find name 'QUnit'.
// eslint-disable-next-line no-var, no-use-before-define
var QUnit = QUnit;

QUnit.test("Current browser supports fetch API", (assert) => {
  assert.expect(1);
  assert.ok(fetch);
});

QUnit.test("Get of / returns ok and compressed HTML content", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "text/html; charset=UTF-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
    }).
    then(done);
});

QUnit.test("Get of /tests.js returns ok and compressed JS content", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/tests.js").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "application/javascript; charset=UTF-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^"use strict";/u).test(text));
    }).
    then(done);
});

QUnit.test("Get of / returns expected HTTP headers", (assert) => {
  assert.expect(13);
  const done = assert.async();
  fetch("/").
    then((response) => {
      const {headers} = response;
      [
        // Content headers
        "Content-Encoding",
        "Content-Type",
        // Caching headers
        "Cache-Control",
        "ETag",
        "Last-Modified",
        // Security headers
        "Content-Security-Policy",
        "Referrer-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-DNS-Prefetch-Control",
        "X-Download-Options",
        "X-Frame-Options",
        "X-XSS-Protection"
      ].forEach((name) => {
        assert.ok(headers.has(name));
      });
    }).
    then(done);
});

QUnit.test("Get of /blog returns ok, compressed HTML content, and 10 posts", (assert) => {
  assert.expect(23);
  const done = assert.async();
  fetch("/blog").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      assert.equal(doc.getElementsByTagName("title").length, 1);
      assert.equal(doc.getElementsByTagName("title")[0].innerText, "simple-website-with-blog/test");
      assert.equal(doc.getElementsByTagName("h1").length, 1);
      assert.equal(doc.getElementsByTagName("h1")[0].innerText, "Test blog");
      assert.equal(doc.getElementsByTagName("h2").length, 1);
      assert.equal(doc.getElementsByTagName("h2")[0].innerText, "");
      assert.equal(doc.getElementsByTagName("h3").length, 10);
      const postTitles = "one two three four five six seven eight nine ten".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerText, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 4);
      assert.equal(doc.getElementsByTagName("li").length, 4);
    }).
    then(done);
});
