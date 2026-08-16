import { Fragment as e, createCommentVNode as t, createElementBlock as n, createElementVNode as r, openBlock as i, renderList as a, toDisplayString as o } from "vue";
//#region \0plugin-vue:export-helper
var s = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, c = {
	name: "TableWidget",
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
}, l = { class: "widget widget-table" }, u = { key: 0 }, d = { class: "table" };
function f(s, c, f, p, m, h) {
	return i(), n("div", l, [f.title ? (i(), n("h3", u, o(f.title), 1)) : t("", !0), r("table", d, [r("thead", null, [r("tr", null, [(i(!0), n(e, null, a(f.data.columns, (e) => (i(), n("th", { key: e }, o(e), 1))), 128))])]), r("tbody", null, [(i(!0), n(e, null, a(f.data.rows, (t, r) => (i(), n("tr", { key: r }, [(i(!0), n(e, null, a(t, (e, t) => (i(), n("td", { key: t }, o(e), 1))), 128))]))), 128))])])]);
}
var p = /*#__PURE__*/ s(c, [["render", f]]);
//#endregion
export { p as default };
