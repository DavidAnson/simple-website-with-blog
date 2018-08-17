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
  let headingText = null;
  if (props.period) {
    headingText = `Posts from ${shared.dateTimeFormatMonth.format(props.period)}`;
  } else if (props.query) {
    headingText = `Search: ${props.query}`;
  }
  const posts = props.posts.map((post) => {
    const publishDateIso = post.publishDate.toISOString();
    const publishDateFormat = shared.dateTimeFormatWeekday.format(post.publishDate);
    const publishDate = (post.publishDate.getTime() > 0)
      ? <p><time dateTime={publishDateIso}>{publishDateFormat}</time></p>
      : null;
    return (
      <section key={post.id}>
        <hr/>
        <h2><a href={`/blog/post/${post.id}`}>{getTitle(post)}</a></h2>
        {publishDate}
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
      </section>
    );
  });
  const title = [
    props.title || headingText,
    blogName
  ].
    filter((part) => Boolean(part)).
    join(" - ");
  const prevLink = props.prevLink ? <a href={props.prevLink}>Newer Posts</a> : null;
  const nextLink = props.nextLink ? <a href={props.nextLink}>Older Posts</a> : null;
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width"/>
        <meta name="description" content="The blog of a simple web site"/>
        <link rel="alternate" type="application/rss+xml" href="/blog/rss" title={blogName}/>
        <link rel="stylesheet" href="/xcode.css"/>
      </head>
      <body>
        <h1><a href="/blog">The blog of simple-website-with-blog</a></h1>
        <ul>{archives}</ul>
        <p><a href="/blog/post/about">About this blog</a></p>
        <form action="/blog/search">
          <input type="text" name="query" placeholder="Search" accessKey="s"/>
        </form>
        {headingText ? <h2>{headingText}</h2> : null}
        {posts}
        <div>{nextLink} {prevLink}</div>
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
