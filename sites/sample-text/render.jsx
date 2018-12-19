"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");

const strings = {
  "title": "simple-website-with-blog/sample-text",
  "description": "The blog of a simple website",
  "author": "David Anson",
  "twitter": "@DavidAns",
  "avatar": "/avatar.png",
  "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by David Anson`
};

module.exports.getPostTitle = (post) => post.title;

module.exports.getContentJsonElements = (post) => {
  const content = post.contentJson.map((line, index) => <p key={index}>{line}</p>);
  return <div>{content}</div>;
};

module.exports.getHtmlElements = (props) => {
  const tags = shared.getTagList(props.tags);
  const archives = shared.getArchiveList(props.archives);
  const posts = props.posts.map((post) => {
    const tagLinks = shared.getTagLinks(post.tags);
    const references =
      shared.getReferences(Boolean(props.title), post.references, props.publishedPostFilter);
    return (
      <div key={post.id} className="post">
        <h2><a href={`/blog/post/${post.id}`}>{post.title}</a></h2>
        {shared.getPublishDate(post)}
        <div className={post.contentSource} dangerouslySetInnerHTML={{"__html": post.contentHtml}}>
        </div>
        {tagLinks}
        {references
          ? (<div className="references">
            <p>Related Posts:</p>
            {references}
          </div>)
          : null
        }
      </div>
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
        <link rel="alternate" type="application/rss+xml" href="/blog/rss" title={strings.title}/>
        <link rel="stylesheet" href="/blog.css"/>
        <link rel="stylesheet" href="/xcode.css"/>
      </head>
      <body>
        <div className="column">
          <h1 className="banner">
            <a href="/blog">{strings.description}</a>
          </h1>
          <div className="content">
            <div className="posts">
              {heading ? <h2>{heading}</h2> : null}
              {posts}
              {shared.getPrevNextLinks(props)}
            </div>
            <div className="sidebar">
              <img src="/avatar.png" alt={strings.author}/>
              <h2>About</h2>
              <p>{strings.description}</p>
              <p>By {strings.author}</p>
              <h2>License</h2>
              <p><a href="/blog/post/mit-license">MIT</a></p>
              <h2>Search</h2>
              <form action="/blog/search">
                <input type="text" name="query" accessKey="s"
                  placeholder="HTML -CSS Java*" aria-label="Search"/>
              </form>
              <h2>Tags</h2>
              <ul>{tags}</ul>
              <h2>Archive</h2>
              <ul>{archives}</ul>
            </div>
          </div>
          <div className="copyright">{strings.copyright}</div>
        </div>
      </body>
    </html>
  );
};

module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
