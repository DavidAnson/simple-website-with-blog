"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");

const blogName = "simple-website-with-blog/sample-text";

const getTitle = (post) => post.title;
module.exports.getTitle = getTitle;

module.exports.getContentElements = (post) => {
  const content = post.contentJson.map((line, index) => <p key={index}>{line}</p>);
  return <div>{content}</div>;
};

module.exports.getHtmlElements = (props) => {
  const archives = shared.getArchiveList(props.archives);
  const heading = props.period
    ? `Posts from ${shared.dateTimeFormatMonth.format(props.period)}`
    : null;
  const posts = props.posts.map((post) => {
    const postDateIso = post.date.toISOString();
    const postDateFormat = shared.dateTimeFormatWeekday.format(post.date);
    const date = (post.date.getTime() > 0)
      ? <p><time dateTime={postDateIso}>{postDateFormat}</time></p>
      : null;
    return (
      <section key={post.id}>
        <hr/>
        <h2><a href={`/blog/post/${post.id}`}>{getTitle(post)}</a></h2>
        {date}
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
      </section>
    );
  });
  const titlePrefix = heading || props.title;
  const title = (titlePrefix ? `${titlePrefix} - ` : "") + blogName;
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width"/>
        <meta name="description" content="The blog of a simple web site"/>
        <link rel="alternate" type="application/rss+xml" href="/blog/rss"
          title={blogName}/>
        <link rel="stylesheet" href="/xcode.css"/>
      </head>
      <body>
        <h1><a href="/blog">The blog of simple-website-with-blog</a></h1>
        <ul>{archives}</ul>
        <p><a href="/blog/post/about">About this blog</a></p>
        {props.period ? <h2>{heading}</h2> : null}
        {posts}
      </body>
    </html>
  );
};

module.exports.getRssMetadata = () => {
  const author = "David Anson";
  return {
    "title": blogName,
    "description": "The blog of a simple web site",
    author,
    "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by ${author}`
  };
};
