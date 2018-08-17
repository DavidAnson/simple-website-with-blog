"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
const blogName = "simple-website-with-blog/sample-photo";
const getTitle = (post) => {
    const contentDate = shared.dateTimeFormatDay.format(post.contentDate);
    return `${contentDate} - ${post.title}`;
};
module.exports.getTitle = getTitle;
module.exports.getContentElements = (post) => {
    const content = post.contentJson.map((photo, index) => {
        const src = `/photos/${photo.image}`;
        const srcSet = photo.image2x ? `/photos/${photo.image2x} 2x` : null;
        return (React.createElement("div", { key: index },
            React.createElement("img", { src: src, srcSet: srcSet, alt: photo.caption }),
            React.createElement("p", null, photo.caption)));
    });
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
        const publishDate = shared.dateTimeFormatWeekday.format(post.publishDate);
        return (React.createElement("section", { key: post.id },
            React.createElement("hr", null),
            React.createElement("h2", null,
                React.createElement("a", { href: `/blog/post/${post.id}` }, getTitle(post))),
            React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } }),
            React.createElement("p", null,
                "Posted ",
                React.createElement("time", { dateTime: post.publishDate.toISOString() }, publishDate))));
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
            React.createElement("meta", { name: "description", content: "The photo blog of a simple web site" }),
            React.createElement("link", { rel: "alternate", type: "application/rss+xml", href: "/blog/rss", title: blogName })),
        React.createElement("body", null,
            React.createElement("h1", null,
                React.createElement("a", { href: "/blog" }, "The photo blog of simple-website-with-blog")),
            React.createElement("ul", null, archives),
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
        "description": "The photo blog of a simple web site",
        author,
        "copyright": `Copyright \u00a9 2004-${new Date().getFullYear()} by ${author}`
    };
};
