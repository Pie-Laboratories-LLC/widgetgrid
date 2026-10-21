// RSS 2.0 for the blog, served at /rss.xml (packages/static-server asks
// BlogService.GetFeed for it -- feed readers want a plain GET, not
// gRPC-Web). One item per post, newest first, with the synopsis as the
// description and the post's own /blog/<slug> page as the link.

const FEED_TITLE = 'Pie Laboratories';
const FEED_DESCRIPTION = 'News and notes from Pie Laboratories, LLC.';

// posts: blogSource posts, newest first.
export function buildRssFeed({ siteOrigin, posts }) {
  const items = posts.map((post) => {
    const link = `${siteOrigin}/blog/${encodeURIComponent(post.slug)}`;
    // Root-relative URLs (local dev's /blog-assets/...) anchored to the
    // site, since a feed reader resolves nothing against our origin.
    const description = post.synopsisHtml.replace(/(src|href)="\//g, `$1="${siteOrigin}/`);
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <description>${cdata(description)}</description>
    </item>`;
  });
  const lastBuild = posts[0] ? `\n    <lastBuildDate>${toRfc822(posts[0].publishedAt)}</lastBuildDate>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${escapeXml(`${siteOrigin}/blog`)}</link>
    <atom:link href="${escapeXml(`${siteOrigin}/rss.xml`)}" rel="self" type="application/rss+xml" />
    <description>${FEED_DESCRIPTION}</description>
    <language>en</language>${lastBuild}
${items.join('\n')}
  </channel>
</rss>
`;
}

// publishedAt is "YYYY-MM-DDTHH:mm" from the post's filename, no zone --
// taken as UTC.
function toRfc822(publishedAt) {
  return new Date(`${publishedAt}:00Z`).toUTCString();
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// A literal "]]>" inside the HTML would end the section early -- split it
// across two sections.
function cdata(s) {
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}
