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
    const content = post.contentJson
      ? <div>{post.contentJson.map((line, index) => <p key={index}>{line}</p>)}</div>
      : <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>;
    const postDateIso = post.date.toISOString();
    const postDateFormat = shared.dateTimeFormatWeekday.format(post.date);
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
