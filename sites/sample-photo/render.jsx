"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");
// eslint-disable-next-line no-useless-concat
const config = require("../../" + "config.js");

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
    const src = `${config.hostnameToken}/photos/${photo.image}`;
    const srcSet = photo.image2x ? `${config.hostnameToken}/photos/${photo.image2x} 2x` : null;
    return (
      <React.Fragment key={index}>
        <img src={src} srcSet={srcSet} alt={photo.caption}/>
        <p>{photo.caption}</p>
      </React.Fragment>
    );
  });
  return <React.Fragment>{content}</React.Fragment>;
};

module.exports.getHtmlElements = (props) => {
  const archives = shared.getArchiveList(props.archives);
  const posts = props.posts.map((post) => {
    const publishDate = shared.dateTimeFormatWeekday.format(post.publishDate);
    return (
      <div key={post.id} className="post">
        <h2><a href={`/blog/post/${post.id}`}>{getPostTitle(post)}</a></h2>
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
        <p>
          Posted <time dateTime={post.publishDate.toISOString()}>{publishDate}</time>
        </p>
        <hr/>
      </div>
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
        <link rel="stylesheet" href="/blog.css"/>
      </head>
      <body>
        <div className="banner">
          <h1><a href="/blog">{strings.description}</a></h1>
        </div>
        <div className="content">
          <div className="posts">
            {heading ? <React.Fragment><h2>{heading}</h2><hr/></React.Fragment> : null}
            {posts}
            {shared.getPrevNextLinks(props)}
            <p className="copyright">{strings.copyright}</p>
          </div>
          <div className="sidebar">
            <h2>Search</h2>
            <form action="/blog/search">
              <input type="text" name="query" accessKey="s" placeholder="cat -dog ham*"/>
            </form>
            <h2>Archive</h2>
            <ul>{archives}</ul>
          </div>
        </div>
      </body>
    </html>
  );
};

module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
