(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-topbar[data-v-70b6ee7b]{z-index:20;background:#050505;align-items:center;height:255px;padding-left:40px;transition:height .25s;display:flex;position:fixed;top:0;left:0;right:0}.widget-topbar.topbar-collapsed[data-v-70b6ee7b]{height:64px}.topbar-logo[data-v-70b6ee7b]{cursor:pointer;width:auto;height:255px;transition:height .25s;display:block}.topbar-collapsed .topbar-logo[data-v-70b6ee7b]{height:64px}.topbar-brand[data-v-70b6ee7b]{color:#f4ead9;flex-direction:column;justify-content:center;margin-left:16px;line-height:1.3;display:flex}.topbar-brand-name[data-v-70b6ee7b]{font-size:1rem;font-weight:600}.topbar-brand-email[data-v-70b6ee7b]{opacity:.75;color:inherit;font-size:.8rem;text-decoration:none}.topbar-brand-email[data-v-70b6ee7b]:hover{opacity:1;text-decoration:underline}.topbar-menu-slot[data-v-70b6ee7b]{flex:1;justify-content:flex-end;align-items:center;gap:20px;padding-right:40px;display:flex}.topbar-icon[data-v-70b6ee7b]{color:#f4ead9;cursor:pointer;background:0 0;border:none;border-radius:6px;padding:6px;line-height:0;position:relative}.topbar-icon[data-v-70b6ee7b]:hover,.topbar-icon[data-v-70b6ee7b]:focus-visible{background:#f4ead91f}.topbar-icon svg[data-v-70b6ee7b]{width:30px;height:30px}.topbar-badge[data-v-70b6ee7b]{color:#fff;text-align:center;background:#e5322d;border-radius:999px;min-width:14px;height:14px;padding:0 2px;font-size:10px;font-weight:700;line-height:14px;position:absolute;bottom:2px;right:2px;box-shadow:0 0 0 2px #150a2e}@media (width<=640px){.widget-topbar[data-v-70b6ee7b]{height:128px;padding-left:0}.topbar-logo[data-v-70b6ee7b]{height:128px}}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { createBlock as e, createCommentVNode as t, createElementBlock as n, createElementVNode as r, normalizeClass as i, openBlock as a, resolveDynamicComponent as o } from "vue";
//#region \0plugin-vue:export-helper
var s = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, c = "/widgets/topbar-assets/", l = {
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
			collapsed: !1,
			hasNewPost: !1,
			hasNewChatMessage: !1,
			loginComponent: null
		};
	},
	created() {
		window.addEventListener("widgetgrid:navigate", this.onNavigate), window.addEventListener("widgetgrid:scroll", this.onScroll), window.addEventListener("widgetgrid:new-post", this.onNewPost), window.addEventListener("widgetgrid:chat-event", this.onChatEvent), import(
			/* @vite-ignore */
			"/widgets/login.js"
).then((e) => {
			this.loginComponent = e.default ?? e;
		});
	},
	beforeUnmount() {
		window.removeEventListener("widgetgrid:navigate", this.onNavigate), window.removeEventListener("widgetgrid:scroll", this.onScroll), window.removeEventListener("widgetgrid:new-post", this.onNewPost), window.removeEventListener("widgetgrid:chat-event", this.onChatEvent);
	},
	methods: {
		assetUrl(e) {
			return c + e;
		},
		onNavigate(e) {
			this.activeView = e.detail.view, this.activeView === "chat" && (this.hasNewChatMessage = !1);
		},
		onScroll(e) {
			this.collapsed = e.detail.collapsed;
		},
		onNewPost() {
			this.hasNewPost = !0;
		},
		onChatEvent() {
			this.activeView !== "chat" && (this.hasNewChatMessage = !0);
		},
		onLogoClick() {
			window.dispatchEvent(new CustomEvent("widgetgrid:logo-click"));
		},
		canLeaveFor(e) {
			return e === this.activeView || window.dispatchEvent(new CustomEvent("widgetgrid:before-navigate", {
				detail: {
					from: this.activeView,
					to: e
				},
				cancelable: !0
			}));
		},
		navigate(e) {
			this.canLeaveFor(e) && window.dispatchEvent(new CustomEvent("widgetgrid:navigate", { detail: { view: e } }));
		},
		onHomeClick() {
			if (!this.canLeaveFor("blog")) return;
			let e = this.hasNewPost;
			this.hasNewPost = !1, window.dispatchEvent(new CustomEvent("widgetgrid:navigate", { detail: {
				view: "blog",
				forceReload: e
			} }));
		}
	}
}, u = [
	"src",
	"width",
	"height",
	"alt"
], d = { class: "topbar-menu-slot" }, f = {
	key: 0,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "2",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
	"aria-hidden": "true"
}, p = {
	key: 1,
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true"
}, m = {
	key: 2,
	class: "topbar-badge",
	"aria-hidden": "true"
}, h = {
	key: 0,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "2",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
	"aria-hidden": "true"
}, g = {
	key: 1,
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true"
}, _ = {
	key: 0,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "2",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
	"aria-hidden": "true"
}, v = {
	key: 1,
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true"
}, y = {
	key: 0,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "2",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
	"aria-hidden": "true"
}, b = {
	key: 1,
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true"
}, x = {
	key: 2,
	class: "topbar-badge",
	"aria-hidden": "true"
};
function S(s, c, l, S, C, w) {
	return a(), n("header", { class: i(["widget widget-topbar", { "topbar-collapsed": C.collapsed }]) }, [
		r("img", {
			src: C.collapsed ? w.assetUrl("logo-h64.png") : w.assetUrl("logo-h255.png"),
			width: C.collapsed ? 85 : 339,
			height: C.collapsed ? 64 : 255,
			alt: l.data?.alt || "Pie Laboratories LLC",
			class: "topbar-logo",
			onClick: c[0] ||= (...e) => w.onLogoClick && w.onLogoClick(...e)
		}, null, 8, u),
		c[13] ||= r("div", { class: "topbar-brand" }, [r("span", { class: "topbar-brand-name" }, "Pie Laboratories, LLC."), r("a", {
			class: "topbar-brand-email",
			href: "mailto:webmaster@pie-laboratories.com"
		}, "webmaster@pie-laboratories.com")], -1),
		r("nav", d, [
			r("button", {
				type: "button",
				class: "topbar-icon",
				title: "Home",
				"aria-label": "Home",
				onClick: c[1] ||= (...e) => w.onHomeClick && w.onHomeClick(...e)
			}, [C.activeView === "blog" ? (a(), n("svg", f, [...c[5] ||= [
				r("path", { d: "M5 12l-2 0l9 -9l9 9l-2 0" }, null, -1),
				r("path", { d: "M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" }, null, -1),
				r("path", { d: "M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" }, null, -1)
			]])) : (a(), n("svg", p, [...c[6] ||= [r("path", { d: "M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" }, null, -1)]])), C.hasNewPost ? (a(), n("span", m, "!")) : t("", !0)]),
			r("button", {
				type: "button",
				class: "topbar-icon",
				title: "Solitaire",
				"aria-label": "Solitaire",
				onClick: c[2] ||= (e) => w.navigate("solitaire")
			}, [C.activeView === "solitaire" ? (a(), n("svg", h, [...c[7] ||= [
				r("path", { d: "M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001" }, null, -1),
				r("path", { d: "M15 4h1a1 1 0 0 1 1 1v3.5" }, null, -1),
				r("path", { d: "M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374" }, null, -1)
			]])) : (a(), n("svg", g, [...c[8] ||= [
				r("path", { d: "M10.348 3.169l-7.15 3.113a2 2 0 0 0 -1.03 2.608l4.92 11.895a1.96 1.96 0 0 0 2.59 1.063l7.142 -3.11a2.002 2.002 0 0 0 1.036 -2.611l-4.92 -11.894a1.96 1.96 0 0 0 -2.588 -1.064z" }, null, -1),
				r("path", { d: "M16 3a2 2 0 0 1 1.995 1.85l.005 .15v3.5a1 1 0 0 1 -1.993 .117l-.007 -.117v-3.5h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" }, null, -1),
				r("path", { d: "M19.08 5.61a1 1 0 0 1 1.31 -.53c.257 .108 .505 .21 .769 .314a2 2 0 0 1 1.114 2.479l-.056 .146l-2.298 5.374a1 1 0 0 1 -1.878 -.676l.04 -.11l2.296 -5.371l-.366 -.148l-.402 -.167a1 1 0 0 1 -.53 -1.312z" }, null, -1)
			]]))]),
			r("button", {
				type: "button",
				class: "topbar-icon",
				title: "Embuscade",
				"aria-label": "Embuscade",
				onClick: c[3] ||= (e) => w.navigate("embuscade")
			}, [C.activeView === "embuscade" ? (a(), n("svg", _, [...c[9] ||= [
				r("path", { d: "M5.5 13h13a3.5 3.5 0 0 1 0 7h-13a3.5 3.5 0 0 1 0 -7z" }, null, -1),
				r("path", { d: "M7 13v-2a2 2 0 0 1 2 -2h5a2 2 0 0 1 2 2v2" }, null, -1),
				r("path", { d: "M16 10.5h5" }, null, -1)
			]])) : (a(), n("svg", v, [...c[10] ||= [
				r("path", { d: "M5.5 13h13a3.5 3.5 0 0 1 0 7h-13a3.5 3.5 0 0 1 0 -7z" }, null, -1),
				r("path", { d: "M9 8h5a3 3 0 0 1 3 3v1h-11v-1a3 3 0 0 1 3 -3z" }, null, -1),
				r("path", { d: "M16 9.5h6v2h-6z" }, null, -1)
			]]))]),
			r("button", {
				type: "button",
				class: "topbar-icon",
				title: "Chat with management",
				"aria-label": "Chat with management",
				onClick: c[4] ||= (e) => w.navigate("chat")
			}, [C.activeView === "chat" ? (a(), n("svg", y, [...c[11] ||= [
				r("path", { d: "M8 9h8" }, null, -1),
				r("path", { d: "M8 13h6" }, null, -1),
				r("path", { d: "M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12" }, null, -1)
			]])) : (a(), n("svg", b, [...c[12] ||= [r("path", { d: "M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-4.724l-4.762 2.857a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2h-1a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-4 9h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m2 -4h-8a1 1 0 1 0 0 2h8a1 1 0 0 0 0 -2" }, null, -1)]])), C.hasNewChatMessage ? (a(), n("span", x, "!")) : t("", !0)]),
			C.loginComponent ? (a(), e(o(C.loginComponent), {
				key: 0,
				data: {},
				title: ""
			})) : t("", !0)
		])
	], 2);
}
var C = /*#__PURE__*/ s(l, [["render", S], ["__scopeId", "data-v-70b6ee7b"]]);
//#endregion
export { C as default };
