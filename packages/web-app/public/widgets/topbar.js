(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-topbar[data-v-264b2bec]{z-index:10;background:#150a2e;align-items:center;height:255px;padding-left:40px;display:flex;position:fixed;top:0;left:0;right:0}.topbar-logo[data-v-264b2bec]{width:auto;height:255px;display:block}.topbar-menu-slot[data-v-264b2bec]{flex:1}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { createElementBlock as e, createElementVNode as t, openBlock as n } from "vue";
//#region \0plugin-vue:export-helper
var r = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, i = "/widgets/topbar-assets/", a = {
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
	methods: { assetUrl(e) {
		return i + e;
	} }
}, o = { class: "widget widget-topbar" }, s = ["src", "alt"];
function c(r, i, a, c, l, u) {
	return n(), e("header", o, [t("img", {
		src: u.assetUrl("logo-h255.png"),
		alt: a.data?.alt || "Pie Laboratories LLC",
		class: "topbar-logo",
		width: "339",
		height: "255"
	}, null, 8, s), i[0] ||= t("nav", { class: "topbar-menu-slot" }, null, -1)]);
}
var l = /*#__PURE__*/ r(a, [["render", c], ["__scopeId", "data-v-264b2bec"]]);
//#endregion
export { l as default };
