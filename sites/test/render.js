"use strict";
const React = require("react");
const shared = require("../" + "shared.js");
const strings = {
    "title": "simple-website-with-blog/test",
    "description": "Test blog",
    "author": "David Anson",
    "copyright": "Copyright \u00a9 David Anson"
};
const getPostTitle = (post) => `Test post - ${post.title}`;
module.exports.getPostTitle = getPostTitle;
module.exports.getContentJsonElements = (contentJson) => {
    const content = contentJson.map((line, index) => React.createElement("p", { key: index }, line));
    return React.createElement(React.Fragment, null, content);
};
module.exports.getHtmlElements = (props) => {
    const archives = shared.getArchiveList(props.archives);
    const posts = props.posts.map((post) => (React.createElement("section", { key: post.id },
        React.createElement("h3", null, post.id),
        React.createElement("h4", null, getPostTitle(post)),
        React.createElement("h5", null, post.publishDate.toISOString()),
        React.createElement("h6", null, post.contentDate.toISOString()),
        React.createElement("div", { dangerouslySetInnerHTML: { "__html": post.contentHtml } }))));
    const { title, heading } = shared.getTitleHeading(props, strings);
    return (React.createElement("html", { lang: "en" },
        React.createElement("head", null,
            React.createElement("title", null, title),
            React.createElement("meta", { name: "viewport", content: "width=device-width" })),
        React.createElement("body", null,
            React.createElement("h1", null, strings.description),
            React.createElement("h2", null, heading),
            posts,
            shared.getPrevNextLinks(props),
            React.createElement("ul", null, archives))));
};
module.exports.getRssMetadata = () => shared.getRssMetadata(strings);
