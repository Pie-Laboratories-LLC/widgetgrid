(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-embuscade[data-v-18ad0bde]{height:100%}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { createElementBlock as e, openBlock as t } from "vue";
//#region \0plugin-vue:export-helper
var n = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, r = "/widgets/embuscade-vendor/", i = "embuscade-vendor-css";
function a() {
	return "ws://localhost:8080/embuscade-ws";
}
var o = {
	name: "EmbuscadeWidget",
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
	created() {
		window.addEventListener("widgetgrid:before-navigate", this.onBeforeNavigate), window.addEventListener("beforeunload", this.onBeforeUnload);
	},
	mounted() {
		this.loadCss(), import(
			/* @vite-ignore */
			`${r}embuscade.js`
).then((e) => {
			this.isUnmounted || (this.unmountGame = e.mount(this.$refs.container, { wsUrl: a() }));
		});
	},
	beforeUnmount() {
		window.removeEventListener("widgetgrid:before-navigate", this.onBeforeNavigate), window.removeEventListener("beforeunload", this.onBeforeUnload), this.isUnmounted = !0, this.unmountGame?.();
	},
	methods: {
		onBeforeNavigate(e) {
			window.confirm("Leave Embuscade? You'll be disconnected from the game.") || e.preventDefault();
		},
		onBeforeUnload(e) {
			e.preventDefault(), e.returnValue = "";
		},
		loadCss() {
			if (document.getElementById(i)) return;
			let e = document.createElement("link");
			e.id = i, e.rel = "stylesheet", e.href = `${r}embuscade.css`, document.head.appendChild(e);
		}
	}
}, s = {
	ref: "container",
	class: "widget widget-embuscade"
};
function c(n, r, i, a, o, c) {
	return t(), e("div", s, null, 512);
}
var l = /*#__PURE__*/ n(o, [["render", c], ["__scopeId", "data-v-18ad0bde"]]);
//#endregion
export { l as default };
