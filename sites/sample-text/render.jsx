"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");

const dateFormatOptionsWeekday = {
  "weekday": "long",
  "year": "numeric",
  "month": "long",
  "day": "numeric"
};
const dateFormatOptionsMonth = {
  "year": "numeric",
  "month": "long"
};
const dateTimeFormatWeekday = new Intl.DateTimeFormat("en-US", dateFormatOptionsWeekday);
const dateTimeFormatMonth = new Intl.DateTimeFormat("en-US", dateFormatOptionsMonth);

module.exports = (props) => {
  const archives = props.archives.map((period) => {
    const year = period.
      getFullYear().
      toString().
      padStart(4, "0");
    const month = (period.getMonth() + 1).
      toString().
      padStart(2, "0");
    const archiveLink = `${year}${month}`;
    return (
      <li key={archiveLink}>
        <a href={`/blog/archive/${archiveLink}`}>{dateTimeFormatMonth.format(period)}</a>
      </li>
    );
  });
  const heading = props.period
    ? <h2>Posts from {dateTimeFormatMonth.format(props.period)}</h2>
    : null;
  const posts = props.posts.map((post) => {
    const content = post.contentJson
      ? <div>{post.contentJson.map((line, index) => <p key={index}>{line}</p>)}</div>
      : <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>;
    const postDateIso = post.date.toISOString();
    const postDateFormat = dateTimeFormatWeekday.format(post.date);
    const date = (post.date.getTime() > 0)
      ? <p><time dateTime={postDateIso}>{postDateFormat}</time></p>
      : null;
    return (
      <section key={post.id}>
        <hr/>
        <h2><a href={`/blog/post/${post.id}`}>{post.title}</a></h2>
        {date}
        {content}
      </section>
    );
  });
  return (
    <html lang="en">
      <head>
        <title>simple-website-with-blog/sample-text</title>
        <meta name="viewport" content="width=device-width"/>
        <meta name="description" content="The blog of a simple web site"/>
        <link rel="stylesheet" href="/xcode.css"/>
      </head>
      <body>
        <h1><a href="/blog">The blog of simple-website-with-blog</a></h1>
        <ul>{archives}</ul>
        <p><a href="/blog/post/about">About this blog</a></p>
        {heading}
        {posts}
      </body>
    </html>
  );
};
