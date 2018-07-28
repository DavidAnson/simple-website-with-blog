"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");

module.exports = (props) => {
  const posts = props.posts.map((post) => {
    const content = post.contentJson.map((photo, index) => (
      <div key={index}>
        <img src={`/photos/${photo.image}`} title={photo.caption}/>
        <p>{photo.caption}</p>
      </div>
    ));
    return (
      <section key={post.id}>
        <hr/>
        <h2><a href={`/blog/post/${post.id}`}>{post.title}</a></h2>
        <p><time dateTime={post.date.toISOString()}>{post.date.toDateString()}</time></p>
        {content}
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
        {posts}
      </body>
    </html>
  );
};
