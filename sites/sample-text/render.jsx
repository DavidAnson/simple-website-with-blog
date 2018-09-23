"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");

const strings = {
  "title": "simple-website-with-blog/sample-text",
  "description": "The blog of a simple web site",
  "author": "David Anson",
  "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by David Anson`
};

const getPostTitle = (post) => post.title;
module.exports.getPostTitle = getPostTitle;

module.exports.getContentJsonElements = (contentJson) => {
  const content = contentJson.map((line, index) => <p key={index}>{line}</p>);
  return <div>{content}</div>;
};

module.exports.getHtmlElements = (props) => {
  const tags = shared.getTagList(props.tags);
  const archives = shared.getArchiveList(props.archives);
  const posts = props.posts.map((post) => {
    const publishDateIso = post.publishDate.toISOString();
    const publishDateFormat = shared.dateTimeFormatWeekday.format(post.publishDate);
    const publishDate = (post.publishDate.getTime() > 0)
      ? <p><time dateTime={publishDateIso}>{publishDateFormat}</time></p>
      : null;
    return (
      <section key={post.id}>
        <hr/>
        <h2><a href={`/blog/post/${post.id}`}>{getPostTitle(post)}</a></h2>
        {publishDate}
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
      </section>
    );
  });
  const {title, heading} = shared.getTitleHeading(props, strings);
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width"/>
        <meta name="description" content={strings.description}/>
        {shared.getMetaRobots(props.noindex)}
        <link rel="alternate" type="application/rss+xml" href="/blog/rss" title={strings.title}/>
        <link rel="stylesheet" href="/xcode.css"/>
      </head>
      <body>
        <h1><a href="/blog">The blog of simple-website-with-blog</a></h1>
        <ul>{tags}</ul>
        <ul>{archives}</ul>
        <p><a href="/blog/post/about">About this blog</a></p>
        <form action="/blog/search">
          <input type="text" name="query" placeholder="HTML -CSS Java*" accessKey="s"/>
        </form>
        {heading ? <h2>{heading}</h2> : null}
        {posts}
        {shared.getPrevNextLinks(props)}
      </body>
    </html>
  );
};

module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
