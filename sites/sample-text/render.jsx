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

module.exports.getPostTitle = (post) => post.title;

module.exports.getContentJsonElements = (contentJson) => {
  const content = contentJson.map((line, index) => <p key={index}>{line}</p>);
  return <div>{content}</div>;
};

module.exports.getHtmlElements = (props) => {
  const tags = shared.getTagList(props.tags);
  const archives = shared.getArchiveList(props.archives);
  const posts = props.posts.map((post) => (
    <section key={post.id}>
      <hr/>
      <h2><a href={`/blog/post/${post.id}`}>{post.title}</a></h2>
      {shared.getPublishDate(post)}
      <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
    </section>
  ));
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
        <p><a href="/blog/post/mit-license">MIT License</a></p>
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
