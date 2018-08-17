"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
const blogName = "simple-website-with-blog/sample-text";
const getTitle = (post) => post.title;
module.exports.getTitle = getTitle;
module.exports.getContentElements = (post) => {
    const content = post.contentJson.map((line, index) => React.createElement("p", { key: index }, line));
    return React.createElement("div", null, content);
};
module.exports.getHtmlElements = (props) => {
    const archives = shared.getArchiveList(props.archives);
    let headingText = null;
    if (props.period) {
        headingText = `Posts from ${shared.dateTimeFormatMonth.format(props.period)}`;
    }
    else if (props.query) {
        headingText = `Search: ${props.query}`;
    }
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
                React.createElement("a", { href: `/blog/post/${post.id}` }, getTitle(post))),
            publishDate,
            React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } })));
    });
    const title = [
        props.title || headingText,
        blogName
    ].
        filter((part) => Boolean(part)).
        join(" - ");
    const prevLink = props.prevLink ? React.createElement("a", { href: props.prevLink }, "Newer Posts") : null;
    const nextLink = props.nextLink ? React.createElement("a", { href: props.nextLink }, "Older Posts") : null;
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, title),
            React.createElement("meta", { name: "viewport", content: "width=device-width" }),
            React.createElement("meta", { name: "description", content: "The blog of a simple web site" }),
            React.createElement("link", { rel: "alternate", type: "application/rss+xml", href: "/blog/rss", title: blogName }),
            React.createElement("link", { rel: "stylesheet", href: "/xcode.css" })),
        React.createElement("body", null,
            React.createElement("h1", null,
                React.createElement("a", { href: "/blog" }, "The blog of simple-website-with-blog")),
            React.createElement("ul", null, archives),
            React.createElement("p", null,
                React.createElement("a", { href: "/blog/post/about" }, "About this blog")),
            React.createElement("form", { action: "/blog/search" },
                React.createElement("input", { type: "text", name: "query", placeholder: "Search", accessKey: "s" })),
            headingText ? React.createElement("h2", null, headingText) : null,
            posts,
            React.createElement("div", null,
                nextLink,
                " ",
                prevLink))));
};
module.exports.getRssMetadata = () => {
    const author = "David Anson";
    return {
        "title": blogName,
        "description": "The blog of a simple web site",
        author,
        "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by ${author}`
    };
};
