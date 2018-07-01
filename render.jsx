"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");

module.exports = (props) => {
  const posts = props.posts.map((post) => (
    <section key={post.title}>
      <hr/>
      <h2>{post.title}</h2>
      <time dateTime={post.date.toISOString()}>{post.date.toDateString()}</time>
      <p>{post.content}</p>
    </section>
  ));
  return (
    <html lang="en">
      <head>
        <title>simple-website-with-blog</title>
        <meta name="viewport" content="width=device-width"/>
        <meta name="description" content="The blog of a simple web site"/>
      </head>
      <body>
        <h1><a href="/blog">The blog of simple-website-with-blog</a></h1>
        {posts}
      </body>
    </html>
  );
};
