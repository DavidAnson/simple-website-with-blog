"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
const strings = {
    "title": "simple-website-with-blog/test",
    "description": "Test blog",
    "author": "David Anson",
    "twitter": "@DavidAns",
    "avatar": "/images/piechart.png",
    "copyright": "Copyright \u00a9 David Anson"
};
module.exports.getPostTitle = (post) => `Test post - ${post.title}`;
module.exports.getContentJsonElements = (post) => {
    const content = post.contentJson.map((line, index) => React.createElement("p", { key: index }, line));
    return React.createElement(React.Fragment, null, content);
};
module.exports.getHtmlElements = (props) => {
    const tags = shared.getTagList(props.tags);
    const archives = shared.getArchiveList(props.archives);
    const posts = props.posts.map((post) => {
        const tagLinks = shared.getTagLinks(post.tags);
        const references = shared.getReferences(Boolean(props.title), post.references, props.publishedPostFilter);
        return (React.createElement("section", { key: post.id },
            React.createElement("h3", null, post.id),
            React.createElement("h4", null, post.title),
            React.createElement("h5", null, post.publishDate.toISOString()),
            React.createElement("h6", null, post.contentDate.toISOString()),
            React.createElement("blockquote", null, post.contentSource),
            React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } }),
            tagLinks,
            React.createElement("article", { className: "references" }, references)));
    });
    const title = shared.getTitle(props, strings);
    const heading = shared.getHeading(props);
    const context = {
        "ogImage": "og/Image.jpg"
    };
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, title),
            React.createElement("meta", { name: "viewport", content: "width=device-width" }),
            React.createElement("meta", { name: "color-scheme", content: "light dark" }),
            React.createElement("meta", { name: "description", content: shared.getDescription(props, strings) }),
            React.createElement("meta", { name: "author", content: strings.author }),
            shared.getTwitterOpenGraph(props, context, strings),
            shared.getMetaRobots(props.noindex),
            React.createElement("link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" })),
        React.createElement("body", null,
            React.createElement("h1", null, strings.description),
            React.createElement("h2", null, heading),
            posts,
            shared.getPrevNextLinks(props),
            React.createElement("ul", { id: "tags" }, tags),
            React.createElement("ul", { id: "archives" }, archives))));
};
module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
