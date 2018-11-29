# simple-website-with-blog

> A simple web site with a blog

`simple-website-with-blog` is a simple [Node.js](https://nodejs.org/) web application for static content that includes a blog.
It was created as the basis for [my own web site](https://dlaa.me/), but everyone is welcome to use it.
The implementation strives to be simple and free of unnecessary dependencies.

## Goals

- An easy way to create a simple, secure web site with a blog
- Support for text-based and photo-based blog formats
- Easy authoring in HTML, Markdown (with code formatting), or JSON
- Ordering of posts by publish date or content date
- Easy customization of site layout and formatting
- High resolution (2x) support for photo blog images
- Support for Windows and Linux hosting with Node.js
- Simple post format that separates content and metadata
- Ability to author hidden posts and schedule a publish date
- Ability to create posts that never show up in the timeline
- Support for archive links and tagging of posts by category
- Quick search of post content, including simple search queries
- Automatic Twitter and Open Graph metadata for social media
- Automatic cross-linking of related posts
- No JavaScript requirement for client browsers

## Structure

- `/app.js` Entry point for the application, configures the server and static content
- `/blog.js` Implementation of the blog, archives, tags, search, and RSS
- `/config.js` Environment variables used to control basic behavior
- `/sites/shared.js(x)` Blog layout code shared by the sample sites
- `/sites/sample-text/render.js(x)` Blog layout code for the sample text blog
- `/sites/sample-text/static/...` Static files and directories for the sample text blog
- `/sites/sample-text/posts/...` Post metadata and content for the sample text blog
- `/sites/sample-photo/...` Sample photo blog
- `/sites/test/...` Test site for running unit tests

## Instructions

- Install Node.js version 8+
- Fork and clone repository
- Create directory under `/sites` or use one of the samples
- Add static content to `/sites/yoursite/static`
- Add post JSON and content under `/sites/yoursite/posts`
- `npm install`
- `npm run compile`
- `npm start`
- Open <http://localhost:3000/> and verify
- Commit changes to repository
- Deploy repository to hosting service

## Configuration

- `SWWB_SITE_ROOT` Set to specify the site to use when serving content (ex: `./sites/sample-text`)
- `SWWB_REDIRECT_TO_HTTPS` Set to `true` to redirect HTTP traffic to HTTPS and set an HSTS header
- `SWWB_SHOW_FUTURE_POSTS` Set to `true` to show posts with a publish date in the future (good when authoring locally)
- `SWWB_HOSTNAME_TOKEN` Set to change the replacement token for inserting host name in posts (RSS uses absolute URLs)
- `SWWB_ACME_CHALLENGE` Set to specify the ACME challenge for [Let's Encrypt](https://letsencrypt.org/) (ex: `abc.123,def.456`)

## Dependencies

- [Express](http://expressjs.com/)
- [React](https://reactjs.org/)
- [Helmet](https://helmetjs.github.io/)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [highlight.js](https://highlightjs.org/)
- [Lunr](https://lunrjs.com/)
- [rss](https://github.com/dylang/node-rss)

## Contributing

- Open issue, discuss proposal
- Fork and clone repository
- Change code and update tests
- `npm test`
- `npm run lint`
- Review changes
- Send pull request

## License

[MIT](LICENSE)
