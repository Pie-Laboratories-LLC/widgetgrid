import { Marked } from 'marked';

// The site's Markdown, for anything people write: message board posts and
// the mini-game's help text. Standard Markdown (GitHub's flavour) minus
// raw HTML, plus one addition -- colour, written as a "generic directive"
// (the proposed CommonMark extension remark and others support):
//
//   Mind the :red[**lava**] and take the :green[left] path.
//
// Colours come from a fixed palette, never arbitrary values, so nothing
// can be made unreadable. Each renders as a CSS variable with a default
// that reads well on a light background -- a page with a dark background
// (the game's help screen, a future dark theme) redefines --mk-<name>.
//
// Safety is structural, not a filter afterwards: raw HTML in the source is
// shown as text, and every link or image URL must be http(s), mailto or
// site-relative. Rendered identically on the server (the HTML that's sent)
// and in the browser (the composer's live preview).

export const PALETTE = {
  red: '#c62828',
  orange: '#e65100',
  yellow: '#a67c00', // darker than "yellow" -- pure yellow is unreadable on white
  green: '#2e7d32',
  blue: '#1565c0',
  purple: '#6a1b9a',
  grey: '#616161',
};

// What a profile allows beyond the common core (paragraphs, emphasis,
// strikethrough, code, quotes, lists, links, line breaks, colour):
//   post -- message boards: no headings, images or tables. A heading
//           renders as a bold paragraph, an image as a link to it.
//   help -- the game's help text: headings, images and tables too.
const PROFILES = {
  post: { headings: false, images: false, tables: false },
  help: { headings: true, images: true, tables: true },
};

const SAFE_URL = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i;

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function safeUrl(href) {
  const url = String(href ?? '').trim();
  return SAFE_URL.test(url) ? url : null;
}

// Index of the "]" closing the "[" at `open`, honouring nesting and
// backslash escapes -- so :red[see [this](https://x)] keeps its link.
function closingBracket(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue; }
    if (src[i] === '[') depth++;
    else if (src[i] === ']' && --depth === 0) return i;
  }
  return -1;
}

const DIRECTIVE_START = new RegExp(`:(${Object.keys(PALETTE).join('|')})\\[`);

const colourDirective = {
  name: 'colour',
  level: 'inline',
  start(src) {
    return src.match(DIRECTIVE_START)?.index;
  },
  tokenizer(src) {
    const match = /^:([a-z]+)\[/.exec(src);
    if (!match || !(match[1] in PALETTE)) return undefined;
    const open = match[0].length - 1;
    const close = closingBracket(src, open);
    if (close === -1) return undefined;
    return {
      type: 'colour',
      raw: src.slice(0, close + 1),
      colour: match[1],
      tokens: this.lexer.inlineTokens(src.slice(open + 1, close)),
    };
  },
  renderer(token) {
    return `<span style="color: var(--mk-${token.colour}, ${PALETTE[token.colour]})">${this.parser.parseInline(token.tokens)}</span>`;
  },
};

function createMarked(profileName) {
  const profile = PROFILES[profileName];
  if (!profile) throw new Error(`unknown markup profile "${profileName}"`);
  const marked = new Marked({ gfm: true, breaks: true, async: false });
  marked.use({
    extensions: [colourDirective],
    renderer: {
      // Raw HTML is never passed through -- shown as the text it is.
      html({ text }) {
        return escapeHtml(text);
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        return profile.headings ? `<h${depth}>${inner}</h${depth}>\n` : `<p><strong>${inner}</strong></p>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const url = safeUrl(href);
        if (!url) return inner;
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        // Off-site links: a new tab, and no endorsement (nofollow ugc).
        const external = /^https?:\/\//i.test(url) ? ' target="_blank" rel="nofollow ugc noopener noreferrer"' : '';
        return `<a href="${escapeHtml(url)}"${titleAttr}${external}>${inner}</a>`;
      },
      image({ href, title, text }) {
        const url = safeUrl(href);
        if (!url) return escapeHtml(text);
        if (!profile.images) {
          return `<a href="${escapeHtml(url)}" target="_blank" rel="nofollow ugc noopener noreferrer">${escapeHtml(text || url)}</a>`;
        }
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${titleAttr}>`;
      },
      table(token) {
        if (profile.tables) return false; // marked's own rendering
        return `<p>${escapeHtml(token.raw)}</p>\n`;
      },
    },
  });
  return marked;
}

const instances = {};

// Markdown source -> HTML, under a profile ('post' or 'help').
export function renderMarkup(source, { profile = 'post' } = {}) {
  instances[profile] ??= createMarked(profile);
  return instances[profile].parse(String(source ?? ''));
}

// Plain text of the same source (no markup, colours dropped) -- for email
// excerpts and notification bodies.
export function markupToText(source, { profile = 'post' } = {}) {
  return renderMarkup(source, { profile })
    .replace(/<\/(p|li|blockquote|pre|h\d)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
