"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");

const dateFormatOptions = {
  "weekday": "long",
  "year": "numeric",
  "month": "long",
  "day": "numeric"
};
const dateTimeFormat = new Intl.DateTimeFormat("en-US", dateFormatOptions);

module.exports = (props) => {
  const posts = props.posts.map((post) => {
    const content = post.contentJson
      ? <div>{post.contentJson.map((line, index) => <p key={index}>{line}</p>)}</div>
      : <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>;
    const date = (post.date.getTime() > 0)
      ? <p><time dateTime={post.date.toISOString()}>{dateTimeFormat.format(post.date)}</time></p>
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
        <p><a href="/blog/post/about">About this blog</a></p>
        {posts}
      </body>
    </html>
  );
};
