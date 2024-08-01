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
module.exports.dateTimeFormatDay = new Intl.DateTimeFormat("en-US", dateFormatOptionsDay);
const dateTimeFormatWeekday = new Intl.DateTimeFormat("en-US", dateFormatOptionsWeekday);
const dateTimeFormatMonth = new Intl.DateTimeFormat("en-US", dateFormatOptionsMonth);

module.exports.getMetaRobots =
  (noindex) => (noindex ? <meta name="robots" content="noindex"/> : null);

module.exports.getPublishDate = (post) => {
  const publishDateIso = post.publishDate.toISOString();
  const publishDateFormat = dateTimeFormatWeekday.format(post.publishDate);
  return (post.publishDate.getTime() > 0)
    ? <time dateTime={publishDateIso}>{publishDateFormat}</time>
    : null;
};

const getRelatedItems = (show, related, publishedPostFilter, queryString) => {
  const filteredRelated = related.filter(publishedPostFilter);
  return (show && (filteredRelated.length > 0))
    ? (<ul>
      {filteredRelated.map((post) => (
        <li key={post.id}>
          <a href={`/blog/post/${post.id}${queryString}`}>{post.title}</a>
        </li>
      ))}
    </ul>)
    : null;
};

module.exports.getRelatedList = (show, label, related, publishedPostFilter, queryString) => {
  const relatedItems = getRelatedItems(show, related, publishedPostFilter, queryString);
  return relatedItems
    ? (
      <div className="related">
        <p>{label}</p>
        {relatedItems}
      </div>
    )
    : null;
};

module.exports.getTagList = (tags, queryString) => tags.
  map((tag) => (
    <li key={tag}>
      <a href={`/blog/tag/${tag}${queryString}`}>{tag}</a>
    </li>
  ));

module.exports.getTagLinks = (tags, queryString) => {
  if (tags.length === 0) {
    return null;
  }
  const tagLinks = tags.map((tag) => (
    <React.Fragment key={tag}>
      {" "}<a href={`/blog/tag/${tag}${queryString}`}>{tag}</a>
    </React.Fragment>
  ));
  return <div className="tags">Tags:{tagLinks}</div>;
};

module.exports.getArchiveList = (archives, queryString) => archives.
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
        <a href={`/blog/archive/${archiveLink}${queryString}`}>
          {dateTimeFormatMonth.format(period)}
        </a>
      </li>
    );
  });

const getHeading = (props) => {
  let heading = null;
  if (props.period) {
    heading = `Posts from ${dateTimeFormatMonth.format(props.period)}`;
  } else if (props.tag) {
    heading = `Posts tagged "${props.tag}"`;
  } else if (props.query) {
    heading = `Search: ${props.query}`;
  }
  return heading;
};
module.exports.getHeading = getHeading;

const getTitle =
  (props, strings) => [
    props.title || getHeading(props),
    strings.title
  ].
    filter(Boolean).
    join(" - ");
module.exports.getTitle = getTitle;

const getDescription =
  (props, strings) => props.title || getHeading(props) || strings.description;
module.exports.getDescription = getDescription;

module.exports.getOpenGraph = (props, context, strings) => {
  const description = getDescription(props, strings);
  return (
    <React.Fragment>
      {strings.fediverse ? <meta name="fediverse:creator" content={strings.fediverse}/> : null}
      <meta name="twitter:card" content="summary"/>
      {strings.twitter ? <meta name="twitter:site" content={strings.twitter}/> : null}
      <meta property="og:type" content="article"/>
      <meta property="og:title" content={description}/>
      <meta property="og:url" content={props.urlHref}/>
      {context.ogImage ? <meta property="og:image" content={context.ogImage}/> : null}
      <meta property="og:site_name" content={strings.title}/>
      <meta property="og:description" content={description}/>
    </React.Fragment>
  );
};

module.exports.getPrevNextLinks = (props) => {
  const prevLink = props.prevLink ? <a href={props.prevLink}>{"\u00AB"} Previous Posts</a> : null;
  const nextLink = props.nextLink ? <a href={props.nextLink}>Next Posts {"\u00BB"}</a> : null;
  return (prevLink || nextLink)
    ? <div className="navigation">{prevLink}{nextLink && prevLink ? " | " : ""}{nextLink}</div>
    : null;
};

module.exports.getSearchForm = (props, placeholder) => {
  const hiddenInputs = Object.entries(props.searchParams).map((entry) => {
    const [name, value] = entry;
    return <input type="hidden" key={name} name={name} value={value}/>;
  });
  return (
    <form action="/blog/search">
      <input type="text" key="query" name="query" defaultValue={props.query}
        accessKey="s" placeholder={placeholder} aria-label="Search"/>
      {hiddenInputs}
    </form>
  );
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
