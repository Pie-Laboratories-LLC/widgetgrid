(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-rightrail[data-v-bc5c5221]{z-index:10;background:#fff;flex-direction:column;align-items:center;gap:28px;width:160px;padding:20px 20px 0;display:flex;position:fixed;top:255px;bottom:0;right:0}.rail-item[data-v-bc5c5221]{color:inherit;flex-direction:column;align-items:center;gap:6px;text-decoration:none;display:flex}.rail-icon[data-v-bc5c5221]{width:32px;height:32px}.rail-label[data-v-bc5c5221]{font-size:.8rem}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { Fragment as e, createElementBlock as t, createElementVNode as n, normalizeStyle as r, openBlock as i, renderList as a, toDisplayString as o } from "vue";
//#region \0plugin-vue:export-helper
var s = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, c = [
	{
		key: "youtube",
		label: "YouTube",
		hex: "FF0000",
		path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
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
], l = {
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
	computed: { items() {
		let e = this.data?.links ?? {};
		return c.map((t) => ({
			...t,
			url: e[t.key] || "#"
		}));
	} }
}, u = { class: "widget widget-rightrail" }, d = ["href"], f = ["d"], p = { class: "rail-label" };
function m(s, c, l, m, h, g) {
	return i(), t("aside", u, [(i(!0), t(e, null, a(g.items, (e) => (i(), t("a", {
		key: e.key,
		href: e.url,
		class: "rail-item",
		target: "_blank",
		rel: "noopener noreferrer"
	}, [(i(), t("svg", {
		viewBox: "0 0 24 24",
		class: "rail-icon",
		style: r({ fill: `#${e.hex}` }),
		"aria-hidden": "true"
	}, [n("path", { d: e.path }, null, 8, f)], 4)), n("span", p, o(e.label), 1)], 8, d))), 128))]);
}
var h = /*#__PURE__*/ s(l, [["render", m], ["__scopeId", "data-v-bc5c5221"]]);
//#endregion
export { h as default };
