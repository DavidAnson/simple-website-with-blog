"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
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
        return (React.createElement(React.Fragment, { key: index },
            React.createElement("img", { src: src, srcSet: srcSet, alt: photo.caption }),
            React.createElement("p", null, photo.caption)));
    });
    return React.createElement(React.Fragment, null, content);
};
module.exports.getHtmlElements = (props) => {
    const archives = shared.getArchiveList(props.archives);
    const posts = props.posts.map((post) => {
        const publishDate = shared.getPublishDate(post);
        const relatedList = shared.getRelatedList(true, "See also:", post.related, props.publishedPostFilter);
        return (React.createElement("article", { key: post.id, className: "post" },
            React.createElement("h2", null,
                React.createElement("a", { href: `/blog/post/${post.id}` }, post.title)),
            React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } }),
            relatedList,
            publishDate ? React.createElement("p", null,
                "Posted ",
                publishDate) : null,
            React.createElement("hr", null)));
    });
    const title = shared.getTitle(props, strings);
    const heading = shared.getHeading(props);
    const context = {};
    const ogImages = props.posts.filter((post) => post.ogImage).map((post) => post.ogImage);
    [context.ogImage] = ogImages;
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, title),
            React.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
            React.createElement("meta", { name: "description", content: shared.getDescription(props, strings) }),
            React.createElement("meta", { name: "author", content: strings.author }),
            shared.getTwitterOpenGraph(props, context, strings),
            shared.getMetaRobots(props.noindex),
            React.createElement("link", { rel: "alternate", type: "application/rss+xml", href: "/blog/rss", title: strings.title }),
            React.createElement("link", { rel: "stylesheet", href: "/blog.css" }),
            React.createElement("link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" })),
        React.createElement("body", null,
            React.createElement("header", { className: "banner" },
                React.createElement("h1", null,
                    React.createElement("a", { href: "/blog" }, strings.description))),
            React.createElement("div", { className: "content" },
                React.createElement("main", { className: "posts" },
                    heading ? React.createElement(React.Fragment, null,
                        React.createElement("h2", null, heading),
                        React.createElement("hr", null)) : null,
                    posts,
                    shared.getPrevNextLinks(props),
                    React.createElement("footer", null,
                        React.createElement("p", { className: "copyright" }, strings.copyright))),
                React.createElement("nav", { className: "sidebar" },
                    React.createElement("h2", null, "Search"),
                    React.createElement("form", { action: "/blog/search" },
                        React.createElement("input", { type: "text", name: "query", accessKey: "s", placeholder: "cat -dog ham*", "aria-label": "Search" })),
                    React.createElement("h2", null, "Archive"),
                    React.createElement("ul", null, archives))))));
};
module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
