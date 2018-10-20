"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
const strings = {
    "title": "simple-website-with-blog/sample-text",
    "description": "The blog of a simple web site",
    "author": "David Anson",
    "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by David Anson`
};
module.exports.getPostTitle = (post) => post.title;
module.exports.getContentJsonElements = (contentJson) => {
    const content = contentJson.map((line, index) => React.createElement("p", { key: index }, line));
    return React.createElement("div", null, content);
};
module.exports.getHtmlElements = (props) => {
    const tags = shared.getTagList(props.tags);
    const archives = shared.getArchiveList(props.archives);
    const posts = props.posts.map((post) => (React.createElement("section", { key: post.id },
        React.createElement("hr", null),
        React.createElement("h2", null,
            React.createElement("a", { href: `/blog/post/${post.id}` }, post.title)),
        shared.getPublishDate(post),
        React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } }))));
    const { title, heading } = shared.getTitleHeading(props, strings);
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, title),
            React.createElement("meta", { name: "viewport", content: "width=device-width" }),
            React.createElement("meta", { name: "description", content: strings.description }),
            shared.getMetaRobots(props.noindex),
            React.createElement("link", { rel: "alternate", type: "application/rss+xml", href: "/blog/rss", title: strings.title }),
            React.createElement("link", { rel: "stylesheet", href: "/xcode.css" })),
        React.createElement("body", null,
            React.createElement("h1", null,
                React.createElement("a", { href: "/blog" }, "The blog of simple-website-with-blog")),
            React.createElement("ul", null, tags),
            React.createElement("ul", null, archives),
            React.createElement("p", null,
                React.createElement("a", { href: "/blog/post/mit-license" }, "MIT License")),
            React.createElement("form", { action: "/blog/search" },
                React.createElement("input", { type: "text", name: "query", placeholder: "HTML -CSS Java*", accessKey: "s" })),
            heading ? React.createElement("h2", null, heading) : null,
            posts,
            shared.getPrevNextLinks(props))));
};
module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
