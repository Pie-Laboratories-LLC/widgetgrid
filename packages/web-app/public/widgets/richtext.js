(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-richtext h3[data-v-158a9a03]{margin-bottom:.5rem}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { createCommentVNode as e, createElementBlock as t, createElementVNode as n, openBlock as r, toDisplayString as i } from "vue";
//#region \0plugin-vue:export-helper
var a = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, o = {
	name: "RichTextWidget",
	props: {
		data: {
			type: Object,
			required: !0
		},
		title: {
			type: String,
			default: ""
		}
	}
}, s = { class: "widget widget-richtext" }, c = { key: 0 }, l = ["innerHTML"];
function u(a, o, u, d, f, p) {
	return r(), t("div", s, [u.title ? (r(), t("h3", c, i(u.title), 1)) : e("", !0), n("div", { innerHTML: u.data?.html ?? "" }, null, 8, l)]);
}
var d = /*#__PURE__*/ a(o, [["render", u], ["__scopeId", "data-v-158a9a03"]]);
//#endregion
export { d as default };
