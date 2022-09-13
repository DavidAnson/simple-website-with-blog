"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");

const strings = {
  "title": "simple-website-with-blog/test",
  "description": "Test blog",
  "author": "David Anson",
  "twitter": "@DavidAns",
  "avatar": "/images/piechart.png",
  "copyright": "Copyright \u00a9 David Anson"
};

module.exports.getPostTitle = (post) => `Test post - ${post.title}`;

module.exports.getContentJsonElements = (post) => {
  const content = post.contentJson.map((line, index) => <p key={index}>{line}</p>);
  return <>{content}</>;
};

module.exports.getHtmlElements = (props) => {
  const queryString = props.questionQueryString(props.searchParams);
  const tags = shared.getTagList(props.tags, queryString);
  const archives = shared.getArchiveList(props.archives, queryString);
  const posts = props.posts.map((post) => {
    const tagLinks = shared.getTagLinks(post.tags, queryString);
    const relatedList =
      shared.getRelatedList(Boolean(props.title), "Related:", post.related, props.publishedPostFilter, queryString);
    return (
      <section key={post.id}>
        <h3>{post.id}</h3>
        <h4>{post.title}</h4>
        <h5>{post.publishDate.toISOString()}</h5>
        <h6>{post.contentDate.toISOString()}</h6>
        <blockquote>{post.contentSource}</blockquote>
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
        {tagLinks}
        {relatedList}
      </section>
    );
  });
  const title = shared.getTitle(props, strings);
  const heading = shared.getHeading(props);
  const context = {
    "ogImage": "og/Image.jpg"
  };
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="color-scheme" content="light dark"/>
        <meta name="description" content={shared.getDescription(props, strings)}/>
        <meta name="author" content={strings.author}/>
        {shared.getTwitterOpenGraph(props, context, strings)}
        {shared.getMetaRobots(props.noindex)}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
      </head>
      <body>
        <h1>{strings.description}</h1>
        <h2>{heading}</h2>
        {posts}
        {shared.getPrevNextLinks(props)}
        <ul id="tags">{tags}</ul>
        <ul id="archives">{archives}</ul>
      </body>
    </html>
  );
};

module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
