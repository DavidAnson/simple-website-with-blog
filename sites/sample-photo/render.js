"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
const strings = {
    "title": "simple-website-with-blog/sample-photo",
    "description": "The photo blog of a simple web site",
    "author": "David Anson",
    "copyright": `Copyright \u00a9 2006-${new Date().getFullYear()} by David Anson`
};
const getPostTitle = (post) => {
    const contentDate = shared.dateTimeFormatDay.format(post.contentDate);
    return `${contentDate} - ${post.title}`;
};
module.exports.getPostTitle = getPostTitle;
module.exports.getContentJsonElements = (contentJson) => {
    const content = contentJson.map((photo, index) => {
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
    const posts = props.posts.map((post) => {
        const publishDate = shared.dateTimeFormatWeekday.format(post.publishDate);
        return (React.createElement("section", { key: post.id },
            React.createElement("hr", null),
            React.createElement("h2", null,
                React.createElement("a", { href: `/blog/post/${post.id}` }, getPostTitle(post))),
            React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } }),
            React.createElement("p", null,
                "Posted ",
                React.createElement("time", { dateTime: post.publishDate.toISOString() }, publishDate))));
    });
    const { title, heading } = shared.getTitleHeading(props, strings);
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, title),
            React.createElement("meta", { name: "viewport", content: "width=device-width" }),
            React.createElement("meta", { name: "description", content: "The photo blog of a simple web site" }),
            React.createElement("link", { rel: "alternate", type: "application/rss+xml", href: "/blog/rss", title: strings.title })),
        React.createElement("body", null,
            React.createElement("h1", null,
                React.createElement("a", { href: "/blog" }, "The photo blog of simple-website-with-blog")),
            React.createElement("ul", null, archives),
            React.createElement("form", { action: "/blog/search" },
                React.createElement("input", { type: "text", name: "query", placeholder: "Search", accessKey: "s" })),
            heading ? React.createElement("h2", null, heading) : null,
            posts,
            shared.getPrevNextLinks(props))));
};
module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
