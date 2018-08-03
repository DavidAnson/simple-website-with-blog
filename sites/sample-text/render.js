"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
module.exports = (props) => {
    const archives = shared.getArchiveList(props.archives);
    const heading = props.period
        ? React.createElement("h2", null,
            "Posts from ",
            shared.dateTimeFormatMonth.format(props.period))
        : null;
    const posts = props.posts.map((post) => {
        const content = post.contentJson
            ? React.createElement("div", null, post.contentJson.map((line, index) => React.createElement("p", { key: index }, line)))
            : React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } });
        const postDateIso = post.date.toISOString();
        const postDateFormat = shared.dateTimeFormatWeekday.format(post.date);
        const date = (post.date.getTime() > 0)
            ? React.createElement("p", null,
                React.createElement("time", { dateTime: postDateIso }, postDateFormat))
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
            React.createElement("ul", null, archives),
            React.createElement("p", null,
                React.createElement("a", { href: "/blog/post/about" }, "About this blog")),
            heading,
            posts)));
};
