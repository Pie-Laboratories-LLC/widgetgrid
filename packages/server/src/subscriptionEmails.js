// The emails behind blog subscriptions: the double-opt-in confirmation
// and the one-per-new-post announcement. Plain text and HTML each; links
// are absolute, built from siteOrigin (https://www.pie-laboratories.com
// in production, see index.js's SITE_ORIGIN).

const SUBSCRIBE_PATH = '/site/subscribe';
// Served by packages/static-server (one-click unsubscribe is an HTTP POST
// from the mail provider, which can't speak gRPC-Web).
const ONE_CLICK_UNSUBSCRIBE_PATH = '/email/unsubscribe';

export function confirmationEmail({ siteOrigin, to, confirmToken, expiresInDays }) {
  const link = `${siteOrigin}${SUBSCRIBE_PATH}?confirm=${encodeURIComponent(confirmToken)}`;
  const text = [
    'Someone -- hopefully you -- asked to get an email from Pie Laboratories',
    'whenever a new blog post goes up.',
    '',
    `Confirm it: ${link}`,
    '',
    `The link works for ${expiresInDays} days. If this wasn't you, ignore this`,
    "email and you won't hear from us again.",
  ].join('\n');
  const html = `<p>Someone &mdash; hopefully you &mdash; asked to get an email from Pie Laboratories whenever a new blog post goes up.</p>
<p><a href="${escapeHtml(link)}">Confirm your subscription</a></p>
<p style="color:#666">The link works for ${expiresInDays} days. If this wasn't you, ignore this email and you won't hear from us again.</p>`;
  return { to, subject: 'Confirm your Pie Laboratories subscription', text, html };
}

// post: a blogSource post ({ slug, title, synopsisHtml }).
export function newPostEmail({ siteOrigin, to, unsubscribeToken, post }) {
  const postLink = `${siteOrigin}/blog/${encodeURIComponent(post.slug)}`;
  const unsubscribeLink = `${siteOrigin}${SUBSCRIBE_PATH}?unsubscribe=${encodeURIComponent(unsubscribeToken)}`;
  const oneClickLink = `${siteOrigin}${ONE_CLICK_UNSUBSCRIBE_PATH}?token=${encodeURIComponent(unsubscribeToken)}`;
  // Root-relative image/link URLs (local dev's /blog-assets/...) mean
  // nothing inside an email client -- anchor them to the site.
  const synopsisHtml = post.synopsisHtml.replace(/(src|href)="\//g, `$1="${siteOrigin}/`);
  const text = [
    post.title,
    '',
    htmlToText(post.synopsisHtml),
    '',
    `Read it: ${postLink}`,
    '',
    '--',
    `Unsubscribe: ${unsubscribeLink}`,
  ].join('\n');
  const html = `<h1 style="font-size:1.4em">${escapeHtml(post.title)}</h1>
${synopsisHtml}
<p><a href="${escapeHtml(postLink)}">Read it on pie-laboratories.com</a></p>
<hr>
<p style="color:#666;font-size:0.85em">You're getting this because you subscribed to new posts. <a href="${escapeHtml(unsubscribeLink)}">Unsubscribe</a></p>`;
  return {
    to,
    subject: `New post: ${post.title}`,
    text,
    html,
    // RFC 8058 one-click unsubscribe -- Gmail/Yahoo show an "Unsubscribe"
    // button from these, and expect them on anything sent in bulk.
    headers: {
      'List-Unsubscribe': `<${oneClickLink}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Good enough for a synopsis's few paragraphs: tags dropped, block ends
// become line breaks, the handful of entities marked emits decoded.
export function htmlToText(html) {
  return html
    .replace(/<\/(p|h\d|li|div)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
