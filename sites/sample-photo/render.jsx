"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");

module.exports = (props) => {
  const archives = shared.getArchiveList(props.archives);
  const heading = props.period
    ? <h2>Posts from {shared.dateTimeFormatMonth.format(props.period)}</h2>
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
    const contentDate = shared.dateTimeFormatDay.format(post.contentDate);
    const date = shared.dateTimeFormatWeekday.format(post.date);
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
