"use strict";

// eslint-disable-next-line no-unused-vars
const React = require("react");
// eslint-disable-next-line no-useless-concat
const shared = require("../" + "shared.js");
// eslint-disable-next-line no-useless-concat
const config = require("../../" + "config.js");

const strings = {
  "title": "simple-website-with-blog/sample-photo",
  "description": "The photo blog of a simple website",
  "author": "David Anson",
  "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by David Anson`
};

module.exports.getPostTitle = (post) => {
  const contentDate = shared.dateTimeFormatDay.format(post.contentDate);
  return `${contentDate} - ${post.title}`;
};

module.exports.getContentJsonElements = (post) => {
  const content = post.contentJson.map((photo, index) => {
    const src = `${config.hostnameToken}/photos/${photo.image}`;
    const srcSet = photo.image2x ? `${config.hostnameToken}/photos/${photo.image2x} 2x` : null;
    post.ogImage = post.ogImage || src;
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
    const publishDate = shared.getPublishDate(post);
    const relatedList =
      shared.getRelatedList(true, "See also:", post.related, props.publishedPostFilter);
    return (
      <article key={post.id} className="post">
        <h2><a href={`/blog/post/${post.id}`}>{post.title}</a></h2>
        <div dangerouslySetInnerHTML={{"__html": post.contentHtml}}></div>
        {relatedList}
        {publishDate ? <p>Posted {publishDate}</p> : null}
        <hr/>
      </article>
    );
  });
  const title = shared.getTitle(props, strings);
  const heading = shared.getHeading(props);
  const context = {};
  const ogImages = props.posts.filter((post) => post.ogImage).map((post) => post.ogImage);
  [context.ogImage] = ogImages;
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="description" content={shared.getDescription(props, strings)}/>
        <meta name="author" content={strings.author}/>
        {shared.getTwitterOpenGraph(props, context, strings)}
        {shared.getMetaRobots(props.noindex)}
        <link rel="alternate" type="application/rss+xml" href="/blog/rss" title={strings.title}/>
        <link rel="stylesheet" href="/blog.css"/>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
      </head>
      <body>
        <header className="banner">
          <h1><a href="/blog">{strings.description}</a></h1>
        </header>
        <div className="content">
          <main className="posts">
            {heading ? <React.Fragment><h2>{heading}</h2><hr/></React.Fragment> : null}
            {posts}
            {shared.getPrevNextLinks(props)}
            <footer>
              <p className="copyright">{strings.copyright}</p>
            </footer>
          </main>
          <nav className="sidebar">
            <h2>Search</h2>
            <form action="/blog/search">
              <input type="text" name="query" accessKey="s"
                placeholder="cat -dog ham*" aria-label="Search"/>
            </form>
            <h2>Archive</h2>
            <ul>{archives}</ul>
          </nav>
        </div>
      </body>
    </html>
  );
};

module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
