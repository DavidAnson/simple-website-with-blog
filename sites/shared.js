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
module.exports.dateTimeFormatDay = new Intl.DateTimeFormat("en-US", dateFormatOptionsDay);
const dateTimeFormatWeekday = new Intl.DateTimeFormat("en-US", dateFormatOptionsWeekday);
const dateTimeFormatMonth = new Intl.DateTimeFormat("en-US", dateFormatOptionsMonth);
module.exports.getMetaRobots =
    (noindex) => (noindex ? React.createElement("meta", { name: "robots", content: "noindex" }) : null);
module.exports.getPublishDate = (post) => {
    const publishDateIso = post.publishDate.toISOString();
    const publishDateFormat = dateTimeFormatWeekday.format(post.publishDate);
    return (post.publishDate.getTime() > 0)
        ? React.createElement("time", { dateTime: publishDateIso }, publishDateFormat)
        : null;
};
const getRelatedItems = (show, related, publishedPostFilter) => {
    const filteredRelated = related.filter(publishedPostFilter);
    return (show && (filteredRelated.length > 0))
        ? (React.createElement("ul", null, filteredRelated.map((post) => (React.createElement("li", { key: post.id },
            React.createElement("a", { href: `/blog/post/${post.id}` }, post.title))))))
        : null;
};
module.exports.getRelatedList = (show, label, related, publishedPostFilter) => {
    const relatedItems = getRelatedItems(show, related, publishedPostFilter);
    return relatedItems
        ? (React.createElement("div", { className: "related" },
            React.createElement("p", null, label),
            relatedItems))
        : null;
};
module.exports.getTagList = (tags) => tags.
    map((tag) => (React.createElement("li", { key: tag },
    React.createElement("a", { href: `/blog/tag/${tag}` }, tag))));
module.exports.getTagLinks = (tags) => {
    if (tags.length === 0) {
        return null;
    }
    const tagLinks = tags.map((tag) => (React.createElement(React.Fragment, { key: tag },
        " ",
        React.createElement("a", { href: `/blog/tag/${tag}` }, tag))));
    return React.createElement("div", { className: "tags" },
        "Tags:",
        tagLinks);
};
module.exports.getArchiveList = (archives) => archives.
    map((period) => {
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
const getHeading = (props) => {
    let heading = null;
    if (props.period) {
        heading = `Posts from ${dateTimeFormatMonth.format(props.period)}`;
    }
    else if (props.tag) {
        heading = `Posts tagged "${props.tag}"`;
    }
    else if (props.query) {
        heading = `Search: ${props.query}`;
    }
    return heading;
};
module.exports.getHeading = getHeading;
const getTitle = (props, strings) => [
    props.title || getHeading(props),
    strings.title
].
    filter(Boolean).
    join(" - ");
module.exports.getTitle = getTitle;
const getDescription = (props, strings) => props.title || getHeading(props) || strings.description;
module.exports.getDescription = getDescription;
module.exports.getTwitterOpenGraph = (props, context, strings) => {
    const description = getDescription(props, strings);
    return (React.createElement(React.Fragment, null,
        React.createElement("meta", { name: "twitter:card", content: "summary" }),
        strings.twitter ? React.createElement("meta", { name: "twitter:site", content: strings.twitter }) : null,
        React.createElement("meta", { property: "og:type", content: "article" }),
        React.createElement("meta", { property: "og:title", content: description }),
        React.createElement("meta", { property: "og:url", content: props.urlHref }),
        context.ogImage ? React.createElement("meta", { property: "og:image", content: context.ogImage }) : null,
        React.createElement("meta", { property: "og:site_name", content: strings.title }),
        React.createElement("meta", { property: "og:description", content: description })));
};
module.exports.getPrevNextLinks = (props) => {
    const prevLink = props.prevLink ? React.createElement("a", { href: props.prevLink },
        "\u00AB",
        " Previous Posts") : null;
    const nextLink = props.nextLink ? React.createElement("a", { href: props.nextLink },
        "Next Posts ",
        "\u00BB") : null;
    return (prevLink || nextLink)
        ? React.createElement("div", { className: "navigation" },
            prevLink,
            nextLink && prevLink ? " | " : "",
            nextLink)
        : null;
};
module.exports.getRssMetadata = (strings) => {
    const { title, description, author, copyright } = strings;
    return {
        title,
        description,
        author,
        copyright
    };
};
