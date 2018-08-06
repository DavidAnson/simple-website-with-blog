"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");

const blogName = "simple-website-with-blog/sample-photo";

const getTitle = (post) => {
  const contentDate = shared.dateTimeFormatDay.format(post.contentDate);
  return `${contentDate} - ${post.title}`;
};
module.exports.getTitle = getTitle;

module.exports.getContentElements = (post) => {
  const content = post.contentJson.map((photo, index) => {
    const src = `/photos/${photo.image}`;
    const srcSet = photo.image2x ? `/photos/${photo.image2x} 2x` : null;
    return (
      <div key={index}>
        <img src={src} srcSet={srcSet} alt={photo.caption}/>
        <p>{photo.caption}</p>
      </div>
    );
  });
  return <div>{content}</div>;
};

module.exports.getHtmlElements = (props) => {
  const archives = shared.getArchiveList(props.archives);
  const heading = props.period
    ? `Posts from ${shared.dateTimeFormatMonth.format(props.period)}`
    : null;
  const posts = props.posts.map((post) => {
    const publishDate = shared.dateTimeFormatWeekday.format(post.publishDate);
    return (
      <section key={post.id}>
        <hr/>
        <h2><a href={`/blog/post/${post.id}`}>{getTitle(post)}</a></h2>
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
        <p>Posted <time dateTime={post.publishDate.toISOString()}>{publishDate}</time></p>
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
        <meta name="description" content="The photo blog of a simple web site"/>
        <link rel="alternate" type="application/rss+xml" href="/blog/rss"
          title={blogName}/>
      </head>
      <body>
        <h1><a href="/blog">The photo blog of simple-website-with-blog</a></h1>
        <ul>{archives}</ul>
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
    "description": "The photo blog of a simple web site",
    author,
    "copyright": `Copyright \u00a9 2004-${new Date().getFullYear()} by ${author}`
  };
};
