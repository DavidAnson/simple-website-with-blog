"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");

const strings = {
  "title": "simple-website-with-blog/sample-photo",
  "description": "The photo blog of a simple web site",
  "author": "David Anson",
  "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by David Anson`
};

const getPostTitle = (post) => {
  const contentDate = shared.dateTimeFormatDay.format(post.contentDate);
  return `${contentDate} - ${post.title}`;
};
module.exports.getPostTitle = getPostTitle;

module.exports.getContentJsonElements = (contentJson) => {
  const content = contentJson.map((photo, index) => {
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
  const posts = props.posts.map((post) => {
    const publishDate = shared.dateTimeFormatWeekday.format(post.publishDate);
    return (
      <section key={post.id}>
        <hr/>
        <h2><a href={`/blog/post/${post.id}`}>{getPostTitle(post)}</a></h2>
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
        <p>Posted <time dateTime={post.publishDate.toISOString()}>{publishDate}</time></p>
      </section>
    );
  });
  const {title, heading} = shared.getTitleHeading(props, strings);
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width"/>
        <meta name="description" content="The photo blog of a simple web site"/>
        <link rel="alternate" type="application/rss+xml" href="/blog/rss" title={strings.title}/>
      </head>
      <body>
        <h1><a href="/blog">The photo blog of simple-website-with-blog</a></h1>
        <ul>{archives}</ul>
        <form action="/blog/search">
          <input type="text" name="query" placeholder="Search" accessKey="s"/>
        </form>
        {heading ? <h2>{heading}</h2> : null}
        {posts}
        {shared.getPrevNextLinks(props)}
      </body>
    </html>
  );
};

module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
