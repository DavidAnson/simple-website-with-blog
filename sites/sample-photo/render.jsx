"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");

const dateFormatOptionsWeekday = {
  "weekday": "long",
  "year": "numeric",
  "month": "long",
  "day": "numeric"
};
const dateFormatOptionsDay = {
  "year": "numeric",
  "month": "long",
  "day": "numeric"
};
const dateFormatOptionsMonth = {
  "year": "numeric",
  "month": "long"
};
const dateTimeFormatWeekday = new Intl.DateTimeFormat("en-US", dateFormatOptionsWeekday);
const dateTimeFormatDay = new Intl.DateTimeFormat("en-US", dateFormatOptionsDay);
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
    const content = post.contentJson.map((photo, index) => {
      const src = `/photos/${photo.image}`;
      const srcSet = photo.image2x ? `/photos/${photo.image2x} 2x` : null;
      return (
        <div key={index}>
          <img src={src} srcSet={srcSet} alt={photo.caption}/>
          <p>{photo.caption}</p>
        </div>
      );
    });
    const contentDate = dateTimeFormatDay.format(post.contentDate);
    const date = dateTimeFormatWeekday.format(post.date);
    return (
      <section key={post.id}>
        <hr/>
        <h2><a href={`/blog/post/${post.id}`}>{contentDate} - {post.title}</a></h2>
        {content}
        <p>Posted <time dateTime={post.date.toISOString()}>{date}</time></p>
      </section>
    );
  });
  return (
    <html lang="en">
      <head>
        <title>simple-website-with-blog/sample-photo</title>
        <meta name="viewport" content="width=device-width"/>
        <meta name="description" content="The photo blog of a simple web site"/>
      </head>
      <body>
        <h1><a href="/blog">The photo blog of simple-website-with-blog</a></h1>
        <ul>{archives}</ul>
        {heading}
        {posts}
      </body>
    </html>
  );
};
