(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-topbar[data-v-6b1a6ab8]{z-index:10;background:#150a2e;align-items:center;height:255px;padding-left:40px;transition:height .25s;display:flex;position:fixed;top:0;left:0;right:0}.widget-topbar.topbar-collapsed[data-v-6b1a6ab8]{height:64px}.topbar-logo[data-v-6b1a6ab8]{width:auto;height:255px;transition:height .25s;display:block}.topbar-collapsed .topbar-logo[data-v-6b1a6ab8]{height:64px}.topbar-menu-slot[data-v-6b1a6ab8]{flex:1;justify-content:flex-end;align-items:center;gap:20px;padding-right:40px;display:flex}.topbar-icon[data-v-6b1a6ab8]{color:#f4ead9;cursor:pointer;background:0 0;border:none;border-radius:6px;padding:6px;line-height:0}.topbar-icon[data-v-6b1a6ab8]:hover,.topbar-icon[data-v-6b1a6ab8]:focus-visible{background:#f4ead91f}.topbar-icon svg[data-v-6b1a6ab8]{width:30px;height:30px}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { createElementBlock as e, createElementVNode as t, normalizeClass as n, openBlock as r } from "vue";
//#region \0plugin-vue:export-helper
var i = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, a = "/widgets/topbar-assets/", o = {
	name: "TopBarWidget",
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
		return {
			activeView: "blog",
			collapsed: !1
		};
	},
	created() {
		window.addEventListener("widgetgrid:navigate", this.onNavigate), window.addEventListener("widgetgrid:scroll", this.onScroll);
	},
	beforeUnmount() {
		window.removeEventListener("widgetgrid:navigate", this.onNavigate), window.removeEventListener("widgetgrid:scroll", this.onScroll);
	},
	methods: {
		assetUrl(e) {
			return a + e;
		},
		onNavigate(e) {
			this.activeView = e.detail.view;
		},
		onScroll(e) {
			this.collapsed = e.detail.collapsed;
		},
		navigate(e) {
			window.dispatchEvent(new CustomEvent("widgetgrid:navigate", { detail: { view: e } }));
		}
	}
}, s = [
	"src",
	"width",
	"height",
	"alt"
], c = { class: "topbar-menu-slot" }, l = {
	key: 0,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "2",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
	"aria-hidden": "true"
}, u = {
	key: 1,
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true"
}, d = {
	key: 0,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "2",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
	"aria-hidden": "true"
}, f = {
	key: 1,
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true"
};
function p(i, a, o, p, m, h) {
	return r(), e("header", { class: n(["widget widget-topbar", { "topbar-collapsed": m.collapsed }]) }, [t("img", {
		src: m.collapsed ? h.assetUrl("logo-h64.png") : h.assetUrl("logo-h255.png"),
		width: m.collapsed ? 85 : 339,
		height: m.collapsed ? 64 : 255,
		alt: o.data?.alt || "Pie Laboratories LLC",
		class: "topbar-logo"
	}, null, 8, s), t("nav", c, [t("button", {
		type: "button",
		class: "topbar-icon",
		title: "Home",
		"aria-label": "Home",
		onClick: a[0] ||= (e) => h.navigate("blog")
	}, [m.activeView === "blog" ? (r(), e("svg", l, [...a[2] ||= [
		t("path", { d: "M5 12l-2 0l9 -9l9 9l-2 0" }, null, -1),
		t("path", { d: "M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" }, null, -1),
		t("path", { d: "M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" }, null, -1)
	]])) : (r(), e("svg", u, [...a[3] ||= [t("path", { d: "M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" }, null, -1)]]))]), t("button", {
		type: "button",
		class: "topbar-icon",
		title: "Solitaire",
		"aria-label": "Solitaire",
		onClick: a[1] ||= (e) => h.navigate("solitaire")
	}, [m.activeView === "solitaire" ? (r(), e("svg", d, [...a[4] ||= [
		t("path", { d: "M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001" }, null, -1),
		t("path", { d: "M15 4h1a1 1 0 0 1 1 1v3.5" }, null, -1),
		t("path", { d: "M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374" }, null, -1)
	]])) : (r(), e("svg", f, [...a[5] ||= [
		t("path", { d: "M10.348 3.169l-7.15 3.113a2 2 0 0 0 -1.03 2.608l4.92 11.895a1.96 1.96 0 0 0 2.59 1.063l7.142 -3.11a2.002 2.002 0 0 0 1.036 -2.611l-4.92 -11.894a1.96 1.96 0 0 0 -2.588 -1.064z" }, null, -1),
		t("path", { d: "M16 3a2 2 0 0 1 1.995 1.85l.005 .15v3.5a1 1 0 0 1 -1.993 .117l-.007 -.117v-3.5h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" }, null, -1),
		t("path", { d: "M19.08 5.61a1 1 0 0 1 1.31 -.53c.257 .108 .505 .21 .769 .314a2 2 0 0 1 1.114 2.479l-.056 .146l-2.298 5.374a1 1 0 0 1 -1.878 -.676l.04 -.11l2.296 -5.371l-.366 -.148l-.402 -.167a1 1 0 0 1 -.53 -1.312z" }, null, -1)
	]]))])])], 2);
}
var m = /*#__PURE__*/ i(o, [["render", p], ["__scopeId", "data-v-6b1a6ab8"]]);
//#endregion
export { m as default };
