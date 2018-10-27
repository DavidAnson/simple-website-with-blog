"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
const config = require("../../" + "config.js");
const strings = {
    "title": "simple-website-with-blog/sample-photo",
    "description": "The photo blog of a simple web site",
    "author": "David Anson",
    "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by David Anson`
};
module.exports.getPostTitle = (post) => {
    const contentDate = shared.dateTimeFormatDay.format(post.contentDate);
    return `${contentDate} - ${post.title}`;
};
module.exports.getContentJsonElements = (contentJson) => {
    const content = contentJson.map((photo, index) => {
        const src = `${config.hostnameToken}/photos/${photo.image}`;
        const srcSet = photo.image2x ? `${config.hostnameToken}/photos/${photo.image2x} 2x` : null;
        return (React.createElement(React.Fragment, { key: index },
            React.createElement("img", { src: src, srcSet: srcSet, alt: photo.caption }),
            React.createElement("p", null, photo.caption)));
    });
    return React.createElement(React.Fragment, null, content);
};
module.exports.getHtmlElements = (props) => {
    const archives = shared.getArchiveList(props.archives);
    const posts = props.posts.map((post) => (React.createElement("div", { key: post.id, className: "post" },
        React.createElement("h2", null,
            React.createElement("a", { href: `/blog/post/${post.id}` }, post.title)),
        React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } }),
        React.createElement("p", null,
            "Posted ",
            shared.getPublishDate(post)),
        React.createElement("hr", null))));
    const { title, heading } = shared.getTitleHeading(props, strings);
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, title),
            React.createElement("meta", { name: "viewport", content: "width=device-width" }),
            React.createElement("meta", { name: "description", content: strings.description }),
            shared.getMetaRobots(props.noindex),
            React.createElement("link", { rel: "alternate", type: "application/rss+xml", href: "/blog/rss", title: strings.title }),
            React.createElement("link", { rel: "stylesheet", href: "/blog.css" })),
        React.createElement("body", null,
            React.createElement("div", { className: "banner" },
                React.createElement("h1", null,
                    React.createElement("a", { href: "/blog" }, strings.description))),
            React.createElement("div", { className: "content" },
                React.createElement("div", { className: "posts" },
                    heading ? React.createElement(React.Fragment, null,
                        React.createElement("h2", null, heading),
                        React.createElement("hr", null)) : null,
                    posts,
                    shared.getPrevNextLinks(props),
                    React.createElement("p", { className: "copyright" }, strings.copyright)),
                React.createElement("div", { className: "sidebar" },
                    React.createElement("h2", null, "Search"),
                    React.createElement("form", { action: "/blog/search" },
                        React.createElement("input", { type: "text", name: "query", accessKey: "s", placeholder: "cat -dog ham*", "aria-label": "Search" })),
                    React.createElement("h2", null, "Archive"),
                    React.createElement("ul", null, archives))))));
};
module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
