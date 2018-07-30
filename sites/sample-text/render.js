"use strict";
// eslint-disable-next-line no-unused-vars
const React = require("react");
const dateFormatOptions = {
    "weekday": "long",
    "year": "numeric",
    "month": "long",
    "day": "numeric"
};
const dateTimeFormat = new Intl.DateTimeFormat("en-US", dateFormatOptions);
module.exports = (props) => {
    const posts = props.posts.map((post) => {
        const content = post.contentJson
            ? React.createElement("div", null, post.contentJson.map((line, index) => React.createElement("p", { key: index }, line)))
            : React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } });
        const date = (post.date.getTime() > 0)
            ? React.createElement("p", null,
                React.createElement("time", { dateTime: post.date.toISOString() }, dateTimeFormat.format(post.date)))
            : null;
        return (React.createElement("section", { key: post.id },
            React.createElement("hr", null),
            React.createElement("h2", null,
                React.createElement("a", { href: `/blog/post/${post.id}` }, post.title)),
            date,
            content));
    });
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, "simple-website-with-blog/sample-text"),
            React.createElement("meta", { name: "viewport", content: "width=device-width" }),
            React.createElement("meta", { name: "description", content: "The blog of a simple web site" }),
            React.createElement("link", { rel: "stylesheet", href: "/xcode.css" })),
        React.createElement("body", null,
            React.createElement("h1", null,
                React.createElement("a", { href: "/blog" }, "The blog of simple-website-with-blog")),
            React.createElement("p", null,
                React.createElement("a", { href: "/blog/post/about" }, "About this blog")),
            posts)));
};
