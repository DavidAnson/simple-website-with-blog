"use strict";
const React = require("react");
const dateFormatOptionsWeekday = {
    "weekday": "long",
    "year": "numeric",
    "month": "long",
    "day": "numeric"
};
const dateFormatOptionsMonth = {
    "year": "numeric",
    "month": "long"
};
const dateTimeFormatWeekday = new Intl.DateTimeFormat("en-US", dateFormatOptionsWeekday);
const dateTimeFormatMonth = new Intl.DateTimeFormat("en-US", dateFormatOptionsMonth);
module.exports = (props) => {
    const archives = props.archives.map((period) => {
        const year = period.
            getFullYear().
            toString().
            padStart(4, "0");
        const month = (period.getMonth() + 1).
            toString().
            padStart(2, "0");
        const archiveLink = `${year}${month}`;
        return (React.createElement("li", { key: archiveLink },
            React.createElement("a", { href: `/blog/archive/${archiveLink}` }, dateTimeFormatMonth.format(period))));
    });
    const heading = props.period
        ? React.createElement("h2", null,
            "Posts from ",
            dateTimeFormatMonth.format(props.period))
        : null;
    const posts = props.posts.map((post) => {
        const content = post.contentJson
            ? React.createElement("div", null, post.contentJson.map((line, index) => React.createElement("p", { key: index }, line)))
            : React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } });
        const postDateIso = post.date.toISOString();
        const postDateFormat = dateTimeFormatWeekday.format(post.date);
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
