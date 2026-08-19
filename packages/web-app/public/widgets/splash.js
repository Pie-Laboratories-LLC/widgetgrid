(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-splash[data-v-66402784]{background:linear-gradient(135deg,#0c308c 0%,#983278 50%,#4c212b 100%);justify-content:center;align-items:center;min-height:100vh;padding:2rem;display:flex}.splash-stage[data-v-66402784]{aspect-ratio:1024/769;cursor:pointer;width:100%;max-width:1024px;position:relative}.splash-stage picture[data-v-66402784],.splash-logo[data-v-66402784]{width:100%;height:100%;display:block}.splash-logo[data-v-66402784]{object-fit:contain}.splash-overlay[data-v-66402784]{pointer-events:none;width:100%;height:100%;position:absolute;inset:0}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
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
	methods: {
		assetUrl(e) {
			return i + e;
		},
		dismiss() {
			window.dispatchEvent(new CustomEvent("widgetgrid:splash-dismissed"));
		}
	}
}, o = { class: "widget widget-splash" }, s = ["srcset"], c = ["src", "alt"], l = ["src"];
function u(r, i, a, u, d, f) {
	return n(), e("section", o, [t("div", {
		class: "splash-stage",
		onClick: i[0] ||= (...e) => f.dismiss && f.dismiss(...e)
	}, [t("picture", null, [t("source", {
		srcset: f.srcset,
		sizes: "(min-width: 1024px) 1024px, 100vw"
	}, null, 8, s), t("img", {
		src: f.assetUrl("logo-1024.png"),
		alt: a.data?.alt || "Pie Laboratories LLC",
		class: "splash-logo",
		width: "1024",
		height: "769"
	}, null, 8, c)]), t("img", {
		src: f.assetUrl("overlay.svg"),
		alt: "",
		class: "splash-overlay",
		"aria-hidden": "true"
	}, null, 8, l)])]);
}
var d = /*#__PURE__*/ r(a, [["render", u], ["__scopeId", "data-v-66402784"]]);
//#endregion
export { d as default };
