"use strict";

// eslint-disable-next-line no-unused-vars
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
module.exports.dateTimeFormatWeekday = new Intl.DateTimeFormat("en-US", dateFormatOptionsWeekday);
module.exports.dateTimeFormatDay = new Intl.DateTimeFormat("en-US", dateFormatOptionsDay);
const dateTimeFormatMonth = new Intl.DateTimeFormat("en-US", dateFormatOptionsMonth);

module.exports.getMetaRobots =
  (noindex) => (noindex ? <meta name="robots" content="noindex"/> : null);

module.exports.getTagList = (tags) => tags.
  map((tag) => (
    <li key={tag}>
      <a href={`/blog/tag/${tag}`}>{tag}</a>
    </li>
  ));

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
    return (
      <li key={archiveLink}>
        <a href={`/blog/archive/${archiveLink}`}>{dateTimeFormatMonth.format(period)}</a>
      </li>
    );
  });

module.exports.getTitleHeading = (props, strings) => {
  let heading = null;
  if (props.period) {
    heading = `Posts from ${dateTimeFormatMonth.format(props.period)}`;
  } else if (props.tag) {
    heading = `Tag: ${props.tag}`;
  } else if (props.query) {
    heading = `Search: ${props.query}`;
  }
  const title = [
    props.title || heading,
    strings.title
  ].
    filter((part) => Boolean(part)).
    join(" - ");
  return {
    title,
    heading
  };
};

module.exports.getPrevNextLinks = (props) => {
  const prevLink = props.prevLink ? <a href={props.prevLink}>{"\u00ab"} Previous Posts</a> : null;
  const nextLink = props.nextLink ? <a href={props.nextLink}>Next Posts {"\u00bb"}</a> : null;
  return (prevLink || nextLink)
    ? <div className="navigation">{prevLink}{nextLink && prevLink ? " | " : ""}{nextLink}</div>
    : null;
};

module.exports.getRssMetadata = (strings) => {
  const {title, description, author, copyright} = strings;
  return {
    title,
    description,
    author,
    copyright
  };
};
