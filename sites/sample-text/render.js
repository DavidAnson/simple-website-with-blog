"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
const strings = {
    "title": "simple-website-with-blog/sample-text",
    "description": "The blog of a simple web site",
    "author": "David Anson",
    "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by David Anson`
};
const getPostTitle = (post) => post.title;
module.exports.getPostTitle = getPostTitle;
module.exports.getContentJsonElements = (contentJson) => {
    const content = contentJson.map((line, index) => React.createElement("p", { key: index }, line));
    return React.createElement("div", null, content);
};
module.exports.getHtmlElements = (props) => {
    const archives = shared.getArchiveList(props.archives);
    const posts = props.posts.map((post) => {
        const publishDateIso = post.publishDate.toISOString();
        const publishDateFormat = shared.dateTimeFormatWeekday.format(post.publishDate);
        const publishDate = (post.publishDate.getTime() > 0)
            ? React.createElement("p", null,
                React.createElement("time", { dateTime: publishDateIso }, publishDateFormat))
            : null;
        return (React.createElement("section", { key: post.id },
            React.createElement("hr", null),
            React.createElement("h2", null,
                React.createElement("a", { href: `/blog/post/${post.id}` }, getPostTitle(post))),
            publishDate,
            React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } })));
    });
    const { title, heading } = shared.getTitleHeading(props, strings);
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, title),
            React.createElement("meta", { name: "viewport", content: "width=device-width" }),
            React.createElement("meta", { name: "description", content: "The blog of a simple web site" }),
            React.createElement("link", { rel: "alternate", type: "application/rss+xml", href: "/blog/rss", title: strings.title }),
            React.createElement("link", { rel: "stylesheet", href: "/xcode.css" })),
        React.createElement("body", null,
            React.createElement("h1", null,
                React.createElement("a", { href: "/blog" }, "The blog of simple-website-with-blog")),
            React.createElement("ul", null, archives),
            React.createElement("p", null,
                React.createElement("a", { href: "/blog/post/about" }, "About this blog")),
            React.createElement("form", { action: "/blog/search" },
                React.createElement("input", { type: "text", name: "query", placeholder: "Search", accessKey: "s" })),
            heading ? React.createElement("h2", null, heading) : null,
            posts,
            shared.getPrevNextLinks(props))));
};
module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
