(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-lastnaming[data-v-9a4b0a04]{height:100%}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { createElementBlock as e, openBlock as t } from "vue";
//#region \0plugin-vue:export-helper
var n = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, r = "/widgets/the-last-naming-vendor/", i = "the-last-naming-vendor-css", a = {
	name: "LastNamingWidget",
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
	mounted() {
		this.loadCss(), import(
			/* @vite-ignore */
			`${r}the-last-naming.js`
).then((e) => {
			this.isUnmounted || (this.unmountGame = e.mount(this.$refs.container, e.optionsFromAddress(window.location.search)));
		});
	},
	beforeUnmount() {
		this.isUnmounted = !0, this.unmountGame?.();
	},
	methods: { loadCss() {
		if (document.getElementById(i)) return;
		let e = document.createElement("link");
		e.id = i, e.rel = "stylesheet", e.href = `${r}the-last-naming.css`, document.head.appendChild(e);
	} }
}, o = {
	ref: "container",
	class: "widget widget-lastnaming"
};
function s(n, r, i, a, s, c) {
	return t(), e("div", o, null, 512);
}
var c = /*#__PURE__*/ n(a, [["render", s], ["__scopeId", "data-v-9a4b0a04"]]);
//#endregion
export { c as default };
