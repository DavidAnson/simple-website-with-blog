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

module.exports.getContentJsonElements = (contentJson) => {
  const content = contentJson.map((line, index) => <p key={index}>{line}</p>);
  return <>{content}</>;
};

module.exports.getHtmlElements = (props) => {
  const tags = shared.getTagList(props.tags);
  const archives = shared.getArchiveList(props.archives);
  const posts = props.posts.map((post) => {
    const tagLinks = shared.getTagLinks(post.tags);
    const references =
      shared.getReferences(Boolean(props.title), post.references, props.publishedPostFilter);
    return (
      <section key={post.id}>
        <h3>{post.id}</h3>
        <h4>{post.title}</h4>
        <h5>{post.publishDate.toISOString()}</h5>
        <h6>{post.contentDate.toISOString()}</h6>
        <blockquote>{post.contentSource}</blockquote>
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
        {tagLinks}
        <article className="references">
          {references}
        </article>
      </section>
    );
  });
  const title = shared.getTitle(props, strings);
  const heading = shared.getHeading(props);
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width"/>
        <meta name="description" content={shared.getDescription(props, strings)}/>
        <meta name="author" content={strings.author}/>
        {shared.getTwitterOpenGraph(props, strings)}
        {shared.getMetaRobots(props.noindex)}
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
