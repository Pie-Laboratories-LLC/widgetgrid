(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-rightrail[data-v-d31fd5a3]{z-index:10;background:#fff;flex-direction:column;align-items:center;gap:clamp(14px,3vw,28px);width:clamp(88px,20vw,160px);padding:clamp(10px,4vw,20px) clamp(10px,4vw,20px) 0;transition:top .25s;display:flex;position:fixed;top:255px;bottom:0;right:0}.widget-rightrail.rail-collapsed[data-v-d31fd5a3]{top:64px}@media (width<=640px){.widget-rightrail[data-v-d31fd5a3]{top:128px}}.rail-item[data-v-d31fd5a3]{color:inherit;flex-direction:column;align-items:center;gap:6px;text-decoration:none;display:flex}.rail-icon[data-v-d31fd5a3]{width:32px;height:32px}.rail-label[data-v-d31fd5a3]{font-size:.8rem}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { Fragment as e, createElementBlock as t, createElementVNode as n, normalizeClass as r, normalizeStyle as i, openBlock as a, renderList as o, toDisplayString as s, vShow as c, withDirectives as l } from "vue";
//#region ../../packages/site-routes/src/index.js
var u = {
	blog: "/blog",
	games: "/games",
	solitaire: "/games/solitaire",
	embuscade: "/games/embuscade",
	lastnaming: "/games/the-last-naming",
	site: "/site",
	lhoraire: "/site/lhoraire",
	messages: "/site/messages",
	subscribe: "/site/subscribe",
	login: "/site/login",
	register: "/site/register",
	account: "/site/account",
	write: "/site/write",
	chat: "/chat"
}, d = {
	solitaire: {
		topbar: "collapsed",
		railHidden: !0
	},
	embuscade: {
		topbar: "collapsed",
		railHidden: !0
	},
	lastnaming: {
		topbar: "collapsed",
		railHidden: !0
	},
	chat: {
		topbar: "collapsed",
		railHidden: !1
	},
	lhoraire: {
		topbar: "collapsed",
		railHidden: !0
	},
	messages: {
		topbar: "scroll",
		railHidden: !0
	},
	write: {
		topbar: "scroll",
		railHidden: !0
	}
};
function f(e) {
	return d[e] ?? {
		topbar: "scroll",
		railHidden: !1
	};
}
function p(e) {
	let t = e.replace(/\/+$/, "") || "/";
	if (t === "/") return {
		view: "blog",
		post: null
	};
	let n = /^\/blog(?:\/([^/]+))?$/.exec(t);
	if (n) return {
		view: "blog",
		post: n[1] ? decodeURIComponent(n[1]) : null
	};
	let r = /^\/site\/messages(?:\/([a-z0-9-]+)(?:\/(\d+))?)?$/.exec(t);
	if (r) return {
		view: "messages",
		post: null,
		board: {
			section: r[1] ?? null,
			thread: r[2] ?? null
		}
	};
	let i = /^\/site\/write(?:\/(\d+))?$/.exec(t);
	if (i) return {
		view: "write",
		post: null,
		draft: i[1] ?? null
	};
	for (let [e, n] of Object.entries(u)) if (t === n) return {
		view: e,
		post: null
	};
	return null;
}
function m() {
	return p(window.location.pathname) ?? {
		view: "blog",
		post: null
	};
}
//#endregion
//#region \0plugin-vue:export-helper
var h = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, g = [
	{
		key: "youtube",
		label: "YouTube",
		hex: "FF0000",
		path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
	},
	{
		key: "bluesky",
		label: "Bluesky",
		hex: "1185FE",
		path: "M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"
	},
	{
		key: "github",
		label: "GitHub",
		hex: "181717",
		path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
	},
	{
		key: "nuget",
		label: "NuGet.org",
		hex: "004880",
		path: "M1.998.342a1.997 1.997 0 1 0 0 3.995 1.997 1.997 0 0 0 0-3.995zm9.18 4.34a6.156 6.156 0 0 0-6.153 6.155v6.667c0 3.4 2.756 6.154 6.154 6.154h6.667c3.4 0 6.154-2.755 6.154-6.154v-6.667a6.154 6.154 0 0 0-6.154-6.155zm-1.477 2.8a2.496 2.496 0 1 1 0 4.993 2.496 2.496 0 0 1 0-4.993zm7.968 6.16a3.996 3.996 0 1 1-.002 7.992 3.996 3.996 0 0 1 .002-7.992z"
	}
], _ = {
	name: "RightRailWidget",
	props: {
		data: {
			type: Object,
			required: !0
		},
		title: {
			type: String,
			default: ""
		}
	},
	data() {
		let e = f(m().view);
		return {
			collapsed: e.topbar === "collapsed",
			hidden: e.railHidden
		};
	},
	computed: { items() {
		let e = this.data?.links ?? {};
		return g.map((t) => ({
			...t,
			url: e[t.key] || "#"
		}));
	} },
	created() {
		window.addEventListener("widgetgrid:scroll", this.onScroll), window.addEventListener("widgetgrid:rail", this.onRail);
	},
	beforeUnmount() {
		window.removeEventListener("widgetgrid:scroll", this.onScroll), window.removeEventListener("widgetgrid:rail", this.onRail);
	},
	methods: {
		onRail(e) {
			this.hidden = e.detail.hidden;
		},
		onScroll(e) {
			this.collapsed = e.detail.collapsed;
		}
	}
}, v = ["href"], y = ["d"], b = { class: "rail-label" };
function x(u, d, f, p, m, h) {
	return l((a(), t("aside", { class: r(["widget widget-rightrail", { "rail-collapsed": m.collapsed }]) }, [(a(!0), t(e, null, o(h.items, (e) => (a(), t("a", {
		key: e.key,
		href: e.url,
		class: "rail-item",
		target: "_blank",
		rel: "noopener noreferrer"
	}, [(a(), t("svg", {
		viewBox: "0 0 24 24",
		class: "rail-icon",
		style: i({ fill: `#${e.hex}` }),
		"aria-hidden": "true"
	}, [n("path", { d: e.path }, null, 8, y)], 4)), n("span", b, s(e.label), 1)], 8, v))), 128))], 2)), [[c, !m.hidden]]);
}
var S = /*#__PURE__*/ h(_, [["render", x], ["__scopeId", "data-v-d31fd5a3"]]);
//#endregion
export { S as default };
