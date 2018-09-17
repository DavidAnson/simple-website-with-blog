"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");

const strings = {
  "title": "simple-website-with-blog/test",
  "description": "Test blog",
  "author": "David Anson",
  "copyright": "Copyright \u00a9 David Anson"
};

const getPostTitle = (post) => `Test post - ${post.title}`;
module.exports.getPostTitle = getPostTitle;

module.exports.getContentJsonElements = (contentJson) => {
  const content = contentJson.map((line, index) => <p key={index}>{line}</p>);
  return <>{content}</>;
};

module.exports.getHtmlElements = (props) => {
  const archives = shared.getArchiveList(props.archives);
  const posts = props.posts.map((post) => (
    <section key={post.id}>
      <h3>{post.id}</h3>
      <h4>{getPostTitle(post)}</h4>
      <h5>{post.publishDate.toISOString()}</h5>
      <h6>{post.contentDate.toISOString()}</h6>
      <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
    </section>
  ));
  const {title, heading} = shared.getTitleHeading(props, strings);
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width"/>
        {shared.getNoIndexTag(props.noindex)}
      </head>
      <body>
        <h1>{strings.description}</h1>
        <h2>{heading}</h2>
        {posts}
        {shared.getPrevNextLinks(props)}
        <ul>{archives}</ul>
      </body>
    </html>
  );
};

module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
