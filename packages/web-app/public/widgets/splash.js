(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-splash[data-v-ca9f2364]{background:radial-gradient(#2e1250 0%,#150a2e 45%,#050208 100%);justify-content:center;align-items:center;min-height:100vh;padding:2rem;display:flex}.splash-stage[data-v-ca9f2364]{aspect-ratio:1024/769;width:100%;max-width:1024px;position:relative}.splash-stage picture[data-v-ca9f2364],.splash-logo[data-v-ca9f2364]{width:100%;height:100%;display:block}.splash-logo[data-v-ca9f2364]{object-fit:contain}.splash-overlay[data-v-ca9f2364]{pointer-events:none;width:100%;height:100%;position:absolute;inset:0}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { createElementBlock as e, createElementVNode as t, openBlock as n } from "vue";
//#region \0plugin-vue:export-helper
var r = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, i = "/widgets/splash-assets/", a = {
	name: "SplashWidget",
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
	computed: { srcset() {
		return [
			600,
			800,
			1024
		].map((e) => `${this.assetUrl(`logo-${e}.png`)} ${e}w`).join(", ");
	} },
	methods: { assetUrl(e) {
		return i + e;
	} }
}, o = { class: "widget widget-splash" }, s = { class: "splash-stage" }, c = ["srcset"], l = ["src", "alt"], u = ["src"];
function d(r, i, a, d, f, p) {
	return n(), e("section", o, [t("div", s, [t("picture", null, [t("source", {
		srcset: p.srcset,
		sizes: "(min-width: 1024px) 1024px, 100vw"
	}, null, 8, c), t("img", {
		src: p.assetUrl("logo-1024.png"),
		alt: a.data?.alt || "Pie Laboratories LLC",
		class: "splash-logo",
		width: "1024",
		height: "769"
	}, null, 8, l)]), t("img", {
		src: p.assetUrl("overlay.svg"),
		alt: "",
		class: "splash-overlay",
		"aria-hidden": "true"
	}, null, 8, u)])]);
}
var f = /*#__PURE__*/ r(a, [["render", d], ["__scopeId", "data-v-ca9f2364"]]);
//#endregion
export { f as default };
