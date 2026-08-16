import { createElementBlock as e, createElementVNode as t, createStaticVNode as n, openBlock as r } from "vue";
//#region \0plugin-vue:export-helper
var i = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, a = "/widgets/solitaire-vendor/", o = "solitaire-vendor-css", s = {
	name: "SolitaireWidget",
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
			`${a}solitaire.js`
).then((e) => {
			e.mount(this.$refs.container);
		});
	},
	methods: {
		loadCss() {
			if (document.getElementById(o)) return;
			let e = document.createElement("link");
			e.id = o, e.rel = "stylesheet", e.href = `${a}solitaire.css`, document.head.appendChild(e);
		},
		dispatch(e) {
			this.$refs.container.dispatchEvent(new CustomEvent("solitaire", {
				detail: { type: e },
				bubbles: !0
			}));
		}
	}
}, c = {
	id: "solitaire",
	ref: "container",
	class: "widget widget-solitaire",
	style: { position: "relative" }
}, l = { class: "controls" };
function u(i, a, o, s, u, d) {
	return r(), e("div", c, [
		a[4] ||= t("div", { class: "canvas-container" }, [t("canvas", { class: "solitaire" })], -1),
		t("div", l, [
			t("button", {
				type: "button",
				onClick: a[0] ||= (e) => d.dispatch("fini")
			}, "FINI"),
			t("button", {
				type: "button",
				onClick: a[1] ||= (e) => d.dispatch("forfeit")
			}, "FORFEIT"),
			t("button", {
				type: "button",
				onClick: a[2] ||= (e) => d.dispatch("reset")
			}, "RESET"),
			t("button", {
				type: "button",
				onClick: a[3] ||= (e) => d.dispatch("help")
			}, "HELP")
		]),
		a[5] ||= n("<div class=\"credits\"><dl><dt>Card Back</dt><dd>By John Opie - Tate Britain, Public Domain, <a href=\"https://commons.wikimedia.org/w/index.php?curid=2358904\">Wikimedia Commons</a></dd><dt>Card Faces</dt><dd><a href=\"http://svg-cards.sourceforge.net/\">svg-cards on sourceforge</a> by David Bellot</dd></dl></div><div class=\"overlay game-dialog\" style=\"display:none;\"><div class=\"dialog\"><div class=\"x-bar\"></div><div class=\"content\"></div></div></div><div class=\"overlay error-dialog\" style=\"display:none;\"><div class=\"dialog\"><div class=\"x-bar\"></div><div class=\"content\"></div></div></div>", 3)
	], 512);
}
var d = /*#__PURE__*/ i(s, [["render", u]]);
//#endregion
export { d as default };
