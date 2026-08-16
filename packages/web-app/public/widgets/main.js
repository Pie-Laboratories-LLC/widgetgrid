(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-main[data-v-2e72418d]{box-sizing:border-box;height:calc(100vh - 255px);margin-top:255px;margin-right:160px;transition:margin-top .25s,height .25s;overflow-y:auto}.widget-main.main-collapsed[data-v-2e72418d]{height:calc(100vh - 64px);margin-top:64px}.main-status[data-v-2e72418d]{color:#666;padding:32px}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { createBlock as e, createCommentVNode as t, createElementBlock as n, normalizeClass as r, openBlock as i, resolveDynamicComponent as a } from "vue";
//#region \0plugin-vue:export-helper
var o = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, s = 10, c = { solitaire: "collapsed" }, l = {
	name: "MainWidget",
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
			view: "blog",
			blogComponent: null,
			solitaireComponent: null,
			collapsed: !1
		};
	},
	created() {
		window.addEventListener("widgetgrid:navigate", this.onNavigate), import(
			/* @vite-ignore */
			"/widgets/blog.js"
).then((e) => {
			this.blogComponent = e.default ?? e;
		});
	},
	beforeUnmount() {
		window.removeEventListener("widgetgrid:navigate", this.onNavigate);
	},
	computed: { topbarMode() {
		return c[this.view] ?? "scroll";
	} },
	methods: {
		onNavigate(e) {
			this.view = e.detail.view, this.view === "solitaire" && !this.solitaireComponent && import(
				/* @vite-ignore */
				"/widgets/solitaire.js"
).then((e) => {
				this.solitaireComponent = e.default ?? e;
			}), this.$el.scrollTop = 0, this.setCollapsed(this.topbarMode === "collapsed");
		},
		onScroll(e) {
			this.topbarMode === "scroll" && this.setCollapsed(e.target.scrollTop > s);
		},
		setCollapsed(e) {
			e !== this.collapsed && (this.collapsed = e, window.dispatchEvent(new CustomEvent("widgetgrid:scroll", { detail: { collapsed: e } })));
		}
	}
}, u = {
	key: 0,
	class: "main-status"
}, d = {
	key: 2,
	class: "main-status"
};
function f(o, s, c, l, f, p) {
	return i(), n("div", {
		class: r(["widget widget-main", { "main-collapsed": f.collapsed }]),
		onScroll: s[0] ||= (...e) => p.onScroll && p.onScroll(...e)
	}, [f.view === "blog" && !f.blogComponent ? (i(), n("p", u, "Loading…")) : f.view === "blog" ? (i(), e(a(f.blogComponent), {
		key: 1,
		data: {},
		title: ""
	})) : f.view === "solitaire" && !f.solitaireComponent ? (i(), n("p", d, "Loading…")) : f.view === "solitaire" ? (i(), e(a(f.solitaireComponent), {
		key: 3,
		data: {},
		title: ""
	})) : t("", !0)], 34);
}
var p = /*#__PURE__*/ o(l, [["render", f], ["__scopeId", "data-v-2e72418d"]]);
//#endregion
export { p as default };
