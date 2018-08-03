"use strict";
const React = require("react");
const dateFormatOptionsWeekday = {
    "weekday": "long",
    "year": "numeric",
    "month": "long",
    "day": "numeric"
};
const dateFormatOptionsDay = {
    "year": "numeric",
    "month": "long",
    "day": "numeric"
};
const dateFormatOptionsMonth = {
    "year": "numeric",
    "month": "long"
};
const dateTimeFormatWeekday = new Intl.DateTimeFormat("en-US", dateFormatOptionsWeekday);
const dateTimeFormatDay = new Intl.DateTimeFormat("en-US", dateFormatOptionsDay);
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
        const content = post.contentJson.map((photo, index) => {
            const src = `/photos/${photo.image}`;
            const srcSet = photo.image2x ? `/photos/${photo.image2x} 2x` : null;
            return (React.createElement("div", { key: index },
                React.createElement("img", { src: src, srcSet: srcSet, alt: photo.caption }),
                React.createElement("p", null, photo.caption)));
        });
        const contentDate = dateTimeFormatDay.format(post.contentDate);
        const date = dateTimeFormatWeekday.format(post.date);
        return (React.createElement("section", { key: post.id },
            React.createElement("hr", null),
            React.createElement("h2", null,
                React.createElement("a", { href: `/blog/post/${post.id}` },
                    contentDate,
                    " - ",
                    post.title)),
            content,
            React.createElement("p", null,
                "Posted ",
                React.createElement("time", { dateTime: post.date.toISOString() }, date))));
    });
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, "simple-website-with-blog/sample-photo"),
            React.createElement("meta", { name: "viewport", content: "width=device-width" }),
            React.createElement("meta", { name: "description", content: "The photo blog of a simple web site" })),
        React.createElement("body", null,
            React.createElement("h1", null,
                React.createElement("a", { href: "/blog" }, "The photo blog of simple-website-with-blog")),
            React.createElement("ul", null, archives),
            heading,
            posts)));
};
