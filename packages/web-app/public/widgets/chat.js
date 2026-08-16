(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.widget-chat[data-v-97112f78]{box-sizing:border-box;height:100%}.chat-status[data-v-97112f78]{color:#666;padding:24px}.chat-shell[data-v-97112f78]{height:100%;display:flex}.chat-list[data-v-97112f78]{box-sizing:border-box;border-right:1px solid #ddd;flex:none;width:220px;overflow-y:auto}.chat-list-item[data-v-97112f78]{cursor:pointer;border-bottom:1px solid #eee;justify-content:space-between;align-items:center;gap:8px;padding:12px 16px;display:flex}.chat-list-item[data-v-97112f78]:hover{background:#f7f5fa}.chat-list-item-active[data-v-97112f78]{background:#efe9f7}.chat-list-label[data-v-97112f78]{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.chat-list-label-unread[data-v-97112f78]{font-weight:700}.chat-rename-btn[data-v-97112f78]{color:#999;cursor:pointer;background:0 0;border:none;flex:none;padding:2px 4px}.chat-rename-btn[data-v-97112f78]:hover{color:#333}.chat-rename-input[data-v-97112f78]{box-sizing:border-box;width:100%;padding:4px 6px}.chat-thread[data-v-97112f78]{flex-direction:column;flex:1;min-width:0;display:flex}.chat-thread-visitor[data-v-97112f78]{height:100%}.chat-messages[data-v-97112f78]{flex-direction:column;flex:1;gap:10px;padding:24px;display:flex;overflow-y:auto}.chat-message[data-v-97112f78]{background:#f0f0f0;border-radius:12px;max-width:70%;padding:8px 12px}.chat-message-body[data-v-97112f78]{white-space:pre-wrap;word-break:break-word;margin:0}.chat-message-mine[data-v-97112f78]{color:#f4ead9;background:#150a2e;align-self:flex-end}.chat-message-theirs[data-v-97112f78]{align-self:flex-start}.chat-composer[data-v-97112f78]{border-top:1px solid #ddd;flex:none;gap:8px;padding:16px 24px;display:flex}.chat-input[data-v-97112f78]{border:1px solid #ccc;border-radius:6px;flex:1;padding:10px 12px;font-size:1rem}.chat-send[data-v-97112f78]{color:#f4ead9;cursor:pointer;background:#150a2e;border:none;border-radius:6px;padding:10px 16px;font-weight:600}.chat-send[data-v-97112f78]:disabled{opacity:.5;cursor:default}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { Fragment, createCommentVNode, createElementBlock, createElementVNode, normalizeClass, openBlock, renderList, toDisplayString, vModelText, withDirectives, withKeys, withModifiers } from "vue";
//#region \0rolldown/runtime.js
var __commonJSMin = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), require_google_protobuf = /* @__PURE__ */ __commonJSMin(((exports) => {
	var COMPILED = !0, goog = goog || {};
	if (goog.global = exports || self, goog.exportPath_ = function(e, t, n, r) {
		e = e.split("."), r ||= goog.global, e[0] in r || r.execScript === void 0 || r.execScript("var " + e[0]);
		for (var i; e.length && (i = e.shift());) if (e.length || t === void 0) r = r[i] && r[i] !== Object.prototype[i] ? r[i] : r[i] = {};
		else if (!n && goog.isObject(t) && goog.isObject(r[i])) for (var o in t) t.hasOwnProperty(o) && (r[i][o] = t[o]);
		else r[i] = t;
	}, goog.define = function(e, t) {
		if (!COMPILED) {
			var n = goog.global.CLOSURE_UNCOMPILED_DEFINES, r = goog.global.CLOSURE_DEFINES;
			n && n.nodeType === void 0 && Object.prototype.hasOwnProperty.call(n, e) ? t = n[e] : r && r.nodeType === void 0 && Object.prototype.hasOwnProperty.call(r, e) && (t = r[e]);
		}
		return t;
	}, goog.FEATURESET_YEAR = 2012, goog.DEBUG = !0, goog.LOCALE = "en", goog.TRUSTED_SITE = !0, goog.DISALLOW_TEST_ONLY_CODE = COMPILED && !goog.DEBUG, goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING = !1, goog.provide = function(e) {
		if (goog.isInModuleLoader_()) throw Error("goog.provide cannot be used within a module.");
		if (!COMPILED && goog.isProvided_(e)) throw Error("Namespace \"" + e + "\" already declared.");
		goog.constructNamespace_(e);
	}, goog.constructNamespace_ = function(e, t, n) {
		if (!COMPILED) {
			delete goog.implicitNamespaces_[e];
			for (var r = e; (r = r.substring(0, r.lastIndexOf("."))) && !goog.getObjectByName(r);) goog.implicitNamespaces_[r] = !0;
		}
		goog.exportPath_(e, t, n);
	}, goog.NONCE_PATTERN_ = /^[\w+/_-]+[=]{0,2}$/, goog.getScriptNonce_ = function(e) {
		return e = (e || goog.global).document, (e = e.querySelector && e.querySelector("script[nonce]")) && (e = e.nonce || e.getAttribute("nonce")) && goog.NONCE_PATTERN_.test(e) ? e : "";
	}, goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/, goog.module = function(e) {
		if (typeof e != "string" || !e || e.search(goog.VALID_MODULE_RE_) == -1) throw Error("Invalid module identifier");
		if (!goog.isInGoogModuleLoader_()) throw Error("Module " + e + " has been loaded incorrectly. Note, modules cannot be loaded as normal scripts. They require some kind of pre-processing step. You're likely trying to load a module via a script tag or as a part of a concatenated bundle without rewriting the module. For more info see: https://github.com/google/closure-library/wiki/goog.module:-an-ES6-module-like-alternative-to-goog.provide.");
		if (goog.moduleLoaderState_.moduleName) throw Error("goog.module may only be called once per module.");
		if (goog.moduleLoaderState_.moduleName = e, !COMPILED) {
			if (goog.isProvided_(e)) throw Error("Namespace \"" + e + "\" already declared.");
			delete goog.implicitNamespaces_[e];
		}
	}, goog.module.get = function(e) {
		return goog.module.getInternal_(e);
	}, goog.module.getInternal_ = function(e) {
		if (!COMPILED) {
			if (e in goog.loadedModules_) return goog.loadedModules_[e].exports;
			if (!goog.implicitNamespaces_[e]) return e = goog.getObjectByName(e), e ?? null;
		}
		return null;
	}, goog.ModuleType = {
		ES6: "es6",
		GOOG: "goog"
	}, goog.moduleLoaderState_ = null, goog.isInModuleLoader_ = function() {
		return goog.isInGoogModuleLoader_() || goog.isInEs6ModuleLoader_();
	}, goog.isInGoogModuleLoader_ = function() {
		return !!goog.moduleLoaderState_ && goog.moduleLoaderState_.type == goog.ModuleType.GOOG;
	}, goog.isInEs6ModuleLoader_ = function() {
		if (goog.moduleLoaderState_ && goog.moduleLoaderState_.type == goog.ModuleType.ES6) return !0;
		var e = goog.global.$jscomp;
		return e ? typeof e.getCurrentModulePath == "function" && !!e.getCurrentModulePath() : !1;
	}, goog.module.declareLegacyNamespace = function() {
		if (!COMPILED && !goog.isInGoogModuleLoader_()) throw Error("goog.module.declareLegacyNamespace must be called from within a goog.module");
		if (!COMPILED && !goog.moduleLoaderState_.moduleName) throw Error("goog.module must be called prior to goog.module.declareLegacyNamespace.");
		goog.moduleLoaderState_.declareLegacyNamespace = !0;
	}, goog.declareModuleId = function(e) {
		if (!COMPILED) {
			if (!goog.isInEs6ModuleLoader_()) throw Error("goog.declareModuleId may only be called from within an ES6 module");
			if (goog.moduleLoaderState_ && goog.moduleLoaderState_.moduleName) throw Error("goog.declareModuleId may only be called once per module.");
			if (e in goog.loadedModules_) throw Error("Module with namespace \"" + e + "\" already exists.");
		}
		if (goog.moduleLoaderState_) goog.moduleLoaderState_.moduleName = e;
		else {
			var t = goog.global.$jscomp;
			if (!t || typeof t.getCurrentModulePath != "function") throw Error("Module with namespace \"" + e + "\" has been loaded incorrectly.");
			t = t.require(t.getCurrentModulePath()), goog.loadedModules_[e] = {
				exports: t,
				type: goog.ModuleType.ES6,
				moduleId: e
			};
		}
	}, goog.setTestOnly = function(e) {
		if (goog.DISALLOW_TEST_ONLY_CODE) throw e ||= "", Error("Importing test-only code into non-debug environment" + (e ? ": " + e : "."));
	}, goog.forwardDeclare = function(e) {}, COMPILED || (goog.isProvided_ = function(e) {
		return e in goog.loadedModules_ || !goog.implicitNamespaces_[e] && goog.getObjectByName(e) != null;
	}, goog.implicitNamespaces_ = { "goog.module": !0 }), goog.getObjectByName = function(e, t) {
		e = e.split("."), t ||= goog.global;
		for (var n = 0; n < e.length; n++) if (t = t[e[n]], t == null) return null;
		return t;
	}, goog.addDependency = function(e, t, n, r) {
		!COMPILED && goog.DEPENDENCIES_ENABLED && goog.debugLoader_.addDependency(e, t, n, r);
	}, goog.ENABLE_DEBUG_LOADER = !1, goog.logToConsole_ = function(e) {
		goog.global.console && goog.global.console.error(e);
	}, goog.require = function(e) {
		if (!COMPILED) {
			if (goog.ENABLE_DEBUG_LOADER && goog.debugLoader_.requested(e), goog.isProvided_(e)) {
				if (goog.isInModuleLoader_()) return goog.module.getInternal_(e);
			} else if (goog.ENABLE_DEBUG_LOADER) {
				var t = goog.moduleLoaderState_;
				goog.moduleLoaderState_ = null;
				try {
					goog.debugLoader_.load_(e);
				} finally {
					goog.moduleLoaderState_ = t;
				}
			}
			return null;
		}
	}, goog.requireType = function(e) {
		return {};
	}, goog.basePath = "", goog.abstractMethod = function() {
		throw Error("unimplemented abstract method");
	}, goog.addSingletonGetter = function(e) {
		e.instance_ = void 0, e.getInstance = function() {
			return e.instance_ ? e.instance_ : (goog.DEBUG && (goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = e), e.instance_ = new e());
		};
	}, goog.instantiatedSingletons_ = [], goog.LOAD_MODULE_USING_EVAL = !0, goog.SEAL_MODULE_EXPORTS = goog.DEBUG, goog.loadedModules_ = {}, goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER, goog.TRANSPILE = "detect", goog.ASSUME_ES_MODULES_TRANSPILED = !1, goog.TRUSTED_TYPES_POLICY_NAME = "goog", goog.hasBadLetScoping = null, goog.loadModule = function(e) {
		var t = goog.moduleLoaderState_;
		try {
			goog.moduleLoaderState_ = {
				moduleName: "",
				declareLegacyNamespace: !1,
				type: goog.ModuleType.GOOG
			};
			var n = {}, r = n;
			if (typeof e == "function") r = e.call(void 0, r);
			else if (typeof e == "string") r = goog.loadModuleFromSource_.call(void 0, r, e);
			else throw Error("Invalid module definition");
			var i = goog.moduleLoaderState_.moduleName;
			if (typeof i == "string" && i) goog.moduleLoaderState_.declareLegacyNamespace ? goog.constructNamespace_(i, r, n !== r) : goog.SEAL_MODULE_EXPORTS && Object.seal && typeof r == "object" && r && Object.seal(r), goog.loadedModules_[i] = {
				exports: r,
				type: goog.ModuleType.GOOG,
				moduleId: goog.moduleLoaderState_.moduleName
			};
			else throw Error("Invalid module name \"" + i + "\"");
		} finally {
			goog.moduleLoaderState_ = t;
		}
	}, goog.loadModuleFromSource_ = function(a, b) {
		return eval(goog.CLOSURE_EVAL_PREFILTER_.createScript(b)), a;
	}, goog.normalizePath_ = function(e) {
		e = e.split("/");
		for (var t = 0; t < e.length;) e[t] == "." ? e.splice(t, 1) : t && e[t] == ".." && e[t - 1] && e[t - 1] != ".." ? e.splice(--t, 2) : t++;
		return e.join("/");
	}, goog.loadFileSync_ = function(e) {
		if (goog.global.CLOSURE_LOAD_FILE_SYNC) return goog.global.CLOSURE_LOAD_FILE_SYNC(e);
		try {
			var t = new goog.global.XMLHttpRequest();
			return t.open("get", e, !1), t.send(), t.status == 0 || t.status == 200 ? t.responseText : null;
		} catch {
			return null;
		}
	}, goog.typeOf = function(e) {
		var t = typeof e;
		return t == "object" ? e ? Array.isArray(e) ? "array" : t : "null" : t;
	}, goog.isArrayLike = function(e) {
		var t = goog.typeOf(e);
		return t == "array" || t == "object" && typeof e.length == "number";
	}, goog.isDateLike = function(e) {
		return goog.isObject(e) && typeof e.getFullYear == "function";
	}, goog.isObject = function(e) {
		var t = typeof e;
		return t == "object" && e != null || t == "function";
	}, goog.getUid = function(e) {
		return Object.prototype.hasOwnProperty.call(e, goog.UID_PROPERTY_) && e[goog.UID_PROPERTY_] || (e[goog.UID_PROPERTY_] = ++goog.uidCounter_);
	}, goog.hasUid = function(e) {
		return !!e[goog.UID_PROPERTY_];
	}, goog.removeUid = function(e) {
		e !== null && "removeAttribute" in e && e.removeAttribute(goog.UID_PROPERTY_);
		try {
			delete e[goog.UID_PROPERTY_];
		} catch {}
	}, goog.UID_PROPERTY_ = "closure_uid_" + (1e9 * Math.random() >>> 0), goog.uidCounter_ = 0, goog.cloneObject = function(e) {
		var t = goog.typeOf(e);
		if (t == "object" || t == "array") {
			if (typeof e.clone == "function") return e.clone();
			if (typeof Map < "u" && e instanceof Map) return new Map(e);
			if (typeof Set < "u" && e instanceof Set) return new Set(e);
			for (var n in t = t == "array" ? [] : {}, e) t[n] = goog.cloneObject(e[n]);
			return t;
		}
		return e;
	}, goog.bindNative_ = function(e, t, n) {
		return e.call.apply(e.bind, arguments);
	}, goog.bindJs_ = function(e, t, n) {
		if (!e) throw Error();
		if (2 < arguments.length) {
			var r = Array.prototype.slice.call(arguments, 2);
			return function() {
				var n = Array.prototype.slice.call(arguments);
				return Array.prototype.unshift.apply(n, r), e.apply(t, n);
			};
		}
		return function() {
			return e.apply(t, arguments);
		};
	}, goog.bind = function(e, t, n) {
		return goog.bind = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? goog.bindNative_ : goog.bindJs_, goog.bind.apply(null, arguments);
	}, goog.partial = function(e, t) {
		var n = Array.prototype.slice.call(arguments, 1);
		return function() {
			var t = n.slice();
			return t.push.apply(t, arguments), e.apply(this, t);
		};
	}, goog.now = function() {
		return Date.now();
	}, goog.globalEval = function(e) {
		(0, eval)(e);
	}, goog.getCssName = function(e, t) {
		if (String(e).charAt(0) == ".") throw Error("className passed in goog.getCssName must not start with \".\". You passed: " + e);
		var n = function(e) {
			return goog.cssNameMapping_[e] || e;
		}, r = function(e) {
			e = e.split("-");
			for (var t = [], r = 0; r < e.length; r++) t.push(n(e[r]));
			return t.join("-");
		};
		return r = goog.cssNameMapping_ ? goog.cssNameMappingStyle_ == "BY_WHOLE" ? n : r : function(e) {
			return e;
		}, e = t ? e + "-" + r(t) : r(e), goog.global.CLOSURE_CSS_NAME_MAP_FN ? goog.global.CLOSURE_CSS_NAME_MAP_FN(e) : e;
	}, goog.setCssNameMapping = function(e, t) {
		goog.cssNameMapping_ = e, goog.cssNameMappingStyle_ = t;
	}, !COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING && (goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING), goog.GetMsgOptions = function() {}, goog.getMsg = function(e, t, n) {
		return n && n.html && (e = e.replace(/</g, "&lt;")), n && n.unescapeHtmlEntities && (e = e.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&")), t && (e = e.replace(/\{\$([^}]+)}/g, function(e, n) {
			return t != null && n in t ? t[n] : e;
		})), e;
	}, goog.getMsgWithFallback = function(e, t) {
		return e;
	}, goog.exportSymbol = function(e, t, n) {
		goog.exportPath_(e, t, !0, n);
	}, goog.exportProperty = function(e, t, n) {
		e[t] = n;
	}, goog.inherits = function(e, t) {
		function n() {}
		n.prototype = t.prototype, e.superClass_ = t.prototype, e.prototype = new n(), e.prototype.constructor = e, e.base = function(e, n, r) {
			for (var i = Array(arguments.length - 2), o = 2; o < arguments.length; o++) i[o - 2] = arguments[o];
			return t.prototype[n].apply(e, i);
		};
	}, goog.scope = function(e) {
		if (goog.isInModuleLoader_()) throw Error("goog.scope is not supported within a module.");
		e.call(goog.global);
	}, COMPILED || (goog.global.COMPILED = COMPILED), goog.defineClass = function(e, t) {
		var n = t.constructor, r = t.statics;
		return n && n != Object.prototype.constructor || (n = function() {
			throw Error("cannot instantiate an interface (no constructor defined).");
		}), n = goog.defineClass.createSealingConstructor_(n, e), e && goog.inherits(n, e), delete t.constructor, delete t.statics, goog.defineClass.applyProperties_(n.prototype, t), r != null && (r instanceof Function ? r(n) : goog.defineClass.applyProperties_(n, r)), n;
	}, goog.defineClass.SEAL_CLASS_INSTANCES = goog.DEBUG, goog.defineClass.createSealingConstructor_ = function(e, t) {
		return goog.defineClass.SEAL_CLASS_INSTANCES ? function() {
			var t = e.apply(this, arguments) || this;
			return t[goog.UID_PROPERTY_] = t[goog.UID_PROPERTY_], t;
		} : e;
	}, goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "), goog.defineClass.applyProperties_ = function(e, t) {
		for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
		for (var r = 0; r < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; r++) n = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[r], Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
	}, goog.identity_ = function(e) {
		return e;
	}, goog.createTrustedTypesPolicy = function(e) {
		var t = null, n = goog.global.trustedTypes;
		if (!n || !n.createPolicy) return t;
		try {
			t = n.createPolicy(e, {
				createHTML: goog.identity_,
				createScript: goog.identity_,
				createScriptURL: goog.identity_
			});
		} catch (e) {
			goog.logToConsole_(e.message);
		}
		return t;
	}, !COMPILED && goog.DEPENDENCIES_ENABLED && (goog.isEdge_ = function() {
		return !!(goog.global.navigator && goog.global.navigator.userAgent ? goog.global.navigator.userAgent : "").match(/Edge\/(\d+)(\.\d)*/i);
	}, goog.inHtmlDocument_ = function() {
		var e = goog.global.document;
		return e != null && "write" in e;
	}, goog.isDocumentLoading_ = function() {
		var e = goog.global.document;
		return e.attachEvent ? e.readyState != "complete" : e.readyState == "loading";
	}, goog.findBasePath_ = function() {
		if (goog.global.CLOSURE_BASE_PATH != null && typeof goog.global.CLOSURE_BASE_PATH == "string") goog.basePath = goog.global.CLOSURE_BASE_PATH;
		else if (goog.inHtmlDocument_()) {
			var e = goog.global.document, t = e.currentScript;
			for (e = t ? [t] : e.getElementsByTagName("SCRIPT"), t = e.length - 1; 0 <= t; --t) {
				var n = e[t].src, r = n.lastIndexOf("?");
				if (r = r == -1 ? n.length : r, n.slice(r - 7, r) == "base.js") {
					goog.basePath = n.slice(0, r - 7);
					break;
				}
			}
		}
	}, goog.findBasePath_(), goog.protectScriptTag_ = function(e) {
		return e.replace(/<\/(SCRIPT)/gi, "\\x3c/$1");
	}, goog.DebugLoader_ = function() {
		this.dependencies_ = {}, this.idToPath_ = {}, this.written_ = {}, this.loadingDeps_ = [], this.depsToLoad_ = [], this.paused_ = !1, this.factory_ = new goog.DependencyFactory(), this.deferredCallbacks_ = {}, this.deferredQueue_ = [];
	}, goog.DebugLoader_.prototype.bootstrap = function(e, t) {
		function n() {
			r &&= (goog.global.setTimeout(r, 0), null);
		}
		var r = t;
		if (e.length) {
			t = [];
			for (var i = 0; i < e.length; i++) {
				var o = this.getPathFromDeps_(e[i]);
				if (!o) throw Error("Unregonized namespace: " + e[i]);
				t.push(this.dependencies_[o]);
			}
			o = goog.require;
			var s = 0;
			for (i = 0; i < e.length; i++) o(e[i]), t[i].onLoad(function() {
				++s == e.length && n();
			});
		} else n();
	}, goog.DebugLoader_.prototype.loadClosureDeps = function() {
		this.depsToLoad_.push(this.factory_.createDependency(goog.normalizePath_(goog.basePath + "deps.js"), "deps.js", [], [], {})), this.loadDeps_();
	}, goog.DebugLoader_.prototype.requested = function(e, t) {
		(e = this.getPathFromDeps_(e)) && (t || this.areDepsLoaded_(this.dependencies_[e].requires)) && (t = this.deferredCallbacks_[e]) && (delete this.deferredCallbacks_[e], t());
	}, goog.DebugLoader_.prototype.setDependencyFactory = function(e) {
		this.factory_ = e;
	}, goog.DebugLoader_.prototype.load_ = function(e) {
		if (this.getPathFromDeps_(e)) {
			var t = this, n = [], r = function(e) {
				var i = t.getPathFromDeps_(e);
				if (!i) throw Error("Bad dependency path or symbol: " + e);
				if (!t.written_[i]) {
					for (t.written_[i] = !0, e = t.dependencies_[i], i = 0; i < e.requires.length; i++) goog.isProvided_(e.requires[i]) || r(e.requires[i]);
					n.push(e);
				}
			};
			r(e), e = !!this.depsToLoad_.length, this.depsToLoad_ = this.depsToLoad_.concat(n), this.paused_ || e || this.loadDeps_();
		} else goog.logToConsole_("goog.require could not find: " + e);
	}, goog.DebugLoader_.prototype.loadDeps_ = function() {
		for (var e = this, t = this.paused_; this.depsToLoad_.length && !t;) (function() {
			var n = !1, r = e.depsToLoad_.shift(), i = !1;
			e.loading_(r);
			var o = {
				pause: function() {
					if (n) throw Error("Cannot call pause after the call to load.");
					t = !0;
				},
				resume: function() {
					n ? e.resume_() : t = !1;
				},
				loaded: function() {
					if (i) throw Error("Double call to loaded.");
					i = !0, e.loaded_(r);
				},
				pending: function() {
					for (var t = [], n = 0; n < e.loadingDeps_.length; n++) t.push(e.loadingDeps_[n]);
					return t;
				},
				setModuleState: function(e) {
					goog.moduleLoaderState_ = {
						type: e,
						moduleName: "",
						declareLegacyNamespace: !1
					};
				},
				registerEs6ModuleExports: function(e, t, n) {
					n && (goog.loadedModules_[n] = {
						exports: t,
						type: goog.ModuleType.ES6,
						moduleId: n || ""
					});
				},
				registerGoogModuleExports: function(e, t) {
					goog.loadedModules_[e] = {
						exports: t,
						type: goog.ModuleType.GOOG,
						moduleId: e
					};
				},
				clearModuleState: function() {
					goog.moduleLoaderState_ = null;
				},
				defer: function(t) {
					if (n) throw Error("Cannot register with defer after the call to load.");
					e.defer_(r, t);
				},
				areDepsLoaded: function() {
					return e.areDepsLoaded_(r.requires);
				}
			};
			try {
				r.load(o);
			} finally {
				n = !0;
			}
		})();
		t && this.pause_();
	}, goog.DebugLoader_.prototype.pause_ = function() {
		this.paused_ = !0;
	}, goog.DebugLoader_.prototype.resume_ = function() {
		this.paused_ && (this.paused_ = !1, this.loadDeps_());
	}, goog.DebugLoader_.prototype.loading_ = function(e) {
		this.loadingDeps_.push(e);
	}, goog.DebugLoader_.prototype.loaded_ = function(e) {
		for (var t = 0; t < this.loadingDeps_.length; t++) if (this.loadingDeps_[t] == e) {
			this.loadingDeps_.splice(t, 1);
			break;
		}
		for (t = 0; t < this.deferredQueue_.length; t++) if (this.deferredQueue_[t] == e.path) {
			this.deferredQueue_.splice(t, 1);
			break;
		}
		if (this.loadingDeps_.length == this.deferredQueue_.length && !this.depsToLoad_.length) for (; this.deferredQueue_.length;) this.requested(this.deferredQueue_.shift(), !0);
		e.loaded();
	}, goog.DebugLoader_.prototype.areDepsLoaded_ = function(e) {
		for (var t = 0; t < e.length; t++) {
			var n = this.getPathFromDeps_(e[t]);
			if (!n || !(n in this.deferredCallbacks_ || goog.isProvided_(e[t]))) return !1;
		}
		return !0;
	}, goog.DebugLoader_.prototype.getPathFromDeps_ = function(e) {
		return e in this.idToPath_ ? this.idToPath_[e] : e in this.dependencies_ ? e : null;
	}, goog.DebugLoader_.prototype.defer_ = function(e, t) {
		this.deferredCallbacks_[e.path] = t, this.deferredQueue_.push(e.path);
	}, goog.LoadController = function() {}, goog.LoadController.prototype.pause = function() {}, goog.LoadController.prototype.resume = function() {}, goog.LoadController.prototype.loaded = function() {}, goog.LoadController.prototype.pending = function() {}, goog.LoadController.prototype.registerEs6ModuleExports = function(e, t, n) {}, goog.LoadController.prototype.setModuleState = function(e) {}, goog.LoadController.prototype.clearModuleState = function() {}, goog.LoadController.prototype.defer = function(e) {}, goog.LoadController.prototype.areDepsLoaded = function() {}, goog.Dependency = function(e, t, n, r, i) {
		this.path = e, this.relativePath = t, this.provides = n, this.requires = r, this.loadFlags = i, this.loaded_ = !1, this.loadCallbacks_ = [];
	}, goog.Dependency.prototype.getPathName = function() {
		var e = this.path, t = e.indexOf("://");
		return 0 <= t && (e = e.substring(t + 3), t = e.indexOf("/"), 0 <= t && (e = e.substring(t + 1))), e;
	}, goog.Dependency.prototype.onLoad = function(e) {
		this.loaded_ ? e() : this.loadCallbacks_.push(e);
	}, goog.Dependency.prototype.loaded = function() {
		this.loaded_ = !0;
		var e = this.loadCallbacks_;
		this.loadCallbacks_ = [];
		for (var t = 0; t < e.length; t++) e[t]();
	}, goog.Dependency.defer_ = !1, goog.Dependency.callbackMap_ = {}, goog.Dependency.registerCallback_ = function(e) {
		var t = Math.random().toString(32);
		return goog.Dependency.callbackMap_[t] = e, t;
	}, goog.Dependency.unregisterCallback_ = function(e) {
		delete goog.Dependency.callbackMap_[e];
	}, goog.Dependency.callback_ = function(e, t) {
		if (e in goog.Dependency.callbackMap_) {
			for (var n = goog.Dependency.callbackMap_[e], r = [], i = 1; i < arguments.length; i++) r.push(arguments[i]);
			n.apply(void 0, r);
		} else throw Error("Callback key " + e + " does not exist (was base.js loaded more than once?).");
	}, goog.Dependency.prototype.load = function(e) {
		if (goog.global.CLOSURE_IMPORT_SCRIPT) goog.global.CLOSURE_IMPORT_SCRIPT(this.path) ? e.loaded() : e.pause();
		else if (goog.inHtmlDocument_()) {
			var t = goog.global.document;
			if (t.readyState == "complete" && !goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING) {
				if (/\bdeps.js$/.test(this.path)) {
					e.loaded();
					return;
				}
				throw Error("Cannot write \"" + this.path + "\" after document load");
			}
			var n = goog.getScriptNonce_();
			if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING && goog.isDocumentLoading_()) {
				var r = function(t) {
					t.readyState && t.readyState != "complete" ? t.onload = r : (goog.Dependency.unregisterCallback_(i), e.loaded());
				}, i = goog.Dependency.registerCallback_(r);
				n = n ? " nonce=\"" + n + "\"" : "";
				var o = "<script src=\"" + this.path + "\"" + n + (goog.Dependency.defer_ ? " defer" : "") + " id=\"script-" + i + "\"><\/script>";
				o += "<script" + n + ">", o = goog.Dependency.defer_ ? o + ("document.getElementById('script-" + i + "').onload = function() {\n  goog.Dependency.callback_('" + i + "', this);\n};\n") : o + ("goog.Dependency.callback_('" + i + "', document.getElementById('script-" + i + "'));"), o += "<\/script>", t.write(goog.TRUSTED_TYPES_POLICY_ ? goog.TRUSTED_TYPES_POLICY_.createHTML(o) : o);
			} else {
				var s = t.createElement("script");
				s.defer = goog.Dependency.defer_, s.async = !1, n && (s.nonce = n), s.onload = function() {
					s.onload = null, e.loaded();
				}, s.src = goog.TRUSTED_TYPES_POLICY_ ? goog.TRUSTED_TYPES_POLICY_.createScriptURL(this.path) : this.path, t.head.appendChild(s);
			}
		} else goog.logToConsole_("Cannot use default debug loader outside of HTML documents."), this.relativePath == "deps.js" ? (goog.logToConsole_("Consider setting CLOSURE_IMPORT_SCRIPT before loading base.js, or setting CLOSURE_NO_DEPS to true."), e.loaded()) : e.pause();
	}, goog.Es6ModuleDependency = function(e, t, n, r, i) {
		goog.Dependency.call(this, e, t, n, r, i);
	}, goog.inherits(goog.Es6ModuleDependency, goog.Dependency), goog.Es6ModuleDependency.prototype.load = function(e) {
		function t(e, t) {
			var n = "", i = goog.getScriptNonce_();
			i && (n = " nonce=\"" + i + "\""), e = t ? "<script type=\"module\" crossorigin" + n + ">" + t + "<\/script>" : "<script type=\"module\" crossorigin src=\"" + e + "\"" + n + "><\/script>", r.write(goog.TRUSTED_TYPES_POLICY_ ? goog.TRUSTED_TYPES_POLICY_.createHTML(e) : e);
		}
		function n(e, t) {
			var n = r.createElement("script");
			n.defer = !0, n.async = !1, n.type = "module", n.setAttribute("crossorigin", !0);
			var i = goog.getScriptNonce_();
			i && (n.nonce = i), t ? n.text = goog.TRUSTED_TYPES_POLICY_ ? goog.TRUSTED_TYPES_POLICY_.createScript(t) : t : n.src = goog.TRUSTED_TYPES_POLICY_ ? goog.TRUSTED_TYPES_POLICY_.createScriptURL(e) : e, r.head.appendChild(n);
		}
		if (goog.global.CLOSURE_IMPORT_SCRIPT) goog.global.CLOSURE_IMPORT_SCRIPT(this.path) ? e.loaded() : e.pause();
		else if (goog.inHtmlDocument_()) {
			var r = goog.global.document, i = this;
			if (goog.isDocumentLoading_()) {
				var o = t;
				goog.Dependency.defer_ = !0;
			} else o = n;
			var s = goog.Dependency.registerCallback_(function() {
				goog.Dependency.unregisterCallback_(s), e.setModuleState(goog.ModuleType.ES6);
			});
			o(void 0, "goog.Dependency.callback_(\"" + s + "\")"), o(this.path, void 0);
			var c = goog.Dependency.registerCallback_(function(t) {
				goog.Dependency.unregisterCallback_(c), e.registerEs6ModuleExports(i.path, t, goog.moduleLoaderState_.moduleName);
			});
			o(void 0, "import * as m from \"" + this.path + "\"; goog.Dependency.callback_(\"" + c + "\", m)");
			var l = goog.Dependency.registerCallback_(function() {
				goog.Dependency.unregisterCallback_(l), e.clearModuleState(), e.loaded();
			});
			o(void 0, "goog.Dependency.callback_(\"" + l + "\")");
		} else goog.logToConsole_("Cannot use default debug loader outside of HTML documents."), e.pause();
	}, goog.TransformedDependency = function(e, t, n, r, i) {
		goog.Dependency.call(this, e, t, n, r, i), this.contents_ = null, this.lazyFetch_ = !goog.inHtmlDocument_() || !("noModule" in goog.global.document.createElement("script"));
	}, goog.inherits(goog.TransformedDependency, goog.Dependency), goog.TransformedDependency.prototype.load = function(e) {
		function t() {
			i.contents_ = goog.loadFileSync_(i.path), i.contents_ && (i.contents_ = i.transform(i.contents_), i.contents_ && (i.contents_ += "\n//# sourceURL=" + i.path));
		}
		function n() {
			if (i.lazyFetch_ && t(), i.contents_) {
				o && e.setModuleState(goog.ModuleType.ES6);
				try {
					var n = i.contents_;
					if (i.contents_ = null, goog.globalEval(goog.CLOSURE_EVAL_PREFILTER_.createScript(n)), o) var r = goog.moduleLoaderState_.moduleName;
				} finally {
					o && e.clearModuleState();
				}
				o && goog.global.$jscomp.require.ensure([i.getPathName()], function() {
					e.registerEs6ModuleExports(i.path, goog.global.$jscomp.require(i.getPathName()), r);
				}), e.loaded();
			}
		}
		function r() {
			var e = goog.global.document, t = goog.Dependency.registerCallback_(function() {
				goog.Dependency.unregisterCallback_(t), n();
			}), r = goog.getScriptNonce_();
			r = "<script" + (r ? " nonce=\"" + r + "\"" : "") + ">" + goog.protectScriptTag_("goog.Dependency.callback_(\"" + t + "\");") + "<\/script>", e.write(goog.TRUSTED_TYPES_POLICY_ ? goog.TRUSTED_TYPES_POLICY_.createHTML(r) : r);
		}
		var i = this;
		if (goog.global.CLOSURE_IMPORT_SCRIPT) t(), this.contents_ && goog.global.CLOSURE_IMPORT_SCRIPT("", this.contents_) ? (this.contents_ = null, e.loaded()) : e.pause();
		else {
			var o = this.loadFlags.module == goog.ModuleType.ES6;
			this.lazyFetch_ || t();
			var s = 1 < e.pending().length;
			if (goog.Dependency.defer_ && (s || goog.isDocumentLoading_())) e.defer(function() {
				n();
			});
			else {
				var c = goog.global.document;
				if (s = goog.inHtmlDocument_() && ("ActiveXObject" in goog.global || goog.isEdge_()), o && goog.inHtmlDocument_() && goog.isDocumentLoading_() && !s) {
					goog.Dependency.defer_ = !0, e.pause();
					var l = c.onreadystatechange;
					c.onreadystatechange = function() {
						c.readyState == "interactive" && (c.onreadystatechange = l, n(), e.resume()), typeof l == "function" && l.apply(void 0, arguments);
					};
				} else goog.inHtmlDocument_() && goog.isDocumentLoading_() ? r() : n();
			}
		}
	}, goog.TransformedDependency.prototype.transform = function(e) {}, goog.PreTranspiledEs6ModuleDependency = function(e, t, n, r, i) {
		goog.TransformedDependency.call(this, e, t, n, r, i);
	}, goog.inherits(goog.PreTranspiledEs6ModuleDependency, goog.TransformedDependency), goog.PreTranspiledEs6ModuleDependency.prototype.transform = function(e) {
		return e;
	}, goog.GoogModuleDependency = function(e, t, n, r, i) {
		goog.TransformedDependency.call(this, e, t, n, r, i);
	}, goog.inherits(goog.GoogModuleDependency, goog.TransformedDependency), goog.GoogModuleDependency.prototype.transform = function(e) {
		return goog.LOAD_MODULE_USING_EVAL && goog.global.JSON !== void 0 ? "goog.loadModule(" + goog.global.JSON.stringify(e + "\n//# sourceURL=" + this.path + "\n") + ");" : "goog.loadModule(function(exports) {\"use strict\";" + e + "\n;return exports});\n//# sourceURL=" + this.path + "\n";
	}, goog.DebugLoader_.prototype.addDependency = function(e, t, n, r) {
		t ||= [], e = e.replace(/\\/g, "/");
		var i = goog.normalizePath_(goog.basePath + e);
		for (r && typeof r != "boolean" || (r = r ? { module: goog.ModuleType.GOOG } : {}), n = this.factory_.createDependency(i, e, t, n, r), this.dependencies_[i] = n, n = 0; n < t.length; n++) this.idToPath_[t[n]] = i;
		this.idToPath_[e] = i;
	}, goog.DependencyFactory = function() {}, goog.DependencyFactory.prototype.createDependency = function(e, t, n, r, i) {
		return i.module == goog.ModuleType.GOOG ? new goog.GoogModuleDependency(e, t, n, r, i) : i.module == goog.ModuleType.ES6 ? goog.ASSUME_ES_MODULES_TRANSPILED ? new goog.PreTranspiledEs6ModuleDependency(e, t, n, r, i) : new goog.Es6ModuleDependency(e, t, n, r, i) : new goog.Dependency(e, t, n, r, i);
	}, goog.debugLoader_ = new goog.DebugLoader_(), goog.loadClosureDeps = function() {
		goog.debugLoader_.loadClosureDeps();
	}, goog.setDependencyFactory = function(e) {
		goog.debugLoader_.setDependencyFactory(e);
	}, goog.TRUSTED_TYPES_POLICY_ = goog.TRUSTED_TYPES_POLICY_NAME ? goog.createTrustedTypesPolicy(goog.TRUSTED_TYPES_POLICY_NAME + "#base") : null, goog.global.CLOSURE_NO_DEPS || goog.debugLoader_.loadClosureDeps(), goog.bootstrap = function(e, t) {
		goog.debugLoader_.bootstrap(e, t);
	}), !COMPILED) {
		var isChrome87 = !1;
		try {
			isChrome87 = eval(goog.global.trustedTypes.emptyScript) !== goog.global.trustedTypes.emptyScript;
		} catch {}
		goog.CLOSURE_EVAL_PREFILTER_ = goog.global.trustedTypes && isChrome87 && goog.createTrustedTypesPolicy("goog#base#devonly#eval") || { createScript: goog.identity_ };
	}
	goog.object = {};
	function module$contents$goog$object_forEach(e, t, n) {
		for (let r in e) t.call(n, e[r], r, e);
	}
	function module$contents$goog$object_filter(e, t, n) {
		let r = {};
		for (let i in e) t.call(n, e[i], i, e) && (r[i] = e[i]);
		return r;
	}
	function module$contents$goog$object_map(e, t, n) {
		let r = {};
		for (let i in e) r[i] = t.call(n, e[i], i, e);
		return r;
	}
	function module$contents$goog$object_some(e, t, n) {
		for (let r in e) if (t.call(n, e[r], r, e)) return !0;
		return !1;
	}
	function module$contents$goog$object_every(e, t, n) {
		for (let r in e) if (!t.call(n, e[r], r, e)) return !1;
		return !0;
	}
	function module$contents$goog$object_getCount(e) {
		let t = 0;
		for (let n in e) t++;
		return t;
	}
	function module$contents$goog$object_getAnyKey(e) {
		for (let t in e) return t;
	}
	function module$contents$goog$object_getAnyValue(e) {
		for (let t in e) return e[t];
	}
	function module$contents$goog$object_contains(e, t) {
		return module$contents$goog$object_containsValue(e, t);
	}
	function module$contents$goog$object_getValues(e) {
		let t = [], n = 0;
		for (let r in e) t[n++] = e[r];
		return t;
	}
	function module$contents$goog$object_getKeys(e) {
		let t = [], n = 0;
		for (let r in e) t[n++] = r;
		return t;
	}
	function module$contents$goog$object_getValueByKeys(e, t) {
		var n = goog.isArrayLike(t);
		let r = n ? t : arguments;
		for (n = +!n; n < r.length; n++) {
			if (e == null) return;
			e = e[r[n]];
		}
		return e;
	}
	function module$contents$goog$object_containsKey(e, t) {
		return e !== null && t in e;
	}
	function module$contents$goog$object_containsValue(e, t) {
		for (let n in e) if (e[n] == t) return !0;
		return !1;
	}
	function module$contents$goog$object_findKey(e, t, n) {
		for (let r in e) if (t.call(n, e[r], r, e)) return r;
	}
	function module$contents$goog$object_findValue(e, t, n) {
		return (t = module$contents$goog$object_findKey(e, t, n)) && e[t];
	}
	function module$contents$goog$object_isEmpty(e) {
		for (let t in e) return !1;
		return !0;
	}
	function module$contents$goog$object_clear(e) {
		for (let t in e) delete e[t];
	}
	function module$contents$goog$object_remove(e, t) {
		let n;
		return (n = t in e) && delete e[t], n;
	}
	function module$contents$goog$object_add(e, t, n) {
		if (e !== null && t in e) throw Error(`The object already contains the key "${t}"`);
		module$contents$goog$object_set(e, t, n);
	}
	function module$contents$goog$object_get(e, t, n) {
		return e !== null && t in e ? e[t] : n;
	}
	function module$contents$goog$object_set(e, t, n) {
		e[t] = n;
	}
	function module$contents$goog$object_setIfUndefined(e, t, n) {
		return t in e ? e[t] : e[t] = n;
	}
	function module$contents$goog$object_setWithReturnValueIfNotSet(e, t, n) {
		return t in e ? e[t] : (n = n(), e[t] = n);
	}
	function module$contents$goog$object_equals(e, t) {
		for (let n in e) if (!(n in t) || e[n] !== t[n]) return !1;
		for (let n in t) if (!(n in e)) return !1;
		return !0;
	}
	function module$contents$goog$object_clone(e) {
		let t = {};
		for (let n in e) t[n] = e[n];
		return t;
	}
	function module$contents$goog$object_unsafeClone(e) {
		if (!e || typeof e != "object") return e;
		if (typeof e.clone == "function") return e.clone();
		if (typeof Map < "u" && e instanceof Map) return new Map(e);
		if (typeof Set < "u" && e instanceof Set) return new Set(e);
		if (e instanceof Date) return new Date(e.getTime());
		let t = Array.isArray(e) ? [] : typeof ArrayBuffer != "function" || typeof ArrayBuffer.isView != "function" || !ArrayBuffer.isView(e) || e instanceof DataView ? {} : new e.constructor(e.length);
		for (let n in e) t[n] = module$contents$goog$object_unsafeClone(e[n]);
		return t;
	}
	function module$contents$goog$object_transpose(e) {
		let t = {};
		for (let n in e) t[e[n]] = n;
		return t;
	}
	var module$contents$goog$object_PROTOTYPE_FIELDS = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
	function module$contents$goog$object_extend(e, t) {
		let n, r;
		for (let t = 1; t < arguments.length; t++) {
			for (n in r = arguments[t], r) e[n] = r[n];
			for (let t = 0; t < module$contents$goog$object_PROTOTYPE_FIELDS.length; t++) n = module$contents$goog$object_PROTOTYPE_FIELDS[t], Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
		}
	}
	function module$contents$goog$object_create(e) {
		let t = arguments.length;
		if (t == 1 && Array.isArray(arguments[0])) return module$contents$goog$object_create.apply(null, arguments[0]);
		if (t % 2) throw Error("Uneven number of arguments");
		let n = {};
		for (let e = 0; e < t; e += 2) n[arguments[e]] = arguments[e + 1];
		return n;
	}
	function module$contents$goog$object_createSet(e) {
		let t = arguments.length;
		if (t == 1 && Array.isArray(arguments[0])) return module$contents$goog$object_createSet.apply(null, arguments[0]);
		let n = {};
		for (let e = 0; e < t; e++) n[arguments[e]] = !0;
		return n;
	}
	function module$contents$goog$object_createImmutableView(e) {
		let t = e;
		return Object.isFrozen && !Object.isFrozen(e) && (t = Object.create(e), Object.freeze(t)), t;
	}
	function module$contents$goog$object_isImmutableView(e) {
		return !!Object.isFrozen && Object.isFrozen(e);
	}
	function module$contents$goog$object_getAllPropertyNames(e, t, n) {
		if (!e) return [];
		if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) return module$contents$goog$object_getKeys(e);
		let r = {};
		for (; e && (e !== Object.prototype || t) && (e !== Function.prototype || n);) {
			let t = Object.getOwnPropertyNames(e);
			for (let e = 0; e < t.length; e++) r[t[e]] = !0;
			e = Object.getPrototypeOf(e);
		}
		return module$contents$goog$object_getKeys(r);
	}
	function module$contents$goog$object_getSuperClass(e) {
		return (e = Object.getPrototypeOf(e.prototype)) && e.constructor;
	}
	goog.object.add = module$contents$goog$object_add, goog.object.clear = module$contents$goog$object_clear, goog.object.clone = module$contents$goog$object_clone, goog.object.contains = module$contents$goog$object_contains, goog.object.containsKey = module$contents$goog$object_containsKey, goog.object.containsValue = module$contents$goog$object_containsValue, goog.object.create = module$contents$goog$object_create, goog.object.createImmutableView = module$contents$goog$object_createImmutableView, goog.object.createSet = module$contents$goog$object_createSet, goog.object.equals = module$contents$goog$object_equals, goog.object.every = module$contents$goog$object_every, goog.object.extend = module$contents$goog$object_extend, goog.object.filter = module$contents$goog$object_filter, goog.object.findKey = module$contents$goog$object_findKey, goog.object.findValue = module$contents$goog$object_findValue, goog.object.forEach = module$contents$goog$object_forEach, goog.object.get = module$contents$goog$object_get, goog.object.getAllPropertyNames = module$contents$goog$object_getAllPropertyNames, goog.object.getAnyKey = module$contents$goog$object_getAnyKey, goog.object.getAnyValue = module$contents$goog$object_getAnyValue, goog.object.getCount = module$contents$goog$object_getCount, goog.object.getKeys = module$contents$goog$object_getKeys, goog.object.getSuperClass = module$contents$goog$object_getSuperClass, goog.object.getValueByKeys = module$contents$goog$object_getValueByKeys, goog.object.getValues = module$contents$goog$object_getValues, goog.object.isEmpty = module$contents$goog$object_isEmpty, goog.object.isImmutableView = module$contents$goog$object_isImmutableView, goog.object.map = module$contents$goog$object_map, goog.object.remove = module$contents$goog$object_remove, goog.object.set = module$contents$goog$object_set, goog.object.setIfUndefined = module$contents$goog$object_setIfUndefined, goog.object.setWithReturnValueIfNotSet = module$contents$goog$object_setWithReturnValueIfNotSet, goog.object.some = module$contents$goog$object_some, goog.object.transpose = module$contents$goog$object_transpose, goog.object.unsafeClone = module$contents$goog$object_unsafeClone, goog.debug = {};
	function module$contents$goog$debug$Error_DebugError(e, t) {
		if (Error.captureStackTrace) Error.captureStackTrace(this, module$contents$goog$debug$Error_DebugError);
		else {
			let e = Error().stack;
			e && (this.stack = e);
		}
		e && (this.message = String(e)), t !== void 0 && (this.cause = t), this.reportErrorToServer = !0;
	}
	goog.inherits(module$contents$goog$debug$Error_DebugError, Error), module$contents$goog$debug$Error_DebugError.prototype.name = "CustomError", goog.debug.Error = module$contents$goog$debug$Error_DebugError, goog.dom = {}, goog.dom.NodeType = {
		ELEMENT: 1,
		ATTRIBUTE: 2,
		TEXT: 3,
		CDATA_SECTION: 4,
		ENTITY_REFERENCE: 5,
		ENTITY: 6,
		PROCESSING_INSTRUCTION: 7,
		COMMENT: 8,
		DOCUMENT: 9,
		DOCUMENT_TYPE: 10,
		DOCUMENT_FRAGMENT: 11,
		NOTATION: 12
	}, goog.asserts = {}, goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
	function module$contents$goog$asserts_AssertionError(e, t) {
		module$contents$goog$debug$Error_DebugError.call(this, module$contents$goog$asserts_subs(e, t)), this.messagePattern = e;
	}
	goog.inherits(module$contents$goog$asserts_AssertionError, module$contents$goog$debug$Error_DebugError), goog.asserts.AssertionError = module$contents$goog$asserts_AssertionError, module$contents$goog$asserts_AssertionError.prototype.name = "AssertionError", goog.asserts.DEFAULT_ERROR_HANDLER = function(e) {
		throw e;
	};
	var module$contents$goog$asserts_errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;
	function module$contents$goog$asserts_subs(e, t) {
		e = e.split("%s");
		let n = "", r = e.length - 1;
		for (let i = 0; i < r; i++) n += e[i] + (i < t.length ? t[i] : "%s");
		return n + e[r];
	}
	function module$contents$goog$asserts_doAssertFailure(e, t, n, r) {
		let i = "Assertion failed", o;
		n ? (i += ": " + n, o = r) : e && (i += ": " + e, o = t), e = new module$contents$goog$asserts_AssertionError("" + i, o || []), module$contents$goog$asserts_errorHandler_(e);
	}
	goog.asserts.setErrorHandler = function(e) {
		goog.asserts.ENABLE_ASSERTS && (module$contents$goog$asserts_errorHandler_ = e);
	}, goog.asserts.assert = function(e, t, n) {
		return goog.asserts.ENABLE_ASSERTS && !e && module$contents$goog$asserts_doAssertFailure("", null, t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.assertExists = function(e, t, n) {
		return goog.asserts.ENABLE_ASSERTS && e == null && module$contents$goog$asserts_doAssertFailure("Expected to exist: %s.", [e], t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.fail = function(e, t) {
		goog.asserts.ENABLE_ASSERTS && module$contents$goog$asserts_errorHandler_(new module$contents$goog$asserts_AssertionError("Failure" + (e ? ": " + e : ""), Array.prototype.slice.call(arguments, 1)));
	}, goog.asserts.assertNumber = function(e, t, n) {
		return goog.asserts.ENABLE_ASSERTS && typeof e != "number" && module$contents$goog$asserts_doAssertFailure("Expected number but got %s: %s.", [goog.typeOf(e), e], t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.assertString = function(e, t, n) {
		return goog.asserts.ENABLE_ASSERTS && typeof e != "string" && module$contents$goog$asserts_doAssertFailure("Expected string but got %s: %s.", [goog.typeOf(e), e], t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.assertFunction = function(e, t, n) {
		return goog.asserts.ENABLE_ASSERTS && typeof e != "function" && module$contents$goog$asserts_doAssertFailure("Expected function but got %s: %s.", [goog.typeOf(e), e], t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.assertObject = function(e, t, n) {
		return goog.asserts.ENABLE_ASSERTS && !goog.isObject(e) && module$contents$goog$asserts_doAssertFailure("Expected object but got %s: %s.", [goog.typeOf(e), e], t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.assertArray = function(e, t, n) {
		return goog.asserts.ENABLE_ASSERTS && !Array.isArray(e) && module$contents$goog$asserts_doAssertFailure("Expected array but got %s: %s.", [goog.typeOf(e), e], t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.assertBoolean = function(e, t, n) {
		return goog.asserts.ENABLE_ASSERTS && typeof e != "boolean" && module$contents$goog$asserts_doAssertFailure("Expected boolean but got %s: %s.", [goog.typeOf(e), e], t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.assertElement = function(e, t, n) {
		return !goog.asserts.ENABLE_ASSERTS || goog.isObject(e) && e.nodeType == goog.dom.NodeType.ELEMENT || module$contents$goog$asserts_doAssertFailure("Expected Element but got %s: %s.", [goog.typeOf(e), e], t, Array.prototype.slice.call(arguments, 2)), e;
	}, goog.asserts.assertInstanceof = function(e, t, n, r) {
		return !goog.asserts.ENABLE_ASSERTS || e instanceof t || module$contents$goog$asserts_doAssertFailure("Expected instanceof %s but got %s.", [module$contents$goog$asserts_getType(t), module$contents$goog$asserts_getType(e)], n, Array.prototype.slice.call(arguments, 3)), e;
	}, goog.asserts.assertFinite = function(e, t, n) {
		return !goog.asserts.ENABLE_ASSERTS || typeof e == "number" && isFinite(e) || module$contents$goog$asserts_doAssertFailure("Expected %s to be a finite number but it is not.", [e], t, Array.prototype.slice.call(arguments, 2)), e;
	};
	function module$contents$goog$asserts_getType(e) {
		return e instanceof Function ? e.displayName || e.name || "unknown type name" : e instanceof Object ? e.constructor.displayName || e.constructor.name || Object.prototype.toString.call(e) : e === null ? "null" : typeof e;
	}
	goog.array = {}, goog.NATIVE_ARRAY_PROTOTYPES = goog.TRUSTED_SITE;
	var module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS = 2012 < goog.FEATURESET_YEAR;
	goog.array.ASSUME_NATIVE_FUNCTIONS = module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS;
	function module$contents$goog$array_peek(e) {
		return e[e.length - 1];
	}
	goog.array.peek = module$contents$goog$array_peek, goog.array.last = module$contents$goog$array_peek;
	var module$contents$goog$array_indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.indexOf) ? function(e, t, n) {
		return goog.asserts.assert(e.length != null), Array.prototype.indexOf.call(e, t, n);
	} : function(e, t, n) {
		if (n = n == null ? 0 : 0 > n ? Math.max(0, e.length + n) : n, typeof e == "string") return typeof t != "string" || t.length != 1 ? -1 : e.indexOf(t, n);
		for (; n < e.length; n++) if (n in e && e[n] === t) return n;
		return -1;
	};
	goog.array.indexOf = module$contents$goog$array_indexOf;
	var module$contents$goog$array_lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.lastIndexOf) ? function(e, t, n) {
		return goog.asserts.assert(e.length != null), Array.prototype.lastIndexOf.call(e, t, n ?? e.length - 1);
	} : function(e, t, n) {
		if (n ??= e.length - 1, 0 > n && (n = Math.max(0, e.length + n)), typeof e == "string") return typeof t != "string" || t.length != 1 ? -1 : e.lastIndexOf(t, n);
		for (; 0 <= n; n--) if (n in e && e[n] === t) return n;
		return -1;
	};
	goog.array.lastIndexOf = module$contents$goog$array_lastIndexOf;
	var module$contents$goog$array_forEach = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.forEach) ? function(e, t, n) {
		goog.asserts.assert(e.length != null), Array.prototype.forEach.call(e, t, n);
	} : function(e, t, n) {
		let r = e.length, i = typeof e == "string" ? e.split("") : e;
		for (let o = 0; o < r; o++) o in i && t.call(n, i[o], o, e);
	};
	goog.array.forEach = module$contents$goog$array_forEach;
	function module$contents$goog$array_forEachRight(e, t, n) {
		var r = e.length;
		let i = typeof e == "string" ? e.split("") : e;
		for (--r; 0 <= r; --r) r in i && t.call(n, i[r], r, e);
	}
	goog.array.forEachRight = module$contents$goog$array_forEachRight;
	var module$contents$goog$array_filter = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.filter) ? function(e, t, n) {
		return goog.asserts.assert(e.length != null), Array.prototype.filter.call(e, t, n);
	} : function(e, t, n) {
		let r = e.length, i = [], o = 0, s = typeof e == "string" ? e.split("") : e;
		for (let c = 0; c < r; c++) if (c in s) {
			let r = s[c];
			t.call(n, r, c, e) && (i[o++] = r);
		}
		return i;
	};
	goog.array.filter = module$contents$goog$array_filter;
	var module$contents$goog$array_map = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.map) ? function(e, t, n) {
		return goog.asserts.assert(e.length != null), Array.prototype.map.call(e, t, n);
	} : function(e, t, n) {
		let r = e.length, i = Array(r), o = typeof e == "string" ? e.split("") : e;
		for (let s = 0; s < r; s++) s in o && (i[s] = t.call(n, o[s], s, e));
		return i;
	};
	goog.array.map = module$contents$goog$array_map;
	var module$contents$goog$array_reduce = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduce) ? function(e, t, n, r) {
		return goog.asserts.assert(e.length != null), r && (t = goog.bind(t, r)), Array.prototype.reduce.call(e, t, n);
	} : function(e, t, n, r) {
		let i = n;
		return module$contents$goog$array_forEach(e, function(n, o) {
			i = t.call(r, i, n, o, e);
		}), i;
	};
	goog.array.reduce = module$contents$goog$array_reduce;
	var module$contents$goog$array_reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduceRight) ? function(e, t, n, r) {
		return goog.asserts.assert(e.length != null), goog.asserts.assert(t != null), r && (t = goog.bind(t, r)), Array.prototype.reduceRight.call(e, t, n);
	} : function(e, t, n, r) {
		let i = n;
		return module$contents$goog$array_forEachRight(e, function(n, o) {
			i = t.call(r, i, n, o, e);
		}), i;
	};
	goog.array.reduceRight = module$contents$goog$array_reduceRight;
	var module$contents$goog$array_some = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.some) ? function(e, t, n) {
		return goog.asserts.assert(e.length != null), Array.prototype.some.call(e, t, n);
	} : function(e, t, n) {
		let r = e.length, i = typeof e == "string" ? e.split("") : e;
		for (let o = 0; o < r; o++) if (o in i && t.call(n, i[o], o, e)) return !0;
		return !1;
	};
	goog.array.some = module$contents$goog$array_some;
	var module$contents$goog$array_every = goog.NATIVE_ARRAY_PROTOTYPES && (module$contents$goog$array_ASSUME_NATIVE_FUNCTIONS || Array.prototype.every) ? function(e, t, n) {
		return goog.asserts.assert(e.length != null), Array.prototype.every.call(e, t, n);
	} : function(e, t, n) {
		let r = e.length, i = typeof e == "string" ? e.split("") : e;
		for (let o = 0; o < r; o++) if (o in i && !t.call(n, i[o], o, e)) return !1;
		return !0;
	};
	goog.array.every = module$contents$goog$array_every;
	function module$contents$goog$array_count(e, t, n) {
		let r = 0;
		return module$contents$goog$array_forEach(e, function(e, i, o) {
			t.call(n, e, i, o) && ++r;
		}, n), r;
	}
	goog.array.count = module$contents$goog$array_count;
	function module$contents$goog$array_find(e, t, n) {
		return t = module$contents$goog$array_findIndex(e, t, n), 0 > t ? null : typeof e == "string" ? e.charAt(t) : e[t];
	}
	goog.array.find = module$contents$goog$array_find;
	function module$contents$goog$array_findIndex(e, t, n) {
		let r = e.length, i = typeof e == "string" ? e.split("") : e;
		for (let o = 0; o < r; o++) if (o in i && t.call(n, i[o], o, e)) return o;
		return -1;
	}
	goog.array.findIndex = module$contents$goog$array_findIndex;
	function module$contents$goog$array_findRight(e, t, n) {
		return t = module$contents$goog$array_findIndexRight(e, t, n), 0 > t ? null : typeof e == "string" ? e.charAt(t) : e[t];
	}
	goog.array.findRight = module$contents$goog$array_findRight;
	function module$contents$goog$array_findIndexRight(e, t, n) {
		var r = e.length;
		let i = typeof e == "string" ? e.split("") : e;
		for (--r; 0 <= r; r--) if (r in i && t.call(n, i[r], r, e)) return r;
		return -1;
	}
	goog.array.findIndexRight = module$contents$goog$array_findIndexRight;
	function module$contents$goog$array_contains(e, t) {
		return 0 <= module$contents$goog$array_indexOf(e, t);
	}
	goog.array.contains = module$contents$goog$array_contains;
	function module$contents$goog$array_isEmpty(e) {
		return e.length == 0;
	}
	goog.array.isEmpty = module$contents$goog$array_isEmpty;
	function module$contents$goog$array_clear(e) {
		if (!Array.isArray(e)) for (let t = e.length - 1; 0 <= t; t--) delete e[t];
		e.length = 0;
	}
	goog.array.clear = module$contents$goog$array_clear;
	function module$contents$goog$array_insert(e, t) {
		module$contents$goog$array_contains(e, t) || e.push(t);
	}
	goog.array.insert = module$contents$goog$array_insert;
	function module$contents$goog$array_insertAt(e, t, n) {
		module$contents$goog$array_splice(e, n, 0, t);
	}
	goog.array.insertAt = module$contents$goog$array_insertAt;
	function module$contents$goog$array_insertArrayAt(e, t, n) {
		goog.partial(module$contents$goog$array_splice, e, n, 0).apply(null, t);
	}
	goog.array.insertArrayAt = module$contents$goog$array_insertArrayAt;
	function module$contents$goog$array_insertBefore(e, t, n) {
		let r;
		arguments.length == 2 || 0 > (r = module$contents$goog$array_indexOf(e, n)) ? e.push(t) : module$contents$goog$array_insertAt(e, t, r);
	}
	goog.array.insertBefore = module$contents$goog$array_insertBefore;
	function module$contents$goog$array_remove(e, t) {
		t = module$contents$goog$array_indexOf(e, t);
		let n;
		return (n = 0 <= t) && module$contents$goog$array_removeAt(e, t), n;
	}
	goog.array.remove = module$contents$goog$array_remove;
	function module$contents$goog$array_removeLast(e, t) {
		return t = module$contents$goog$array_lastIndexOf(e, t), 0 <= t && (module$contents$goog$array_removeAt(e, t), !0);
	}
	goog.array.removeLast = module$contents$goog$array_removeLast;
	function module$contents$goog$array_removeAt(e, t) {
		return goog.asserts.assert(e.length != null), Array.prototype.splice.call(e, t, 1).length == 1;
	}
	goog.array.removeAt = module$contents$goog$array_removeAt;
	function module$contents$goog$array_removeIf(e, t, n) {
		return t = module$contents$goog$array_findIndex(e, t, n), 0 <= t && (module$contents$goog$array_removeAt(e, t), !0);
	}
	goog.array.removeIf = module$contents$goog$array_removeIf;
	function module$contents$goog$array_removeAllIf(e, t, n) {
		let r = 0;
		return module$contents$goog$array_forEachRight(e, function(i, o) {
			t.call(n, i, o, e) && module$contents$goog$array_removeAt(e, o) && r++;
		}), r;
	}
	goog.array.removeAllIf = module$contents$goog$array_removeAllIf;
	function module$contents$goog$array_concat(e) {
		return Array.prototype.concat.apply([], arguments);
	}
	goog.array.concat = module$contents$goog$array_concat;
	function module$contents$goog$array_join(e) {
		return Array.prototype.concat.apply([], arguments);
	}
	goog.array.join = module$contents$goog$array_join;
	function module$contents$goog$array_toArray(e) {
		let t = e.length;
		if (0 < t) {
			let n = Array(t);
			for (let r = 0; r < t; r++) n[r] = e[r];
			return n;
		}
		return [];
	}
	var module$contents$goog$array_clone = goog.array.toArray = module$contents$goog$array_toArray;
	goog.array.clone = module$contents$goog$array_toArray;
	function module$contents$goog$array_extend(e, t) {
		for (let t = 1; t < arguments.length; t++) {
			let n = arguments[t];
			if (goog.isArrayLike(n)) {
				let t = e.length || 0, r = n.length || 0;
				e.length = t + r;
				for (let i = 0; i < r; i++) e[t + i] = n[i];
			} else e.push(n);
		}
	}
	goog.array.extend = module$contents$goog$array_extend;
	function module$contents$goog$array_splice(e, t, n, r) {
		return goog.asserts.assert(e.length != null), Array.prototype.splice.apply(e, module$contents$goog$array_slice(arguments, 1));
	}
	goog.array.splice = module$contents$goog$array_splice;
	function module$contents$goog$array_slice(e, t, n) {
		return goog.asserts.assert(e.length != null), 2 >= arguments.length ? Array.prototype.slice.call(e, t) : Array.prototype.slice.call(e, t, n);
	}
	goog.array.slice = module$contents$goog$array_slice;
	function module$contents$goog$array_removeDuplicates(e, t, n) {
		t ||= e;
		var r = function(e) {
			return goog.isObject(e) ? "o" + goog.getUid(e) : (typeof e).charAt(0) + e;
		};
		n ||= r;
		let i = r = 0, o = {};
		for (; i < e.length;) {
			let s = e[i++], c = n(s);
			Object.prototype.hasOwnProperty.call(o, c) || (o[c] = !0, t[r++] = s);
		}
		t.length = r;
	}
	goog.array.removeDuplicates = module$contents$goog$array_removeDuplicates;
	function module$contents$goog$array_binarySearch(e, t, n) {
		return module$contents$goog$array_binarySearch_(e, n || module$contents$goog$array_defaultCompare, !1, t);
	}
	goog.array.binarySearch = module$contents$goog$array_binarySearch;
	function module$contents$goog$array_binarySelect(e, t, n) {
		return module$contents$goog$array_binarySearch_(e, t, !0, void 0, n);
	}
	goog.array.binarySelect = module$contents$goog$array_binarySelect;
	function module$contents$goog$array_binarySearch_(e, t, n, r, i) {
		let o = 0, s = e.length, c;
		for (; o < s;) {
			let l = o + (s - o >>> 1), u;
			u = n ? t.call(i, e[l], l, e) : t(r, e[l]), 0 < u ? o = l + 1 : (s = l, c = !u);
		}
		return c ? o : -o - 1;
	}
	function module$contents$goog$array_sort(e, t) {
		e.sort(t || module$contents$goog$array_defaultCompare);
	}
	goog.array.sort = module$contents$goog$array_sort;
	function module$contents$goog$array_stableSort(e, t) {
		let n = Array(e.length);
		for (let t = 0; t < e.length; t++) n[t] = {
			index: t,
			value: e[t]
		};
		let r = t || module$contents$goog$array_defaultCompare;
		for (module$contents$goog$array_sort(n, function(e, t) {
			return r(e.value, t.value) || e.index - t.index;
		}), t = 0; t < e.length; t++) e[t] = n[t].value;
	}
	goog.array.stableSort = module$contents$goog$array_stableSort;
	function module$contents$goog$array_sortByKey(e, t, n) {
		let r = n || module$contents$goog$array_defaultCompare;
		module$contents$goog$array_sort(e, function(e, n) {
			return r(t(e), t(n));
		});
	}
	goog.array.sortByKey = module$contents$goog$array_sortByKey;
	function module$contents$goog$array_sortObjectsByKey(e, t, n) {
		module$contents$goog$array_sortByKey(e, function(e) {
			return e[t];
		}, n);
	}
	goog.array.sortObjectsByKey = module$contents$goog$array_sortObjectsByKey;
	function module$contents$goog$array_isSorted(e, t, n) {
		t ||= module$contents$goog$array_defaultCompare;
		for (let r = 1; r < e.length; r++) {
			let i = t(e[r - 1], e[r]);
			if (0 < i || i == 0 && n) return !1;
		}
		return !0;
	}
	goog.array.isSorted = module$contents$goog$array_isSorted;
	function module$contents$goog$array_equals(e, t, n) {
		if (!goog.isArrayLike(e) || !goog.isArrayLike(t) || e.length != t.length) return !1;
		let r = e.length;
		n ||= module$contents$goog$array_defaultCompareEquality;
		for (let i = 0; i < r; i++) if (!n(e[i], t[i])) return !1;
		return !0;
	}
	goog.array.equals = module$contents$goog$array_equals;
	function module$contents$goog$array_compare3(e, t, n) {
		n ||= module$contents$goog$array_defaultCompare;
		let r = Math.min(e.length, t.length);
		for (let i = 0; i < r; i++) {
			let r = n(e[i], t[i]);
			if (r != 0) return r;
		}
		return module$contents$goog$array_defaultCompare(e.length, t.length);
	}
	goog.array.compare3 = module$contents$goog$array_compare3;
	function module$contents$goog$array_defaultCompare(e, t) {
		return e > t ? 1 : e < t ? -1 : 0;
	}
	goog.array.defaultCompare = module$contents$goog$array_defaultCompare;
	function module$contents$goog$array_inverseDefaultCompare(e, t) {
		return -module$contents$goog$array_defaultCompare(e, t);
	}
	goog.array.inverseDefaultCompare = module$contents$goog$array_inverseDefaultCompare;
	function module$contents$goog$array_defaultCompareEquality(e, t) {
		return e === t;
	}
	goog.array.defaultCompareEquality = module$contents$goog$array_defaultCompareEquality;
	function module$contents$goog$array_binaryInsert(e, t, n) {
		return n = module$contents$goog$array_binarySearch(e, t, n), 0 > n && (module$contents$goog$array_insertAt(e, t, -(n + 1)), !0);
	}
	goog.array.binaryInsert = module$contents$goog$array_binaryInsert;
	function module$contents$goog$array_binaryRemove(e, t, n) {
		return t = module$contents$goog$array_binarySearch(e, t, n), 0 <= t && module$contents$goog$array_removeAt(e, t);
	}
	goog.array.binaryRemove = module$contents$goog$array_binaryRemove;
	function module$contents$goog$array_bucket(e, t, n) {
		let r = {};
		for (let i = 0; i < e.length; i++) {
			let o = e[i], s = t.call(n, o, i, e);
			s !== void 0 && (r[s] || (r[s] = [])).push(o);
		}
		return r;
	}
	goog.array.bucket = module$contents$goog$array_bucket;
	function module$contents$goog$array_bucketToMap(e, t) {
		let n = /* @__PURE__ */ new Map();
		for (let r = 0; r < e.length; r++) {
			let i = e[r], o = t(i, r, e);
			if (o !== void 0) {
				let e = n.get(o);
				e || (e = [], n.set(o, e)), e.push(i);
			}
		}
		return n;
	}
	goog.array.bucketToMap = module$contents$goog$array_bucketToMap;
	function module$contents$goog$array_toObject(e, t, n) {
		let r = {};
		return module$contents$goog$array_forEach(e, function(i, o) {
			r[t.call(n, i, o, e)] = i;
		}), r;
	}
	goog.array.toObject = module$contents$goog$array_toObject;
	function module$contents$goog$array_toMap(e, t) {
		let n = /* @__PURE__ */ new Map();
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			n.set(t(i, r, e), i);
		}
		return n;
	}
	goog.array.toMap = module$contents$goog$array_toMap;
	function module$contents$goog$array_range(e, t, n) {
		let r = [], i = 0, o = e;
		if (n ||= 1, t !== void 0 && (i = e, o = t), 0 > n * (o - i)) return [];
		if (0 < n) for (e = i; e < o; e += n) r.push(e);
		else for (e = i; e > o; e += n) r.push(e);
		return r;
	}
	goog.array.range = module$contents$goog$array_range;
	function module$contents$goog$array_repeat(e, t) {
		let n = [];
		for (let r = 0; r < t; r++) n[r] = e;
		return n;
	}
	goog.array.repeat = module$contents$goog$array_repeat;
	function module$contents$goog$array_flatten(e) {
		let t = [];
		for (let e = 0; e < arguments.length; e++) {
			let r = arguments[e];
			if (Array.isArray(r)) for (let e = 0; e < r.length; e += 8192) {
				var n = module$contents$goog$array_slice(r, e, e + 8192);
				n = module$contents$goog$array_flatten.apply(null, n);
				for (let e = 0; e < n.length; e++) t.push(n[e]);
			}
			else t.push(r);
		}
		return t;
	}
	goog.array.flatten = module$contents$goog$array_flatten;
	function module$contents$goog$array_rotate(e, t) {
		return goog.asserts.assert(e.length != null), e.length && (t %= e.length, 0 < t ? Array.prototype.unshift.apply(e, e.splice(-t, t)) : 0 > t && Array.prototype.push.apply(e, e.splice(0, -t))), e;
	}
	goog.array.rotate = module$contents$goog$array_rotate;
	function module$contents$goog$array_moveItem(e, t, n) {
		goog.asserts.assert(0 <= t && t < e.length), goog.asserts.assert(0 <= n && n < e.length), t = Array.prototype.splice.call(e, t, 1), Array.prototype.splice.call(e, n, 0, t[0]);
	}
	goog.array.moveItem = module$contents$goog$array_moveItem;
	function module$contents$goog$array_zip(e) {
		if (!arguments.length) return [];
		let t = [], n = arguments[0].length;
		for (var r = 1; r < arguments.length; r++) arguments[r].length < n && (n = arguments[r].length);
		for (r = 0; r < n; r++) {
			let e = [];
			for (let t = 0; t < arguments.length; t++) e.push(arguments[t][r]);
			t.push(e);
		}
		return t;
	}
	goog.array.zip = module$contents$goog$array_zip;
	function module$contents$goog$array_shuffle(e, t) {
		t ||= Math.random;
		for (let n = e.length - 1; 0 < n; n--) {
			let r = Math.floor(t() * (n + 1)), i = e[n];
			e[n] = e[r], e[r] = i;
		}
	}
	goog.array.shuffle = module$contents$goog$array_shuffle;
	function module$contents$goog$array_copyByIndex(e, t) {
		let n = [];
		return module$contents$goog$array_forEach(t, function(t) {
			n.push(e[t]);
		}), n;
	}
	goog.array.copyByIndex = module$contents$goog$array_copyByIndex;
	function module$contents$goog$array_concatMap(e, t, n) {
		return module$contents$goog$array_concat.apply([], module$contents$goog$array_map(e, t, n));
	}
	goog.array.concatMap = module$contents$goog$array_concatMap;
	var jspb = { asserts: {} };
	function module$contents$jspb$asserts_doAssertFailure(e, t, n, r) {
		let i = "Assertion failed", o;
		throw n ? (i += ": " + n, o = r) : e && (i += ": " + e, o = t), Error("" + i, o || []);
	}
	function module$contents$jspb$asserts_assert(e, t, ...n) {
		return e || module$contents$jspb$asserts_doAssertFailure("", null, t, n), e;
	}
	function module$contents$jspb$asserts_assertString(e, t, ...n) {
		return typeof e != "string" && module$contents$jspb$asserts_doAssertFailure("Expected string but got %s: %s.", [goog.typeOf(e), e], t, n), e;
	}
	function module$contents$jspb$asserts_assertArray(e, t, ...n) {
		return Array.isArray(e) || module$contents$jspb$asserts_doAssertFailure("Expected array but got %s: %s.", [goog.typeOf(e), e], t, n), e;
	}
	function module$contents$jspb$asserts_fail(e, ...t) {
		throw Error("Failure" + (e ? ": " + e : ""), t);
	}
	function module$contents$jspb$asserts_assertInstanceof(e, t, n, ...r) {
		return e instanceof t || module$contents$jspb$asserts_doAssertFailure("Expected instanceof %s but got %s.", [module$contents$jspb$asserts_getType(t), module$contents$jspb$asserts_getType(e)], n, r), e;
	}
	function module$contents$jspb$asserts_getType(e) {
		return e instanceof Function ? e.displayName || e.name || "unknown type name" : e instanceof Object ? e.constructor.displayName || e.constructor.name || Object.prototype.toString.call(e) : e === null ? "null" : typeof e;
	}
	jspb.asserts.doAssertFailure = module$contents$jspb$asserts_doAssertFailure, jspb.asserts.assert = module$contents$jspb$asserts_assert, jspb.asserts.assertString = module$contents$jspb$asserts_assertString, jspb.asserts.assertArray = module$contents$jspb$asserts_assertArray, jspb.asserts.fail = module$contents$jspb$asserts_fail, jspb.asserts.assertInstanceof = module$contents$jspb$asserts_assertInstanceof, jspb.asserts.getType = module$contents$jspb$asserts_getType;
	var module$contents$jspb$Map_Map = function(e, t) {
		this.arr_ = e, this.valueCtor_ = t, this.map_ = {}, this.arrClean = !0, 0 < this.arr_.length && this.loadFromArray_();
	}, module$contents$jspb$Map_Entry_ = function(e, t) {
		this.key = e, this.value = t, this.valueWrapper = void 0;
	};
	module$contents$jspb$Map_Map.prototype.loadFromArray_ = function() {
		for (var e = 0; e < this.arr_.length; e++) {
			var t = this.arr_[e], n = t[0];
			this.map_[n.toString()] = new module$contents$jspb$Map_Entry_(n, t[1]);
		}
		this.arrClean = !0;
	}, module$contents$jspb$Map_Map.prototype.toArray = function() {
		if (this.arrClean) {
			if (this.valueCtor_) {
				var e = this.map_, t;
				for (t in e) if (Object.prototype.hasOwnProperty.call(e, t)) {
					var n = e[t].valueWrapper;
					n && n.toArray();
				}
			}
		} else {
			for (this.arr_.length = 0, e = this.stringKeys_(), e.sort(), t = 0; t < e.length; t++) {
				var r = this.map_[e[t]];
				(n = r.valueWrapper) && n.toArray(), this.arr_.push([r.key, r.value]);
			}
			this.arrClean = !0;
		}
		return this.arr_;
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "toArray", module$contents$jspb$Map_Map.prototype.toArray), module$contents$jspb$Map_Map.prototype.toObject = function(e, t) {
		for (var n = this.toArray(), r = [], i = 0; i < n.length; i++) {
			var o = this.map_[n[i][0].toString()];
			this.wrapEntry_(o);
			var s = o.valueWrapper;
			s ? (module$contents$jspb$asserts_assert(t), r.push([o.key, t(e, s)])) : r.push([o.key, o.value]);
		}
		return r;
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "toObject", module$contents$jspb$Map_Map.prototype.toObject), module$contents$jspb$Map_Map.fromObject = function(e, t, n) {
		t = new module$contents$jspb$Map_Map([], t);
		for (var r = 0; r < e.length; r++) {
			var i = e[r][0], o = n(e[r][1]);
			t.set(i, o);
		}
		return t;
	}, goog.exportSymbol("module$contents$jspb$Map_Map.fromObject", module$contents$jspb$Map_Map.fromObject);
	var module$contents$jspb$Map_ArrayIteratorIterable_ = function(e) {
		this.idx_ = 0, this.arr_ = e;
	};
	module$contents$jspb$Map_ArrayIteratorIterable_.prototype.next = function() {
		return this.idx_ < this.arr_.length ? {
			done: !1,
			value: this.arr_[this.idx_++]
		} : {
			done: !0,
			value: void 0
		};
	}, typeof Symbol < "u" && (module$contents$jspb$Map_ArrayIteratorIterable_.prototype[Symbol.iterator] = function() {
		return this;
	}), module$contents$jspb$Map_Map.prototype.getLength = function() {
		return this.stringKeys_().length;
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "getLength", module$contents$jspb$Map_Map.prototype.getLength), module$contents$jspb$Map_Map.prototype.clear = function() {
		this.map_ = {}, this.arrClean = !1;
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "clear", module$contents$jspb$Map_Map.prototype.clear), module$contents$jspb$Map_Map.prototype.del = function(e) {
		e = e.toString();
		var t = this.map_.hasOwnProperty(e);
		return delete this.map_[e], this.arrClean = !1, t;
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "del", module$contents$jspb$Map_Map.prototype.del), module$contents$jspb$Map_Map.prototype.getEntryList = function() {
		var e = [], t = this.stringKeys_();
		t.sort();
		for (var n = 0; n < t.length; n++) {
			var r = this.map_[t[n]];
			e.push([r.key, r.value]);
		}
		return e;
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "getEntryList", module$contents$jspb$Map_Map.prototype.getEntryList), module$contents$jspb$Map_Map.prototype.entries = function() {
		var e = [], t = this.stringKeys_();
		t.sort();
		for (var n = 0; n < t.length; n++) {
			var r = this.map_[t[n]];
			e.push([r.key, this.wrapEntry_(r)]);
		}
		return new module$contents$jspb$Map_ArrayIteratorIterable_(e);
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "entries", module$contents$jspb$Map_Map.prototype.entries), module$contents$jspb$Map_Map.prototype.keys = function() {
		var e = [], t = this.stringKeys_();
		t.sort();
		for (var n = 0; n < t.length; n++) e.push(this.map_[t[n]].key);
		return new module$contents$jspb$Map_ArrayIteratorIterable_(e);
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "keys", module$contents$jspb$Map_Map.prototype.keys), module$contents$jspb$Map_Map.prototype.values = function() {
		var e = [], t = this.stringKeys_();
		t.sort();
		for (var n = 0; n < t.length; n++) e.push(this.wrapEntry_(this.map_[t[n]]));
		return new module$contents$jspb$Map_ArrayIteratorIterable_(e);
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "values", module$contents$jspb$Map_Map.prototype.values), module$contents$jspb$Map_Map.prototype.forEach = function(e, t) {
		var n = this.stringKeys_();
		n.sort();
		for (var r = 0; r < n.length; r++) {
			var i = this.map_[n[r]];
			e.call(t, this.wrapEntry_(i), i.key, this);
		}
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "forEach", module$contents$jspb$Map_Map.prototype.forEach), module$contents$jspb$Map_Map.prototype.set = function(e, t) {
		var n = new module$contents$jspb$Map_Entry_(e);
		return this.valueCtor_ ? (n.valueWrapper = t, n.value = t.toArray()) : n.value = t, this.map_[e.toString()] = n, this.arrClean = !1, this;
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "set", module$contents$jspb$Map_Map.prototype.set), module$contents$jspb$Map_Map.prototype.wrapEntry_ = function(e) {
		return this.valueCtor_ ? (e.valueWrapper ||= new this.valueCtor_(e.value), e.valueWrapper) : e.value;
	}, module$contents$jspb$Map_Map.prototype.get = function(e) {
		if (e = this.map_[e.toString()]) return this.wrapEntry_(e);
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "get", module$contents$jspb$Map_Map.prototype.get), module$contents$jspb$Map_Map.prototype.has = function(e) {
		return e.toString() in this.map_;
	}, goog.exportProperty(module$contents$jspb$Map_Map.prototype, "has", module$contents$jspb$Map_Map.prototype.has), module$contents$jspb$Map_Map.deserializeBinary = function(e, t, n, r, i, o, s) {
		for (; t.nextField() && !t.isEndGroup();) {
			var c = t.getFieldNumber();
			c == 1 ? o = n.call(t) : c == 2 && (e.valueCtor_ ? (module$contents$jspb$asserts_assert(i), s ||= new e.valueCtor_(), r.call(t, s, i)) : s = r.call(t));
		}
		module$contents$jspb$asserts_assert(o != null), module$contents$jspb$asserts_assert(s != null), e.set(o, s);
	}, goog.exportSymbol("module$contents$jspb$Map_Map.deserializeBinary", module$contents$jspb$Map_Map.deserializeBinary), module$contents$jspb$Map_Map.prototype.stringKeys_ = function() {
		var e = this.map_, t = [], n;
		for (n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
		return t;
	}, jspb.Map = module$contents$jspb$Map_Map, goog.async = {};
	function module$contents$goog$async$throwException_throwException(e) {
		goog.global.setTimeout(() => {
			throw e;
		}, 0);
	}
	goog.async.throwException = module$contents$goog$async$throwException_throwException, goog.crypt = {}, goog.crypt.ASYNC_THROW_ON_UNICODE_TO_BYTE = goog.DEBUG, goog.crypt.TEST_ONLY = {}, goog.crypt.TEST_ONLY.throwException = module$contents$goog$async$throwException_throwException, goog.crypt.TEST_ONLY.alwaysThrowSynchronously = goog.DEBUG, goog.crypt.binaryStringToByteArray = function(e) {
		return goog.crypt.stringToByteArray(e, !0);
	}, goog.crypt.stringToByteArray = function(e, t) {
		for (var n = [], r = 0, i = 0; i < e.length; i++) {
			var o = e.charCodeAt(i);
			if (255 < o) {
				var s = Error("go/unicode-to-byte-error");
				if (goog.crypt.TEST_ONLY.alwaysThrowSynchronously || t) throw s;
				goog.crypt.ASYNC_THROW_ON_UNICODE_TO_BYTE && goog.crypt.TEST_ONLY.throwException(s), n[r++] = o & 255, o >>= 8;
			}
			n[r++] = o;
		}
		return n;
	}, goog.crypt.byteArrayToString = function(e) {
		return goog.crypt.byteArrayToBinaryString(e);
	}, goog.crypt.byteArrayToBinaryString = function(e) {
		if (8192 >= e.length) return String.fromCharCode.apply(null, e);
		for (var t = "", n = 0; n < e.length; n += 8192) {
			var r = Array.prototype.slice.call(e, n, n + 8192);
			t += String.fromCharCode.apply(null, r);
		}
		return t;
	}, goog.crypt.byteArrayToHex = function(e, t) {
		return Array.prototype.map.call(e, function(e) {
			return e = e.toString(16), 1 < e.length ? e : "0" + e;
		}).join(t || "");
	}, goog.crypt.hexToByteArray = function(e) {
		goog.asserts.assert(e.length % 2 == 0, "Key string length must be multiple of 2");
		for (var t = [], n = 0; n < e.length; n += 2) t.push(parseInt(e.substring(n, n + 2), 16));
		return t;
	}, goog.crypt.stringToUtf8ByteArray = function(e) {
		return goog.crypt.textToByteArray(e);
	}, goog.crypt.textToByteArray = function(e) {
		for (var t = [], n = 0, r = 0; r < e.length; r++) {
			var i = e.charCodeAt(r);
			128 > i ? t[n++] = i : (2048 > i ? t[n++] = i >> 6 | 192 : ((i & 64512) == 55296 && r + 1 < e.length && (e.charCodeAt(r + 1) & 64512) == 56320 ? (i = 65536 + ((i & 1023) << 10) + (e.charCodeAt(++r) & 1023), t[n++] = i >> 18 | 240, t[n++] = i >> 12 & 63 | 128) : t[n++] = i >> 12 | 224, t[n++] = i >> 6 & 63 | 128), t[n++] = i & 63 | 128);
		}
		return t;
	}, goog.crypt.utf8ByteArrayToString = function(e) {
		return goog.crypt.byteArrayToText(e);
	}, goog.crypt.byteArrayToText = function(e) {
		for (var t = [], n = 0, r = 0; n < e.length;) {
			var i = e[n++];
			if (128 > i) t[r++] = String.fromCharCode(i);
			else if (191 < i && 224 > i) {
				var o = e[n++];
				t[r++] = String.fromCharCode((i & 31) << 6 | o & 63);
			} else if (239 < i && 365 > i) {
				o = e[n++];
				var s = e[n++], c = e[n++];
				i = ((i & 7) << 18 | (o & 63) << 12 | (s & 63) << 6 | c & 63) - 65536, t[r++] = String.fromCharCode(55296 + (i >> 10)), t[r++] = String.fromCharCode(56320 + (i & 1023));
			} else o = e[n++], s = e[n++], t[r++] = String.fromCharCode((i & 15) << 12 | (o & 63) << 6 | s & 63);
		}
		return t.join("");
	}, goog.crypt.xorByteArray = function(e, t) {
		goog.asserts.assert(e.length == t.length, "XOR array lengths must match");
		for (var n = [], r = 0; r < e.length; r++) n.push(e[r] ^ t[r]);
		return n;
	}, goog.string = {}, goog.string.internal = {}, goog.string.internal.startsWith = function(e, t) {
		return e.lastIndexOf(t, 0) == 0;
	}, goog.string.internal.endsWith = function(e, t) {
		let n = e.length - t.length;
		return 0 <= n && e.indexOf(t, n) == n;
	}, goog.string.internal.caseInsensitiveStartsWith = function(e, t) {
		return goog.string.internal.caseInsensitiveCompare(t, e.slice(0, t.length)) == 0;
	}, goog.string.internal.caseInsensitiveEndsWith = function(e, t) {
		return goog.string.internal.caseInsensitiveCompare(t, e.slice(e.length - t.length)) == 0;
	}, goog.string.internal.caseInsensitiveEquals = function(e, t) {
		return e.toLowerCase() == t.toLowerCase();
	}, goog.string.internal.isEmptyOrWhitespace = function(e) {
		return /^[\s\xa0]*$/.test(e);
	}, goog.string.internal.trim = goog.TRUSTED_SITE && String.prototype.trim ? function(e) {
		return e.trim();
	} : function(e) {
		return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(e)[1];
	}, goog.string.internal.caseInsensitiveCompare = function(e, t) {
		return e = String(e).toLowerCase(), t = String(t).toLowerCase(), e < t ? -1 : e == t ? 0 : 1;
	}, goog.string.internal.newLineToBr = function(e, t) {
		return e.replace(/(\r\n|\r|\n)/g, t ? "<br />" : "<br>");
	}, goog.string.internal.htmlEscape = function(e, t) {
		if (t) e = e.replace(goog.string.internal.AMP_RE_, "&amp;").replace(goog.string.internal.LT_RE_, "&lt;").replace(goog.string.internal.GT_RE_, "&gt;").replace(goog.string.internal.QUOT_RE_, "&quot;").replace(goog.string.internal.SINGLE_QUOTE_RE_, "&#39;").replace(goog.string.internal.NULL_RE_, "&#0;");
		else {
			if (!goog.string.internal.ALL_RE_.test(e)) return e;
			e.indexOf("&") != -1 && (e = e.replace(goog.string.internal.AMP_RE_, "&amp;")), e.indexOf("<") != -1 && (e = e.replace(goog.string.internal.LT_RE_, "&lt;")), e.indexOf(">") != -1 && (e = e.replace(goog.string.internal.GT_RE_, "&gt;")), e.indexOf("\"") != -1 && (e = e.replace(goog.string.internal.QUOT_RE_, "&quot;")), e.indexOf("'") != -1 && (e = e.replace(goog.string.internal.SINGLE_QUOTE_RE_, "&#39;")), e.indexOf("\0") != -1 && (e = e.replace(goog.string.internal.NULL_RE_, "&#0;"));
		}
		return e;
	}, goog.string.internal.AMP_RE_ = /&/g, goog.string.internal.LT_RE_ = /</g, goog.string.internal.GT_RE_ = />/g, goog.string.internal.QUOT_RE_ = /"/g, goog.string.internal.SINGLE_QUOTE_RE_ = /'/g, goog.string.internal.NULL_RE_ = /\x00/g, goog.string.internal.ALL_RE_ = /[\x00&<>"']/, goog.string.internal.whitespaceEscape = function(e, t) {
		return goog.string.internal.newLineToBr(e.replace(/  /g, " &#160;"), t);
	}, goog.string.internal.contains = function(e, t) {
		return e.indexOf(t) != -1;
	}, goog.string.internal.caseInsensitiveContains = function(e, t) {
		return goog.string.internal.contains(e.toLowerCase(), t.toLowerCase());
	}, goog.string.internal.compareVersions = function(e, t) {
		var n = 0;
		e = goog.string.internal.trim(String(e)).split("."), t = goog.string.internal.trim(String(t)).split(".");
		let r = Math.max(e.length, t.length);
		for (let s = 0; n == 0 && s < r; s++) {
			var i = e[s] || "", o = t[s] || "";
			do {
				if (i = /(\d*)(\D*)(.*)/.exec(i) || [
					"",
					"",
					"",
					""
				], o = /(\d*)(\D*)(.*)/.exec(o) || [
					"",
					"",
					"",
					""
				], i[0].length == 0 && o[0].length == 0) break;
				n = i[1].length == 0 ? 0 : parseInt(i[1], 10);
				let e = o[1].length == 0 ? 0 : parseInt(o[1], 10);
				n = goog.string.internal.compareElements_(n, e) || goog.string.internal.compareElements_(i[2].length == 0, o[2].length == 0) || goog.string.internal.compareElements_(i[2], o[2]), i = i[3], o = o[3];
			} while (n == 0);
		}
		return n;
	}, goog.string.internal.compareElements_ = function(e, t) {
		return e < t ? -1 : +(e > t);
	}, goog.flags = {}, goog.flags.USE_USER_AGENT_CLIENT_HINTS = !1, goog.flags.ASYNC_THROW_ON_UNICODE_TO_BYTE = !1, goog.labs = {}, goog.labs.userAgent = {};
	var module$contents$goog$labs$userAgent_USE_CLIENT_HINTS_OVERRIDE = "", module$contents$goog$labs$userAgent_USE_CLIENT_HINTS = !1, module$contents$goog$labs$userAgent_forceClientHintsInTests = !1;
	goog.labs.userAgent.setUseClientHintsForTesting = (e) => {
		module$contents$goog$labs$userAgent_forceClientHintsInTests = e;
	};
	var module$contents$goog$labs$userAgent_useClientHintsRuntimeOverride = module$contents$goog$labs$userAgent_USE_CLIENT_HINTS_OVERRIDE ? !!goog.getObjectByName(module$contents$goog$labs$userAgent_USE_CLIENT_HINTS_OVERRIDE) : !1;
	goog.labs.userAgent.useClientHints = () => goog.flags.USE_USER_AGENT_CLIENT_HINTS || module$contents$goog$labs$userAgent_USE_CLIENT_HINTS || module$contents$goog$labs$userAgent_useClientHintsRuntimeOverride || module$contents$goog$labs$userAgent_forceClientHintsInTests, goog.labs.userAgent.util = {};
	var module$contents$goog$labs$userAgent$util_ASSUME_CLIENT_HINTS_SUPPORT = !1;
	function module$contents$goog$labs$userAgent$util_getNativeUserAgentString() {
		var e = module$contents$goog$labs$userAgent$util_getNavigator();
		return (e &&= e.userAgent) ? e : "";
	}
	function module$contents$goog$labs$userAgent$util_getNativeUserAgentData() {
		let e = module$contents$goog$labs$userAgent$util_getNavigator();
		return e && e.userAgentData || null;
	}
	function module$contents$goog$labs$userAgent$util_getNavigator() {
		return goog.global.navigator;
	}
	var module$contents$goog$labs$userAgent$util_userAgentInternal = null, module$contents$goog$labs$userAgent$util_userAgentDataInternal = module$contents$goog$labs$userAgent$util_getNativeUserAgentData();
	function module$contents$goog$labs$userAgent$util_setUserAgent(e) {
		module$contents$goog$labs$userAgent$util_userAgentInternal = typeof e == "string" ? e : module$contents$goog$labs$userAgent$util_getNativeUserAgentString();
	}
	function module$contents$goog$labs$userAgent$util_getUserAgent() {
		return module$contents$goog$labs$userAgent$util_userAgentInternal ?? module$contents$goog$labs$userAgent$util_getNativeUserAgentString();
	}
	function module$contents$goog$labs$userAgent$util_setUserAgentData(e) {
		module$contents$goog$labs$userAgent$util_userAgentDataInternal = e;
	}
	function module$contents$goog$labs$userAgent$util_resetUserAgentData() {
		module$contents$goog$labs$userAgent$util_userAgentDataInternal = module$contents$goog$labs$userAgent$util_getNativeUserAgentData();
	}
	function module$contents$goog$labs$userAgent$util_getUserAgentData() {
		return module$contents$goog$labs$userAgent$util_userAgentDataInternal;
	}
	function module$contents$goog$labs$userAgent$util_matchUserAgentDataBrand(e) {
		if (!(0, goog.labs.userAgent.useClientHints)()) return !1;
		let t = module$contents$goog$labs$userAgent$util_getUserAgentData();
		return t ? t.brands.some(({ brand: t }) => t && (0, goog.string.internal.contains)(t, e)) : !1;
	}
	function module$contents$goog$labs$userAgent$util_matchUserAgent(e) {
		let t = module$contents$goog$labs$userAgent$util_getUserAgent();
		return (0, goog.string.internal.contains)(t, e);
	}
	function module$contents$goog$labs$userAgent$util_matchUserAgentIgnoreCase(e) {
		let t = module$contents$goog$labs$userAgent$util_getUserAgent();
		return (0, goog.string.internal.caseInsensitiveContains)(t, e);
	}
	function module$contents$goog$labs$userAgent$util_extractVersionTuples(e) {
		let t = RegExp("([A-Z][\\w ]+)/([^\\s]+)\\s*(?:\\((.*?)\\))?", "g"), n = [], r;
		for (; r = t.exec(e);) n.push([
			r[1],
			r[2],
			r[3] || void 0
		]);
		return n;
	}
	goog.labs.userAgent.util.ASSUME_CLIENT_HINTS_SUPPORT = module$contents$goog$labs$userAgent$util_ASSUME_CLIENT_HINTS_SUPPORT, goog.labs.userAgent.util.extractVersionTuples = module$contents$goog$labs$userAgent$util_extractVersionTuples, goog.labs.userAgent.util.getNativeUserAgentString = module$contents$goog$labs$userAgent$util_getNativeUserAgentString, goog.labs.userAgent.util.getUserAgent = module$contents$goog$labs$userAgent$util_getUserAgent, goog.labs.userAgent.util.getUserAgentData = module$contents$goog$labs$userAgent$util_getUserAgentData, goog.labs.userAgent.util.matchUserAgent = module$contents$goog$labs$userAgent$util_matchUserAgent, goog.labs.userAgent.util.matchUserAgentDataBrand = module$contents$goog$labs$userAgent$util_matchUserAgentDataBrand, goog.labs.userAgent.util.matchUserAgentIgnoreCase = module$contents$goog$labs$userAgent$util_matchUserAgentIgnoreCase, goog.labs.userAgent.util.resetUserAgentData = module$contents$goog$labs$userAgent$util_resetUserAgentData, goog.labs.userAgent.util.setUserAgent = module$contents$goog$labs$userAgent$util_setUserAgent, goog.labs.userAgent.util.setUserAgentData = module$contents$goog$labs$userAgent$util_setUserAgentData;
	var module$exports$goog$labs$userAgent$highEntropy$highEntropyValue = {
		AsyncValue: class {
			getIfLoaded() {}
			load() {}
		},
		HighEntropyValue: class {
			constructor(e) {
				this.key_ = e, this.promise_ = this.value_ = void 0, this.pending_ = !1;
			}
			getIfLoaded() {
				if (module$contents$goog$labs$userAgent$util_getUserAgentData()) return this.value_;
			}
			async load() {
				let e = module$contents$goog$labs$userAgent$util_getUserAgentData();
				if (e) return this.promise_ ||= (this.pending_ = !0, (async () => {
					try {
						return this.value_ = (await e.getHighEntropyValues([this.key_]))[this.key_];
					} finally {
						this.pending_ = !1;
					}
				})()), await this.promise_;
			}
			resetForTesting() {
				if (this.pending_) throw Error("Unsafe call to resetForTesting");
				this.value_ = this.promise_ = void 0, this.pending_ = !1;
			}
		},
		Version: class {
			constructor(e) {
				this.versionString_ = e;
			}
			toVersionStringForLogging() {
				return this.versionString_;
			}
			isAtLeast(e) {
				return 0 <= (0, goog.string.internal.compareVersions)(this.versionString_, e);
			}
		}
	}, module$exports$goog$labs$userAgent$highEntropy$highEntropyData = {};
	module$exports$goog$labs$userAgent$highEntropy$highEntropyData.fullVersionList = new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.HighEntropyValue("fullVersionList"), module$exports$goog$labs$userAgent$highEntropy$highEntropyData.platformVersion = new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.HighEntropyValue("platformVersion"), goog.labs.userAgent.browser = {};
	var module$contents$goog$labs$userAgent$browser_Brand = {
		ANDROID_BROWSER: "Android Browser",
		CHROMIUM: "Chromium",
		EDGE: "Microsoft Edge",
		FIREFOX: "Firefox",
		IE: "Internet Explorer",
		OPERA: "Opera",
		SAFARI: "Safari",
		SILK: "Silk"
	};
	goog.labs.userAgent.browser.Brand = module$contents$goog$labs$userAgent$browser_Brand;
	function module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand(e = !1) {
		return module$contents$goog$labs$userAgent$util_ASSUME_CLIENT_HINTS_SUPPORT ? !0 : !e && !(0, goog.labs.userAgent.useClientHints)() ? !1 : (e = module$contents$goog$labs$userAgent$util_getUserAgentData(), !!e && 0 < e.brands.length);
	}
	function module$contents$goog$labs$userAgent$browser_hasFullVersionList() {
		return module$contents$goog$labs$userAgent$browser_isAtLeast(module$contents$goog$labs$userAgent$browser_Brand.CHROMIUM, 98);
	}
	function module$contents$goog$labs$userAgent$browser_matchOpera() {
		return !module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand() && module$contents$goog$labs$userAgent$util_matchUserAgent("Opera");
	}
	function module$contents$goog$labs$userAgent$browser_matchIE() {
		return module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand() ? !1 : module$contents$goog$labs$userAgent$util_matchUserAgent("Trident") || module$contents$goog$labs$userAgent$util_matchUserAgent("MSIE");
	}
	function module$contents$goog$labs$userAgent$browser_matchEdgeHtml() {
		return !module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand() && module$contents$goog$labs$userAgent$util_matchUserAgent("Edge");
	}
	function module$contents$goog$labs$userAgent$browser_matchEdgeChromium() {
		return module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand() ? module$contents$goog$labs$userAgent$util_matchUserAgentDataBrand(module$contents$goog$labs$userAgent$browser_Brand.EDGE) : module$contents$goog$labs$userAgent$util_matchUserAgent("Edg/");
	}
	function module$contents$goog$labs$userAgent$browser_matchOperaChromium() {
		return module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand() ? module$contents$goog$labs$userAgent$util_matchUserAgentDataBrand(module$contents$goog$labs$userAgent$browser_Brand.OPERA) : module$contents$goog$labs$userAgent$util_matchUserAgent("OPR");
	}
	function module$contents$goog$labs$userAgent$browser_matchFirefox() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("Firefox") || module$contents$goog$labs$userAgent$util_matchUserAgent("FxiOS");
	}
	function module$contents$goog$labs$userAgent$browser_matchSafari() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("Safari") && !(module$contents$goog$labs$userAgent$browser_matchChrome() || module$contents$goog$labs$userAgent$browser_matchCoast() || module$contents$goog$labs$userAgent$browser_matchOpera() || module$contents$goog$labs$userAgent$browser_matchEdgeHtml() || module$contents$goog$labs$userAgent$browser_matchEdgeChromium() || module$contents$goog$labs$userAgent$browser_matchOperaChromium() || module$contents$goog$labs$userAgent$browser_matchFirefox() || module$contents$goog$labs$userAgent$browser_isSilk() || module$contents$goog$labs$userAgent$util_matchUserAgent("Android"));
	}
	function module$contents$goog$labs$userAgent$browser_matchCoast() {
		return !module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand() && module$contents$goog$labs$userAgent$util_matchUserAgent("Coast");
	}
	function module$contents$goog$labs$userAgent$browser_matchIosWebview() {
		return (module$contents$goog$labs$userAgent$util_matchUserAgent("iPad") || module$contents$goog$labs$userAgent$util_matchUserAgent("iPhone")) && !module$contents$goog$labs$userAgent$browser_matchSafari() && !module$contents$goog$labs$userAgent$browser_matchChrome() && !module$contents$goog$labs$userAgent$browser_matchCoast() && !module$contents$goog$labs$userAgent$browser_matchFirefox() && module$contents$goog$labs$userAgent$util_matchUserAgent("AppleWebKit");
	}
	function module$contents$goog$labs$userAgent$browser_matchChrome() {
		return module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand() ? module$contents$goog$labs$userAgent$util_matchUserAgentDataBrand(module$contents$goog$labs$userAgent$browser_Brand.CHROMIUM) : (module$contents$goog$labs$userAgent$util_matchUserAgent("Chrome") || module$contents$goog$labs$userAgent$util_matchUserAgent("CriOS")) && !module$contents$goog$labs$userAgent$browser_matchEdgeHtml() || module$contents$goog$labs$userAgent$browser_isSilk();
	}
	function module$contents$goog$labs$userAgent$browser_matchAndroidBrowser() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("Android") && !(module$contents$goog$labs$userAgent$browser_matchChrome() || module$contents$goog$labs$userAgent$browser_matchFirefox() || module$contents$goog$labs$userAgent$browser_matchOpera() || module$contents$goog$labs$userAgent$browser_isSilk());
	}
	var module$contents$goog$labs$userAgent$browser_isOpera = module$contents$goog$labs$userAgent$browser_matchOpera;
	goog.labs.userAgent.browser.isOpera = module$contents$goog$labs$userAgent$browser_matchOpera;
	var module$contents$goog$labs$userAgent$browser_isIE = module$contents$goog$labs$userAgent$browser_matchIE;
	goog.labs.userAgent.browser.isIE = module$contents$goog$labs$userAgent$browser_matchIE;
	var module$contents$goog$labs$userAgent$browser_isEdge = module$contents$goog$labs$userAgent$browser_matchEdgeHtml;
	goog.labs.userAgent.browser.isEdge = module$contents$goog$labs$userAgent$browser_matchEdgeHtml;
	var module$contents$goog$labs$userAgent$browser_isEdgeChromium = module$contents$goog$labs$userAgent$browser_matchEdgeChromium;
	goog.labs.userAgent.browser.isEdgeChromium = module$contents$goog$labs$userAgent$browser_matchEdgeChromium;
	var module$contents$goog$labs$userAgent$browser_isOperaChromium = module$contents$goog$labs$userAgent$browser_matchOperaChromium;
	goog.labs.userAgent.browser.isOperaChromium = module$contents$goog$labs$userAgent$browser_matchOperaChromium;
	var module$contents$goog$labs$userAgent$browser_isFirefox = module$contents$goog$labs$userAgent$browser_matchFirefox;
	goog.labs.userAgent.browser.isFirefox = module$contents$goog$labs$userAgent$browser_matchFirefox;
	var module$contents$goog$labs$userAgent$browser_isSafari = module$contents$goog$labs$userAgent$browser_matchSafari;
	goog.labs.userAgent.browser.isSafari = module$contents$goog$labs$userAgent$browser_matchSafari;
	var module$contents$goog$labs$userAgent$browser_isCoast = module$contents$goog$labs$userAgent$browser_matchCoast;
	goog.labs.userAgent.browser.isCoast = module$contents$goog$labs$userAgent$browser_matchCoast;
	var module$contents$goog$labs$userAgent$browser_isIosWebview = module$contents$goog$labs$userAgent$browser_matchIosWebview;
	goog.labs.userAgent.browser.isIosWebview = module$contents$goog$labs$userAgent$browser_matchIosWebview;
	var module$contents$goog$labs$userAgent$browser_isChrome = module$contents$goog$labs$userAgent$browser_matchChrome;
	goog.labs.userAgent.browser.isChrome = module$contents$goog$labs$userAgent$browser_matchChrome;
	var module$contents$goog$labs$userAgent$browser_isAndroidBrowser = module$contents$goog$labs$userAgent$browser_matchAndroidBrowser;
	goog.labs.userAgent.browser.isAndroidBrowser = module$contents$goog$labs$userAgent$browser_matchAndroidBrowser;
	function module$contents$goog$labs$userAgent$browser_isSilk() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("Silk");
	}
	goog.labs.userAgent.browser.isSilk = module$contents$goog$labs$userAgent$browser_isSilk;
	function module$contents$goog$labs$userAgent$browser_createVersionMap(e) {
		let t = {};
		return e.forEach((e) => {
			t[e[0]] = e[1];
		}), (e) => t[e.find((e) => e in t)] || "";
	}
	function module$contents$goog$labs$userAgent$browser_getVersion() {
		var e = module$contents$goog$labs$userAgent$util_getUserAgent();
		if (module$contents$goog$labs$userAgent$browser_matchIE()) return module$contents$goog$labs$userAgent$browser_getIEVersion(e);
		e = module$contents$goog$labs$userAgent$util_extractVersionTuples(e);
		let t = module$contents$goog$labs$userAgent$browser_createVersionMap(e);
		return module$contents$goog$labs$userAgent$browser_matchOpera() ? t(["Version", "Opera"]) : module$contents$goog$labs$userAgent$browser_matchEdgeHtml() ? t(["Edge"]) : module$contents$goog$labs$userAgent$browser_matchEdgeChromium() ? t(["Edg"]) : module$contents$goog$labs$userAgent$browser_isSilk() ? t(["Silk"]) : module$contents$goog$labs$userAgent$browser_matchChrome() ? t([
			"Chrome",
			"CriOS",
			"HeadlessChrome"
		]) : (e = e[2]) && e[1] || "";
	}
	goog.labs.userAgent.browser.getVersion = module$contents$goog$labs$userAgent$browser_getVersion;
	function module$contents$goog$labs$userAgent$browser_isVersionOrHigher(e) {
		return 0 <= (0, goog.string.internal.compareVersions)(module$contents$goog$labs$userAgent$browser_getVersion(), e);
	}
	goog.labs.userAgent.browser.isVersionOrHigher = module$contents$goog$labs$userAgent$browser_isVersionOrHigher;
	function module$contents$goog$labs$userAgent$browser_getIEVersion(e) {
		var t = /rv: *([\d\.]*)/.exec(e);
		if (t && t[1]) return t[1];
		t = "";
		let n = /MSIE +([\d\.]+)/.exec(e);
		if (n && n[1]) {
			if (e = /Trident\/(\d.\d)/.exec(e), n[1] == "7.0") {
				if (e && e[1]) switch (e[1]) {
					case "4.0":
						t = "8.0";
						break;
					case "5.0":
						t = "9.0";
						break;
					case "6.0":
						t = "10.0";
						break;
					case "7.0": t = "11.0";
				}
				else t = "7.0";
			} else t = n[1];
		}
		return t;
	}
	function module$contents$goog$labs$userAgent$browser_getFullVersionFromUserAgentString(e) {
		var t = module$contents$goog$labs$userAgent$util_getUserAgent();
		if (e === module$contents$goog$labs$userAgent$browser_Brand.IE) return module$contents$goog$labs$userAgent$browser_matchIE() ? module$contents$goog$labs$userAgent$browser_getIEVersion(t) : "";
		t = module$contents$goog$labs$userAgent$util_extractVersionTuples(t);
		let n = module$contents$goog$labs$userAgent$browser_createVersionMap(t);
		switch (e) {
			case module$contents$goog$labs$userAgent$browser_Brand.OPERA:
				if (module$contents$goog$labs$userAgent$browser_matchOpera()) return n(["Version", "Opera"]);
				if (module$contents$goog$labs$userAgent$browser_matchOperaChromium()) return n(["OPR"]);
				break;
			case module$contents$goog$labs$userAgent$browser_Brand.EDGE:
				if (module$contents$goog$labs$userAgent$browser_matchEdgeHtml()) return n(["Edge"]);
				if (module$contents$goog$labs$userAgent$browser_matchEdgeChromium()) return n(["Edg"]);
				break;
			case module$contents$goog$labs$userAgent$browser_Brand.CHROMIUM: if (module$contents$goog$labs$userAgent$browser_matchChrome()) return n([
				"Chrome",
				"CriOS",
				"HeadlessChrome"
			]);
		}
		return (e === module$contents$goog$labs$userAgent$browser_Brand.FIREFOX && module$contents$goog$labs$userAgent$browser_matchFirefox() || e === module$contents$goog$labs$userAgent$browser_Brand.SAFARI && module$contents$goog$labs$userAgent$browser_matchSafari() || e === module$contents$goog$labs$userAgent$browser_Brand.ANDROID_BROWSER && module$contents$goog$labs$userAgent$browser_matchAndroidBrowser() || e === module$contents$goog$labs$userAgent$browser_Brand.SILK && module$contents$goog$labs$userAgent$browser_isSilk()) && (e = t[2]) && e[1] || "";
	}
	function module$contents$goog$labs$userAgent$browser_versionOf_(e) {
		if (module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand() && e !== module$contents$goog$labs$userAgent$browser_Brand.SILK) {
			var t = module$contents$goog$labs$userAgent$util_getUserAgentData().brands.find(({ brand: t }) => t === e);
			if (!t || !t.version) return NaN;
			t = t.version.split(".");
		} else {
			if (t = module$contents$goog$labs$userAgent$browser_getFullVersionFromUserAgentString(e), t === "") return NaN;
			t = t.split(".");
		}
		return t.length === 0 ? NaN : Number(t[0]);
	}
	function module$contents$goog$labs$userAgent$browser_isAtLeast(e, t) {
		return (0, goog.asserts.assert)(Math.floor(t) === t, "Major version must be an integer"), module$contents$goog$labs$userAgent$browser_versionOf_(e) >= t;
	}
	goog.labs.userAgent.browser.isAtLeast = module$contents$goog$labs$userAgent$browser_isAtLeast;
	function module$contents$goog$labs$userAgent$browser_isAtMost(e, t) {
		return (0, goog.asserts.assert)(Math.floor(t) === t, "Major version must be an integer"), module$contents$goog$labs$userAgent$browser_versionOf_(e) <= t;
	}
	goog.labs.userAgent.browser.isAtMost = module$contents$goog$labs$userAgent$browser_isAtMost;
	var module$contents$goog$labs$userAgent$browser_HighEntropyBrandVersion = class {
		constructor(e, t, n) {
			this.brand_ = e, this.version_ = new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.Version(n), this.useUach_ = t;
		}
		getIfLoaded() {
			if (this.useUach_) {
				var e = module$exports$goog$labs$userAgent$highEntropy$highEntropyData.fullVersionList.getIfLoaded();
				if (e !== void 0) return e = e.find(({ brand: e }) => this.brand_ === e), (0, goog.asserts.assertExists)(e), new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.Version(e.version);
			}
			if (module$contents$goog$labs$userAgent$browser_preUachHasLoaded) return this.version_;
		}
		async load() {
			if (this.useUach_) {
				var e = await module$exports$goog$labs$userAgent$highEntropy$highEntropyData.fullVersionList.load();
				if (e !== void 0) return e = e.find(({ brand: e }) => this.brand_ === e), (0, goog.asserts.assertExists)(e), new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.Version(e.version);
			} else await 0;
			return module$contents$goog$labs$userAgent$browser_preUachHasLoaded = !0, this.version_;
		}
	}, module$contents$goog$labs$userAgent$browser_preUachHasLoaded = !1;
	async function module$contents$goog$labs$userAgent$browser_loadFullVersions() {
		module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand(!0) && await module$exports$goog$labs$userAgent$highEntropy$highEntropyData.fullVersionList.load(), module$contents$goog$labs$userAgent$browser_preUachHasLoaded = !0;
	}
	goog.labs.userAgent.browser.loadFullVersions = module$contents$goog$labs$userAgent$browser_loadFullVersions, goog.labs.userAgent.browser.resetForTesting = () => {
		module$contents$goog$labs$userAgent$browser_preUachHasLoaded = !1, module$exports$goog$labs$userAgent$highEntropy$highEntropyData.fullVersionList.resetForTesting();
	};
	function module$contents$goog$labs$userAgent$browser_fullVersionOf(e) {
		let t = "";
		module$contents$goog$labs$userAgent$browser_hasFullVersionList() || (t = module$contents$goog$labs$userAgent$browser_getFullVersionFromUserAgentString(e));
		let n = e !== module$contents$goog$labs$userAgent$browser_Brand.SILK && module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand(!0);
		if (n) {
			if (!module$contents$goog$labs$userAgent$util_getUserAgentData().brands.find(({ brand: t }) => t === e)) return;
		} else if (t === "") return;
		return new module$contents$goog$labs$userAgent$browser_HighEntropyBrandVersion(e, n, t);
	}
	goog.labs.userAgent.browser.fullVersionOf = module$contents$goog$labs$userAgent$browser_fullVersionOf;
	function module$contents$goog$labs$userAgent$browser_getVersionStringForLogging(e) {
		if (module$contents$goog$labs$userAgent$browser_useUserAgentDataBrand(!0)) {
			var t = module$contents$goog$labs$userAgent$browser_fullVersionOf(e);
			return t ? (t = t.getIfLoaded()) ? t.toVersionStringForLogging() : (t = module$contents$goog$labs$userAgent$util_getUserAgentData().brands.find(({ brand: t }) => t === e), (0, goog.asserts.assertExists)(t), t.version) : "";
		}
		return module$contents$goog$labs$userAgent$browser_getFullVersionFromUserAgentString(e);
	}
	goog.labs.userAgent.browser.getVersionStringForLogging = module$contents$goog$labs$userAgent$browser_getVersionStringForLogging, goog.labs.userAgent.engine = {};
	function module$contents$goog$labs$userAgent$engine_isPresto() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("Presto");
	}
	function module$contents$goog$labs$userAgent$engine_isTrident() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("Trident") || module$contents$goog$labs$userAgent$util_matchUserAgent("MSIE");
	}
	function module$contents$goog$labs$userAgent$engine_isEdge() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("Edge");
	}
	function module$contents$goog$labs$userAgent$engine_isWebKit() {
		return module$contents$goog$labs$userAgent$util_matchUserAgentIgnoreCase("WebKit") && !module$contents$goog$labs$userAgent$engine_isEdge();
	}
	function module$contents$goog$labs$userAgent$engine_isGecko() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("Gecko") && !module$contents$goog$labs$userAgent$engine_isWebKit() && !module$contents$goog$labs$userAgent$engine_isTrident() && !module$contents$goog$labs$userAgent$engine_isEdge();
	}
	function module$contents$goog$labs$userAgent$engine_getVersion() {
		var e = module$contents$goog$labs$userAgent$util_getUserAgent();
		if (e) {
			e = module$contents$goog$labs$userAgent$util_extractVersionTuples(e);
			let n = module$contents$goog$labs$userAgent$engine_getEngineTuple(e);
			if (n) return n[0] == "Gecko" ? module$contents$goog$labs$userAgent$engine_getVersionForKey(e, "Firefox") : n[1];
			e = e[0];
			var t;
			if (e && (t = e[2]) && (t = /Trident\/([^\s;]+)/.exec(t))) return t[1];
		}
		return "";
	}
	function module$contents$goog$labs$userAgent$engine_getEngineTuple(e) {
		if (!module$contents$goog$labs$userAgent$engine_isEdge()) return e[1];
		for (let t = 0; t < e.length; t++) {
			let n = e[t];
			if (n[0] == "Edge") return n;
		}
	}
	function module$contents$goog$labs$userAgent$engine_isVersionOrHigher(e) {
		return 0 <= goog.string.internal.compareVersions(module$contents$goog$labs$userAgent$engine_getVersion(), e);
	}
	function module$contents$goog$labs$userAgent$engine_getVersionForKey(e, t) {
		return (e = module$contents$goog$array_find(e, function(e) {
			return t == e[0];
		})) && e[1] || "";
	}
	goog.labs.userAgent.engine.getVersion = module$contents$goog$labs$userAgent$engine_getVersion, goog.labs.userAgent.engine.isEdge = module$contents$goog$labs$userAgent$engine_isEdge, goog.labs.userAgent.engine.isGecko = module$contents$goog$labs$userAgent$engine_isGecko, goog.labs.userAgent.engine.isPresto = module$contents$goog$labs$userAgent$engine_isPresto, goog.labs.userAgent.engine.isTrident = module$contents$goog$labs$userAgent$engine_isTrident, goog.labs.userAgent.engine.isVersionOrHigher = module$contents$goog$labs$userAgent$engine_isVersionOrHigher, goog.labs.userAgent.engine.isWebKit = module$contents$goog$labs$userAgent$engine_isWebKit, goog.labs.userAgent.platform = {};
	function module$contents$goog$labs$userAgent$platform_useUserAgentDataPlatform(e = !1) {
		return module$contents$goog$labs$userAgent$util_ASSUME_CLIENT_HINTS_SUPPORT ? !0 : !e && !(0, goog.labs.userAgent.useClientHints)() ? !1 : (e = module$contents$goog$labs$userAgent$util_getUserAgentData(), !!e && !!e.platform);
	}
	function module$contents$goog$labs$userAgent$platform_isAndroid() {
		return module$contents$goog$labs$userAgent$platform_useUserAgentDataPlatform() ? module$contents$goog$labs$userAgent$util_getUserAgentData().platform === "Android" : module$contents$goog$labs$userAgent$util_matchUserAgent("Android");
	}
	function module$contents$goog$labs$userAgent$platform_isIpod() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("iPod");
	}
	function module$contents$goog$labs$userAgent$platform_isIphone() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("iPhone") && !module$contents$goog$labs$userAgent$util_matchUserAgent("iPod") && !module$contents$goog$labs$userAgent$util_matchUserAgent("iPad");
	}
	function module$contents$goog$labs$userAgent$platform_isIpad() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("iPad");
	}
	function module$contents$goog$labs$userAgent$platform_isIos() {
		return module$contents$goog$labs$userAgent$platform_isIphone() || module$contents$goog$labs$userAgent$platform_isIpad() || module$contents$goog$labs$userAgent$platform_isIpod();
	}
	function module$contents$goog$labs$userAgent$platform_isMacintosh() {
		return module$contents$goog$labs$userAgent$platform_useUserAgentDataPlatform() ? module$contents$goog$labs$userAgent$util_getUserAgentData().platform === "macOS" : module$contents$goog$labs$userAgent$util_matchUserAgent("Macintosh");
	}
	function module$contents$goog$labs$userAgent$platform_isLinux() {
		return module$contents$goog$labs$userAgent$platform_useUserAgentDataPlatform() ? module$contents$goog$labs$userAgent$util_getUserAgentData().platform === "Linux" : module$contents$goog$labs$userAgent$util_matchUserAgent("Linux");
	}
	function module$contents$goog$labs$userAgent$platform_isWindows() {
		return module$contents$goog$labs$userAgent$platform_useUserAgentDataPlatform() ? module$contents$goog$labs$userAgent$util_getUserAgentData().platform === "Windows" : module$contents$goog$labs$userAgent$util_matchUserAgent("Windows");
	}
	function module$contents$goog$labs$userAgent$platform_isChromeOS() {
		return module$contents$goog$labs$userAgent$platform_useUserAgentDataPlatform() ? module$contents$goog$labs$userAgent$util_getUserAgentData().platform === "Chrome OS" : module$contents$goog$labs$userAgent$util_matchUserAgent("CrOS");
	}
	function module$contents$goog$labs$userAgent$platform_isChromecast() {
		return module$contents$goog$labs$userAgent$util_matchUserAgent("CrKey");
	}
	function module$contents$goog$labs$userAgent$platform_isKaiOS() {
		return module$contents$goog$labs$userAgent$util_matchUserAgentIgnoreCase("KaiOS");
	}
	function module$contents$goog$labs$userAgent$platform_getVersion() {
		var e = module$contents$goog$labs$userAgent$util_getUserAgent(), t = "";
		return module$contents$goog$labs$userAgent$platform_isWindows() ? (t = /Windows (?:NT|Phone) ([0-9.]+)/, t = (e = t.exec(e)) ? e[1] : "0.0") : module$contents$goog$labs$userAgent$platform_isIos() ? (t = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/, t = (e = t.exec(e)) && e[1].replace(/_/g, ".")) : module$contents$goog$labs$userAgent$platform_isMacintosh() ? (t = /Mac OS X ([0-9_.]+)/, t = (e = t.exec(e)) ? e[1].replace(/_/g, ".") : "10") : module$contents$goog$labs$userAgent$platform_isKaiOS() ? (t = /(?:KaiOS)\/(\S+)/i, t = (e = t.exec(e)) && e[1]) : module$contents$goog$labs$userAgent$platform_isAndroid() ? (t = /Android\s+([^\);]+)(\)|;)/, t = (e = t.exec(e)) && e[1]) : module$contents$goog$labs$userAgent$platform_isChromeOS() && (t = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/, t = (e = t.exec(e)) && e[1]), t || "";
	}
	function module$contents$goog$labs$userAgent$platform_isVersionOrHigher(e) {
		return 0 <= goog.string.internal.compareVersions(module$contents$goog$labs$userAgent$platform_getVersion(), e);
	}
	var module$contents$goog$labs$userAgent$platform_PlatformVersion = class {
		constructor() {
			this.preUachHasLoaded_ = !1;
		}
		getIfLoaded() {
			if (module$contents$goog$labs$userAgent$platform_useUserAgentDataPlatform(!0)) {
				let e = module$exports$goog$labs$userAgent$highEntropy$highEntropyData.platformVersion.getIfLoaded();
				return e === void 0 ? void 0 : new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.Version(e);
			}
			if (this.preUachHasLoaded_) return new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.Version(module$contents$goog$labs$userAgent$platform_getVersion());
		}
		async load() {
			return module$contents$goog$labs$userAgent$platform_useUserAgentDataPlatform(!0) ? new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.Version(await module$exports$goog$labs$userAgent$highEntropy$highEntropyData.platformVersion.load()) : (this.preUachHasLoaded_ = !0, new module$exports$goog$labs$userAgent$highEntropy$highEntropyValue.Version(module$contents$goog$labs$userAgent$platform_getVersion()));
		}
		resetForTesting() {
			module$exports$goog$labs$userAgent$highEntropy$highEntropyData.platformVersion.resetForTesting(), this.preUachHasLoaded_ = !1;
		}
	}, module$contents$goog$labs$userAgent$platform_version = new module$contents$goog$labs$userAgent$platform_PlatformVersion();
	goog.labs.userAgent.platform.getVersion = module$contents$goog$labs$userAgent$platform_getVersion, goog.labs.userAgent.platform.isAndroid = module$contents$goog$labs$userAgent$platform_isAndroid, goog.labs.userAgent.platform.isChromeOS = module$contents$goog$labs$userAgent$platform_isChromeOS, goog.labs.userAgent.platform.isChromecast = module$contents$goog$labs$userAgent$platform_isChromecast, goog.labs.userAgent.platform.isIos = module$contents$goog$labs$userAgent$platform_isIos, goog.labs.userAgent.platform.isIpad = module$contents$goog$labs$userAgent$platform_isIpad, goog.labs.userAgent.platform.isIphone = module$contents$goog$labs$userAgent$platform_isIphone, goog.labs.userAgent.platform.isIpod = module$contents$goog$labs$userAgent$platform_isIpod, goog.labs.userAgent.platform.isKaiOS = module$contents$goog$labs$userAgent$platform_isKaiOS, goog.labs.userAgent.platform.isLinux = module$contents$goog$labs$userAgent$platform_isLinux, goog.labs.userAgent.platform.isMacintosh = module$contents$goog$labs$userAgent$platform_isMacintosh, goog.labs.userAgent.platform.isVersionOrHigher = module$contents$goog$labs$userAgent$platform_isVersionOrHigher, goog.labs.userAgent.platform.isWindows = module$contents$goog$labs$userAgent$platform_isWindows, goog.labs.userAgent.platform.version = module$contents$goog$labs$userAgent$platform_version, goog.reflect = {}, goog.reflect.object = function(e, t) {
		return t;
	}, goog.reflect.objectProperty = function(e, t) {
		return e;
	}, goog.reflect.sinkValue = function(e) {
		return goog.reflect.sinkValue[" "](e), e;
	}, goog.reflect.sinkValue[" "] = function() {}, goog.reflect.canAccessProperty = function(e, t) {
		try {
			return goog.reflect.sinkValue(e[t]), !0;
		} catch {}
		return !1;
	}, goog.reflect.cache = function(e, t, n, r) {
		return r = r ? r(t) : t, Object.prototype.hasOwnProperty.call(e, r) ? e[r] : e[r] = n(t);
	}, goog.userAgent = {}, goog.userAgent.ASSUME_IE = !1, goog.userAgent.ASSUME_EDGE = !1, goog.userAgent.ASSUME_GECKO = !1, goog.userAgent.ASSUME_WEBKIT = !1, goog.userAgent.ASSUME_MOBILE_WEBKIT = !1, goog.userAgent.ASSUME_OPERA = !1, goog.userAgent.ASSUME_ANY_VERSION = !1, goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA, goog.userAgent.getUserAgentString = function() {
		return module$contents$goog$labs$userAgent$util_getUserAgent();
	}, goog.userAgent.getNavigatorTyped = function() {
		return goog.global.navigator || null;
	}, goog.userAgent.getNavigator = function() {
		return goog.userAgent.getNavigatorTyped();
	}, goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : module$contents$goog$labs$userAgent$browser_matchOpera(), goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : module$contents$goog$labs$userAgent$browser_matchIE(), goog.userAgent.EDGE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_EDGE : module$contents$goog$labs$userAgent$engine_isEdge(), goog.userAgent.EDGE_OR_IE = goog.userAgent.EDGE || goog.userAgent.IE, goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : module$contents$goog$labs$userAgent$engine_isGecko(), goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : module$contents$goog$labs$userAgent$engine_isWebKit(), goog.userAgent.isMobile_ = function() {
		return goog.userAgent.WEBKIT && module$contents$goog$labs$userAgent$util_matchUserAgent("Mobile");
	}, goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.isMobile_(), goog.userAgent.SAFARI = goog.userAgent.WEBKIT, goog.userAgent.determinePlatform_ = function() {
		var e = goog.userAgent.getNavigatorTyped();
		return e && e.platform || "";
	}, goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_(), goog.userAgent.ASSUME_MAC = !1, goog.userAgent.ASSUME_WINDOWS = !1, goog.userAgent.ASSUME_LINUX = !1, goog.userAgent.ASSUME_X11 = !1, goog.userAgent.ASSUME_ANDROID = !1, goog.userAgent.ASSUME_IPHONE = !1, goog.userAgent.ASSUME_IPAD = !1, goog.userAgent.ASSUME_IPOD = !1, goog.userAgent.ASSUME_KAIOS = !1, goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD || goog.userAgent.ASSUME_IPOD, goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : module$contents$goog$labs$userAgent$platform_isMacintosh(), goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : module$contents$goog$labs$userAgent$platform_isWindows(), goog.userAgent.isLegacyLinux_ = function() {
		return module$contents$goog$labs$userAgent$platform_isLinux() || module$contents$goog$labs$userAgent$platform_isChromeOS();
	}, goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.isLegacyLinux_(), goog.userAgent.isX11_ = function() {
		var e = goog.userAgent.getNavigatorTyped();
		return !!e && goog.string.internal.contains(e.appVersion || "", "X11");
	}, goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.isX11_(), goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : module$contents$goog$labs$userAgent$platform_isAndroid(), goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : module$contents$goog$labs$userAgent$platform_isIphone(), goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : module$contents$goog$labs$userAgent$platform_isIpad(), goog.userAgent.IPOD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPOD : module$contents$goog$labs$userAgent$platform_isIpod(), goog.userAgent.IOS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD || goog.userAgent.ASSUME_IPOD : module$contents$goog$labs$userAgent$platform_isIos(), goog.userAgent.KAIOS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_KAIOS : module$contents$goog$labs$userAgent$platform_isKaiOS(), goog.userAgent.determineVersion_ = function() {
		var e = "", t = goog.userAgent.getVersionRegexResult_();
		return t && (e = t ? t[1] : ""), goog.userAgent.IE && (t = goog.userAgent.getDocumentMode_(), t != null && t > parseFloat(e)) ? String(t) : e;
	}, goog.userAgent.getVersionRegexResult_ = function() {
		var e = goog.userAgent.getUserAgentString();
		if (goog.userAgent.GECKO) return /rv:([^\);]+)(\)|;)/.exec(e);
		if (goog.userAgent.EDGE) return /Edge\/([\d\.]+)/.exec(e);
		if (goog.userAgent.IE) return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(e);
		if (goog.userAgent.WEBKIT) return /WebKit\/(\S+)/.exec(e);
		if (goog.userAgent.OPERA) return /(?:Version)[ \/]?(\S+)/.exec(e);
	}, goog.userAgent.getDocumentMode_ = function() {
		var e = goog.global.document;
		return e ? e.documentMode : void 0;
	}, goog.userAgent.VERSION = goog.userAgent.determineVersion_(), goog.userAgent.compare = function(e, t) {
		return goog.string.internal.compareVersions(e, t);
	}, goog.userAgent.isVersionOrHigherCache_ = {}, goog.userAgent.isVersionOrHigher = function(e) {
		return goog.userAgent.ASSUME_ANY_VERSION || goog.reflect.cache(goog.userAgent.isVersionOrHigherCache_, e, function() {
			return 0 <= goog.string.internal.compareVersions(goog.userAgent.VERSION, e);
		});
	}, goog.userAgent.isDocumentModeOrHigher = function(e) {
		return Number(goog.userAgent.DOCUMENT_MODE) >= e;
	}, goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher, goog.userAgent.DOCUMENT_MODE = function() {
		if (goog.global.document && goog.userAgent.IE) return goog.userAgent.getDocumentMode_() || parseInt(goog.userAgent.VERSION, 10) || void 0;
	}(), goog.userAgent.product = {}, goog.userAgent.product.ASSUME_FIREFOX = !1, goog.userAgent.product.ASSUME_IPHONE = !1, goog.userAgent.product.ASSUME_IPAD = !1, goog.userAgent.product.ASSUME_ANDROID = !1, goog.userAgent.product.ASSUME_CHROME = !1, goog.userAgent.product.ASSUME_SAFARI = !1, goog.userAgent.product.PRODUCT_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_OPERA || goog.userAgent.product.ASSUME_FIREFOX || goog.userAgent.product.ASSUME_IPHONE || goog.userAgent.product.ASSUME_IPAD || goog.userAgent.product.ASSUME_ANDROID || goog.userAgent.product.ASSUME_CHROME || goog.userAgent.product.ASSUME_SAFARI, goog.userAgent.product.OPERA = goog.userAgent.OPERA, goog.userAgent.product.IE = goog.userAgent.IE, goog.userAgent.product.EDGE = goog.userAgent.EDGE, goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_FIREFOX : module$contents$goog$labs$userAgent$browser_matchFirefox(), goog.userAgent.product.isIphoneOrIpod_ = function() {
		return module$contents$goog$labs$userAgent$platform_isIphone() || module$contents$goog$labs$userAgent$platform_isIpod();
	}, goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPHONE : goog.userAgent.product.isIphoneOrIpod_(), goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPAD : module$contents$goog$labs$userAgent$platform_isIpad(), goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_ANDROID : module$contents$goog$labs$userAgent$browser_matchAndroidBrowser(), goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CHROME : module$contents$goog$labs$userAgent$browser_matchChrome(), goog.userAgent.product.isSafariDesktop_ = function() {
		return module$contents$goog$labs$userAgent$browser_matchSafari() && !module$contents$goog$labs$userAgent$platform_isIos();
	}, goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_SAFARI : goog.userAgent.product.isSafariDesktop_(), goog.crypt.base64 = {}, goog.crypt.base64.DEFAULT_ALPHABET_COMMON_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", goog.crypt.base64.ENCODED_VALS = goog.crypt.base64.DEFAULT_ALPHABET_COMMON_ + "+/=", goog.crypt.base64.ENCODED_VALS_WEBSAFE = goog.crypt.base64.DEFAULT_ALPHABET_COMMON_ + "-_.", goog.crypt.base64.Alphabet = {
		DEFAULT: 0,
		NO_PADDING: 1,
		WEBSAFE: 2,
		WEBSAFE_DOT_PADDING: 3,
		WEBSAFE_NO_PADDING: 4
	}, goog.crypt.base64.paddingChars_ = "=.", goog.crypt.base64.isPadding_ = function(e) {
		return goog.string.internal.contains(goog.crypt.base64.paddingChars_, e);
	}, goog.crypt.base64.byteToCharMaps_ = {}, goog.crypt.base64.charToByteMap_ = null, goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ = goog.userAgent.GECKO || goog.userAgent.WEBKIT, goog.crypt.base64.HAS_NATIVE_ENCODE_ = goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ || typeof goog.global.btoa == "function", goog.crypt.base64.HAS_NATIVE_DECODE_ = goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ || !goog.userAgent.product.SAFARI && !goog.userAgent.IE && typeof goog.global.atob == "function", goog.crypt.base64.encodeByteArray = function(e, t) {
		goog.asserts.assert(goog.isArrayLike(e), "encodeByteArray takes an array as a parameter"), t === void 0 && (t = goog.crypt.base64.Alphabet.DEFAULT), goog.crypt.base64.init_(), t = goog.crypt.base64.byteToCharMaps_[t];
		let n = Array(Math.floor(e.length / 3)), r = t[64] || "", i = 0, o = 0;
		for (; i < e.length - 2; i += 3) {
			var s = e[i], c = e[i + 1], l = e[i + 2], u = t[s >> 2];
			s = t[(s & 3) << 4 | c >> 4], c = t[(c & 15) << 2 | l >> 6], l = t[l & 63], n[o++] = "" + u + s + c + l;
		}
		switch (u = 0, l = r, e.length - i) {
			case 2: u = e[i + 1], l = t[(u & 15) << 2] || r;
			case 1: e = e[i], n[o] = "" + t[e >> 2] + t[(e & 3) << 4 | u >> 4] + l + r;
		}
		return n.join("");
	}, goog.crypt.base64.encodeBinaryString = function(e, t) {
		return goog.crypt.base64.encodeString(e, t, !0);
	}, goog.crypt.base64.encodeString = function(e, t, n) {
		return goog.crypt.base64.HAS_NATIVE_ENCODE_ && !t ? goog.global.btoa(e) : goog.crypt.base64.encodeByteArray(goog.crypt.stringToByteArray(e, n), t);
	}, goog.crypt.base64.encodeStringUtf8 = function(e, t) {
		return goog.crypt.base64.encodeText(e, t);
	}, goog.crypt.base64.encodeText = function(e, t) {
		return goog.crypt.base64.HAS_NATIVE_ENCODE_ && !t ? goog.global.btoa(unescape(encodeURIComponent(e))) : goog.crypt.base64.encodeByteArray(goog.crypt.stringToUtf8ByteArray(e), t);
	}, goog.crypt.base64.decodeToBinaryString = function(e, t) {
		if (goog.crypt.base64.HAS_NATIVE_DECODE_ && !t) return goog.global.atob(e);
		var n = "";
		return goog.crypt.base64.decodeStringInternal_(e, function(e) {
			n += String.fromCharCode(e);
		}), n;
	}, goog.crypt.base64.decodeString = goog.crypt.base64.decodeToBinaryString, goog.crypt.base64.decodeStringUtf8 = function(e, t) {
		return goog.crypt.base64.decodeToText(e, t);
	}, goog.crypt.base64.decodeToText = function(e, t) {
		return decodeURIComponent(escape(goog.crypt.base64.decodeString(e, t)));
	}, goog.crypt.base64.decodeStringToByteArray = function(e, t) {
		var n = [];
		return goog.crypt.base64.decodeStringInternal_(e, function(e) {
			n.push(e);
		}), n;
	}, goog.crypt.base64.decodeStringToUint8Array = function(e) {
		var t = e.length, n = 3 * t / 4;
		n % 3 ? n = Math.floor(n) : goog.crypt.base64.isPadding_(e[t - 1]) && (n = goog.crypt.base64.isPadding_(e[t - 2]) ? n - 2 : n - 1);
		var r = new Uint8Array(n), i = 0;
		return goog.crypt.base64.decodeStringInternal_(e, function(e) {
			r[i++] = e;
		}), i === n ? r : r.subarray(0, i);
	}, goog.crypt.base64.decodeStringInternal_ = function(e, t) {
		function n(t) {
			for (; r < e.length;) {
				var n = e.charAt(r++), i = goog.crypt.base64.charToByteMap_[n];
				if (i != null) return i;
				if (!goog.string.internal.isEmptyOrWhitespace(n)) throw Error("Unknown base64 encoding at char: " + n);
			}
			return t;
		}
		goog.crypt.base64.init_();
		for (var r = 0;;) {
			var i = n(-1), o = n(0), s = n(64), c = n(64);
			if (c === 64 && i === -1) break;
			t(i << 2 | o >> 4), s != 64 && (t(o << 4 & 240 | s >> 2), c != 64 && t(s << 6 & 192 | c));
		}
	}, goog.crypt.base64.init_ = function() {
		if (!goog.crypt.base64.charToByteMap_) {
			goog.crypt.base64.charToByteMap_ = {};
			for (var e = goog.crypt.base64.DEFAULT_ALPHABET_COMMON_.split(""), t = [
				"+/=",
				"+/",
				"-_=",
				"-_.",
				"-_"
			], n = 0; 5 > n; n++) {
				var r = e.concat(t[n].split(""));
				goog.crypt.base64.byteToCharMaps_[n] = r;
				for (var i = 0; i < r.length; i++) {
					var o = r[i], s = goog.crypt.base64.charToByteMap_[o];
					s === void 0 ? goog.crypt.base64.charToByteMap_[o] = i : goog.asserts.assert(s === i);
				}
			}
		}
	}, jspb.BinaryConstants = {};
	var module$contents$jspb$BinaryConstants_FieldType = {
		INVALID: -1,
		DOUBLE: 1,
		FLOAT: 2,
		INT64: 3,
		UINT64: 4,
		INT32: 5,
		FIXED64: 6,
		FIXED32: 7,
		BOOL: 8,
		STRING: 9,
		GROUP: 10,
		MESSAGE: 11,
		BYTES: 12,
		UINT32: 13,
		ENUM: 14,
		SFIXED32: 15,
		SFIXED64: 16,
		SINT32: 17,
		SINT64: 18
	}, module$contents$jspb$BinaryConstants_WireType = {
		INVALID: -1,
		VARINT: 0,
		FIXED64: 1,
		DELIMITED: 2,
		START_GROUP: 3,
		END_GROUP: 4,
		FIXED32: 5
	};
	function module$contents$jspb$BinaryConstants_isValidWireType(e) {
		return 0 <= e && 5 >= e;
	}
	function module$contents$jspb$BinaryConstants_FieldTypeToWireType(e) {
		switch (e) {
			case module$contents$jspb$BinaryConstants_FieldType.INT32:
			case module$contents$jspb$BinaryConstants_FieldType.INT64:
			case module$contents$jspb$BinaryConstants_FieldType.UINT32:
			case module$contents$jspb$BinaryConstants_FieldType.UINT64:
			case module$contents$jspb$BinaryConstants_FieldType.SINT32:
			case module$contents$jspb$BinaryConstants_FieldType.SINT64:
			case module$contents$jspb$BinaryConstants_FieldType.BOOL:
			case module$contents$jspb$BinaryConstants_FieldType.ENUM: return module$contents$jspb$BinaryConstants_WireType.VARINT;
			case module$contents$jspb$BinaryConstants_FieldType.DOUBLE:
			case module$contents$jspb$BinaryConstants_FieldType.FIXED64:
			case module$contents$jspb$BinaryConstants_FieldType.SFIXED64: return module$contents$jspb$BinaryConstants_WireType.FIXED64;
			case module$contents$jspb$BinaryConstants_FieldType.STRING:
			case module$contents$jspb$BinaryConstants_FieldType.MESSAGE:
			case module$contents$jspb$BinaryConstants_FieldType.BYTES: return module$contents$jspb$BinaryConstants_WireType.DELIMITED;
			case module$contents$jspb$BinaryConstants_FieldType.FLOAT:
			case module$contents$jspb$BinaryConstants_FieldType.FIXED32:
			case module$contents$jspb$BinaryConstants_FieldType.SFIXED32: return module$contents$jspb$BinaryConstants_WireType.FIXED32;
			default: return module$contents$jspb$BinaryConstants_WireType.INVALID;
		}
	}
	var module$contents$jspb$BinaryConstants_INVALID_FIELD_NUMBER = -1, module$contents$jspb$BinaryConstants_INVALID_TAG = -1, module$contents$jspb$BinaryConstants_FLOAT32_EPS = 1401298464324817e-60, module$contents$jspb$BinaryConstants_FLOAT32_MIN = 11754943508222875e-54, module$contents$jspb$BinaryConstants_FLOAT32_MAX = 34028234663852886e22, module$contents$jspb$BinaryConstants_FLOAT64_EPS = 5e-324, module$contents$jspb$BinaryConstants_FLOAT64_MIN = 22250738585072014e-324, module$contents$jspb$BinaryConstants_FLOAT64_MAX = 17976931348623157e292, module$contents$jspb$BinaryConstants_TWO_TO_20 = 1048576, module$contents$jspb$BinaryConstants_TWO_TO_23 = 8388608, module$contents$jspb$BinaryConstants_TWO_TO_31 = 2147483648, module$contents$jspb$BinaryConstants_TWO_TO_32 = 4294967296, module$contents$jspb$BinaryConstants_TWO_TO_52 = 4503599627370496, module$contents$jspb$BinaryConstants_TWO_TO_63 = 0x8000000000000000, module$contents$jspb$BinaryConstants_TWO_TO_64 = 0x10000000000000000, module$contents$jspb$BinaryConstants_ZERO_HASH = "\0\0\0\0\0\0\0\0", module$contents$jspb$BinaryConstants_MESSAGE_SET_GROUP_NUMBER = 1, module$contents$jspb$BinaryConstants_MESSAGE_SET_TYPE_ID_FIELD_NUMBER = 2, module$contents$jspb$BinaryConstants_MESSAGE_SET_MESSAGE_FIELD_NUMBER = 3, module$contents$jspb$BinaryConstants_MESSAGE_SET_MAX_TYPE_ID = 4294967294;
	jspb.BinaryConstants.FieldType = module$contents$jspb$BinaryConstants_FieldType, jspb.BinaryConstants.FieldTypeToWireType = module$contents$jspb$BinaryConstants_FieldTypeToWireType, jspb.BinaryConstants.FLOAT32_EPS = module$contents$jspb$BinaryConstants_FLOAT32_EPS, jspb.BinaryConstants.FLOAT32_MIN = module$contents$jspb$BinaryConstants_FLOAT32_MIN, jspb.BinaryConstants.FLOAT32_MAX = module$contents$jspb$BinaryConstants_FLOAT32_MAX, jspb.BinaryConstants.FLOAT64_EPS = module$contents$jspb$BinaryConstants_FLOAT64_EPS, jspb.BinaryConstants.FLOAT64_MIN = module$contents$jspb$BinaryConstants_FLOAT64_MIN, jspb.BinaryConstants.FLOAT64_MAX = module$contents$jspb$BinaryConstants_FLOAT64_MAX, jspb.BinaryConstants.INVALID_FIELD_NUMBER = module$contents$jspb$BinaryConstants_INVALID_FIELD_NUMBER, jspb.BinaryConstants.INVALID_TAG = module$contents$jspb$BinaryConstants_INVALID_TAG, jspb.BinaryConstants.MESSAGE_SET_GROUP_NUMBER = module$contents$jspb$BinaryConstants_MESSAGE_SET_GROUP_NUMBER, jspb.BinaryConstants.MESSAGE_SET_MAX_TYPE_ID = module$contents$jspb$BinaryConstants_MESSAGE_SET_MAX_TYPE_ID, jspb.BinaryConstants.MESSAGE_SET_MESSAGE_FIELD_NUMBER = module$contents$jspb$BinaryConstants_MESSAGE_SET_MESSAGE_FIELD_NUMBER, jspb.BinaryConstants.MESSAGE_SET_TYPE_ID_FIELD_NUMBER = module$contents$jspb$BinaryConstants_MESSAGE_SET_TYPE_ID_FIELD_NUMBER, jspb.BinaryConstants.TWO_TO_20 = module$contents$jspb$BinaryConstants_TWO_TO_20, jspb.BinaryConstants.TWO_TO_23 = module$contents$jspb$BinaryConstants_TWO_TO_23, jspb.BinaryConstants.TWO_TO_31 = module$contents$jspb$BinaryConstants_TWO_TO_31, jspb.BinaryConstants.TWO_TO_32 = module$contents$jspb$BinaryConstants_TWO_TO_32, jspb.BinaryConstants.TWO_TO_52 = module$contents$jspb$BinaryConstants_TWO_TO_52, jspb.BinaryConstants.TWO_TO_63 = module$contents$jspb$BinaryConstants_TWO_TO_63, jspb.BinaryConstants.TWO_TO_64 = module$contents$jspb$BinaryConstants_TWO_TO_64, jspb.BinaryConstants.WireType = module$contents$jspb$BinaryConstants_WireType, jspb.BinaryConstants.ZERO_HASH = module$contents$jspb$BinaryConstants_ZERO_HASH, jspb.BinaryConstants.isValidWireType = module$contents$jspb$BinaryConstants_isValidWireType;
	var module$exports$jspb$binary$errors = {};
	function module$contents$jspb$binary$errors_messageLengthMismatchError(e, t) {
		return Error(`Message parsing ended unexpectedly. Expected to read ${e} bytes, instead read ${t} bytes, either the data ended unexpectedly or the message misreported its own length`);
	}
	function module$contents$jspb$binary$errors_invalidWireTypeError(e, t) {
		return Error(`Invalid wire type: ${e} (at position ${t})`);
	}
	function module$contents$jspb$binary$errors_invalidFieldNumberError(e, t) {
		return Error(`Invalid field number: ${e} (at position ${t})`);
	}
	function module$contents$jspb$binary$errors_malformedBinaryBytesForMessageSet() {
		return Error("Malformed binary bytes for message set");
	}
	function module$contents$jspb$binary$errors_unmatchedStartGroupEofError() {
		return Error("Unmatched start-group tag: stream EOF");
	}
	function module$contents$jspb$binary$errors_unmatchedStartGroupError() {
		return Error("Unmatched end-group tag");
	}
	function module$contents$jspb$binary$errors_groupDidNotEndWithEndGroupError() {
		return Error("Group submessage did not end with an END_GROUP tag");
	}
	function module$contents$jspb$binary$errors_invalidVarintError() {
		return Error("Failed to read varint, encoding is invalid.");
	}
	function module$contents$jspb$binary$errors_readTooFarError(e, t) {
		return Error(`Tried to read past the end of the data ${t} > ${e}`);
	}
	function module$contents$jspb$binary$errors_negativeByteLengthError(e) {
		return Error(`Tried to read a negative byte length: ${e}`);
	}
	module$exports$jspb$binary$errors.messageLengthMismatchError = module$contents$jspb$binary$errors_messageLengthMismatchError, module$exports$jspb$binary$errors.groupDidNotEndWithEndGroupError = module$contents$jspb$binary$errors_groupDidNotEndWithEndGroupError, module$exports$jspb$binary$errors.invalidFieldNumberError = module$contents$jspb$binary$errors_invalidFieldNumberError, module$exports$jspb$binary$errors.invalidVarintError = module$contents$jspb$binary$errors_invalidVarintError, module$exports$jspb$binary$errors.invalidWireTypeError = module$contents$jspb$binary$errors_invalidWireTypeError, module$exports$jspb$binary$errors.malformedBinaryBytesForMessageSet = module$contents$jspb$binary$errors_malformedBinaryBytesForMessageSet, module$exports$jspb$binary$errors.negativeByteLengthError = module$contents$jspb$binary$errors_negativeByteLengthError, module$exports$jspb$binary$errors.readTooFarError = module$contents$jspb$binary$errors_readTooFarError, module$exports$jspb$binary$errors.unmatchedStartGroupError = module$contents$jspb$binary$errors_unmatchedStartGroupError, module$exports$jspb$binary$errors.unmatchedStartGroupEofError = module$contents$jspb$binary$errors_unmatchedStartGroupEofError;
	var module$exports$jspb$internal_options = {};
	function module$contents$jspb$internal_options_isBigIntAvailable() {
		return 2021 <= goog.FEATURESET_YEAR || typeof BigInt == "function";
	}
	module$exports$jspb$internal_options.isBigIntAvailable = module$contents$jspb$internal_options_isBigIntAvailable;
	var module$exports$jspb$binary$bytesource = {}, module$exports$jspb$internal_bytes = {};
	module$exports$jspb$internal_bytes.SUPPORTS_UINT8ARRAY = 2018 <= goog.FEATURESET_YEAR || typeof Uint8Array < "u";
	var module$contents$jspb$internal_bytes_HANDLE_WEB_SAFE_ENCODINGS_WITH_ATOB_AND_BTOA = !0, module$contents$jspb$internal_bytes_CAN_USE_ATOB_AND_BTOA = !0, module$contents$jspb$internal_bytes_ASSUME_ATOB_AND_BTOA_AVAILABLE = 2018 <= goog.FEATURESET_YEAR;
	module$exports$jspb$internal_bytes.USE_ATOB_BTOA = module$contents$jspb$internal_bytes_CAN_USE_ATOB_AND_BTOA && (module$contents$jspb$internal_bytes_ASSUME_ATOB_AND_BTOA_AVAILABLE || !goog.userAgent.IE && typeof btoa == "function");
	var module$contents$jspb$internal_bytes_UINT8ARRAY_MAX_SIZE_FOR_SPREAD = 10240;
	function module$contents$jspb$internal_bytes_encodeByteArray(e) {
		if (!module$exports$jspb$internal_bytes.USE_ATOB_BTOA) return goog.crypt.base64.encodeByteArray(e);
		let t = "", n = 0, r = e.length - module$contents$jspb$internal_bytes_UINT8ARRAY_MAX_SIZE_FOR_SPREAD;
		for (; n < r;) t += String.fromCharCode.apply(null, e.subarray(n, n += module$contents$jspb$internal_bytes_UINT8ARRAY_MAX_SIZE_FOR_SPREAD));
		return t += String.fromCharCode.apply(null, n ? e.subarray(n) : e), btoa(t);
	}
	var module$contents$jspb$internal_bytes_WEBSAFE_BASE64_CHARS = /[-_.]/g, module$contents$jspb$internal_bytes_websafeReplacer = {
		"-": "+",
		_: "/",
		".": "="
	};
	function module$contents$jspb$internal_bytes_replaceWebsafe(e) {
		return module$contents$jspb$internal_bytes_websafeReplacer[e] || "";
	}
	function module$contents$jspb$internal_bytes_replaceWebsafeString(e) {
		return module$contents$jspb$internal_bytes_WEBSAFE_BASE64_CHARS.test(e) ? e.replace(module$contents$jspb$internal_bytes_WEBSAFE_BASE64_CHARS, module$contents$jspb$internal_bytes_replaceWebsafe) : e;
	}
	function module$contents$jspb$internal_bytes_decodeByteArray(e) {
		if (!module$exports$jspb$internal_bytes.USE_ATOB_BTOA) return goog.crypt.base64.decodeStringToUint8Array(e);
		var t = e;
		module$contents$jspb$internal_bytes_HANDLE_WEB_SAFE_ENCODINGS_WITH_ATOB_AND_BTOA && (t = module$contents$jspb$internal_bytes_replaceWebsafeString(t));
		let n;
		if (goog.DEBUG) try {
			n = atob(t);
		} catch (t) {
			throw Error(`invalid encoding '${e}': ${t}`);
		}
		else n = atob(t);
		for (e = new Uint8Array(n.length), t = 0; t < n.length; t++) e[t] = n.charCodeAt(t);
		return e;
	}
	function module$contents$jspb$internal_bytes_dataAsU8(e) {
		return e == null || module$contents$jspb$internal_bytes_isU8(e) ? e : typeof e == "string" ? module$contents$jspb$internal_bytes_decodeByteArray(e) : ((0, goog.asserts.fail)("Cannot coerce to Uint8Array: " + goog.typeOf(e)), null);
	}
	function module$contents$jspb$internal_bytes_isU8(e) {
		return module$exports$jspb$internal_bytes.SUPPORTS_UINT8ARRAY && e != null && e instanceof Uint8Array;
	}
	function module$contents$jspb$internal_bytes_uint8ArrayEquals(e, t) {
		let n = e.length;
		if (n !== t.length) return !1;
		for (let r = 0; r < n; r++) if (e[r] !== t[r]) return !1;
		return !0;
	}
	module$exports$jspb$internal_bytes.I_AM_INTERNAL = {}, module$exports$jspb$internal_bytes.encodeByteArray = module$contents$jspb$internal_bytes_encodeByteArray, module$exports$jspb$internal_bytes.decodeByteArray = module$contents$jspb$internal_bytes_decodeByteArray, module$exports$jspb$internal_bytes.dataAsU8 = module$contents$jspb$internal_bytes_dataAsU8, module$exports$jspb$internal_bytes.isU8 = module$contents$jspb$internal_bytes_isU8, module$exports$jspb$internal_bytes.replaceWebsafeString = module$contents$jspb$internal_bytes_replaceWebsafeString, module$exports$jspb$internal_bytes.uint8ArrayEquals = module$contents$jspb$internal_bytes_uint8ArrayEquals, jspb.binary = {}, jspb.binary.utf8 = {};
	var module$contents$jspb$binary$utf8_USE_TEXT_ENCODING = !0, module$contents$jspb$binary$utf8_ASSUME_TEXT_ENCODING_AVAILABLE = 2020 <= goog.FEATURESET_YEAR, module$contents$jspb$binary$utf8_MIN_SURROGATE = 55296, module$contents$jspb$binary$utf8_MIN_HIGH_SURROGATE = module$contents$jspb$binary$utf8_MIN_SURROGATE, module$contents$jspb$binary$utf8_MAX_HIGH_SURROGATE = 56319, module$contents$jspb$binary$utf8_MIN_LOW_SURROGATE = 56320, module$contents$jspb$binary$utf8_MAX_LOW_SURROGATE = 57343, module$contents$jspb$binary$utf8_MAX_SURROGATE = module$contents$jspb$binary$utf8_MAX_LOW_SURROGATE;
	function module$contents$jspb$binary$utf8_isNotTrailingByte(e) {
		return (e & 192) != 128;
	}
	function module$contents$jspb$binary$utf8_invalid(e, t) {
		if (e) throw Error("Invalid UTF8");
		t.push(65533);
	}
	function module$contents$jspb$binary$utf8_codeUnitsToString(e, t) {
		return t = String.fromCharCode.apply(null, t), e == null ? t : e + t;
	}
	function module$contents$jspb$binary$utf8_polyfillDecodeUtf8(e, t, n, r) {
		n = t + n;
		let i = [], o = null, s, c, l;
		for (; t < n;) {
			var u = e[t++];
			128 > u ? i.push(u) : 224 > u ? t >= n ? module$contents$jspb$binary$utf8_invalid(r, i) : (s = e[t++], 194 > u || module$contents$jspb$binary$utf8_isNotTrailingByte(s) ? (t--, module$contents$jspb$binary$utf8_invalid(r, i)) : (u = (u & 31) << 6 | s & 63, (0, goog.asserts.assert)(128 <= u && 2047 >= u), i.push(u))) : 240 > u ? t >= n - 1 ? module$contents$jspb$binary$utf8_invalid(r, i) : (s = e[t++], module$contents$jspb$binary$utf8_isNotTrailingByte(s) || u === 224 && 160 > s || u === 237 && 160 <= s || module$contents$jspb$binary$utf8_isNotTrailingByte(c = e[t++]) ? (t--, module$contents$jspb$binary$utf8_invalid(r, i)) : (u = (u & 15) << 12 | (s & 63) << 6 | c & 63, (0, goog.asserts.assert)(2048 <= u && 65535 >= u), (0, goog.asserts.assert)(u < module$contents$jspb$binary$utf8_MIN_SURROGATE || u > module$contents$jspb$binary$utf8_MAX_LOW_SURROGATE), i.push(u))) : 244 >= u ? t >= n - 2 ? module$contents$jspb$binary$utf8_invalid(r, i) : (s = e[t++], module$contents$jspb$binary$utf8_isNotTrailingByte(s) || (u << 28) + (s - 144) >> 30 || module$contents$jspb$binary$utf8_isNotTrailingByte(c = e[t++]) || module$contents$jspb$binary$utf8_isNotTrailingByte(l = e[t++]) ? (t--, module$contents$jspb$binary$utf8_invalid(r, i)) : (u = (u & 7) << 18 | (s & 63) << 12 | (c & 63) << 6 | l & 63, (0, goog.asserts.assert)(65536 <= u && 1114111 >= u), u -= 65536, i.push((u >> 10 & 1023) + module$contents$jspb$binary$utf8_MIN_SURROGATE, (u & 1023) + module$contents$jspb$binary$utf8_MIN_LOW_SURROGATE))) : module$contents$jspb$binary$utf8_invalid(r, i), 8192 <= i.length && (o = module$contents$jspb$binary$utf8_codeUnitsToString(o, i), i.length = 0);
		}
		return (0, goog.asserts.assert)(t === n, `expected ${t} === ${n}`), module$contents$jspb$binary$utf8_codeUnitsToString(o, i);
	}
	var module$contents$jspb$binary$utf8_isFatalTextDecoderCachableAfterThrowing_ = 2020 <= goog.FEATURESET_YEAR || void 0;
	function module$contents$jspb$binary$utf8_isFatalTextDecoderCachableAfterThrowing(e) {
		if (module$contents$jspb$binary$utf8_isFatalTextDecoderCachableAfterThrowing_ === void 0) {
			try {
				e.decode(new Uint8Array([128]));
			} catch {}
			try {
				e.decode(new Uint8Array([97])), module$contents$jspb$binary$utf8_isFatalTextDecoderCachableAfterThrowing_ = !0;
			} catch {
				module$contents$jspb$binary$utf8_isFatalTextDecoderCachableAfterThrowing_ = !1;
			}
		}
		return module$contents$jspb$binary$utf8_isFatalTextDecoderCachableAfterThrowing_;
	}
	var module$contents$jspb$binary$utf8_fatalDecoderInstance;
	function module$contents$jspb$binary$utf8_getFatalDecoderInstance() {
		let e = module$contents$jspb$binary$utf8_fatalDecoderInstance;
		return e ||= module$contents$jspb$binary$utf8_fatalDecoderInstance = new TextDecoder("utf-8", { fatal: !0 }), e;
	}
	var module$contents$jspb$binary$utf8_nonFatalDecoderInstance;
	function module$contents$jspb$binary$utf8_getNonFatalDecoderInstance() {
		let e = module$contents$jspb$binary$utf8_nonFatalDecoderInstance;
		return e ||= module$contents$jspb$binary$utf8_nonFatalDecoderInstance = new TextDecoder("utf-8", { fatal: !1 }), e;
	}
	function module$contents$jspb$binary$utf8_subarray(e, t, n) {
		return t === 0 && n === e.length ? e : e.subarray(t, n);
	}
	function module$contents$jspb$binary$utf8_textDecoderDecodeUtf8(e, t, n, r) {
		let i = r ? module$contents$jspb$binary$utf8_getFatalDecoderInstance() : module$contents$jspb$binary$utf8_getNonFatalDecoderInstance();
		e = module$contents$jspb$binary$utf8_subarray(e, t, t + n);
		try {
			return i.decode(e);
		} catch (e) {
			throw r && !module$contents$jspb$binary$utf8_isFatalTextDecoderCachableAfterThrowing(i) && (module$contents$jspb$binary$utf8_fatalDecoderInstance = void 0), e;
		}
	}
	var module$contents$jspb$binary$utf8_useTextDecoderDecode = module$contents$jspb$binary$utf8_USE_TEXT_ENCODING && (module$contents$jspb$binary$utf8_ASSUME_TEXT_ENCODING_AVAILABLE || typeof TextDecoder < "u");
	function module$contents$jspb$binary$utf8_decodeUtf8(e, t, n, r) {
		return module$contents$jspb$binary$utf8_useTextDecoderDecode ? module$contents$jspb$binary$utf8_textDecoderDecodeUtf8(e, t, n, r) : module$contents$jspb$binary$utf8_polyfillDecodeUtf8(e, t, n, r);
	}
	var module$contents$jspb$binary$utf8_textEncoderInstance;
	function module$contents$jspb$binary$utf8_textEncoderEncode(e, t) {
		return t && module$contents$jspb$binary$utf8_checkWellFormed(e), (module$contents$jspb$binary$utf8_textEncoderInstance ||= new TextEncoder()).encode(e);
	}
	var module$contents$jspb$binary$utf8_IS_WELL_FORMED = "isWellFormed", module$contents$jspb$binary$utf8_HAS_WELL_FORMED_METHOD = 2023 < goog.FEATURESET_YEAR || typeof String.prototype[module$contents$jspb$binary$utf8_IS_WELL_FORMED] == "function";
	function module$contents$jspb$binary$utf8_checkWellFormed(e) {
		if (module$contents$jspb$binary$utf8_HAS_WELL_FORMED_METHOD ? !e[module$contents$jspb$binary$utf8_IS_WELL_FORMED]() : /(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(e)) throw Error("Found an unpaired surrogate");
	}
	function module$contents$jspb$binary$utf8_polyfillEncode(e, t) {
		let n = 0, r = new Uint8Array(3 * e.length);
		for (let o = 0; o < e.length; o++) {
			var i = e.charCodeAt(o);
			if (128 > i) r[n++] = i;
			else {
				if (2048 > i) r[n++] = i >> 6 | 192;
				else {
					if ((0, goog.asserts.assert)(65536 > i), i >= module$contents$jspb$binary$utf8_MIN_SURROGATE && i <= module$contents$jspb$binary$utf8_MAX_LOW_SURROGATE) {
						if (i <= module$contents$jspb$binary$utf8_MAX_HIGH_SURROGATE && o < e.length) {
							let t = e.charCodeAt(++o);
							if (t >= module$contents$jspb$binary$utf8_MIN_LOW_SURROGATE && t <= module$contents$jspb$binary$utf8_MAX_LOW_SURROGATE) {
								i = 1024 * (i - module$contents$jspb$binary$utf8_MIN_SURROGATE) + t - module$contents$jspb$binary$utf8_MIN_LOW_SURROGATE + 65536, r[n++] = i >> 18 | 240, r[n++] = i >> 12 & 63 | 128, r[n++] = i >> 6 & 63 | 128, r[n++] = i & 63 | 128;
								continue;
							}
							o--;
						}
						if (t) throw Error("Found an unpaired surrogate");
						i = 65533;
					}
					r[n++] = i >> 12 | 224, r[n++] = i >> 6 & 63 | 128;
				}
				r[n++] = i & 63 | 128;
			}
		}
		return module$contents$jspb$binary$utf8_subarray(r, 0, n);
	}
	var module$contents$jspb$binary$utf8_useTextEncoderEncode = module$contents$jspb$binary$utf8_USE_TEXT_ENCODING && (module$contents$jspb$binary$utf8_ASSUME_TEXT_ENCODING_AVAILABLE || typeof TextEncoder < "u");
	function module$contents$jspb$binary$utf8_encodeUtf8(e, t = !1) {
		return (0, goog.asserts.assertString)(e), module$contents$jspb$binary$utf8_useTextEncoderEncode ? module$contents$jspb$binary$utf8_textEncoderEncode(e, t) : module$contents$jspb$binary$utf8_polyfillEncode(e, t);
	}
	jspb.binary.utf8.decodeUtf8 = module$contents$jspb$binary$utf8_decodeUtf8, jspb.binary.utf8.encodeUtf8 = module$contents$jspb$binary$utf8_encodeUtf8, jspb.binary.utf8.checkWellFormed = module$contents$jspb$binary$utf8_checkWellFormed, jspb.binary.utf8.textDecoderDecodeUtf8 = module$contents$jspb$binary$utf8_textDecoderDecodeUtf8, jspb.binary.utf8.polyfillDecodeUtf8 = module$contents$jspb$binary$utf8_polyfillDecodeUtf8, jspb.binary.utf8.textEncoderEncode = module$contents$jspb$binary$utf8_textEncoderEncode, jspb.binary.utf8.polyfillEncode = module$contents$jspb$binary$utf8_polyfillEncode, jspb.bytestring = {};
	var module$contents$jspb$bytestring_ByteString = class e {
		static fromBase64(t) {
			return (0, goog.asserts.assertString)(t), t ? new e(t, module$exports$jspb$internal_bytes.I_AM_INTERNAL) : e.empty();
		}
		static fromUint8Array(t) {
			return (0, goog.asserts.assert)(t instanceof Uint8Array || Array.isArray(t)), t.length ? new e(new Uint8Array(t), module$exports$jspb$internal_bytes.I_AM_INTERNAL) : e.empty();
		}
		static fromStringUtf8(t) {
			return (0, goog.asserts.assertString)(t), t.length ? new e(module$contents$jspb$binary$utf8_encodeUtf8(t, !0), module$exports$jspb$internal_bytes.I_AM_INTERNAL) : e.empty();
		}
		static async fromBlob(t) {
			return (0, goog.asserts.assertInstanceof)(t, Blob), t.size === 0 ? e.empty() : (t = await t.arrayBuffer(), new e(new Uint8Array(t), module$exports$jspb$internal_bytes.I_AM_INTERNAL));
		}
		static empty() {
			return module$contents$jspb$bytestring_emptyByteString ||= new e(null, module$exports$jspb$internal_bytes.I_AM_INTERNAL);
		}
		asBase64() {
			let e = this.value_;
			return e == null ? "" : typeof e == "string" ? e : this.value_ = module$contents$jspb$internal_bytes_encodeByteArray(e);
		}
		asUint8Array() {
			return new Uint8Array(this.internalBytesUnsafe(module$exports$jspb$internal_bytes.I_AM_INTERNAL) || 0);
		}
		isEmpty() {
			return this.value_ == null;
		}
		sizeBytes() {
			let e = this.internalBytesUnsafe(module$exports$jspb$internal_bytes.I_AM_INTERNAL);
			return e ? e.length : 0;
		}
		unsignedByteAt(e) {
			(0, goog.asserts.assertNumber)(e), (0, goog.asserts.assert)(0 <= e, "index %s should be non-negative", e);
			let t = this.internalBytesUnsafe(module$exports$jspb$internal_bytes.I_AM_INTERNAL);
			return (0, goog.asserts.assert)(e < t.length, "index %s must be less than %s", e, t.length), t[e];
		}
		signedByteAt(e) {
			return this.unsignedByteAt(e) << 24 >> 24;
		}
		asStringUtf8({ parsingErrorsAreFatal: e = !0 } = {}) {
			let t = this.internalBytesUnsafe(module$exports$jspb$internal_bytes.I_AM_INTERNAL);
			return t ? module$contents$jspb$binary$utf8_decodeUtf8(t, 0, t.length, e) : "";
		}
		asBlob(e) {
			let t = this.internalBytesUnsafe(module$exports$jspb$internal_bytes.I_AM_INTERNAL);
			return t ? new Blob([t], e) : new Blob([], e);
		}
		internalBytesUnsafe(e) {
			return module$contents$jspb$bytestring_checkAllowedCaller(e), e = module$contents$jspb$internal_bytes_dataAsU8(this.value_), e == null ? e : this.value_ = e;
		}
		internalUnwrap(e) {
			return module$contents$jspb$bytestring_checkAllowedCaller(e), this.value_ || "";
		}
		constructor(e, t) {
			if (module$contents$jspb$bytestring_checkAllowedCaller(t), this.value_ = e, e != null && e.length === 0) throw Error("ByteString should be constructed with non-empty values");
		}
	}, module$contents$jspb$bytestring_emptyByteString;
	function module$contents$jspb$bytestring_checkAllowedCaller(e) {
		if (e !== module$exports$jspb$internal_bytes.I_AM_INTERNAL) throw Error("illegal external caller");
	}
	jspb.bytestring.ByteString = module$contents$jspb$bytestring_ByteString;
	var module$exports$jspb$unsafe_bytestring = {};
	function module$contents$jspb$unsafe_bytestring_unsafeByteStringFromUint8Array(e) {
		return (0, goog.asserts.assertInstanceof)(e, Uint8Array), e.length == 0 ? module$contents$jspb$bytestring_ByteString.empty() : new module$contents$jspb$bytestring_ByteString(e, module$exports$jspb$internal_bytes.I_AM_INTERNAL);
	}
	function module$contents$jspb$unsafe_bytestring_unsafeUint8ArrayFromByteString(e) {
		return (0, goog.asserts.assertInstanceof)(e, module$contents$jspb$bytestring_ByteString), e.internalBytesUnsafe(module$exports$jspb$internal_bytes.I_AM_INTERNAL) || /* @__PURE__ */ new Uint8Array();
	}
	function module$contents$jspb$unsafe_bytestring_unsafeUnwrapByteString(e) {
		return (0, goog.asserts.assertInstanceof)(e, module$contents$jspb$bytestring_ByteString), e.internalUnwrap(module$exports$jspb$internal_bytes.I_AM_INTERNAL);
	}
	module$exports$jspb$unsafe_bytestring.unsafeByteStringFromUint8Array = module$contents$jspb$unsafe_bytestring_unsafeByteStringFromUint8Array, module$exports$jspb$unsafe_bytestring.unsafeUint8ArrayFromByteString = module$contents$jspb$unsafe_bytestring_unsafeUint8ArrayFromByteString, module$exports$jspb$unsafe_bytestring.unsafeUnwrapByteString = module$contents$jspb$unsafe_bytestring_unsafeUnwrapByteString, jspb.utils = {};
	var module$contents$jspb$utils_SUPPORTS_UINT8ARRAY_SLICING = 2018 <= goog.FEATURESET_YEAR || typeof Uint8Array.prototype.slice == "function", module$contents$jspb$utils_MAX_SCRATCHPAD_BYTES = 8;
	function module$contents$jspb$utils_sliceUint8Array(e, t, n) {
		return t === n ? /* @__PURE__ */ new Uint8Array() : module$contents$jspb$utils_SUPPORTS_UINT8ARRAY_SLICING ? e.slice(t, n) : new Uint8Array(e.subarray(t, n));
	}
	var module$contents$jspb$utils_split64Low = 0, module$contents$jspb$utils_split64High = 0, module$contents$jspb$utils_scratchpad;
	function module$contents$jspb$utils_splitUint64(e) {
		let t = e >>> 0;
		e = (e - t) / module$contents$jspb$BinaryConstants_TWO_TO_32 >>> 0, module$contents$jspb$utils_split64Low = t, module$contents$jspb$utils_split64High = e;
	}
	function module$contents$jspb$utils_splitInt64(e) {
		if (0 > e) {
			module$contents$jspb$utils_splitUint64(0 - e);
			let [t, n] = module$contents$jspb$utils_negate(module$contents$jspb$utils_split64Low, module$contents$jspb$utils_split64High);
			module$contents$jspb$utils_split64Low = t >>> 0, module$contents$jspb$utils_split64High = n >>> 0;
		} else module$contents$jspb$utils_splitUint64(e);
	}
	function module$contents$jspb$utils_splitZigzag64(e) {
		let t = 0 > e;
		e = 2 * Math.abs(e), module$contents$jspb$utils_splitUint64(e), e = module$contents$jspb$utils_split64Low;
		let n = module$contents$jspb$utils_split64High;
		t && (e == 0 ? n == 0 ? n = e = 4294967295 : (n--, e = 4294967295) : e--), module$contents$jspb$utils_split64Low = e, module$contents$jspb$utils_split64High = n;
	}
	function module$contents$jspb$utils_getScratchpad(e) {
		return (0, goog.asserts.assert)(e <= module$contents$jspb$utils_MAX_SCRATCHPAD_BYTES), module$contents$jspb$utils_scratchpad ||= new DataView(new ArrayBuffer(module$contents$jspb$utils_MAX_SCRATCHPAD_BYTES));
	}
	function module$contents$jspb$utils_splitFloat32(e) {
		let t = module$contents$jspb$utils_getScratchpad(4);
		t.setFloat32(0, +e, !0), module$contents$jspb$utils_split64High = 0, module$contents$jspb$utils_split64Low = t.getUint32(0, !0);
	}
	function module$contents$jspb$utils_splitFloat64(e) {
		let t = module$contents$jspb$utils_getScratchpad(8);
		t.setFloat64(0, +e, !0), module$contents$jspb$utils_split64Low = t.getUint32(0, !0), module$contents$jspb$utils_split64High = t.getUint32(4, !0);
	}
	function module$contents$jspb$utils_splitBytes64(e) {
		let [t, n, r, i, o, s, c, l] = e;
		module$contents$jspb$utils_split64Low = t + (n << 8) + (r << 16) + (i << 24) >>> 0, module$contents$jspb$utils_split64High = o + (s << 8) + (c << 16) + (l << 24) >>> 0;
	}
	function module$contents$jspb$utils_joinUint64(e, t) {
		let n = t * module$contents$jspb$BinaryConstants_TWO_TO_32 + (e >>> 0);
		return Number.isSafeInteger(n) ? n : module$contents$jspb$utils_joinUnsignedDecimalString(e, t);
	}
	function module$contents$jspb$utils_joinInt64(e, t) {
		let n = t & 2147483648;
		return n && (e = ~e + 1 >>> 0, t = ~t >>> 0, e == 0 && (t = t + 1 >>> 0)), e = module$contents$jspb$utils_joinUint64(e, t), typeof e == "number" ? n ? -e : e : n ? "-" + e : e;
	}
	function module$contents$jspb$utils_toZigzag32(e) {
		return (e << 1 ^ e >> 31) >>> 0;
	}
	function module$contents$jspb$utils_toZigzag64(e, t, n) {
		let r = t >> 31;
		return t = (t << 1 | e >>> 31) ^ r, e = e << 1 ^ r, n(e, t);
	}
	function module$contents$jspb$utils_joinZigzag64(e, t) {
		return module$contents$jspb$utils_fromZigzag64(e, t, module$contents$jspb$utils_joinInt64);
	}
	function module$contents$jspb$utils_fromZigzag32(e) {
		return e >>> 1 ^ -(e & 1);
	}
	function module$contents$jspb$utils_fromZigzag64(e, t, n) {
		let r = -(e & 1);
		return e = (e >>> 1 | t << 31) ^ r, t = t >>> 1 ^ r, n(e, t);
	}
	function module$contents$jspb$utils_joinFloat32(e, t) {
		t = 2 * (e >> 31) + 1;
		let n = e >>> 23 & 255;
		return e &= 8388607, n == 255 ? e ? NaN : Infinity * t : n == 0 ? t * 2 ** -149 * e : t * 2 ** (n - 150) * (e + 2 ** 23);
	}
	function module$contents$jspb$utils_joinFloat64(e, t) {
		let n = 2 * (t >> 31) + 1, r = t >>> 20 & 2047;
		return e = module$contents$jspb$BinaryConstants_TWO_TO_32 * (t & 1048575) + e, r == 2047 ? e ? NaN : Infinity * n : r == 0 ? n * 2 ** -1074 * e : n * 2 ** (r - 1075) * (e + module$contents$jspb$BinaryConstants_TWO_TO_52);
	}
	function module$contents$jspb$utils_joinUnsignedDecimalString(e, t) {
		return t >>>= 0, e >>>= 0, 2097151 >= t ? "" + (module$contents$jspb$BinaryConstants_TWO_TO_32 * t + e) : module$contents$jspb$internal_options_isBigIntAvailable() ? "" + (BigInt(t) << BigInt(32) | BigInt(e)) : module$contents$jspb$utils_joinUnsignedDecimalStringFallback(e, t);
	}
	function module$contents$jspb$utils_joinUnsignedDecimalStringFallback(e, t) {
		var n = (e >>> 24 | t << 8) & module$contents$jspb$utils_LOW_24_BITS;
		return t = t >> 16 & module$contents$jspb$utils_LOW_16_BITS, e = (e & module$contents$jspb$utils_LOW_24_BITS) + 6777216 * n + 6710656 * t, n += 8147497 * t, t *= 2, 1e7 <= e && (n += e / 1e7 >>> 0, e %= 1e7), 1e7 <= n && (t += n / 1e7 >>> 0, n %= 1e7), (0, goog.asserts.assert)(t), t + module$contents$jspb$utils_decimalFrom1e7WithLeadingZeros(n) + module$contents$jspb$utils_decimalFrom1e7WithLeadingZeros(e);
	}
	function module$contents$jspb$utils_decimalFrom1e7WithLeadingZeros(e) {
		return e = String(e), "0000000".slice(e.length) + e;
	}
	function module$contents$jspb$utils_joinSignedDecimalString(e, t) {
		return t & 2147483648 ? module$contents$jspb$internal_options_isBigIntAvailable() ? "" + (BigInt(t | 0) << BigInt(32) | BigInt(e >>> 0)) : module$contents$jspb$utils_joinNegativeDecimalStringFallback(e, t) : module$contents$jspb$utils_joinUnsignedDecimalString(e, t);
	}
	function module$contents$jspb$utils_joinSignedNumberOrDecimalString(e, t) {
		let n = module$contents$jspb$utils_joinInt64(e, t);
		return Number.isSafeInteger(n) ? n : module$contents$jspb$utils_joinSignedDecimalString(e, t);
	}
	function module$contents$jspb$utils_joinUnsignedNumberOrDecimalString(e, t) {
		t >>>= 0;
		let n = module$contents$jspb$utils_joinUint64(e, t);
		return Number.isSafeInteger(n) ? n : module$contents$jspb$utils_joinUnsignedDecimalString(e, t);
	}
	function module$contents$jspb$utils_joinNegativeDecimalStringFallback(e, t) {
		let [n, r] = module$contents$jspb$utils_negate(e, t);
		return e = n, t = r, "-" + module$contents$jspb$utils_joinUnsignedDecimalString(e, t);
	}
	function module$contents$jspb$utils_splitDecimalString(e) {
		(0, goog.asserts.assert)(0 < e.length), e.length < module$contents$jspb$utils_MAX_SAFE_INTEGER_DECIMAL_LENGTH ? module$contents$jspb$utils_splitInt64(Number(e)) : module$contents$jspb$internal_options_isBigIntAvailable() ? (e = BigInt(e), module$contents$jspb$utils_split64Low = Number(e & BigInt(module$contents$jspb$utils_ALL_32_BITS)) >>> 0, module$contents$jspb$utils_split64High = Number(e >> BigInt(32) & BigInt(module$contents$jspb$utils_ALL_32_BITS))) : module$contents$jspb$utils_splitDecimalStringFallback(e);
	}
	function module$contents$jspb$utils_splitDecimalStringFallback(e) {
		(0, goog.asserts.assert)(0 < e.length);
		let t = +(e[0] === "-");
		module$contents$jspb$utils_split64High = module$contents$jspb$utils_split64Low = 0;
		let n = e.length;
		for (let r = 0 + t, i = (n - t) % 6 + t; i <= n; r = i, i += 6) {
			let t = Number(e.slice(r, i));
			module$contents$jspb$utils_split64High *= 1e6, module$contents$jspb$utils_split64Low = 1e6 * module$contents$jspb$utils_split64Low + t, module$contents$jspb$utils_split64Low >= module$contents$jspb$BinaryConstants_TWO_TO_32 && (module$contents$jspb$utils_split64High += Math.trunc(module$contents$jspb$utils_split64Low / module$contents$jspb$BinaryConstants_TWO_TO_32), module$contents$jspb$utils_split64High >>>= 0, module$contents$jspb$utils_split64Low >>>= 0);
		}
		if (t) {
			let [e, t] = module$contents$jspb$utils_negate(module$contents$jspb$utils_split64Low, module$contents$jspb$utils_split64High);
			module$contents$jspb$utils_split64Low = e, module$contents$jspb$utils_split64High = t;
		}
	}
	function module$contents$jspb$utils_negate(e, t) {
		return t = ~t, e ? e = ~e + 1 : t += 1, [e, t];
	}
	function module$contents$jspb$utils_countVarints(e, t, n) {
		let r = 0;
		for (let i = t; i < n; i++) r += e[i] >> 7;
		return n - t - r;
	}
	function module$contents$jspb$utils_countVarintFields(e, t, n, r) {
		let i = 0;
		if (r = 8 * r + module$contents$jspb$BinaryConstants_WireType.VARINT, 128 > r) for (; t < n && e[t++] == r;) for (i++; e[t++] & 128;);
		else for (; t < n;) {
			let n = r;
			for (; 128 < n;) {
				if (e[t] != (n & 127 | 128)) return i;
				t++, n >>= 7;
			}
			if (e[t++] != n) break;
			for (i++; e[t++] & 128;);
		}
		return i;
	}
	function module$contents$jspb$utils_countFixedFields_(e, t, n, r, i) {
		let o = 0;
		if (128 > r) for (; t < n && e[t++] == r;) o++, t += i;
		else for (; t < n;) {
			let n = r;
			for (; 128 < n;) {
				if (e[t++] != (n & 127 | 128)) return o;
				n >>= 7;
			}
			if (e[t++] != n) break;
			o++, t += i;
		}
		return o;
	}
	function module$contents$jspb$utils_countFixed32Fields(e, t, n, r) {
		return module$contents$jspb$utils_countFixedFields_(e, t, n, 8 * r + module$contents$jspb$BinaryConstants_WireType.FIXED32, 4);
	}
	function module$contents$jspb$utils_countFixed64Fields(e, t, n, r) {
		return module$contents$jspb$utils_countFixedFields_(e, t, n, 8 * r + module$contents$jspb$BinaryConstants_WireType.FIXED64, 8);
	}
	function module$contents$jspb$utils_countDelimitedFields(e, t, n, r) {
		let i = 0;
		for (r = 8 * r + module$contents$jspb$BinaryConstants_WireType.DELIMITED; t < n;) {
			let n = r;
			for (; 128 < n;) {
				if (e[t++] != (n & 127 | 128)) return i;
				n >>= 7;
			}
			if (e[t++] != n) break;
			i++;
			let o = 0, s = 1;
			for (; n = e[t++], o += (n & 127) * s, s *= 128, n & 128;);
			t += o;
		}
		return i;
	}
	function module$contents$jspb$utils_byteSourceToUint8Array(e, t) {
		if (e.constructor === Uint8Array) return e;
		if (e.constructor === ArrayBuffer || e.constructor === Array) return new Uint8Array(e);
		if (e.constructor === String) return (0, goog.crypt.base64.decodeStringToUint8Array)(e);
		if (e.constructor === module$contents$jspb$bytestring_ByteString) return t ? e.asUint8Array() : module$contents$jspb$unsafe_bytestring_unsafeUint8ArrayFromByteString(e);
		if (e instanceof Uint8Array) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
		throw Error("Type not convertible to a Uint8Array, expected a Uint8Array, an ArrayBuffer, a base64 encoded string, or Array of numbers");
	}
	function module$contents$jspb$utils_getSplit64Low() {
		return module$contents$jspb$utils_split64Low;
	}
	function module$contents$jspb$utils_getSplit64High() {
		return module$contents$jspb$utils_split64High;
	}
	function module$contents$jspb$utils_makeTag(e, t) {
		return 8 * e + t;
	}
	var module$contents$jspb$utils_LOW_16_BITS = 65535, module$contents$jspb$utils_LOW_24_BITS = 16777215, module$contents$jspb$utils_ALL_32_BITS = 4294967295, module$contents$jspb$utils_MAX_SAFE_INTEGER_DECIMAL_LENGTH = 16;
	jspb.utils.byteSourceToUint8Array = module$contents$jspb$utils_byteSourceToUint8Array, jspb.utils.countDelimitedFields = module$contents$jspb$utils_countDelimitedFields, jspb.utils.countFixed32Fields = module$contents$jspb$utils_countFixed32Fields, jspb.utils.countFixed64Fields = module$contents$jspb$utils_countFixed64Fields, jspb.utils.countVarintFields = module$contents$jspb$utils_countVarintFields, jspb.utils.countVarints = module$contents$jspb$utils_countVarints, jspb.utils.fromZigzag32 = module$contents$jspb$utils_fromZigzag32, jspb.utils.fromZigzag64 = module$contents$jspb$utils_fromZigzag64, jspb.utils.getSplit64High = module$contents$jspb$utils_getSplit64High, jspb.utils.getSplit64Low = module$contents$jspb$utils_getSplit64Low, jspb.utils.joinFloat32 = module$contents$jspb$utils_joinFloat32, jspb.utils.joinFloat64 = module$contents$jspb$utils_joinFloat64, jspb.utils.joinInt64 = module$contents$jspb$utils_joinInt64, jspb.utils.joinNegativeDecimalStringFallback = module$contents$jspb$utils_joinNegativeDecimalStringFallback, jspb.utils.joinSignedDecimalString = module$contents$jspb$utils_joinSignedDecimalString, jspb.utils.joinSignedNumberOrDecimalString = module$contents$jspb$utils_joinSignedNumberOrDecimalString, jspb.utils.joinUint64 = module$contents$jspb$utils_joinUint64, jspb.utils.joinUnsignedDecimalString = module$contents$jspb$utils_joinUnsignedDecimalString, jspb.utils.joinUnsignedDecimalStringFallback = module$contents$jspb$utils_joinUnsignedDecimalStringFallback, jspb.utils.joinUnsignedNumberOrDecimalString = module$contents$jspb$utils_joinUnsignedNumberOrDecimalString, jspb.utils.joinZigzag64 = module$contents$jspb$utils_joinZigzag64, jspb.utils.makeTag = module$contents$jspb$utils_makeTag, jspb.utils.sliceUint8Array = module$contents$jspb$utils_sliceUint8Array, jspb.utils.splitDecimalString = module$contents$jspb$utils_splitDecimalString, jspb.utils.splitDecimalStringFallback = module$contents$jspb$utils_splitDecimalStringFallback, jspb.utils.splitFloat32 = module$contents$jspb$utils_splitFloat32, jspb.utils.splitFloat64 = module$contents$jspb$utils_splitFloat64, jspb.utils.splitInt64 = module$contents$jspb$utils_splitInt64, jspb.utils.splitUint64 = module$contents$jspb$utils_splitUint64, jspb.utils.splitZigzag64 = module$contents$jspb$utils_splitZigzag64, jspb.utils.toZigzag32 = module$contents$jspb$utils_toZigzag32, jspb.utils.toZigzag64 = module$contents$jspb$utils_toZigzag64;
	var module$exports$jspb$binary$internal_buffer = { Buffer: class {
		constructor(e, t, n) {
			if (this.buffer = e, (this.bufferAsByteStringInternal = n) && !t) throw goog.DEBUG ? Error("Buffer must be immutable if a ByteString is provided.") : Error();
			this.isImmutable = t;
		}
		getBufferAsByteStringIfImmutable() {
			if (!this.isImmutable) throw goog.DEBUG ? Error("Cannot get ByteString from mutable buffer.") : Error();
			return this.buffer == null ? null : this.bufferAsByteStringInternal ??= module$contents$jspb$unsafe_bytestring_unsafeByteStringFromUint8Array(this.buffer);
		}
	} };
	function module$contents$jspb$binary$internal_buffer_bufferFromSource(e, t) {
		if (typeof e == "string") return new module$exports$jspb$binary$internal_buffer.Buffer(module$contents$jspb$internal_bytes_decodeByteArray(e), t);
		if (Array.isArray(e)) return new module$exports$jspb$binary$internal_buffer.Buffer(new Uint8Array(e), t);
		if (e.constructor === Uint8Array) return new module$exports$jspb$binary$internal_buffer.Buffer(e, !1);
		if (e.constructor === ArrayBuffer) return e = new Uint8Array(e), new module$exports$jspb$binary$internal_buffer.Buffer(e, !1);
		if (e.constructor === module$contents$jspb$bytestring_ByteString) return t = module$contents$jspb$unsafe_bytestring_unsafeUint8ArrayFromByteString(e), new module$exports$jspb$binary$internal_buffer.Buffer(t, !0, e);
		if (e instanceof Uint8Array) return e = e.constructor === Uint8Array ? e : new Uint8Array(e.buffer, e.byteOffset, e.byteLength), new module$exports$jspb$binary$internal_buffer.Buffer(e, !1);
		throw goog.DEBUG ? Error("Type not convertible to a Uint8Array, expected a Uint8Array, an ArrayBuffer, a base64 encoded string, a ByteString or an Array of numbers") : Error();
	}
	module$exports$jspb$binary$internal_buffer.bufferFromSource = module$contents$jspb$binary$internal_buffer_bufferFromSource, jspb.binary.decoder = {};
	var module$contents$jspb$binary$decoder_MAX_VARINT_SIZE = 10, module$contents$jspb$binary$decoder_BinaryDecoder = class e {
		constructor(e, t, n, r) {
			this.buffer_ = this.bytes_ = null, this.bytesAreImmutable_ = !1, module$contents$jspb$binary$decoder_ASSUME_DATAVIEW_IS_FAST && (this.dataView_ = null), this.cursor_ = this.end_ = this.start_ = 0, this.init(e, t, n, r);
		}
		init(e, t, n, { aliasBytesFields: r = !1, treatNewDataAsImmutable: i = !1 } = {}) {
			this.aliasBytesFields = r, this.treatNewDataAsImmutable = i, e && this.setBlock(e, t, n);
		}
		static alloc(t, n, r, i) {
			if (e.instanceCache_.length) {
				let o = e.instanceCache_.pop();
				return o.init(t, n, r, i), o;
			}
			return new e(t, n, r, i);
		}
		free() {
			this.clear(), 100 > e.instanceCache_.length && e.instanceCache_.push(this);
		}
		clear() {
			this.buffer_ = this.bytes_ = null, this.bytesAreImmutable_ = !1, module$contents$jspb$binary$decoder_ASSUME_DATAVIEW_IS_FAST && (this.dataView_ = null), this.cursor_ = this.end_ = this.start_ = 0, this.aliasBytesFields = !1;
		}
		dataIsImmutable() {
			return this.bytesAreImmutable_;
		}
		getBuffer() {
			if (this.bytesAreImmutable_) throw goog.DEBUG ? Error("cannot access the buffer of decoders over immutable data.") : Error();
			return this.bytes_;
		}
		getBufferAsByteString() {
			if (this.buffer_ == null) return null;
			if (!this.bytesAreImmutable_) throw goog.DEBUG ? Error("cannot access the buffer of decoders over immutable data.") : Error();
			return this.buffer_.getBufferAsByteStringIfImmutable();
		}
		setBlock(e, t, n) {
			this.buffer_ = e = module$contents$jspb$binary$internal_buffer_bufferFromSource(e, this.treatNewDataAsImmutable), this.bytes_ = e.buffer, this.bytesAreImmutable_ = e.isImmutable, module$contents$jspb$binary$decoder_ASSUME_DATAVIEW_IS_FAST && (this.dataView_ = null), this.start_ = t || 0, this.end_ = n === void 0 ? this.bytes_.length : this.start_ + n, this.cursor_ = this.start_;
		}
		getEnd() {
			return this.end_;
		}
		setEnd(e) {
			this.end_ = e;
		}
		reset() {
			this.cursor_ = this.start_;
		}
		getCursor() {
			return this.cursor_;
		}
		setCursor(e) {
			this.cursor_ = e;
		}
		advance(e) {
			this.setCursorAndCheck(this.cursor_ + e);
		}
		atEnd() {
			return this.cursor_ == this.end_;
		}
		pastEnd() {
			return this.cursor_ > this.end_;
		}
		static readSplitVarint64(e, t) {
			let n, r = 0, i = 0, o = 0, s = e.bytes_, c = e.cursor_;
			do
				n = s[c++], r |= (n & 127) << o, o += 7;
			while (32 > o && n & 128);
			for (32 < o && (i |= (n & 127) >> 4), o = 3; 32 > o && n & 128; o += 7) n = s[c++], i |= (n & 127) << o;
			if (e.setCursorAndCheck(c), 128 > n) return t(r >>> 0, i >>> 0);
			throw module$contents$jspb$binary$errors_invalidVarintError();
		}
		static readSplitZigzagVarint64(t, n) {
			return e.readSplitVarint64(t, (e, t) => module$contents$jspb$utils_fromZigzag64(e, t, n));
		}
		static readSplitFixed64(e, t) {
			let n = e.bytes_, r = e.cursor_;
			e.advance(8);
			let i = e = 0;
			for (let t = r + 7; t >= r; t--) e = e << 8 | n[t], i = i << 8 | n[t + 4];
			return t(e, i);
		}
		skipVarint() {
			e.readBool(this);
		}
		setCursorAndCheck(e) {
			if (this.cursor_ = e, e > this.end_) throw module$contents$jspb$binary$errors_readTooFarError(this.end_, e);
		}
		static readSignedVarint32(e) {
			let t = e.bytes_, n = e.cursor_, r = t[n++], i = r & 127;
			if (r & 128 && (r = t[n++], i |= (r & 127) << 7, r & 128 && (r = t[n++], i |= (r & 127) << 14, r & 128 && (r = t[n++], i |= (r & 127) << 21, r & 128 && (r = t[n++], i |= r << 28, r & 128 && t[n++] & 128 && t[n++] & 128 && t[n++] & 128 && t[n++] & 128 && t[n++] & 128))))) throw module$contents$jspb$binary$errors_invalidVarintError();
			return e.setCursorAndCheck(n), i;
		}
		static readUnsignedVarint32(t) {
			return e.readSignedVarint32(t) >>> 0;
		}
		readUnsignedVarint32IfEqualTo(e) {
			goog.asserts.assert(e === e >>> 0);
			let t = this.cursor_, n = t, r = this.end_, i = this.bytes_;
			for (; n < r;) if (127 < e) {
				let t = 128 | e & 127;
				if (i[n++] !== t) break;
				e >>>= 7;
			} else {
				if (i[n++] === e) return this.cursor_ = n, t;
				break;
			}
			return -1;
		}
		static readZigzagVarint32(t) {
			return module$contents$jspb$utils_fromZigzag32(e.readUnsignedVarint32(t));
		}
		static readUnsignedVarint64(t) {
			return e.readSplitVarint64(t, module$contents$jspb$utils_joinUint64);
		}
		static readUnsignedVarint64String(t) {
			return e.readSplitVarint64(t, module$contents$jspb$utils_joinUnsignedDecimalString);
		}
		static readSignedVarint64(t) {
			return e.readSplitVarint64(t, module$contents$jspb$utils_joinInt64);
		}
		static readSignedVarint64String(t) {
			return e.readSplitVarint64(t, module$contents$jspb$utils_joinSignedDecimalString);
		}
		static readZigzagVarint64(t) {
			return e.readSplitVarint64(t, module$contents$jspb$utils_joinZigzag64);
		}
		static readZigzagVarint64String(t) {
			return e.readSplitZigzagVarint64(t, module$contents$jspb$utils_joinSignedDecimalString);
		}
		static readUint8(e) {
			let t = e.bytes_[e.cursor_ + 0];
			return e.advance(1), t;
		}
		static readUint16(e) {
			let t = e.bytes_[e.cursor_ + 0], n = e.bytes_[e.cursor_ + 1];
			return e.advance(2), t << 0 | n << 8;
		}
		static readUint32(e) {
			var t = e.bytes_;
			let n = e.cursor_, r = t[n + 0], i = t[n + 1], o = t[n + 2];
			return t = t[n + 3], e.advance(4), (r << 0 | i << 8 | o << 16 | t << 24) >>> 0;
		}
		static readUint64(t) {
			let n = e.readUint32(t);
			return t = e.readUint32(t), module$contents$jspb$utils_joinUint64(n, t);
		}
		static readUint64String(t) {
			let n = e.readUint32(t);
			return t = e.readUint32(t), module$contents$jspb$utils_joinUnsignedDecimalString(n, t);
		}
		static readInt8(e) {
			let t = e.bytes_[e.cursor_ + 0];
			return e.advance(1), t << 24 >> 24;
		}
		static readInt16(e) {
			let t = e.bytes_[e.cursor_ + 0], n = e.bytes_[e.cursor_ + 1];
			return e.advance(2), (t << 0 | n << 8) << 16 >> 16;
		}
		static readInt32(e) {
			var t = e.bytes_;
			let n = e.cursor_, r = t[n + 0], i = t[n + 1], o = t[n + 2];
			return t = t[n + 3], e.advance(4), r << 0 | i << 8 | o << 16 | t << 24;
		}
		static readInt64(t) {
			let n = e.readUint32(t);
			return t = e.readUint32(t), module$contents$jspb$utils_joinInt64(n, t);
		}
		static readInt64String(t) {
			let n = e.readUint32(t);
			return t = e.readUint32(t), module$contents$jspb$utils_joinSignedDecimalString(n, t);
		}
		static readFloat(t) {
			return t = e.readUint32(t), module$contents$jspb$utils_joinFloat32(t, 0);
		}
		static readDouble(t) {
			if (module$contents$jspb$binary$decoder_ASSUME_DATAVIEW_IS_FAST) {
				var n = t.getDataView().getFloat64(t.cursor_, !0);
				return t.advance(8), n;
			}
			return n = e.readUint32(t), t = e.readUint32(t), module$contents$jspb$utils_joinFloat64(n, t);
		}
		readDoubleArrayInto(t, n) {
			var r = this.cursor_, i = 8 * t;
			if (r + i > this.end_) throw module$contents$jspb$binary$errors_readTooFarError(i, this.end_ - r);
			var o = this.bytes_;
			if (r += o.byteOffset, module$contents$jspb$binary$decoder_ASSUME_DATAVIEW_IS_FAST) for (this.cursor_ += i, t = new DataView(o.buffer, r, i), i = 0; o = i + 8, !(o > t.byteLength);) n.push(t.getFloat64(i, !0)), i = o;
			else if (module$contents$jspb$binary$decoder_OPTIMIZE_LITTLE_ENDIAN_MACHINES && module$contents$jspb$binary$decoder_isLittleEndian()) for (this.cursor_ += i, t = new Float64Array(o.buffer.slice(r, r + i)), i = 0; i < t.length; i++) n.push(t[i]);
			else for (i = 0; i < t; i++) n.push(e.readDouble(this));
		}
		static readBool(e) {
			let t = 0, n = e.cursor_, r = n + module$contents$jspb$binary$decoder_MAX_VARINT_SIZE, i = e.bytes_;
			for (; n < r;) {
				let r = i[n++];
				if (t |= r, !(r & 128)) return e.setCursorAndCheck(n), !!(t & 127);
			}
			throw module$contents$jspb$binary$errors_invalidVarintError();
		}
		static readEnum(t) {
			return e.readSignedVarint32(t);
		}
		checkReadLengthAndAdvance(e) {
			if (0 > e) throw module$contents$jspb$binary$errors_negativeByteLengthError(e);
			let t = this.cursor_, n = t + e;
			if (n > this.end_) throw module$contents$jspb$binary$errors_readTooFarError(e, this.end_ - t);
			return this.cursor_ = n, t;
		}
		readString(e, t) {
			let n = this.checkReadLengthAndAdvance(e);
			return module$contents$jspb$binary$utf8_decodeUtf8(goog.asserts.assert(this.bytes_), n, e, t);
		}
		readBytes(e) {
			let t = this.checkReadLengthAndAdvance(e);
			return this.aliasBytesFields && !this.bytesAreImmutable_ ? this.bytes_.subarray(t, t + e) : module$contents$jspb$utils_sliceUint8Array(goog.asserts.assert(this.bytes_), t, t + e);
		}
		readByteString(e) {
			if (e == 0) return module$contents$jspb$bytestring_ByteString.empty();
			let t = this.checkReadLengthAndAdvance(e);
			return e = this.aliasBytesFields && this.bytesAreImmutable_ ? this.bytes_.subarray(t, t + e) : module$contents$jspb$utils_sliceUint8Array(goog.asserts.assert(this.bytes_), t, t + e), module$contents$jspb$unsafe_bytestring_unsafeByteStringFromUint8Array(e);
		}
		getDataView() {
			var e = this.dataView_;
			return e ||= (e = this.bytes_, this.dataView_ = new DataView(e.buffer, e.byteOffset, e.byteLength)), e;
		}
		static resetInstanceCache() {
			e.instanceCache_ = [];
		}
		static getInstanceCache() {
			return e.instanceCache_;
		}
	};
	goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "getInstanceCache", module$contents$jspb$binary$decoder_BinaryDecoder.getInstanceCache), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "resetInstanceCache", module$contents$jspb$binary$decoder_BinaryDecoder.resetInstanceCache), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "readByteString", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.readByteString), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "readBytes", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.readBytes), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "readString", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.readString), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readEnum", module$contents$jspb$binary$decoder_BinaryDecoder.readEnum), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readBool", module$contents$jspb$binary$decoder_BinaryDecoder.readBool), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "readDoubleArrayInto", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.readDoubleArrayInto), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readDouble", module$contents$jspb$binary$decoder_BinaryDecoder.readDouble), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readFloat", module$contents$jspb$binary$decoder_BinaryDecoder.readFloat), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readInt64String", module$contents$jspb$binary$decoder_BinaryDecoder.readInt64String), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readInt64", module$contents$jspb$binary$decoder_BinaryDecoder.readInt64), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readInt32", module$contents$jspb$binary$decoder_BinaryDecoder.readInt32), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readInt16", module$contents$jspb$binary$decoder_BinaryDecoder.readInt16), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readInt8", module$contents$jspb$binary$decoder_BinaryDecoder.readInt8), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readUint64String", module$contents$jspb$binary$decoder_BinaryDecoder.readUint64String), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readUint64", module$contents$jspb$binary$decoder_BinaryDecoder.readUint64), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readUint32", module$contents$jspb$binary$decoder_BinaryDecoder.readUint32), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readUint16", module$contents$jspb$binary$decoder_BinaryDecoder.readUint16), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readUint8", module$contents$jspb$binary$decoder_BinaryDecoder.readUint8), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readZigzagVarint64String", module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint64String), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readZigzagVarint64", module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint64), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readSignedVarint64String", module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint64String), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readSignedVarint64", module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint64), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readUnsignedVarint64String", module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint64String), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readUnsignedVarint64", module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint64), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readZigzagVarint32", module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint32), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "readUnsignedVarint32IfEqualTo", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.readUnsignedVarint32IfEqualTo), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readUnsignedVarint32", module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readSignedVarint32", module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint32), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "skipVarint", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.skipVarint), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readSplitFixed64", module$contents$jspb$binary$decoder_BinaryDecoder.readSplitFixed64), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readSplitZigzagVarint64", module$contents$jspb$binary$decoder_BinaryDecoder.readSplitZigzagVarint64), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "readSplitVarint64", module$contents$jspb$binary$decoder_BinaryDecoder.readSplitVarint64), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "pastEnd", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.pastEnd), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "atEnd", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.atEnd), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "advance", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.advance), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "setCursor", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.setCursor), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "getCursor", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.getCursor), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "reset", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.reset), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "setEnd", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.setEnd), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "getEnd", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.getEnd), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "setBlock", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.setBlock), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "getBufferAsByteString", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.getBufferAsByteString), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "getBuffer", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.getBuffer), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "dataIsImmutable", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.dataIsImmutable), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "clear", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.clear), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder.prototype, "free", module$contents$jspb$binary$decoder_BinaryDecoder.prototype.free), goog.exportProperty(module$contents$jspb$binary$decoder_BinaryDecoder, "alloc", module$contents$jspb$binary$decoder_BinaryDecoder.alloc), module$contents$jspb$binary$decoder_BinaryDecoder.instanceCache_ = [];
	function module$contents$jspb$binary$decoder_isLittleEndian() {
		return module$contents$jspb$binary$decoder_isLittleEndianCache === void 0 && (module$contents$jspb$binary$decoder_isLittleEndianCache = new Uint16Array(new Uint8Array([1, 2]).buffer)[0] == 513), goog.asserts.assertBoolean(module$contents$jspb$binary$decoder_isLittleEndianCache);
	}
	var module$contents$jspb$binary$decoder_isLittleEndianCache = void 0, module$contents$jspb$binary$decoder_ASSUME_DATAVIEW_IS_FAST = 2019 <= goog.FEATURESET_YEAR, module$contents$jspb$binary$decoder_OPTIMIZE_LITTLE_ENDIAN_MACHINES = !0;
	jspb.binary.decoder.BinaryDecoder = module$contents$jspb$binary$decoder_BinaryDecoder, jspb.binary.reader = {};
	var module$contents$jspb$binary$reader_ENFORCE_UTF8 = "ALWAYS";
	goog.asserts.assert(module$contents$jspb$binary$reader_ENFORCE_UTF8 === "DEPRECATED_PROTO3_ONLY" || module$contents$jspb$binary$reader_ENFORCE_UTF8 === "ALWAYS");
	var module$contents$jspb$binary$reader_UTF8_PARSING_ERRORS_ARE_FATAL = module$contents$jspb$binary$reader_ENFORCE_UTF8 === "ALWAYS", module$contents$jspb$binary$reader_BinaryReaderOptions = class {
		constructor() {}
	}, module$contents$jspb$binary$reader_BinaryReader = class e {
		constructor(e, t, n, r) {
			this.decoder_ = module$contents$jspb$binary$decoder_BinaryDecoder.alloc(e, t, n, r), this.fieldCursor_ = this.decoder_.getCursor(), this.nextField_ = module$contents$jspb$BinaryConstants_INVALID_FIELD_NUMBER, this.nextTag_ = module$contents$jspb$BinaryConstants_INVALID_TAG, this.nextWireType_ = module$contents$jspb$BinaryConstants_WireType.INVALID, this.setOptions(r);
		}
		setOptions({ discardUnknownFields: e = !1 } = {}) {
			this.discardUnknownFields = e;
		}
		static alloc(t, n, r, i) {
			if (e.instanceCache_.length) {
				let o = e.instanceCache_.pop();
				return o.setOptions(i), o.decoder_.init(t, n, r, i), o;
			}
			return new e(t, n, r, i);
		}
		free() {
			this.decoder_.clear(), this.nextTag_ = module$contents$jspb$BinaryConstants_INVALID_TAG, this.nextField_ = module$contents$jspb$BinaryConstants_INVALID_FIELD_NUMBER, this.nextWireType_ = module$contents$jspb$BinaryConstants_WireType.INVALID, 100 > e.instanceCache_.length && e.instanceCache_.push(this);
		}
		getFieldCursor() {
			return this.fieldCursor_;
		}
		getCursor() {
			return this.decoder_.getCursor();
		}
		dataIsImmutable() {
			return this.decoder_.dataIsImmutable();
		}
		getBuffer() {
			return this.decoder_.getBuffer();
		}
		getBufferAsByteString() {
			return this.decoder_.getBufferAsByteString();
		}
		getTag() {
			return this.nextTag_;
		}
		getFieldNumber() {
			return this.nextField_;
		}
		getWireType() {
			return this.nextWireType_;
		}
		isEndGroup() {
			return this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.END_GROUP;
		}
		isDelimited() {
			return this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.DELIMITED;
		}
		reset() {
			this.decoder_.reset(), this.fieldCursor_ = this.decoder_.getCursor(), this.nextTag_ = module$contents$jspb$BinaryConstants_INVALID_TAG, this.nextField_ = module$contents$jspb$BinaryConstants_INVALID_FIELD_NUMBER, this.nextWireType_ = module$contents$jspb$BinaryConstants_WireType.INVALID;
		}
		advance(e) {
			this.decoder_.advance(e);
		}
		nextField() {
			if (this.decoder_.atEnd()) return !1;
			this.assertPriorFieldWasRead(), this.fieldCursor_ = this.decoder_.getCursor();
			let e = module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_), t = module$contents$jspb$binary$reader_parseFieldNumber(e), n = module$contents$jspb$binary$reader_parseWireType(e);
			if (!module$contents$jspb$BinaryConstants_isValidWireType(n)) throw module$contents$jspb$binary$errors_invalidWireTypeError(n, this.fieldCursor_);
			if (1 > t) throw module$contents$jspb$binary$errors_invalidFieldNumberError(t, this.fieldCursor_);
			return this.nextTag_ = e, this.nextField_ = t, this.nextWireType_ = n, !0;
		}
		nextFieldIfTagEqualTo(e) {
			this.assertPriorFieldWasRead(), goog.asserts.assert(module$contents$jspb$BinaryConstants_isValidWireType(module$contents$jspb$binary$reader_parseWireType(e)) && 0 < module$contents$jspb$binary$reader_parseFieldNumber(e), "Must pass a valid tag.");
			let t = this.decoder_.readUnsignedVarint32IfEqualTo(e), n = 0 <= t;
			return n && (this.fieldCursor_ = t, this.nextTag_ = e, this.nextField_ = module$contents$jspb$binary$reader_parseFieldNumber(e), this.nextWireType_ = module$contents$jspb$binary$reader_parseWireType(e)), n;
		}
		assertPriorFieldWasRead() {
			if (goog.asserts.ENABLE_ASSERTS && this.nextTag_ !== module$contents$jspb$BinaryConstants_INVALID_TAG) {
				let e = this.decoder_.getCursor();
				this.decoder_.setCursor(this.fieldCursor_), module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_), this.nextWireType_ === module$contents$jspb$BinaryConstants_WireType.END_GROUP || this.nextWireType_ === module$contents$jspb$BinaryConstants_WireType.START_GROUP ? goog.asserts.assert(e === this.decoder_.getCursor(), "Expected to not advance the cursor.  Group tags do not have values.") : goog.asserts.assert(e > this.decoder_.getCursor(), "Expected to read the field, did you forget to call a read or skip method?"), this.decoder_.setCursor(e);
			}
		}
		skipVarintField() {
			this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT ? this.decoder_.skipVarint() : (goog.asserts.fail("Invalid wire type for skipVarintField"), this.skipField());
		}
		skipDelimitedField() {
			if (this.nextWireType_ != module$contents$jspb$BinaryConstants_WireType.DELIMITED) return goog.asserts.fail("Invalid wire type for skipDelimitedField"), this.skipField(), 0;
			let e = module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_);
			return this.decoder_.advance(e), e;
		}
		skipFixed32Field() {
			goog.asserts.assert(this.nextWireType_ === module$contents$jspb$BinaryConstants_WireType.FIXED32), this.decoder_.advance(4);
		}
		skipFixed64Field() {
			goog.asserts.assert(this.nextWireType_ === module$contents$jspb$BinaryConstants_WireType.FIXED64), this.decoder_.advance(8);
		}
		skipGroup() {
			let e = this.nextField_;
			do {
				if (!this.nextField()) throw module$contents$jspb$binary$errors_unmatchedStartGroupEofError();
				if (this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.END_GROUP) {
					if (this.nextField_ != e) throw module$contents$jspb$binary$errors_unmatchedStartGroupError();
					break;
				}
				this.skipField();
			} while (1);
		}
		skipField() {
			switch (this.nextWireType_) {
				case module$contents$jspb$BinaryConstants_WireType.VARINT:
					this.skipVarintField();
					break;
				case module$contents$jspb$BinaryConstants_WireType.FIXED64:
					this.skipFixed64Field();
					break;
				case module$contents$jspb$BinaryConstants_WireType.DELIMITED:
					this.skipDelimitedField();
					break;
				case module$contents$jspb$BinaryConstants_WireType.FIXED32:
					this.skipFixed32Field();
					break;
				case module$contents$jspb$BinaryConstants_WireType.START_GROUP:
					this.skipGroup();
					break;
				default: throw module$contents$jspb$binary$errors_invalidWireTypeError(this.nextWireType_, this.fieldCursor_);
			}
		}
		skipToEnd() {
			this.decoder_.setCursor(this.decoder_.getEnd());
		}
		readUnknownField() {
			let e = this.getFieldCursor();
			return this.skipField(), this.readUnknownFieldsStartingFrom(e);
		}
		readUnknownFieldsStartingFrom(e) {
			if (!this.discardUnknownFields) {
				let t = this.decoder_.getCursor(), n = t - e;
				return this.decoder_.setCursor(e), e = this.decoder_.readByteString(n), goog.asserts.assert(t == this.decoder_.getCursor()), e;
			}
		}
		readAny(e) {
			if (module$contents$jspb$BinaryConstants_FieldTypeToWireType(e) !== this.nextWireType_) return null;
			let t = module$contents$jspb$BinaryConstants_FieldType;
			switch (e) {
				case t.DOUBLE: return this.readDouble();
				case t.FLOAT: return this.readFloat();
				case t.INT64: return this.readInt64();
				case t.UINT64: return this.readUint64();
				case t.INT32: return this.readInt32();
				case t.FIXED64: return this.readFixed64();
				case t.FIXED32: return this.readFixed32();
				case t.BOOL: return this.readBool();
				case t.STRING: return this.readString();
				case t.GROUP: goog.asserts.fail("Group field type not supported in readAny()");
				case t.MESSAGE: goog.asserts.fail("Message field type not supported in readAny()");
				case t.BYTES: return this.readBytes();
				case t.UINT32: return this.readUint32();
				case t.ENUM: return this.readEnum();
				case t.SFIXED32: return this.readSfixed32();
				case t.SFIXED64: return this.readSfixed64();
				case t.SINT32: return this.readSint32();
				case t.SINT64: return this.readSint64();
				default: goog.asserts.fail("Invalid field type in readAny()");
			}
			return null;
		}
		readMessage(e, t, n, r, i) {
			goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.DELIMITED);
			let o = this.decoder_.getEnd(), s = module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_), c = this.decoder_.getCursor() + s, l = c - o;
			if (0 >= l && (this.decoder_.setEnd(c), t(e, this, n, r, i), l = c - this.decoder_.getCursor()), l) throw module$contents$jspb$binary$errors_messageLengthMismatchError(s, s - l);
			return this.decoder_.setCursor(c), this.decoder_.setEnd(o), e;
		}
		readGroup(e, t, n) {
			if (goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.START_GROUP), goog.asserts.assert(this.nextField_ == e), n(t, this), this.nextWireType_ !== module$contents$jspb$BinaryConstants_WireType.END_GROUP) throw module$contents$jspb$binary$errors_groupDidNotEndWithEndGroupError();
			if (this.nextField_ !== e) throw module$contents$jspb$binary$errors_unmatchedStartGroupError();
			return t;
		}
		isMessageSetGroup() {
			return this.getTag() === module$contents$jspb$binary$reader_MESSAGE_SET_START_GROUP_TAG;
		}
		readMessageSetGroup(e) {
			goog.asserts.assert(this.isMessageSetGroup());
			let t = 0, n = 0;
			for (; this.nextField() && !this.isEndGroup();) this.getTag() !== module$contents$jspb$binary$reader_MESSAGE_SET_TYPE_ID_TAG || t ? this.getTag() !== module$contents$jspb$binary$reader_MESSAGE_SET_MESSAGE_TAG || n ? this.skipField() : t ? (n = -1, this.readMessage(t, e)) : (n = this.getFieldCursor(), this.skipDelimitedField()) : (t = this.readUint32(), n &&= (goog.asserts.assert(0 < n), goog.asserts.ENABLE_ASSERTS && (this.nextTag_ = module$contents$jspb$BinaryConstants_INVALID_TAG, this.nextWireType_ = module$contents$jspb$BinaryConstants_WireType.INVALID), this.decoder_.setCursor(n), 0));
			if (this.getTag() !== module$contents$jspb$binary$reader_MESSAGE_SET_END_TAG || !n || !t) throw module$contents$jspb$binary$errors_malformedBinaryBytesForMessageSet();
		}
		readInt32() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint32(this.decoder_);
		}
		readInt64() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint64(this.decoder_);
		}
		readInt64String() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint64String(this.decoder_);
		}
		readUint32() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_);
		}
		readUint64() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint64(this.decoder_);
		}
		readUint64String() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint64String(this.decoder_);
		}
		readSint32() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint32(this.decoder_);
		}
		readSint64() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint64(this.decoder_);
		}
		readSint64String() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint64String(this.decoder_);
		}
		readFixed32() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED32), module$contents$jspb$binary$decoder_BinaryDecoder.readUint32(this.decoder_);
		}
		readFixed64() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED64), module$contents$jspb$binary$decoder_BinaryDecoder.readUint64(this.decoder_);
		}
		readFixed64String() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED64), module$contents$jspb$binary$decoder_BinaryDecoder.readUint64String(this.decoder_);
		}
		readSfixed32() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED32), module$contents$jspb$binary$decoder_BinaryDecoder.readInt32(this.decoder_);
		}
		readSfixed32String() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED32), module$contents$jspb$binary$decoder_BinaryDecoder.readInt32(this.decoder_).toString();
		}
		readSfixed64() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED64), module$contents$jspb$binary$decoder_BinaryDecoder.readInt64(this.decoder_);
		}
		readSfixed64String() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED64), module$contents$jspb$binary$decoder_BinaryDecoder.readInt64String(this.decoder_);
		}
		readFloat() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED32), module$contents$jspb$binary$decoder_BinaryDecoder.readFloat(this.decoder_);
		}
		readDouble() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED64), module$contents$jspb$binary$decoder_BinaryDecoder.readDouble(this.decoder_);
		}
		readBool() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readBool(this.decoder_);
		}
		readEnum() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint32(this.decoder_);
		}
		readString() {
			if (module$contents$jspb$binary$reader_UTF8_PARSING_ERRORS_ARE_FATAL) return this.readStringRequireUtf8();
			goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.DELIMITED);
			let e = module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_);
			return this.decoder_.readString(e, !1);
		}
		readStringRequireUtf8() {
			goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.DELIMITED);
			let e = module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_);
			return this.decoder_.readString(e, !0);
		}
		readBytes() {
			goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.DELIMITED);
			let e = module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_);
			return this.decoder_.readBytes(e);
		}
		readByteString() {
			goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.DELIMITED);
			let e = module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_);
			return this.decoder_.readByteString(e);
		}
		readSplitVarint64(e) {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readSplitVarint64(this.decoder_, e);
		}
		readSplitZigzagVarint64(e) {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$decoder_BinaryDecoder.readSplitVarint64(this.decoder_, (t, n) => module$contents$jspb$utils_fromZigzag64(t, n, e));
		}
		readSplitFixed64(e) {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.FIXED64), module$contents$jspb$binary$decoder_BinaryDecoder.readSplitFixed64(this.decoder_, e);
		}
		readPackedFieldInto_(e, t) {
			var n = this.readPackedFieldLength_();
			for (n = this.decoder_.getCursor() + n; this.decoder_.getCursor() < n;) t.push(e(this.decoder_));
		}
		readPackedFieldLength_() {
			return goog.asserts.assert(this.nextWireType_ == module$contents$jspb$BinaryConstants_WireType.DELIMITED), module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32(this.decoder_);
		}
		readPackableInt32Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint32, e) : e.push(this.readInt32());
		}
		readPackableInt64Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint64, e) : e.push(this.readInt64());
		}
		readPackableInt64StringInto(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readSignedVarint64String, e) : e.push(this.readInt64String());
		}
		readPackableUint32Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint32, e) : e.push(this.readUint32());
		}
		readPackableUint64Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint64, e) : e.push(this.readUint64());
		}
		readPackableUint64StringInto(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readUnsignedVarint64String, e) : e.push(this.readUint64String());
		}
		readPackableSint32Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint32, e) : e.push(this.readSint32());
		}
		readPackableSint64Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint64, e) : e.push(this.readSint64());
		}
		readPackableSint64StringInto(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readZigzagVarint64String, e) : e.push(this.readSint64String());
		}
		readPackableFixed32Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readUint32, e) : e.push(this.readFixed32());
		}
		readPackableFixed64Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readUint64, e) : e.push(this.readFixed64());
		}
		readPackableFixed64StringInto(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readUint64String, e) : e.push(this.readFixed64String());
		}
		readPackableSfixed32Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readInt32, e) : e.push(this.readSfixed32());
		}
		readPackableSfixed64Into(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readInt64, e) : e.push(this.readSfixed64());
		}
		readPackableSfixed64StringInto(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readInt64String, e) : e.push(this.readSfixed64String());
		}
		readPackedFixed32() {
			let e = [];
			return this.readPackableFixed32Into(e), e;
		}
		readPackedFixed64() {
			let e = [];
			return this.readPackableFixed64Into(e), e;
		}
		readPackedFixed64String() {
			let e = [];
			return this.readPackableFixed64StringInto(e), e;
		}
		readPackedSfixed32() {
			let e = [];
			return this.readPackableSfixed32Into(e), e;
		}
		readPackedSfixed64String() {
			let e = [];
			return this.readPackableSfixed64StringInto(e), e;
		}
		readPackableFloatInto(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readFloat, e) : e.push(this.readFloat());
		}
		readPackableDoubleInto(e) {
			this.isDelimited() ? this.decoder_.readDoubleArrayInto(this.readPackedFieldLength_() / 8, e) : e.push(this.readDouble());
		}
		readPackableBoolInto(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readBool, e) : e.push(this.readBool());
		}
		readPackableEnumInto(e) {
			this.isDelimited() ? this.readPackedFieldInto_(module$contents$jspb$binary$decoder_BinaryDecoder.readEnum, e) : e.push(this.readEnum());
		}
		static resetInstanceCache() {
			e.instanceCache_ = [];
		}
		static getInstanceCache() {
			return e.instanceCache_;
		}
	};
	goog.exportProperty(module$contents$jspb$binary$reader_BinaryReader.prototype, "readPackedSfixed64String", module$contents$jspb$binary$reader_BinaryReader.prototype.readPackedSfixed64String), goog.exportProperty(module$contents$jspb$binary$reader_BinaryReader.prototype, "readPackedSfixed32", module$contents$jspb$binary$reader_BinaryReader.prototype.readPackedSfixed32), goog.exportProperty(module$contents$jspb$binary$reader_BinaryReader.prototype, "readPackedFixed64String", module$contents$jspb$binary$reader_BinaryReader.prototype.readPackedFixed64String), goog.exportProperty(module$contents$jspb$binary$reader_BinaryReader.prototype, "readPackedFixed64", module$contents$jspb$binary$reader_BinaryReader.prototype.readPackedFixed64), goog.exportProperty(module$contents$jspb$binary$reader_BinaryReader.prototype, "readPackedFixed32", module$contents$jspb$binary$reader_BinaryReader.prototype.readPackedFixed32);
	function module$contents$jspb$binary$reader_parseWireType(e) {
		return e & 7;
	}
	function module$contents$jspb$binary$reader_parseFieldNumber(e) {
		return e >>> 3;
	}
	module$contents$jspb$binary$reader_BinaryReader.instanceCache_ = [];
	var module$contents$jspb$binary$reader_MESSAGE_SET_START_GROUP_TAG = module$contents$jspb$utils_makeTag(module$contents$jspb$BinaryConstants_MESSAGE_SET_GROUP_NUMBER, module$contents$jspb$BinaryConstants_WireType.START_GROUP), module$contents$jspb$binary$reader_MESSAGE_SET_TYPE_ID_TAG = module$contents$jspb$utils_makeTag(module$contents$jspb$BinaryConstants_MESSAGE_SET_TYPE_ID_FIELD_NUMBER, module$contents$jspb$BinaryConstants_WireType.VARINT), module$contents$jspb$binary$reader_MESSAGE_SET_MESSAGE_TAG = module$contents$jspb$utils_makeTag(module$contents$jspb$BinaryConstants_MESSAGE_SET_MESSAGE_FIELD_NUMBER, module$contents$jspb$BinaryConstants_WireType.DELIMITED), module$contents$jspb$binary$reader_MESSAGE_SET_END_TAG = module$contents$jspb$utils_makeTag(module$contents$jspb$BinaryConstants_MESSAGE_SET_GROUP_NUMBER, module$contents$jspb$BinaryConstants_WireType.END_GROUP);
	jspb.binary.reader.BinaryReader = module$contents$jspb$binary$reader_BinaryReader, jspb.binary.reader.BinaryReaderOptions = module$contents$jspb$binary$reader_BinaryReaderOptions, jspb.binary.reader.UTF8_PARSING_ERRORS_ARE_FATAL = module$contents$jspb$binary$reader_UTF8_PARSING_ERRORS_ARE_FATAL;
	var module$contents$jspb$ExtensionFieldInfo_ExtensionFieldInfo = function(e, t, n, r, i) {
		this.fieldIndex = e, this.fieldName = t, this.ctor = n, this.toObjectFn = r, this.isRepeated = i;
	};
	module$contents$jspb$ExtensionFieldInfo_ExtensionFieldInfo.prototype.isMessageType = function() {
		return !!this.ctor;
	}, goog.exportProperty(module$contents$jspb$ExtensionFieldInfo_ExtensionFieldInfo.prototype, "isMessageType", module$contents$jspb$ExtensionFieldInfo_ExtensionFieldInfo.prototype.isMessageType), jspb.ExtensionFieldInfo = module$contents$jspb$ExtensionFieldInfo_ExtensionFieldInfo;
	var module$contents$jspb$ExtensionFieldBinaryInfo_ExtensionFieldBinaryInfo = function(e, t, n, r, i, o) {
		this.fieldInfo = e, this.binaryReaderFn = t, this.binaryWriterFn = n, this.binaryMessageSerializeFn = r, this.binaryMessageDeserializeFn = i, this.isPacked = o;
	};
	jspb.ExtensionFieldBinaryInfo = module$contents$jspb$ExtensionFieldBinaryInfo_ExtensionFieldBinaryInfo;
	var module$contents$jspb$Message_Message = function() {};
	module$contents$jspb$Message_Message.GENERATE_TO_OBJECT = !0, goog.exportSymbol("module$contents$jspb$Message_Message.GENERATE_TO_OBJECT", module$contents$jspb$Message_Message.GENERATE_TO_OBJECT), module$contents$jspb$Message_Message.GENERATE_FROM_OBJECT = !goog.DISALLOW_TEST_ONLY_CODE, goog.exportSymbol("module$contents$jspb$Message_Message.GENERATE_FROM_OBJECT", module$contents$jspb$Message_Message.GENERATE_FROM_OBJECT), module$contents$jspb$Message_Message.GENERATE_TO_STRING = !0, module$contents$jspb$Message_Message.ASSUME_LOCAL_ARRAYS = !1, module$contents$jspb$Message_Message.SERIALIZE_EMPTY_TRAILING_FIELDS = !0, module$contents$jspb$Message_Message.SUPPORTS_UINT8ARRAY_ = typeof Uint8Array == "function", module$contents$jspb$Message_Message.prototype.getJsPbMessageId = function() {
		return this.messageId_;
	}, goog.exportProperty(module$contents$jspb$Message_Message.prototype, "getJsPbMessageId", module$contents$jspb$Message_Message.prototype.getJsPbMessageId), module$contents$jspb$Message_Message.getIndex_ = function(e, t) {
		return t + e.arrayIndexOffset_;
	}, module$contents$jspb$Message_Message.hiddenES6Property_ = class {}, module$contents$jspb$Message_Message.getFieldNumber_ = function(e, t) {
		return t - e.arrayIndexOffset_;
	}, module$contents$jspb$Message_Message.initialize = function(e, t, n, r, i, o) {
		if (e.wrappers_ = null, t ||= n ? [n] : [], e.messageId_ = n ? String(n) : void 0, e.arrayIndexOffset_ = n === 0 ? -1 : 0, e.array = t, module$contents$jspb$Message_Message.initPivotAndExtensionObject_(e, r), e.convertedPrimitiveFields_ = {}, module$contents$jspb$Message_Message.SERIALIZE_EMPTY_TRAILING_FIELDS || (e.repeatedFields = i), i) for (t = 0; t < i.length; t++) n = i[t], n < e.pivot_ ? (n = module$contents$jspb$Message_Message.getIndex_(e, n), e.array[n] = e.array[n] || module$contents$jspb$Message_Message.EMPTY_LIST_SENTINEL_) : (module$contents$jspb$Message_Message.maybeInitEmptyExtensionObject_(e), e.extensionObject_[n] = e.extensionObject_[n] || module$contents$jspb$Message_Message.EMPTY_LIST_SENTINEL_);
		if (o && o.length) for (t = 0; t < o.length; t++) module$contents$jspb$Message_Message.computeOneofCase(e, o[t]);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.initialize", module$contents$jspb$Message_Message.initialize), module$contents$jspb$Message_Message.EMPTY_LIST_SENTINEL_ = goog.DEBUG && Object.freeze ? Object.freeze([]) : [], module$contents$jspb$Message_Message.isArray_ = function(e) {
		return module$contents$jspb$Message_Message.ASSUME_LOCAL_ARRAYS ? e instanceof Array : Array.isArray(e);
	}, module$contents$jspb$Message_Message.isExtensionObject_ = function(e) {
		return typeof e == "object" && !!e && !module$contents$jspb$Message_Message.isArray_(e) && !(module$contents$jspb$Message_Message.SUPPORTS_UINT8ARRAY_ && e instanceof Uint8Array);
	}, module$contents$jspb$Message_Message.initPivotAndExtensionObject_ = function(e, t) {
		var n = e.array.length, r = -1;
		if (n && (r = n - 1, n = e.array[r], module$contents$jspb$Message_Message.isExtensionObject_(n))) {
			e.pivot_ = module$contents$jspb$Message_Message.getFieldNumber_(e, r), e.extensionObject_ = n;
			return;
		}
		-1 < t ? (e.pivot_ = Math.max(t, module$contents$jspb$Message_Message.getFieldNumber_(e, r + 1)), e.extensionObject_ = null) : e.pivot_ = Number.MAX_VALUE;
	}, module$contents$jspb$Message_Message.maybeInitEmptyExtensionObject_ = function(e) {
		var t = module$contents$jspb$Message_Message.getIndex_(e, e.pivot_);
		e.array[t] || (e.extensionObject_ = e.array[t] = {});
	}, module$contents$jspb$Message_Message.toObjectList = function(e, t, n) {
		for (var r = [], i = 0; i < e.length; i++) r[i] = t.call(e[i], n, e[i]);
		return r;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.toObjectList", module$contents$jspb$Message_Message.toObjectList), module$contents$jspb$Message_Message.toObjectExtension = function(e, t, n, r, i) {
		for (var o in n) {
			var s = n[o], c = r.call(e, s);
			if (c != null) {
				for (var l in s.fieldName) if (s.fieldName.hasOwnProperty(l)) break;
				t[l] = s.toObjectFn ? s.isRepeated ? module$contents$jspb$Message_Message.toObjectList(c, s.toObjectFn, i) : s.toObjectFn(i, c) : c;
			}
		}
	}, goog.exportSymbol("module$contents$jspb$Message_Message.toObjectExtension", module$contents$jspb$Message_Message.toObjectExtension), module$contents$jspb$Message_Message.serializeBinaryExtensions = function(e, t, n, r) {
		for (var i in n) {
			var o = n[i], s = o.fieldInfo;
			if (!o.binaryWriterFn) throw Error("Message extension present that was generated without binary serialization support");
			var c = r.call(e, s);
			if (c != null) {
				if (s.isMessageType()) {
					if (o.binaryMessageSerializeFn) o.binaryWriterFn.call(t, s.fieldIndex, c, o.binaryMessageSerializeFn);
					else throw Error("Message extension present holding submessage without binary support enabled, and message is being serialized to binary format");
				} else o.binaryWriterFn.call(t, s.fieldIndex, c);
			}
		}
	}, goog.exportSymbol("module$contents$jspb$Message_Message.serializeBinaryExtensions", module$contents$jspb$Message_Message.serializeBinaryExtensions), module$contents$jspb$Message_Message.readBinaryExtension = function(e, t, n, r, i) {
		var o = n[t.getFieldNumber()];
		if (o) {
			if (n = o.fieldInfo, !o.binaryReaderFn) throw Error("Deserializing extension whose generated code does not support binary format");
			if (n.isMessageType()) {
				var s = new n.ctor();
				o.binaryReaderFn.call(t, s, o.binaryMessageDeserializeFn);
			} else {
				if (n.isRepeated && o.isPacked) {
					s = r.call(e, n) ?? [], o.binaryReaderFn.call(t, s), i.call(e, n, s);
					return;
				}
				s = o.binaryReaderFn.call(t);
			}
			n.isRepeated && !o.isPacked ? (t = r.call(e, n)) ? t.push(s) : i.call(e, n, [s]) : i.call(e, n, s);
		} else t.skipField();
	}, goog.exportSymbol("module$contents$jspb$Message_Message.readBinaryExtension", module$contents$jspb$Message_Message.readBinaryExtension), module$contents$jspb$Message_Message.getField = function(e, t) {
		if (t < e.pivot_) {
			t = module$contents$jspb$Message_Message.getIndex_(e, t);
			var n = e.array[t];
			return n === module$contents$jspb$Message_Message.EMPTY_LIST_SENTINEL_ ? e.array[t] = [] : n;
		}
		if (e.extensionObject_) return n = e.extensionObject_[t], n === module$contents$jspb$Message_Message.EMPTY_LIST_SENTINEL_ ? e.extensionObject_[t] = [] : n;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getField", module$contents$jspb$Message_Message.getField), module$contents$jspb$Message_Message.getRepeatedField = function(e, t) {
		return module$contents$jspb$Message_Message.getField(e, t);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getRepeatedField", module$contents$jspb$Message_Message.getRepeatedField), module$contents$jspb$Message_Message.getOptionalFloatingPointField = function(e, t) {
		return e = module$contents$jspb$Message_Message.getField(e, t), e == null ? e : +e;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getOptionalFloatingPointField", module$contents$jspb$Message_Message.getOptionalFloatingPointField), module$contents$jspb$Message_Message.getBooleanField = function(e, t) {
		return e = module$contents$jspb$Message_Message.getField(e, t), e == null ? e : !!e;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getBooleanField", module$contents$jspb$Message_Message.getBooleanField), module$contents$jspb$Message_Message.getRepeatedFloatingPointField = function(e, t) {
		var n = module$contents$jspb$Message_Message.getRepeatedField(e, t);
		if (e.convertedPrimitiveFields_ ||= {}, !e.convertedPrimitiveFields_[t]) {
			for (var r = 0; r < n.length; r++) n[r] = +n[r];
			e.convertedPrimitiveFields_[t] = !0;
		}
		return n;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getRepeatedFloatingPointField", module$contents$jspb$Message_Message.getRepeatedFloatingPointField), module$contents$jspb$Message_Message.getRepeatedBooleanField = function(e, t) {
		var n = module$contents$jspb$Message_Message.getRepeatedField(e, t);
		if (e.convertedPrimitiveFields_ ||= {}, !e.convertedPrimitiveFields_[t]) {
			for (var r = 0; r < n.length; r++) n[r] = !!n[r];
			e.convertedPrimitiveFields_[t] = !0;
		}
		return n;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getRepeatedBooleanField", module$contents$jspb$Message_Message.getRepeatedBooleanField), module$contents$jspb$Message_Message.bytesAsB64 = function(e) {
		return e == null || typeof e == "string" ? e : module$contents$jspb$Message_Message.SUPPORTS_UINT8ARRAY_ && e instanceof Uint8Array ? goog.crypt.base64.encodeByteArray(e) : (module$contents$jspb$asserts_fail("Cannot coerce to b64 string: " + goog.typeOf(e)), null);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.bytesAsB64", module$contents$jspb$Message_Message.bytesAsB64), module$contents$jspb$Message_Message.bytesAsU8 = function(e) {
		return e == null || e instanceof Uint8Array ? e : typeof e == "string" ? goog.crypt.base64.decodeStringToUint8Array(e) : (module$contents$jspb$asserts_fail("Cannot coerce to Uint8Array: " + goog.typeOf(e)), null);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.bytesAsU8", module$contents$jspb$Message_Message.bytesAsU8), module$contents$jspb$Message_Message.bytesListAsB64 = function(e) {
		return module$contents$jspb$Message_Message.assertConsistentTypes_(e), e.length && typeof e[0] != "string" ? module$contents$goog$array_map(e, module$contents$jspb$Message_Message.bytesAsB64) : e;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.bytesListAsB64", module$contents$jspb$Message_Message.bytesListAsB64), module$contents$jspb$Message_Message.bytesListAsU8 = function(e) {
		return module$contents$jspb$Message_Message.assertConsistentTypes_(e), !e.length || e[0] instanceof Uint8Array ? e : module$contents$goog$array_map(e, module$contents$jspb$Message_Message.bytesAsU8);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.bytesListAsU8", module$contents$jspb$Message_Message.bytesListAsU8), module$contents$jspb$Message_Message.assertConsistentTypes_ = function(e) {
		if (goog.DEBUG && e && 1 < e.length) {
			var t = goog.typeOf(e[0]);
			module$contents$goog$array_forEach(e, function(e) {
				goog.typeOf(e) != t && module$contents$jspb$asserts_fail("Inconsistent type in JSPB repeated field array. Got " + goog.typeOf(e) + " expected " + t);
			});
		}
	}, module$contents$jspb$Message_Message.getFieldWithDefault = function(e, t, n) {
		return e = module$contents$jspb$Message_Message.getField(e, t), e ?? n;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getFieldWithDefault", module$contents$jspb$Message_Message.getFieldWithDefault), module$contents$jspb$Message_Message.getBooleanFieldWithDefault = function(e, t, n) {
		return e = module$contents$jspb$Message_Message.getBooleanField(e, t), e ?? n;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getBooleanFieldWithDefault", module$contents$jspb$Message_Message.getBooleanFieldWithDefault), module$contents$jspb$Message_Message.getFloatingPointFieldWithDefault = function(e, t, n) {
		return e = module$contents$jspb$Message_Message.getOptionalFloatingPointField(e, t), e ?? n;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getFloatingPointFieldWithDefault", module$contents$jspb$Message_Message.getFloatingPointFieldWithDefault), module$contents$jspb$Message_Message.getFieldProto3 = module$contents$jspb$Message_Message.getFieldWithDefault, goog.exportSymbol("module$contents$jspb$Message_Message.getFieldProto3", module$contents$jspb$Message_Message.getFieldProto3), module$contents$jspb$Message_Message.getMapField = function(e, t, n, r) {
		if (e.wrappers_ ||= {}, t in e.wrappers_) return e.wrappers_[t];
		var i = module$contents$jspb$Message_Message.getField(e, t);
		if (!i) {
			if (n) return;
			i = [], module$contents$jspb$Message_Message.setField(e, t, i);
		}
		return e.wrappers_[t] = new module$contents$jspb$Map_Map(i, r);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getMapField", module$contents$jspb$Message_Message.getMapField), module$contents$jspb$Message_Message.setField = function(e, t, n) {
		return module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message), t < e.pivot_ ? e.array[module$contents$jspb$Message_Message.getIndex_(e, t)] = n : (module$contents$jspb$Message_Message.maybeInitEmptyExtensionObject_(e), e.extensionObject_[t] = n), e;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setField", module$contents$jspb$Message_Message.setField), module$contents$jspb$Message_Message.setProto3IntField = function(e, t, n) {
		return module$contents$jspb$Message_Message.setFieldIgnoringDefault_(e, t, n, 0);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setProto3IntField", module$contents$jspb$Message_Message.setProto3IntField), module$contents$jspb$Message_Message.setProto3FloatField = function(e, t, n) {
		return module$contents$jspb$Message_Message.setFieldIgnoringDefault_(e, t, n, 0);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setProto3FloatField", module$contents$jspb$Message_Message.setProto3FloatField), module$contents$jspb$Message_Message.setProto3BooleanField = function(e, t, n) {
		return module$contents$jspb$Message_Message.setFieldIgnoringDefault_(e, t, n, !1);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setProto3BooleanField", module$contents$jspb$Message_Message.setProto3BooleanField), module$contents$jspb$Message_Message.setProto3StringField = function(e, t, n) {
		return module$contents$jspb$Message_Message.setFieldIgnoringDefault_(e, t, n, "");
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setProto3StringField", module$contents$jspb$Message_Message.setProto3StringField), module$contents$jspb$Message_Message.setProto3BytesField = function(e, t, n) {
		return module$contents$jspb$Message_Message.setFieldIgnoringDefault_(e, t, n, "");
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setProto3BytesField", module$contents$jspb$Message_Message.setProto3BytesField), module$contents$jspb$Message_Message.setProto3EnumField = function(e, t, n) {
		return module$contents$jspb$Message_Message.setFieldIgnoringDefault_(e, t, n, 0);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setProto3EnumField", module$contents$jspb$Message_Message.setProto3EnumField), module$contents$jspb$Message_Message.setProto3StringIntField = function(e, t, n) {
		return module$contents$jspb$Message_Message.setFieldIgnoringDefault_(e, t, n, "0");
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setProto3StringIntField", module$contents$jspb$Message_Message.setProto3StringIntField), module$contents$jspb$Message_Message.setFieldIgnoringDefault_ = function(e, t, n, r) {
		return module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message), n === r ? t < e.pivot_ ? e.array[module$contents$jspb$Message_Message.getIndex_(e, t)] = null : (module$contents$jspb$Message_Message.maybeInitEmptyExtensionObject_(e), delete e.extensionObject_[t]) : module$contents$jspb$Message_Message.setField(e, t, n), e;
	}, module$contents$jspb$Message_Message.addToRepeatedField = function(e, t, n, r) {
		return module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message), t = module$contents$jspb$Message_Message.getRepeatedField(e, t), r == null ? t.push(n) : t.splice(r, 0, n), e;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.addToRepeatedField", module$contents$jspb$Message_Message.addToRepeatedField), module$contents$jspb$Message_Message.setOneofField = function(e, t, n, r) {
		return module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message), (n = module$contents$jspb$Message_Message.computeOneofCase(e, n)) && n !== t && r !== void 0 && (e.wrappers_ && n in e.wrappers_ && (e.wrappers_[n] = void 0), module$contents$jspb$Message_Message.setField(e, n, void 0)), module$contents$jspb$Message_Message.setField(e, t, r);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setOneofField", module$contents$jspb$Message_Message.setOneofField), module$contents$jspb$Message_Message.computeOneofCase = function(e, t) {
		for (var n, r, i = 0; i < t.length; i++) {
			var o = t[i], s = module$contents$jspb$Message_Message.getField(e, o);
			s != null && (n = o, r = s, module$contents$jspb$Message_Message.setField(e, o, void 0));
		}
		return n ? (module$contents$jspb$Message_Message.setField(e, n, r), n) : 0;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.computeOneofCase", module$contents$jspb$Message_Message.computeOneofCase), module$contents$jspb$Message_Message.getWrapperField = function(e, t, n, r) {
		if (e.wrappers_ ||= {}, !e.wrappers_[n]) {
			var i = module$contents$jspb$Message_Message.getField(e, n);
			(r || i) && (e.wrappers_[n] = new t(i));
		}
		return e.wrappers_[n];
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getWrapperField", module$contents$jspb$Message_Message.getWrapperField), module$contents$jspb$Message_Message.getRepeatedWrapperField = function(e, t, n) {
		return module$contents$jspb$Message_Message.wrapRepeatedField_(e, t, n), t = e.wrappers_[n], t == module$contents$jspb$Message_Message.EMPTY_LIST_SENTINEL_ && (t = e.wrappers_[n] = []), t;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.getRepeatedWrapperField", module$contents$jspb$Message_Message.getRepeatedWrapperField), module$contents$jspb$Message_Message.wrapRepeatedField_ = function(e, t, n) {
		if (e.wrappers_ ||= {}, !e.wrappers_[n]) {
			for (var r = module$contents$jspb$Message_Message.getRepeatedField(e, n), i = [], o = 0; o < r.length; o++) i[o] = new t(r[o]);
			e.wrappers_[n] = i;
		}
	}, module$contents$jspb$Message_Message.setWrapperField = function(e, t, n) {
		module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message), e.wrappers_ ||= {};
		var r = n && n.toArray();
		return e.wrappers_[t] = n, module$contents$jspb$Message_Message.setField(e, t, r);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setWrapperField", module$contents$jspb$Message_Message.setWrapperField), module$contents$jspb$Message_Message.setOneofWrapperField = function(e, t, n, r) {
		module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message), e.wrappers_ ||= {};
		var i = r && r.toArray();
		return e.wrappers_[t] = r, module$contents$jspb$Message_Message.setOneofField(e, t, n, i);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setOneofWrapperField", module$contents$jspb$Message_Message.setOneofWrapperField), module$contents$jspb$Message_Message.setRepeatedWrapperField = function(e, t, n) {
		module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message), e.wrappers_ ||= {}, n ||= [];
		for (var r = [], i = 0; i < n.length; i++) r[i] = n[i].toArray();
		return e.wrappers_[t] = n, module$contents$jspb$Message_Message.setField(e, t, r);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.setRepeatedWrapperField", module$contents$jspb$Message_Message.setRepeatedWrapperField), module$contents$jspb$Message_Message.addToRepeatedWrapperField = function(e, t, n, r, i) {
		module$contents$jspb$Message_Message.wrapRepeatedField_(e, r, t);
		var o = e.wrappers_[t];
		return o ||= e.wrappers_[t] = [], n ||= new r(), e = module$contents$jspb$Message_Message.getRepeatedField(e, t), i == null ? (o.push(n), e.push(n.toArray())) : (o.splice(i, 0, n), e.splice(i, 0, n.toArray())), n;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.addToRepeatedWrapperField", module$contents$jspb$Message_Message.addToRepeatedWrapperField), module$contents$jspb$Message_Message.toMap = function(e, t, n, r) {
		for (var i = {}, o = 0; o < e.length; o++) i[t.call(e[o])] = n ? n.call(e[o], r, e[o]) : e[o];
		return i;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.toMap", module$contents$jspb$Message_Message.toMap), module$contents$jspb$Message_Message.prototype.syncMapFields_ = function() {
		if (this.wrappers_) for (var e in this.wrappers_) {
			var t = this.wrappers_[e];
			if (Array.isArray(t)) for (var n = 0; n < t.length; n++) t[n] && t[n].toArray();
			else t && t.toArray();
		}
	}, module$contents$jspb$Message_Message.prototype.toArray = function() {
		return this.syncMapFields_(), this.array;
	}, goog.exportProperty(module$contents$jspb$Message_Message.prototype, "toArray", module$contents$jspb$Message_Message.prototype.toArray), module$contents$jspb$Message_Message.GENERATE_TO_STRING && (module$contents$jspb$Message_Message.prototype.toString = function() {
		return this.syncMapFields_(), this.array.toString();
	}), module$contents$jspb$Message_Message.prototype.getExtension = function(e) {
		if (this.extensionObject_) {
			this.wrappers_ ||= {};
			var t = e.fieldIndex;
			if (e.isRepeated) {
				if (e.isMessageType()) return this.wrappers_[t] || (this.wrappers_[t] = module$contents$goog$array_map(this.extensionObject_[t] || [], function(t) {
					return new e.ctor(t);
				})), this.wrappers_[t];
			} else if (e.isMessageType()) return !this.wrappers_[t] && this.extensionObject_[t] && (this.wrappers_[t] = new e.ctor(this.extensionObject_[t])), this.wrappers_[t];
			return this.extensionObject_[t];
		}
	}, goog.exportProperty(module$contents$jspb$Message_Message.prototype, "getExtension", module$contents$jspb$Message_Message.prototype.getExtension), module$contents$jspb$Message_Message.prototype.setExtension = function(e, t) {
		this.wrappers_ ||= {}, module$contents$jspb$Message_Message.maybeInitEmptyExtensionObject_(this);
		var n = e.fieldIndex;
		return e.isRepeated ? (t ||= [], e.isMessageType() ? (this.wrappers_[n] = t, this.extensionObject_[n] = module$contents$goog$array_map(t, function(e) {
			return e.toArray();
		})) : this.extensionObject_[n] = t) : e.isMessageType() ? (this.wrappers_[n] = t, this.extensionObject_[n] = t && t.toArray()) : this.extensionObject_[n] = t, this;
	}, goog.exportProperty(module$contents$jspb$Message_Message.prototype, "setExtension", module$contents$jspb$Message_Message.prototype.setExtension), module$contents$jspb$Message_Message.difference = function(e, t) {
		if (!(e instanceof t.constructor)) throw Error("Messages have different types.");
		var n = e.toArray();
		t = t.toArray();
		var r = [], i = 0, o = n.length > t.length ? n.length : t.length;
		for (e.getJsPbMessageId() && (r[0] = e.getJsPbMessageId(), i = 1); i < o; i++) module$contents$jspb$Message_Message.compareFields(n[i], t[i]) || (r[i] = t[i]);
		return new e.constructor(r);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.difference", module$contents$jspb$Message_Message.difference), module$contents$jspb$Message_Message.equals = function(e, t) {
		return e == t || !(!e || !t) && e instanceof t.constructor && module$contents$jspb$Message_Message.compareFields(e.toArray(), t.toArray());
	}, goog.exportSymbol("module$contents$jspb$Message_Message.equals", module$contents$jspb$Message_Message.equals), module$contents$jspb$Message_Message.compareExtensions = function(e, t) {
		e ||= {}, t ||= {};
		var n = {}, r;
		for (r in e) n[r] = 0;
		for (r in t) n[r] = 0;
		for (r in n) if (!module$contents$jspb$Message_Message.compareFields(e[r], t[r])) return !1;
		return !0;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.compareExtensions", module$contents$jspb$Message_Message.compareExtensions), module$contents$jspb$Message_Message.compareFields = function(e, t) {
		if (e == t) return !0;
		if (!goog.isObject(e) || !goog.isObject(t)) return typeof e == "number" && isNaN(e) || typeof t == "number" && isNaN(t) ? String(e) == String(t) : !1;
		if (e.constructor != t.constructor) return !1;
		if (module$contents$jspb$Message_Message.SUPPORTS_UINT8ARRAY_ && e.constructor === Uint8Array) {
			if (e.length != t.length) return !1;
			for (var n = 0; n < e.length; n++) if (e[n] != t[n]) return !1;
			return !0;
		}
		if (e.constructor === Array) {
			var r = void 0, i = void 0, o = Math.max(e.length, t.length);
			for (n = 0; n < o; n++) {
				var s = e[n], c = t[n];
				if (s && s.constructor == Object && (module$contents$jspb$asserts_assert(r === void 0), module$contents$jspb$asserts_assert(n === e.length - 1), r = s, s = void 0), c && c.constructor == Object && (module$contents$jspb$asserts_assert(i === void 0), module$contents$jspb$asserts_assert(n === t.length - 1), i = c, c = void 0), !module$contents$jspb$Message_Message.compareFields(s, c)) return !1;
			}
			return r || i ? (r ||= {}, i ||= {}, module$contents$jspb$Message_Message.compareExtensions(r, i)) : !0;
		}
		if (e.constructor === Object) return module$contents$jspb$Message_Message.compareExtensions(e, t);
		throw Error("Invalid type in JSPB array");
	}, goog.exportSymbol("module$contents$jspb$Message_Message.compareFields", module$contents$jspb$Message_Message.compareFields), module$contents$jspb$Message_Message.prototype.cloneMessage = function() {
		return module$contents$jspb$Message_Message.cloneMessage(this);
	}, goog.exportProperty(module$contents$jspb$Message_Message.prototype, "cloneMessage", module$contents$jspb$Message_Message.prototype.cloneMessage), module$contents$jspb$Message_Message.prototype.clone = function() {
		return module$contents$jspb$Message_Message.cloneMessage(this);
	}, goog.exportProperty(module$contents$jspb$Message_Message.prototype, "clone", module$contents$jspb$Message_Message.prototype.clone), module$contents$jspb$Message_Message.clone = function(e) {
		return module$contents$jspb$Message_Message.cloneMessage(e);
	}, goog.exportSymbol("module$contents$jspb$Message_Message.clone", module$contents$jspb$Message_Message.clone), module$contents$jspb$Message_Message.cloneMessage = function(e) {
		return new e.constructor(module$contents$jspb$Message_Message.clone_(e.toArray()));
	}, module$contents$jspb$Message_Message.copyInto = function(e, t) {
		module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message), module$contents$jspb$asserts_assertInstanceof(t, module$contents$jspb$Message_Message), module$contents$jspb$asserts_assert(e.constructor == t.constructor, "Copy source and target message should have the same type."), e = module$contents$jspb$Message_Message.clone(e);
		for (var n = t.toArray(), r = e.toArray(), i = n.length = 0; i < r.length; i++) n[i] = r[i];
		t.wrappers_ = e.wrappers_, t.extensionObject_ = e.extensionObject_;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.copyInto", module$contents$jspb$Message_Message.copyInto), module$contents$jspb$Message_Message.clone_ = function(e) {
		if (Array.isArray(e)) {
			for (var t = Array(e.length), n = 0; n < e.length; n++) {
				var r = e[n];
				r != null && (t[n] = typeof r == "object" ? module$contents$jspb$Message_Message.clone_(module$contents$jspb$asserts_assert(r)) : r);
			}
			return t;
		}
		if (module$contents$jspb$Message_Message.SUPPORTS_UINT8ARRAY_ && e instanceof Uint8Array) return new Uint8Array(e);
		for (n in t = {}, e) r = e[n], r != null && (t[n] = typeof r == "object" ? module$contents$jspb$Message_Message.clone_(module$contents$jspb$asserts_assert(r)) : r);
		return t;
	}, module$contents$jspb$Message_Message.registerMessageType = function(e, t) {
		t.messageId = e;
	}, goog.exportSymbol("module$contents$jspb$Message_Message.registerMessageType", module$contents$jspb$Message_Message.registerMessageType), module$contents$jspb$Message_Message.messageSetExtensions = {}, module$contents$jspb$Message_Message.messageSetExtensionsBinary = {}, jspb.Message = module$contents$jspb$Message_Message, jspb.debug = {};
	function module$contents$jspb$debug_dump(e) {
		return goog.DEBUG ? (module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message, "jspb.Message instance expected"), module$contents$jspb$asserts_assert(e.getExtension, "Only unobfuscated and unoptimized compilation modes supported."), module$contents$jspb$debug_dump_(e)) : null;
	}
	function module$contents$jspb$debug_dump_(e) {
		var t = goog.typeOf(e);
		if (t == "number" || t == "string" || t == "boolean" || t == "null" || t == "undefined" || typeof Uint8Array < "u" && e instanceof Uint8Array) return e;
		if (t == "array") return module$contents$jspb$asserts_assertArray(e), module$contents$goog$array_map(e, module$contents$jspb$debug_dump_);
		if (e instanceof module$contents$jspb$Map_Map) {
			var n = {};
			e = e.entries();
			for (var r = e.next(); !r.done; r = e.next()) n[r.value[0]] = module$contents$jspb$debug_dump_(r.value[1]);
			return n;
		}
		module$contents$jspb$asserts_assertInstanceof(e, module$contents$jspb$Message_Message, "Only messages expected: " + e), t = e.constructor;
		var i = { $name: t.name || t.displayName };
		for (c in t.prototype) {
			var o = /^get([A-Z]\w*)/.exec(c);
			if (o && c != "getExtension" && c != "getJsPbMessageId") {
				var s = "has" + o[1];
				(!e[s] || e[s]()) && (s = e[c](), i[module$contents$jspb$debug_formatFieldName_(o[1])] = module$contents$jspb$debug_dump_(s));
			}
		}
		if (COMPILED && e.extensionObject_) return i.$extensions = "Recursive dumping of extensions not supported in compiled code. Switch to uncompiled or dump extension object directly", i;
		for (r in t.extensions) if (/^\d+$/.test(r)) {
			o = t.extensions[r];
			var c = e.getExtension(o);
			o = module$contents$goog$object_getKeys(o.fieldName)[0], c != null && (n ||= i.$extensions = {}, n[module$contents$jspb$debug_formatFieldName_(o)] = module$contents$jspb$debug_dump_(c));
		}
		return i;
	}
	function module$contents$jspb$debug_formatFieldName_(e) {
		return e.replace(/^[A-Z]/, function(e) {
			return e.toLowerCase();
		});
	}
	jspb.debug.dump = module$contents$jspb$debug_dump, jspb.BinaryReader = module$contents$jspb$binary$reader_BinaryReader, jspb.binary.encoder = {};
	var module$contents$jspb$binary$encoder_MAX_PUSH = 8192, module$contents$jspb$binary$encoder_BinaryEncoder = class {
		constructor() {
			this.buffer_ = [];
		}
		length() {
			return this.buffer_.length;
		}
		end() {
			let e = this.buffer_;
			return this.buffer_ = [], e;
		}
		writeSplitVarint64(e, t) {
			for (goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(t == Math.floor(t)), goog.asserts.assert(0 <= e && e < module$contents$jspb$BinaryConstants_TWO_TO_32), goog.asserts.assert(0 <= t && t < module$contents$jspb$BinaryConstants_TWO_TO_32); 0 < t || 127 < e;) this.buffer_.push(e & 127 | 128), e = (e >>> 7 | t << 25) >>> 0, t >>>= 7;
			this.buffer_.push(e);
		}
		writeSplitFixed64(e, t) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(t == Math.floor(t)), goog.asserts.assert(0 <= e && e < module$contents$jspb$BinaryConstants_TWO_TO_32), goog.asserts.assert(0 <= t && t < module$contents$jspb$BinaryConstants_TWO_TO_32), this.writeUint32(e), this.writeUint32(t);
		}
		writeSplitZigzagVarint64(e, t) {
			module$contents$jspb$utils_toZigzag64(e, t, (e, t) => {
				this.writeSplitVarint64(e >>> 0, t >>> 0);
			});
		}
		writeUnsignedVarint32(e) {
			for (goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(0 <= e && e < module$contents$jspb$BinaryConstants_TWO_TO_32); 127 < e;) this.buffer_.push(e & 127 | 128), e >>>= 7;
			this.buffer_.push(e);
		}
		writeSignedVarint32(e) {
			if (goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(e >= -module$contents$jspb$BinaryConstants_TWO_TO_31 && e < module$contents$jspb$BinaryConstants_TWO_TO_31), 0 <= e) this.writeUnsignedVarint32(e);
			else {
				for (let t = 0; 9 > t; t++) this.buffer_.push(e & 127 | 128), e >>= 7;
				this.buffer_.push(1);
			}
		}
		writeUnsignedVarint64(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(0 <= e && e < module$contents$jspb$BinaryConstants_TWO_TO_64), module$contents$jspb$utils_splitInt64(e), this.writeSplitVarint64(module$contents$jspb$utils_getSplit64Low(), module$contents$jspb$utils_getSplit64High());
		}
		writeSignedVarint64(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(e >= -module$contents$jspb$BinaryConstants_TWO_TO_63 && e < module$contents$jspb$BinaryConstants_TWO_TO_63), module$contents$jspb$utils_splitInt64(e), this.writeSplitVarint64(module$contents$jspb$utils_getSplit64Low(), module$contents$jspb$utils_getSplit64High());
		}
		writeZigzagVarint32(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(e >= -module$contents$jspb$BinaryConstants_TWO_TO_31 && e < module$contents$jspb$BinaryConstants_TWO_TO_31), this.writeUnsignedVarint32(module$contents$jspb$utils_toZigzag32(e));
		}
		writeZigzagVarint64(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(e >= -module$contents$jspb$BinaryConstants_TWO_TO_63 && e < module$contents$jspb$BinaryConstants_TWO_TO_63), module$contents$jspb$utils_splitZigzag64(e), this.writeSplitVarint64(module$contents$jspb$utils_getSplit64Low(), module$contents$jspb$utils_getSplit64High());
		}
		writeZigzagVarint64String(e) {
			module$contents$jspb$utils_splitDecimalString(e), module$contents$jspb$utils_toZigzag64(module$contents$jspb$utils_getSplit64Low(), module$contents$jspb$utils_getSplit64High(), (e, t) => {
				this.writeSplitVarint64(e >>> 0, t >>> 0);
			});
		}
		writeUint8(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(0 <= e && 256 > e), this.buffer_.push(e >>> 0 & 255);
		}
		writeUint16(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(0 <= e && 65536 > e), this.buffer_.push(e >>> 0 & 255), this.buffer_.push(e >>> 8 & 255);
		}
		writeUint32(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(0 <= e && e < module$contents$jspb$BinaryConstants_TWO_TO_32), this.buffer_.push(e >>> 0 & 255), this.buffer_.push(e >>> 8 & 255), this.buffer_.push(e >>> 16 & 255), this.buffer_.push(e >>> 24 & 255);
		}
		writeUint64(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(0 <= e && e < module$contents$jspb$BinaryConstants_TWO_TO_64), module$contents$jspb$utils_splitUint64(e), this.writeUint32(module$contents$jspb$utils_getSplit64Low()), this.writeUint32(module$contents$jspb$utils_getSplit64High());
		}
		writeInt8(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(-128 <= e && 128 > e), this.buffer_.push(e >>> 0 & 255);
		}
		writeInt16(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(-32768 <= e && 32768 > e), this.buffer_.push(e >>> 0 & 255), this.buffer_.push(e >>> 8 & 255);
		}
		writeInt32(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(e >= -module$contents$jspb$BinaryConstants_TWO_TO_31 && e < module$contents$jspb$BinaryConstants_TWO_TO_31), this.buffer_.push(e >>> 0 & 255), this.buffer_.push(e >>> 8 & 255), this.buffer_.push(e >>> 16 & 255), this.buffer_.push(e >>> 24 & 255);
		}
		writeInt64(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(e >= -module$contents$jspb$BinaryConstants_TWO_TO_63 && e < module$contents$jspb$BinaryConstants_TWO_TO_63), module$contents$jspb$utils_splitInt64(e), this.writeSplitFixed64(module$contents$jspb$utils_getSplit64Low(), module$contents$jspb$utils_getSplit64High());
		}
		writeFloat(e) {
			goog.asserts.assert(e == Infinity || e == -Infinity || isNaN(e) || typeof e == "number" && e >= -module$contents$jspb$BinaryConstants_FLOAT32_MAX && e <= module$contents$jspb$BinaryConstants_FLOAT32_MAX), module$contents$jspb$utils_splitFloat32(e), this.writeUint32(module$contents$jspb$utils_getSplit64Low());
		}
		writeDouble(e) {
			goog.asserts.assert(typeof e == "number" || e === "Infinity" || e === "-Infinity" || e === "NaN"), module$contents$jspb$utils_splitFloat64(e), this.writeUint32(module$contents$jspb$utils_getSplit64Low()), this.writeUint32(module$contents$jspb$utils_getSplit64High());
		}
		writeBool(e) {
			goog.asserts.assert(typeof e == "boolean" || typeof e == "number"), this.buffer_.push(+!!e);
		}
		writeEnum(e) {
			goog.asserts.assert(e == Math.floor(e)), goog.asserts.assert(e >= -module$contents$jspb$BinaryConstants_TWO_TO_31 && e < module$contents$jspb$BinaryConstants_TWO_TO_31), this.writeSignedVarint32(e);
		}
		writeBytes(e) {
			for (; e.length > module$contents$jspb$binary$encoder_MAX_PUSH;) Array.prototype.push.apply(this.buffer_, e.subarray(0, module$contents$jspb$binary$encoder_MAX_PUSH)), e = e.subarray(module$contents$jspb$binary$encoder_MAX_PUSH);
			Array.prototype.push.apply(this.buffer_, e);
		}
	};
	jspb.binary.encoder.BinaryEncoder = module$contents$jspb$binary$encoder_BinaryEncoder, jspb.arith = {};
	var module$contents$jspb$arith_UInt64 = class e {
		constructor(e, t) {
			this.lo = e >>> 0, this.hi = t >>> 0;
		}
		toDecimalString() {
			return module$contents$jspb$utils_joinUnsignedDecimalString(this.lo, this.hi);
		}
		negateInTwosComplement() {
			return this.lo === 0 ? new e(0, 1 + ~this.hi) : new e(~this.lo + 1, ~this.hi);
		}
		static fromBigInt(t) {
			return t = BigInt.asUintN(64, t), new e(Number(t & BigInt(4294967295)), Number(t >> BigInt(32)));
		}
		static fromString(t) {
			return t ? /^\d+$/.test(t) ? (module$contents$jspb$utils_splitDecimalString(t), new e(module$contents$jspb$utils_getSplit64Low(), module$contents$jspb$utils_getSplit64High())) : null : e.getZero();
		}
		static fromNumber(t) {
			return new e(t & module$contents$jspb$arith_ALL_32_BITS, t / module$contents$jspb$arith_TWO_PWR_32_DBL);
		}
		static getZero() {
			return module$contents$jspb$arith_uint64Zero ||= new e(0, 0);
		}
	}, module$contents$jspb$arith_uint64Zero, module$contents$jspb$arith_Int64 = class e {
		constructor(e, t) {
			this.lo = e >>> 0, this.hi = t >>> 0;
		}
		toDecimalString() {
			return module$contents$jspb$utils_joinSignedDecimalString(this.lo, this.hi);
		}
		static fromBigInt(t) {
			return t = BigInt.asUintN(64, t), new e(Number(t & BigInt(4294967295)), Number(t >> BigInt(32)));
		}
		static fromString(t) {
			return t ? /^-?\d+$/.test(t) ? (module$contents$jspb$utils_splitDecimalString(t), new e(module$contents$jspb$utils_getSplit64Low(), module$contents$jspb$utils_getSplit64High())) : null : e.getZero();
		}
		static fromNumber(t) {
			return new e(t & module$contents$jspb$arith_ALL_32_BITS, t / module$contents$jspb$arith_TWO_PWR_32_DBL);
		}
		static getZero() {
			return module$contents$jspb$arith_int64Zero ||= new e(0, 0);
		}
	}, module$contents$jspb$arith_int64Zero, module$contents$jspb$arith_ALL_32_BITS = 4294967295, module$contents$jspb$arith_TWO_PWR_32_DBL = 4294967296;
	jspb.arith.UInt64 = module$contents$jspb$arith_UInt64, jspb.arith.Int64 = module$contents$jspb$arith_Int64, jspb.binary.writer = {};
	var module$contents$jspb$binary$writer_REJECT_UNPAIRED_SURROGATES = goog.DEBUG, module$contents$jspb$binary$writer_BinaryWriter = class {
		constructor() {
			this.blocks_ = [], this.totalLength_ = 0, this.encoder_ = new module$contents$jspb$binary$encoder_BinaryEncoder();
		}
		pushBlock(e) {
			e.length !== 0 && (this.blocks_.push(e), this.totalLength_ += e.length);
		}
		appendUint8Array_(e) {
			this.pushBlock(this.encoder_.end()), this.pushBlock(e);
		}
		beginDelimited_(e) {
			return this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), e = this.encoder_.end(), this.pushBlock(e), e.push(this.totalLength_), e;
		}
		endDelimited_(e) {
			var t = e.pop();
			for (t = this.totalLength_ + this.encoder_.length() - t, (0, goog.asserts.assert)(0 <= t); 127 < t;) e.push(t & 127 | 128), t >>>= 7, this.totalLength_++;
			e.push(t), this.totalLength_++;
		}
		writeUnknownFields(e) {
			this.pushBlock(this.encoder_.end());
			for (let t = 0; t < e.length; t++) this.pushBlock(module$contents$jspb$unsafe_bytestring_unsafeUint8ArrayFromByteString(e[t]));
		}
		writeSerializedMessage(e, t, n) {
			this.appendUint8Array_(e.subarray(t, n));
		}
		maybeWriteSerializedMessage(e, t, n) {
			e != null && t != null && n != null && this.writeSerializedMessage(e, t, n);
		}
		reset() {
			this.blocks_ = [], this.encoder_.end(), this.totalLength_ = 0;
		}
		getResultBuffer() {
			this.pushBlock(this.encoder_.end());
			let e = new Uint8Array(this.totalLength_), t = this.blocks_, n = t.length, r = 0;
			for (let i = 0; i < n; i++) {
				let n = t[i];
				e.set(n, r), r += n.length;
			}
			return (0, goog.asserts.assert)(r == e.length), this.blocks_ = [e], e;
		}
		getResultBufferAsByteString() {
			return module$contents$jspb$unsafe_bytestring_unsafeByteStringFromUint8Array(this.getResultBuffer());
		}
		getResultBase64String(e) {
			return e === void 0 ? module$contents$jspb$internal_bytes_encodeByteArray(this.getResultBuffer()) : (0, goog.crypt.base64.encodeByteArray)(this.getResultBuffer(), e);
		}
		writeFieldHeader_(e, t) {
			(0, goog.asserts.assert)(1 <= e && e == Math.floor(e)), this.encoder_.writeUnsignedVarint32(module$contents$jspb$utils_makeTag(e, t));
		}
		writeAny(e, t, n) {
			switch (e) {
				case module$contents$jspb$BinaryConstants_FieldType.DOUBLE:
					this.writeDouble(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.FLOAT:
					this.writeFloat(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.INT64:
					this.writeInt64(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.UINT64:
					this.writeUint64(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.INT32:
					this.writeInt32(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.FIXED64:
					this.writeFixed64(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.FIXED32:
					this.writeFixed32(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.BOOL:
					this.writeBool(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.STRING:
					this.writeString(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.GROUP:
					(0, goog.asserts.fail)("Group field type not supported in writeAny()");
					break;
				case module$contents$jspb$BinaryConstants_FieldType.MESSAGE:
					(0, goog.asserts.fail)("Message field type not supported in writeAny()");
					break;
				case module$contents$jspb$BinaryConstants_FieldType.BYTES:
					this.writeBytes(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.UINT32:
					this.writeUint32(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.ENUM:
					this.writeEnum(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.SFIXED32:
					this.writeSfixed32(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.SFIXED64:
					this.writeSfixed64(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.SINT32:
					this.writeSint32(t, n);
					break;
				case module$contents$jspb$BinaryConstants_FieldType.SINT64:
					this.writeSint64(t, n);
					break;
				default: (0, goog.asserts.fail)("Invalid field type in writeAny()");
			}
		}
		writeUnsignedVarint32_(e, t) {
			t != null && (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), this.encoder_.writeUnsignedVarint32(t));
		}
		writeSignedVarint32_(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertSignedInteger(e, t), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), this.encoder_.writeSignedVarint32(t));
		}
		writeUnsignedVarint64_(e, t) {
			if (t != null) switch (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), typeof t) {
				case "number":
					this.encoder_.writeUnsignedVarint64(t);
					break;
				case "bigint":
					e = module$contents$jspb$arith_UInt64.fromBigInt(t), this.encoder_.writeSplitVarint64(e.lo, e.hi);
					break;
				default: e = module$contents$jspb$arith_UInt64.fromString(t), this.encoder_.writeSplitVarint64(e.lo, e.hi);
			}
		}
		writeSignedVarint64_(e, t) {
			if (t != null) switch (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), typeof t) {
				case "number":
					this.encoder_.writeSignedVarint64(t);
					break;
				case "bigint":
					e = module$contents$jspb$arith_Int64.fromBigInt(t), this.encoder_.writeSplitVarint64(e.lo, e.hi);
					break;
				default: e = module$contents$jspb$arith_Int64.fromString(t), this.encoder_.writeSplitVarint64(e.lo, e.hi);
			}
		}
		writeZigzagVarint32_(e, t) {
			t != null && (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), this.encoder_.writeZigzagVarint32(t));
		}
		writeZigzagVarint64_(e, t) {
			if (t != null) switch (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), typeof t) {
				case "number":
					this.encoder_.writeZigzagVarint64(t);
					break;
				default: this.encoder_.writeZigzagVarint64String(t);
			}
		}
		writeInt32(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertThat(e, t, t >= -module$contents$jspb$BinaryConstants_TWO_TO_31 && t < module$contents$jspb$BinaryConstants_TWO_TO_31), this.writeSignedVarint32_(e, t));
		}
		writeInt64(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertSignedInt64(e, t), this.writeSignedVarint64_(e, t));
		}
		writeInt64String(e, t) {
			this.writeInt64(e, t);
		}
		writeUint32(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertThat(e, t, 0 <= t && t < module$contents$jspb$BinaryConstants_TWO_TO_32), this.writeUnsignedVarint32_(e, t));
		}
		writeUint64(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertUnsignedInt64(e, t), this.writeUnsignedVarint64_(e, t));
		}
		writeUint64String(e, t) {
			this.writeUint64(e, t);
		}
		writeSint32(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertThat(e, t, t >= -module$contents$jspb$BinaryConstants_TWO_TO_31 && t < module$contents$jspb$BinaryConstants_TWO_TO_31), this.writeZigzagVarint32_(e, t));
		}
		writeSint64(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertSignedInt64(e, t), this.writeZigzagVarint64_(e, t));
		}
		writeSint64String(e, t) {
			this.writeSint64(e, t);
		}
		writeFixed32(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertThat(e, t, 0 <= t && t < module$contents$jspb$BinaryConstants_TWO_TO_32), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.FIXED32), this.encoder_.writeUint32(t));
		}
		writeFixed64(e, t) {
			if (t != null) switch (module$contents$jspb$binary$writer_assertUnsignedInt64(e, t), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.FIXED64), typeof t) {
				case "number":
					this.encoder_.writeUint64(t);
					break;
				case "bigint":
					e = module$contents$jspb$arith_UInt64.fromBigInt(t), this.encoder_.writeSplitFixed64(e.lo, e.hi);
					break;
				default: e = module$contents$jspb$arith_UInt64.fromString(t), this.encoder_.writeSplitFixed64(e.lo, e.hi);
			}
		}
		writeFixed64String(e, t) {
			this.writeFixed64(e, t);
		}
		writeSfixed32(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertThat(e, t, t >= -module$contents$jspb$BinaryConstants_TWO_TO_31 && t < module$contents$jspb$BinaryConstants_TWO_TO_31), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.FIXED32), this.encoder_.writeInt32(t));
		}
		writeSfixed64(e, t) {
			if (t != null) switch (module$contents$jspb$binary$writer_assertSignedInt64(e, t), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.FIXED64), typeof t) {
				case "number":
					this.encoder_.writeInt64(t);
					break;
				case "bigint":
					e = module$contents$jspb$arith_Int64.fromBigInt(t), this.encoder_.writeSplitFixed64(e.lo, e.hi);
					break;
				default: e = module$contents$jspb$arith_Int64.fromString(t), this.encoder_.writeSplitFixed64(e.lo, e.hi);
			}
		}
		writeSfixed64String(e, t) {
			this.writeSfixed64(e, t);
		}
		writeFloat(e, t) {
			t != null && (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.FIXED32), this.encoder_.writeFloat(t));
		}
		writeDouble(e, t) {
			t != null && (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.FIXED64), this.encoder_.writeDouble(t));
		}
		writeBool(e, t) {
			t != null && (module$contents$jspb$binary$writer_assertThat(e, t, typeof t == "boolean" || typeof t == "number"), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), this.encoder_.writeBool(t));
		}
		writeEnum(e, t) {
			t != null && (t = parseInt(t, 10), module$contents$jspb$binary$writer_assertSignedInteger(e, t), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), this.encoder_.writeSignedVarint32(t));
		}
		writeString(e, t) {
			t != null && this.writeUint8Array(e, module$contents$jspb$binary$utf8_encodeUtf8(t, module$contents$jspb$binary$writer_REJECT_UNPAIRED_SURROGATES));
		}
		writeBytes(e, t) {
			t != null && this.writeUint8Array(e, module$contents$jspb$binary$internal_buffer_bufferFromSource(t, !0).buffer);
		}
		writeUint8Array(e, t) {
			this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), this.encoder_.writeUnsignedVarint32(t.length), this.appendUint8Array_(t);
		}
		writeMessage(e, t, n) {
			t != null && (e = this.beginDelimited_(e), n(t, this), this.endDelimited_(e));
		}
		writeMessageSet(e, t, n) {
			t != null && (this.writeFieldHeader_(1, module$contents$jspb$BinaryConstants_WireType.START_GROUP), this.writeFieldHeader_(2, module$contents$jspb$BinaryConstants_WireType.VARINT), this.encoder_.writeSignedVarint32(e), e = this.beginDelimited_(3), n(t, this), this.endDelimited_(e), this.writeFieldHeader_(1, module$contents$jspb$BinaryConstants_WireType.END_GROUP));
		}
		writeGroup(e, t, n) {
			t != null && (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.START_GROUP), n(t, this), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.END_GROUP));
		}
		writeSplitFixed64(e, t, n) {
			this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.FIXED64), this.encoder_.writeSplitFixed64(t, n);
		}
		writeSplitVarint64(e, t, n) {
			this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), this.encoder_.writeSplitVarint64(t, n);
		}
		writeSplitZigzagVarint64(e, t, n) {
			this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.VARINT), this.encoder_.writeSplitZigzagVarint64(t >>> 0, n >>> 0);
		}
		writeRepeatedInt32(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeSignedVarint32_(e, t[n]);
		}
		writeRepeatedInt64(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeSignedVarint64_(e, t[n]);
		}
		writeRepeatedSplitFixed64(e, t, n, r) {
			if (t != null) for (let i = 0; i < t.length; i++) this.writeSplitFixed64(e, n(t[i]), r(t[i]));
		}
		writeRepeatedSplitVarint64(e, t, n, r) {
			if (t != null) for (let i = 0; i < t.length; i++) this.writeSplitVarint64(e, n(t[i]), r(t[i]));
		}
		writeRepeatedSplitZigzagVarint64(e, t, n, r) {
			if (t != null) for (let i = 0; i < t.length; i++) this.writeSplitZigzagVarint64(e, n(t[i]), r(t[i]));
		}
		writeRepeatedInt64String(e, t) {
			this.writeRepeatedInt64(e, t);
		}
		writeRepeatedUint32(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeUnsignedVarint32_(e, t[n]);
		}
		writeRepeatedUint64(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeUnsignedVarint64_(e, t[n]);
		}
		writeRepeatedUint64String(e, t) {
			this.writeRepeatedUint64(e, t);
		}
		writeRepeatedSint32(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeZigzagVarint32_(e, t[n]);
		}
		writeRepeatedSint64(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeZigzagVarint64_(e, t[n]);
		}
		writeRepeatedSint64String(e, t) {
			this.writeRepeatedSint64(e, t);
		}
		writeRepeatedFixed32(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeFixed32(e, t[n]);
		}
		writeRepeatedFixed64(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeFixed64(e, t[n]);
		}
		writeRepeatedFixed64String(e, t) {
			this.writeRepeatedFixed64(e, t);
		}
		writeRepeatedSfixed32(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeSfixed32(e, t[n]);
		}
		writeRepeatedSfixed64(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeSfixed64(e, t[n]);
		}
		writeRepeatedSfixed64String(e, t) {
			this.writeRepeatedSfixed64(e, t);
		}
		writeRepeatedFloat(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeFloat(e, t[n]);
		}
		writeRepeatedDouble(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeDouble(e, t[n]);
		}
		writeRepeatedBool(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeBool(e, t[n]);
		}
		writeRepeatedEnum(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeEnum(e, t[n]);
		}
		writeRepeatedString(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeString(e, t[n]);
		}
		writeRepeatedBytes(e, t) {
			if (t != null) for (let n = 0; n < t.length; n++) this.writeBytes(e, t[n]);
		}
		writeRepeatedMessage(e, t, n) {
			if (t != null) for (let r = 0; r < t.length; r++) {
				let i = this.beginDelimited_(e);
				n(t[r], this), this.endDelimited_(i);
			}
		}
		writeRepeatedGroup(e, t, n) {
			if (t != null) for (let r = 0; r < t.length; r++) this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.START_GROUP), n(t[r], this), this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.END_GROUP);
		}
		writePackedInt32(e, t) {
			if (t != null && t.length) {
				var n = this.beginDelimited_(e);
				for (let n = 0; n < t.length; n++) module$contents$jspb$binary$writer_assertSignedInteger(e, t[n]), this.encoder_.writeSignedVarint32(t[n]);
				this.endDelimited_(n);
			}
		}
		writePackedInt32String(e, t) {
			if (t != null && t.length) {
				var n = this.beginDelimited_(e);
				for (let n = 0; n < t.length; n++) {
					let r = parseInt(t[n], 10);
					module$contents$jspb$binary$writer_assertSignedInteger(e, r), this.encoder_.writeSignedVarint32(r);
				}
				this.endDelimited_(n);
			}
		}
		writePackedInt64(e, t) {
			if (t != null && t.length) {
				e = this.beginDelimited_(e);
				for (let e = 0; e < t.length; e++) {
					var n = t[e];
					switch (typeof n) {
						case "number":
							this.encoder_.writeSignedVarint64(n);
							break;
						case "bigint":
							n = module$contents$jspb$arith_Int64.fromBigInt(n), this.encoder_.writeSplitVarint64(n.lo, n.hi);
							break;
						default: n = module$contents$jspb$arith_Int64.fromString(n), this.encoder_.writeSplitVarint64(n.lo, n.hi);
					}
				}
				this.endDelimited_(e);
			}
		}
		writePackedSplitFixed64(e, t, n, r) {
			if (t != null) {
				e = this.beginDelimited_(e);
				for (let e = 0; e < t.length; e++) this.encoder_.writeSplitFixed64(n(t[e]), r(t[e]));
				this.endDelimited_(e);
			}
		}
		writePackedSplitVarint64(e, t, n, r) {
			if (t != null) {
				e = this.beginDelimited_(e);
				for (let e = 0; e < t.length; e++) this.encoder_.writeSplitVarint64(n(t[e]), r(t[e]));
				this.endDelimited_(e);
			}
		}
		writePackedSplitZigzagVarint64(e, t, n, r) {
			if (t != null) {
				e = this.beginDelimited_(e);
				var i = this.encoder_;
				for (let e = 0; e < t.length; e++) i.writeSplitZigzagVarint64(n(t[e]), r(t[e]));
				this.endDelimited_(e);
			}
		}
		writePackedInt64String(e, t) {
			this.writePackedInt64(e, t);
		}
		writePackedUint32(e, t) {
			if (t != null && t.length) {
				e = this.beginDelimited_(e);
				for (let e = 0; e < t.length; e++) this.encoder_.writeUnsignedVarint32(t[e]);
				this.endDelimited_(e);
			}
		}
		writePackedUint64(e, t) {
			if (t != null && t.length) {
				e = this.beginDelimited_(e);
				for (let e = 0; e < t.length; e++) {
					var n = t[e];
					switch (typeof n) {
						case "number":
							this.encoder_.writeUnsignedVarint64(n);
							break;
						case "bigint":
							let e = Number(n);
							Number.isSafeInteger(e) ? this.encoder_.writeUnsignedVarint64(e) : (n = module$contents$jspb$arith_UInt64.fromBigInt(n), this.encoder_.writeSplitVarint64(n.lo, n.hi));
							break;
						default: n = module$contents$jspb$arith_UInt64.fromString(n), this.encoder_.writeSplitVarint64(n.lo, n.hi);
					}
				}
				this.endDelimited_(e);
			}
		}
		writePackedUint64String(e, t) {
			this.writePackedUint64(e, t);
		}
		writePackedSint32(e, t) {
			if (t != null && t.length) {
				e = this.beginDelimited_(e);
				for (let e = 0; e < t.length; e++) this.encoder_.writeZigzagVarint32(t[e]);
				this.endDelimited_(e);
			}
		}
		writePackedSint64(e, t) {
			if (t != null && t.length) {
				e = this.beginDelimited_(e);
				for (let e = 0; e < t.length; e++) {
					let n = t[e];
					switch (typeof n) {
						case "number":
							this.encoder_.writeZigzagVarint64(n);
							break;
						default: this.encoder_.writeZigzagVarint64String(n);
					}
				}
				this.endDelimited_(e);
			}
		}
		writePackedSint64String(e, t) {
			this.writePackedSint64(e, t);
		}
		writePackedFixed32(e, t) {
			if (t != null && t.length) for (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), this.encoder_.writeUnsignedVarint32(4 * t.length), e = 0; e < t.length; e++) this.encoder_.writeUint32(t[e]);
		}
		writePackedFixed64(e, t) {
			if (t != null && t.length) for (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), this.encoder_.writeUnsignedVarint32(8 * t.length), e = 0; e < t.length; e++) {
				var n = t[e];
				switch (typeof n) {
					case "number":
						this.encoder_.writeUint64(n);
						break;
					case "bigint":
						n = module$contents$jspb$arith_UInt64.fromBigInt(n), this.encoder_.writeSplitFixed64(n.lo, n.hi);
						break;
					default: n = module$contents$jspb$arith_UInt64.fromString(n), this.encoder_.writeSplitFixed64(n.lo, n.hi);
				}
			}
		}
		writePackedFixed64String(e, t) {
			this.writePackedFixed64(e, t);
		}
		writePackedSfixed32(e, t) {
			if (t != null && t.length) for (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), this.encoder_.writeUnsignedVarint32(4 * t.length), e = 0; e < t.length; e++) this.encoder_.writeInt32(t[e]);
		}
		writePackedSfixed64(e, t) {
			if (t != null && t.length) for (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), this.encoder_.writeUnsignedVarint32(8 * t.length), e = 0; e < t.length; e++) {
				var n = t[e];
				switch (typeof n) {
					case "number":
						this.encoder_.writeInt64(n);
						break;
					case "bigint":
						n = module$contents$jspb$arith_Int64.fromBigInt(n), this.encoder_.writeSplitFixed64(n.lo, n.hi);
						break;
					default: n = module$contents$jspb$arith_Int64.fromString(n), this.encoder_.writeSplitFixed64(n.lo, n.hi);
				}
			}
		}
		writePackedSfixed64String(e, t) {
			this.writePackedSfixed64(e, t);
		}
		writePackedFloat(e, t) {
			if (t != null && t.length) for (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), this.encoder_.writeUnsignedVarint32(4 * t.length), e = 0; e < t.length; e++) this.encoder_.writeFloat(t[e]);
		}
		writePackedDouble(e, t) {
			if (t != null && t.length) for (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), this.encoder_.writeUnsignedVarint32(8 * t.length), e = 0; e < t.length; e++) this.encoder_.writeDouble(t[e]);
		}
		writePackedBool(e, t) {
			if (t != null && t.length) for (this.writeFieldHeader_(e, module$contents$jspb$BinaryConstants_WireType.DELIMITED), this.encoder_.writeUnsignedVarint32(t.length), e = 0; e < t.length; e++) this.encoder_.writeBool(t[e]);
		}
		writePackedEnum(e, t) {
			if (t != null && t.length) {
				e = this.beginDelimited_(e);
				for (let e = 0; e < t.length; e++) this.encoder_.writeEnum(t[e]);
				this.endDelimited_(e);
			}
		}
	};
	function module$contents$jspb$binary$writer_assertSignedInteger(e, t) {
		module$contents$jspb$binary$writer_assertThat(e, t, t === Math.floor(t)), module$contents$jspb$binary$writer_assertThat(e, t, t >= -module$contents$jspb$BinaryConstants_TWO_TO_31 && t < module$contents$jspb$BinaryConstants_TWO_TO_31);
	}
	function module$contents$jspb$binary$writer_assertSignedInt64(e, t) {
		switch (typeof t) {
			case "string":
				module$contents$jspb$binary$writer_assertThat(e, t, module$contents$jspb$arith_Int64.fromString(t));
				break;
			case "number":
				module$contents$jspb$binary$writer_assertThat(e, t, t >= -module$contents$jspb$BinaryConstants_TWO_TO_63 && t < module$contents$jspb$BinaryConstants_TWO_TO_63);
				break;
			default: module$contents$jspb$binary$writer_assertThat(e, t, t >= BigInt(-module$contents$jspb$BinaryConstants_TWO_TO_63) && t < BigInt(module$contents$jspb$BinaryConstants_TWO_TO_63));
		}
	}
	function module$contents$jspb$binary$writer_assertUnsignedInt64(e, t) {
		switch (typeof t) {
			case "string":
				module$contents$jspb$binary$writer_assertThat(e, t, module$contents$jspb$arith_UInt64.fromString(t));
				break;
			case "number":
				module$contents$jspb$binary$writer_assertThat(e, t, 0 <= t && t < module$contents$jspb$BinaryConstants_TWO_TO_64);
				break;
			default: module$contents$jspb$binary$writer_assertThat(e, t, t >= BigInt(0) && t < BigInt(module$contents$jspb$BinaryConstants_TWO_TO_64));
		}
	}
	function module$contents$jspb$binary$writer_assertThat(e, t, n) {
		n || (0, goog.asserts.fail)(`for [${t}] at [${e}]`);
	}
	jspb.binary.writer.BinaryWriter = module$contents$jspb$binary$writer_BinaryWriter, jspb.BinaryWriter = module$contents$jspb$binary$writer_BinaryWriter, jspb.internal = {}, jspb.internal.public_for_gencode = {};
	function module$contents$jspb$internal$public_for_gencode_serializeMapToBinary(e, t, n, r, i, o) {
		e && e.forEach((s, c) => {
			n.writeMessage(t, e, (e, t) => {
				r.call(t, 1, c), i.call(t, 2, s, o);
			});
		});
	}
	function module$contents$jspb$internal$public_for_gencode_deserializeMapFromBinary(e, t, n, r, i, o) {
		t.readMessage(e, (t, s) => {
			t = r;
			let c = o;
			for (; s.nextField() && !s.isEndGroup();) {
				let r = s.getFieldNumber();
				r == 1 ? t = n.call(s) : r == 2 && (e.valueCtor ? s.readMessage(c, i) : c = i.call(s));
			}
			goog.asserts.assert(t != null), goog.asserts.assert(c != null), e.set(t, c);
		});
	}
	jspb.internal.public_for_gencode.deserializeMapFromBinary = module$contents$jspb$internal$public_for_gencode_deserializeMapFromBinary, jspb.internal.public_for_gencode.serializeMapToBinary = module$contents$jspb$internal$public_for_gencode_serializeMapToBinary, jspb.Export = {}, typeof exports == "object" && (exports.debug = jspb.debug, exports.Map = module$contents$jspb$Map_Map, exports.Message = module$contents$jspb$Message_Message, exports.BinaryReader = module$contents$jspb$binary$reader_BinaryReader, exports.BinaryWriter = module$contents$jspb$binary$writer_BinaryWriter, exports.ExtensionFieldInfo = module$contents$jspb$ExtensionFieldInfo_ExtensionFieldInfo, exports.ExtensionFieldBinaryInfo = module$contents$jspb$ExtensionFieldBinaryInfo_ExtensionFieldBinaryInfo, exports.internal = { public_for_gencode: jspb.internal.public_for_gencode }, exports.exportSymbol = goog.exportSymbol, exports.inherits = goog.inherits, exports.object = { extend: module$contents$goog$object_extend }, exports.typeOf = goog.typeOf);
})), require_chat_pb = /* @__PURE__ */ __commonJSMin(((e) => {
	var t = require_google_protobuf(), n = t, r = function() {
		return this ? this : typeof window < "u" ? window : r === void 0 ? typeof self < "u" ? self : Function("return this")() : r;
	}.call(null);
	n.exportSymbol("proto.widgetgrid.v1.Chat", null, r), n.exportSymbol("proto.widgetgrid.v1.ChatEvent", null, r), n.exportSymbol("proto.widgetgrid.v1.ChatMessage", null, r), n.exportSymbol("proto.widgetgrid.v1.ListChatsRequest", null, r), n.exportSymbol("proto.widgetgrid.v1.ListChatsResponse", null, r), n.exportSymbol("proto.widgetgrid.v1.ListMessagesRequest", null, r), n.exportSymbol("proto.widgetgrid.v1.ListMessagesResponse", null, r), n.exportSymbol("proto.widgetgrid.v1.MarkReadRequest", null, r), n.exportSymbol("proto.widgetgrid.v1.MarkReadResponse", null, r), n.exportSymbol("proto.widgetgrid.v1.RenameChatRequest", null, r), n.exportSymbol("proto.widgetgrid.v1.RenameChatResponse", null, r), n.exportSymbol("proto.widgetgrid.v1.SendMessageRequest", null, r), n.exportSymbol("proto.widgetgrid.v1.SendMessageResponse", null, r), n.exportSymbol("proto.widgetgrid.v1.StartOrGetChatRequest", null, r), n.exportSymbol("proto.widgetgrid.v1.StartOrGetChatResponse", null, r), n.exportSymbol("proto.widgetgrid.v1.SubscribeChatEventsRequest", null, r), proto.widgetgrid.v1.Chat = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.Chat, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.Chat.displayName = "proto.widgetgrid.v1.Chat"), proto.widgetgrid.v1.ChatMessage = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.ChatMessage, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.ChatMessage.displayName = "proto.widgetgrid.v1.ChatMessage"), proto.widgetgrid.v1.StartOrGetChatRequest = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.StartOrGetChatRequest, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.StartOrGetChatRequest.displayName = "proto.widgetgrid.v1.StartOrGetChatRequest"), proto.widgetgrid.v1.StartOrGetChatResponse = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.StartOrGetChatResponse, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.StartOrGetChatResponse.displayName = "proto.widgetgrid.v1.StartOrGetChatResponse"), proto.widgetgrid.v1.SendMessageRequest = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.SendMessageRequest, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.SendMessageRequest.displayName = "proto.widgetgrid.v1.SendMessageRequest"), proto.widgetgrid.v1.SendMessageResponse = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.SendMessageResponse, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.SendMessageResponse.displayName = "proto.widgetgrid.v1.SendMessageResponse"), proto.widgetgrid.v1.ListMessagesRequest = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.ListMessagesRequest, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.ListMessagesRequest.displayName = "proto.widgetgrid.v1.ListMessagesRequest"), proto.widgetgrid.v1.ListMessagesResponse = function(e) {
		t.Message.initialize(this, e, 0, -1, proto.widgetgrid.v1.ListMessagesResponse.repeatedFields_, null);
	}, n.inherits(proto.widgetgrid.v1.ListMessagesResponse, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.ListMessagesResponse.displayName = "proto.widgetgrid.v1.ListMessagesResponse"), proto.widgetgrid.v1.ListChatsRequest = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.ListChatsRequest, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.ListChatsRequest.displayName = "proto.widgetgrid.v1.ListChatsRequest"), proto.widgetgrid.v1.ListChatsResponse = function(e) {
		t.Message.initialize(this, e, 0, -1, proto.widgetgrid.v1.ListChatsResponse.repeatedFields_, null);
	}, n.inherits(proto.widgetgrid.v1.ListChatsResponse, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.ListChatsResponse.displayName = "proto.widgetgrid.v1.ListChatsResponse"), proto.widgetgrid.v1.RenameChatRequest = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.RenameChatRequest, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.RenameChatRequest.displayName = "proto.widgetgrid.v1.RenameChatRequest"), proto.widgetgrid.v1.RenameChatResponse = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.RenameChatResponse, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.RenameChatResponse.displayName = "proto.widgetgrid.v1.RenameChatResponse"), proto.widgetgrid.v1.MarkReadRequest = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.MarkReadRequest, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.MarkReadRequest.displayName = "proto.widgetgrid.v1.MarkReadRequest"), proto.widgetgrid.v1.MarkReadResponse = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.MarkReadResponse, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.MarkReadResponse.displayName = "proto.widgetgrid.v1.MarkReadResponse"), proto.widgetgrid.v1.SubscribeChatEventsRequest = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.SubscribeChatEventsRequest, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.SubscribeChatEventsRequest.displayName = "proto.widgetgrid.v1.SubscribeChatEventsRequest"), proto.widgetgrid.v1.ChatEvent = function(e) {
		t.Message.initialize(this, e, 0, -1, null, null);
	}, n.inherits(proto.widgetgrid.v1.ChatEvent, t.Message), n.DEBUG && !COMPILED && (proto.widgetgrid.v1.ChatEvent.displayName = "proto.widgetgrid.v1.ChatEvent"), t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.Chat.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.Chat.toObject(e, this);
	}, proto.widgetgrid.v1.Chat.toObject = function(e, n) {
		var r = {
			id: t.Message.getFieldWithDefault(n, 1, ""),
			label: t.Message.getFieldWithDefault(n, 2, ""),
			hasUnread: t.Message.getBooleanFieldWithDefault(n, 3, !1),
			createdAt: t.Message.getFieldWithDefault(n, 4, "")
		};
		return e && (r.$jspbMessageInstance = n), r;
	}), proto.widgetgrid.v1.Chat.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.Chat();
		return proto.widgetgrid.v1.Chat.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.Chat.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = t.readString();
				e.setId(n);
				break;
			case 2:
				var n = t.readString();
				e.setLabel(n);
				break;
			case 3:
				var n = t.readBool();
				e.setHasUnread(n);
				break;
			case 4:
				var n = t.readString();
				e.setCreatedAt(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.Chat.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.Chat.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.Chat.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getId(), n.length > 0 && t.writeString(1, n), n = e.getLabel(), n.length > 0 && t.writeString(2, n), n = e.getHasUnread(), n && t.writeBool(3, n), n = e.getCreatedAt(), n.length > 0 && t.writeString(4, n);
	}, proto.widgetgrid.v1.Chat.prototype.getId = function() {
		return t.Message.getFieldWithDefault(this, 1, "");
	}, proto.widgetgrid.v1.Chat.prototype.setId = function(e) {
		return t.Message.setProto3StringField(this, 1, e);
	}, proto.widgetgrid.v1.Chat.prototype.getLabel = function() {
		return t.Message.getFieldWithDefault(this, 2, "");
	}, proto.widgetgrid.v1.Chat.prototype.setLabel = function(e) {
		return t.Message.setProto3StringField(this, 2, e);
	}, proto.widgetgrid.v1.Chat.prototype.getHasUnread = function() {
		return t.Message.getBooleanFieldWithDefault(this, 3, !1);
	}, proto.widgetgrid.v1.Chat.prototype.setHasUnread = function(e) {
		return t.Message.setProto3BooleanField(this, 3, e);
	}, proto.widgetgrid.v1.Chat.prototype.getCreatedAt = function() {
		return t.Message.getFieldWithDefault(this, 4, "");
	}, proto.widgetgrid.v1.Chat.prototype.setCreatedAt = function(e) {
		return t.Message.setProto3StringField(this, 4, e);
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.ChatMessage.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.ChatMessage.toObject(e, this);
	}, proto.widgetgrid.v1.ChatMessage.toObject = function(e, n) {
		var r = {
			id: t.Message.getFieldWithDefault(n, 1, ""),
			chatId: t.Message.getFieldWithDefault(n, 2, ""),
			sender: t.Message.getFieldWithDefault(n, 3, ""),
			body: t.Message.getFieldWithDefault(n, 4, ""),
			createdAt: t.Message.getFieldWithDefault(n, 5, "")
		};
		return e && (r.$jspbMessageInstance = n), r;
	}), proto.widgetgrid.v1.ChatMessage.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.ChatMessage();
		return proto.widgetgrid.v1.ChatMessage.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.ChatMessage.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = t.readString();
				e.setId(n);
				break;
			case 2:
				var n = t.readString();
				e.setChatId(n);
				break;
			case 3:
				var n = t.readString();
				e.setSender(n);
				break;
			case 4:
				var n = t.readString();
				e.setBody(n);
				break;
			case 5:
				var n = t.readString();
				e.setCreatedAt(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.ChatMessage.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.ChatMessage.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.ChatMessage.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getId(), n.length > 0 && t.writeString(1, n), n = e.getChatId(), n.length > 0 && t.writeString(2, n), n = e.getSender(), n.length > 0 && t.writeString(3, n), n = e.getBody(), n.length > 0 && t.writeString(4, n), n = e.getCreatedAt(), n.length > 0 && t.writeString(5, n);
	}, proto.widgetgrid.v1.ChatMessage.prototype.getId = function() {
		return t.Message.getFieldWithDefault(this, 1, "");
	}, proto.widgetgrid.v1.ChatMessage.prototype.setId = function(e) {
		return t.Message.setProto3StringField(this, 1, e);
	}, proto.widgetgrid.v1.ChatMessage.prototype.getChatId = function() {
		return t.Message.getFieldWithDefault(this, 2, "");
	}, proto.widgetgrid.v1.ChatMessage.prototype.setChatId = function(e) {
		return t.Message.setProto3StringField(this, 2, e);
	}, proto.widgetgrid.v1.ChatMessage.prototype.getSender = function() {
		return t.Message.getFieldWithDefault(this, 3, "");
	}, proto.widgetgrid.v1.ChatMessage.prototype.setSender = function(e) {
		return t.Message.setProto3StringField(this, 3, e);
	}, proto.widgetgrid.v1.ChatMessage.prototype.getBody = function() {
		return t.Message.getFieldWithDefault(this, 4, "");
	}, proto.widgetgrid.v1.ChatMessage.prototype.setBody = function(e) {
		return t.Message.setProto3StringField(this, 4, e);
	}, proto.widgetgrid.v1.ChatMessage.prototype.getCreatedAt = function() {
		return t.Message.getFieldWithDefault(this, 5, "");
	}, proto.widgetgrid.v1.ChatMessage.prototype.setCreatedAt = function(e) {
		return t.Message.setProto3StringField(this, 5, e);
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.StartOrGetChatRequest.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.StartOrGetChatRequest.toObject(e, this);
	}, proto.widgetgrid.v1.StartOrGetChatRequest.toObject = function(e, t) {
		var n = {};
		return e && (n.$jspbMessageInstance = t), n;
	}), proto.widgetgrid.v1.StartOrGetChatRequest.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.StartOrGetChatRequest();
		return proto.widgetgrid.v1.StartOrGetChatRequest.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.StartOrGetChatRequest.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) t.getFieldNumber(), t.skipField();
		return e;
	}, proto.widgetgrid.v1.StartOrGetChatRequest.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.StartOrGetChatRequest.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.StartOrGetChatRequest.serializeBinaryToWriter = function(e, t) {}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.StartOrGetChatResponse.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.StartOrGetChatResponse.toObject(e, this);
	}, proto.widgetgrid.v1.StartOrGetChatResponse.toObject = function(e, t) {
		var n, r = { chat: (n = t.getChat()) && proto.widgetgrid.v1.Chat.toObject(e, n) };
		return e && (r.$jspbMessageInstance = t), r;
	}), proto.widgetgrid.v1.StartOrGetChatResponse.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.StartOrGetChatResponse();
		return proto.widgetgrid.v1.StartOrGetChatResponse.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.StartOrGetChatResponse.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = new proto.widgetgrid.v1.Chat();
				t.readMessage(n, proto.widgetgrid.v1.Chat.deserializeBinaryFromReader), e.setChat(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.StartOrGetChatResponse.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.StartOrGetChatResponse.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.StartOrGetChatResponse.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getChat(), n != null && t.writeMessage(1, n, proto.widgetgrid.v1.Chat.serializeBinaryToWriter);
	}, proto.widgetgrid.v1.StartOrGetChatResponse.prototype.getChat = function() {
		return t.Message.getWrapperField(this, proto.widgetgrid.v1.Chat, 1);
	}, proto.widgetgrid.v1.StartOrGetChatResponse.prototype.setChat = function(e) {
		return t.Message.setWrapperField(this, 1, e);
	}, proto.widgetgrid.v1.StartOrGetChatResponse.prototype.clearChat = function() {
		return this.setChat(void 0);
	}, proto.widgetgrid.v1.StartOrGetChatResponse.prototype.hasChat = function() {
		return t.Message.getField(this, 1) != null;
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.SendMessageRequest.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.SendMessageRequest.toObject(e, this);
	}, proto.widgetgrid.v1.SendMessageRequest.toObject = function(e, n) {
		var r = {
			chatId: t.Message.getFieldWithDefault(n, 1, ""),
			body: t.Message.getFieldWithDefault(n, 2, "")
		};
		return e && (r.$jspbMessageInstance = n), r;
	}), proto.widgetgrid.v1.SendMessageRequest.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.SendMessageRequest();
		return proto.widgetgrid.v1.SendMessageRequest.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.SendMessageRequest.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = t.readString();
				e.setChatId(n);
				break;
			case 2:
				var n = t.readString();
				e.setBody(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.SendMessageRequest.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.SendMessageRequest.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.SendMessageRequest.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getChatId(), n.length > 0 && t.writeString(1, n), n = e.getBody(), n.length > 0 && t.writeString(2, n);
	}, proto.widgetgrid.v1.SendMessageRequest.prototype.getChatId = function() {
		return t.Message.getFieldWithDefault(this, 1, "");
	}, proto.widgetgrid.v1.SendMessageRequest.prototype.setChatId = function(e) {
		return t.Message.setProto3StringField(this, 1, e);
	}, proto.widgetgrid.v1.SendMessageRequest.prototype.getBody = function() {
		return t.Message.getFieldWithDefault(this, 2, "");
	}, proto.widgetgrid.v1.SendMessageRequest.prototype.setBody = function(e) {
		return t.Message.setProto3StringField(this, 2, e);
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.SendMessageResponse.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.SendMessageResponse.toObject(e, this);
	}, proto.widgetgrid.v1.SendMessageResponse.toObject = function(e, t) {
		var n, r = { message: (n = t.getMessage()) && proto.widgetgrid.v1.ChatMessage.toObject(e, n) };
		return e && (r.$jspbMessageInstance = t), r;
	}), proto.widgetgrid.v1.SendMessageResponse.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.SendMessageResponse();
		return proto.widgetgrid.v1.SendMessageResponse.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.SendMessageResponse.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = new proto.widgetgrid.v1.ChatMessage();
				t.readMessage(n, proto.widgetgrid.v1.ChatMessage.deserializeBinaryFromReader), e.setMessage(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.SendMessageResponse.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.SendMessageResponse.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.SendMessageResponse.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getMessage(), n != null && t.writeMessage(1, n, proto.widgetgrid.v1.ChatMessage.serializeBinaryToWriter);
	}, proto.widgetgrid.v1.SendMessageResponse.prototype.getMessage = function() {
		return t.Message.getWrapperField(this, proto.widgetgrid.v1.ChatMessage, 1);
	}, proto.widgetgrid.v1.SendMessageResponse.prototype.setMessage = function(e) {
		return t.Message.setWrapperField(this, 1, e);
	}, proto.widgetgrid.v1.SendMessageResponse.prototype.clearMessage = function() {
		return this.setMessage(void 0);
	}, proto.widgetgrid.v1.SendMessageResponse.prototype.hasMessage = function() {
		return t.Message.getField(this, 1) != null;
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.ListMessagesRequest.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.ListMessagesRequest.toObject(e, this);
	}, proto.widgetgrid.v1.ListMessagesRequest.toObject = function(e, n) {
		var r = { chatId: t.Message.getFieldWithDefault(n, 1, "") };
		return e && (r.$jspbMessageInstance = n), r;
	}), proto.widgetgrid.v1.ListMessagesRequest.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.ListMessagesRequest();
		return proto.widgetgrid.v1.ListMessagesRequest.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.ListMessagesRequest.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = t.readString();
				e.setChatId(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.ListMessagesRequest.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.ListMessagesRequest.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.ListMessagesRequest.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getChatId(), n.length > 0 && t.writeString(1, n);
	}, proto.widgetgrid.v1.ListMessagesRequest.prototype.getChatId = function() {
		return t.Message.getFieldWithDefault(this, 1, "");
	}, proto.widgetgrid.v1.ListMessagesRequest.prototype.setChatId = function(e) {
		return t.Message.setProto3StringField(this, 1, e);
	}, proto.widgetgrid.v1.ListMessagesResponse.repeatedFields_ = [1], t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.ListMessagesResponse.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.ListMessagesResponse.toObject(e, this);
	}, proto.widgetgrid.v1.ListMessagesResponse.toObject = function(e, n) {
		var r = { messagesList: t.Message.toObjectList(n.getMessagesList(), proto.widgetgrid.v1.ChatMessage.toObject, e) };
		return e && (r.$jspbMessageInstance = n), r;
	}), proto.widgetgrid.v1.ListMessagesResponse.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.ListMessagesResponse();
		return proto.widgetgrid.v1.ListMessagesResponse.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.ListMessagesResponse.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = new proto.widgetgrid.v1.ChatMessage();
				t.readMessage(n, proto.widgetgrid.v1.ChatMessage.deserializeBinaryFromReader), e.addMessages(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.ListMessagesResponse.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.ListMessagesResponse.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.ListMessagesResponse.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getMessagesList(), n.length > 0 && t.writeRepeatedMessage(1, n, proto.widgetgrid.v1.ChatMessage.serializeBinaryToWriter);
	}, proto.widgetgrid.v1.ListMessagesResponse.prototype.getMessagesList = function() {
		return t.Message.getRepeatedWrapperField(this, proto.widgetgrid.v1.ChatMessage, 1);
	}, proto.widgetgrid.v1.ListMessagesResponse.prototype.setMessagesList = function(e) {
		return t.Message.setRepeatedWrapperField(this, 1, e);
	}, proto.widgetgrid.v1.ListMessagesResponse.prototype.addMessages = function(e, n) {
		return t.Message.addToRepeatedWrapperField(this, 1, e, proto.widgetgrid.v1.ChatMessage, n);
	}, proto.widgetgrid.v1.ListMessagesResponse.prototype.clearMessagesList = function() {
		return this.setMessagesList([]);
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.ListChatsRequest.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.ListChatsRequest.toObject(e, this);
	}, proto.widgetgrid.v1.ListChatsRequest.toObject = function(e, t) {
		var n = {};
		return e && (n.$jspbMessageInstance = t), n;
	}), proto.widgetgrid.v1.ListChatsRequest.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.ListChatsRequest();
		return proto.widgetgrid.v1.ListChatsRequest.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.ListChatsRequest.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) t.getFieldNumber(), t.skipField();
		return e;
	}, proto.widgetgrid.v1.ListChatsRequest.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.ListChatsRequest.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.ListChatsRequest.serializeBinaryToWriter = function(e, t) {}, proto.widgetgrid.v1.ListChatsResponse.repeatedFields_ = [1], t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.ListChatsResponse.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.ListChatsResponse.toObject(e, this);
	}, proto.widgetgrid.v1.ListChatsResponse.toObject = function(e, n) {
		var r = { chatsList: t.Message.toObjectList(n.getChatsList(), proto.widgetgrid.v1.Chat.toObject, e) };
		return e && (r.$jspbMessageInstance = n), r;
	}), proto.widgetgrid.v1.ListChatsResponse.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.ListChatsResponse();
		return proto.widgetgrid.v1.ListChatsResponse.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.ListChatsResponse.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = new proto.widgetgrid.v1.Chat();
				t.readMessage(n, proto.widgetgrid.v1.Chat.deserializeBinaryFromReader), e.addChats(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.ListChatsResponse.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.ListChatsResponse.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.ListChatsResponse.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getChatsList(), n.length > 0 && t.writeRepeatedMessage(1, n, proto.widgetgrid.v1.Chat.serializeBinaryToWriter);
	}, proto.widgetgrid.v1.ListChatsResponse.prototype.getChatsList = function() {
		return t.Message.getRepeatedWrapperField(this, proto.widgetgrid.v1.Chat, 1);
	}, proto.widgetgrid.v1.ListChatsResponse.prototype.setChatsList = function(e) {
		return t.Message.setRepeatedWrapperField(this, 1, e);
	}, proto.widgetgrid.v1.ListChatsResponse.prototype.addChats = function(e, n) {
		return t.Message.addToRepeatedWrapperField(this, 1, e, proto.widgetgrid.v1.Chat, n);
	}, proto.widgetgrid.v1.ListChatsResponse.prototype.clearChatsList = function() {
		return this.setChatsList([]);
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.RenameChatRequest.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.RenameChatRequest.toObject(e, this);
	}, proto.widgetgrid.v1.RenameChatRequest.toObject = function(e, n) {
		var r = {
			chatId: t.Message.getFieldWithDefault(n, 1, ""),
			label: t.Message.getFieldWithDefault(n, 2, "")
		};
		return e && (r.$jspbMessageInstance = n), r;
	}), proto.widgetgrid.v1.RenameChatRequest.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.RenameChatRequest();
		return proto.widgetgrid.v1.RenameChatRequest.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.RenameChatRequest.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = t.readString();
				e.setChatId(n);
				break;
			case 2:
				var n = t.readString();
				e.setLabel(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.RenameChatRequest.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.RenameChatRequest.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.RenameChatRequest.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getChatId(), n.length > 0 && t.writeString(1, n), n = e.getLabel(), n.length > 0 && t.writeString(2, n);
	}, proto.widgetgrid.v1.RenameChatRequest.prototype.getChatId = function() {
		return t.Message.getFieldWithDefault(this, 1, "");
	}, proto.widgetgrid.v1.RenameChatRequest.prototype.setChatId = function(e) {
		return t.Message.setProto3StringField(this, 1, e);
	}, proto.widgetgrid.v1.RenameChatRequest.prototype.getLabel = function() {
		return t.Message.getFieldWithDefault(this, 2, "");
	}, proto.widgetgrid.v1.RenameChatRequest.prototype.setLabel = function(e) {
		return t.Message.setProto3StringField(this, 2, e);
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.RenameChatResponse.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.RenameChatResponse.toObject(e, this);
	}, proto.widgetgrid.v1.RenameChatResponse.toObject = function(e, t) {
		var n = {};
		return e && (n.$jspbMessageInstance = t), n;
	}), proto.widgetgrid.v1.RenameChatResponse.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.RenameChatResponse();
		return proto.widgetgrid.v1.RenameChatResponse.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.RenameChatResponse.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) t.getFieldNumber(), t.skipField();
		return e;
	}, proto.widgetgrid.v1.RenameChatResponse.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.RenameChatResponse.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.RenameChatResponse.serializeBinaryToWriter = function(e, t) {}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.MarkReadRequest.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.MarkReadRequest.toObject(e, this);
	}, proto.widgetgrid.v1.MarkReadRequest.toObject = function(e, n) {
		var r = { chatId: t.Message.getFieldWithDefault(n, 1, "") };
		return e && (r.$jspbMessageInstance = n), r;
	}), proto.widgetgrid.v1.MarkReadRequest.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.MarkReadRequest();
		return proto.widgetgrid.v1.MarkReadRequest.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.MarkReadRequest.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = t.readString();
				e.setChatId(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.MarkReadRequest.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.MarkReadRequest.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.MarkReadRequest.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getChatId(), n.length > 0 && t.writeString(1, n);
	}, proto.widgetgrid.v1.MarkReadRequest.prototype.getChatId = function() {
		return t.Message.getFieldWithDefault(this, 1, "");
	}, proto.widgetgrid.v1.MarkReadRequest.prototype.setChatId = function(e) {
		return t.Message.setProto3StringField(this, 1, e);
	}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.MarkReadResponse.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.MarkReadResponse.toObject(e, this);
	}, proto.widgetgrid.v1.MarkReadResponse.toObject = function(e, t) {
		var n = {};
		return e && (n.$jspbMessageInstance = t), n;
	}), proto.widgetgrid.v1.MarkReadResponse.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.MarkReadResponse();
		return proto.widgetgrid.v1.MarkReadResponse.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.MarkReadResponse.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) t.getFieldNumber(), t.skipField();
		return e;
	}, proto.widgetgrid.v1.MarkReadResponse.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.MarkReadResponse.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.MarkReadResponse.serializeBinaryToWriter = function(e, t) {}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.SubscribeChatEventsRequest.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.SubscribeChatEventsRequest.toObject(e, this);
	}, proto.widgetgrid.v1.SubscribeChatEventsRequest.toObject = function(e, t) {
		var n = {};
		return e && (n.$jspbMessageInstance = t), n;
	}), proto.widgetgrid.v1.SubscribeChatEventsRequest.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.SubscribeChatEventsRequest();
		return proto.widgetgrid.v1.SubscribeChatEventsRequest.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.SubscribeChatEventsRequest.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) t.getFieldNumber(), t.skipField();
		return e;
	}, proto.widgetgrid.v1.SubscribeChatEventsRequest.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.SubscribeChatEventsRequest.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.SubscribeChatEventsRequest.serializeBinaryToWriter = function(e, t) {}, t.Message.GENERATE_TO_OBJECT && (proto.widgetgrid.v1.ChatEvent.prototype.toObject = function(e) {
		return proto.widgetgrid.v1.ChatEvent.toObject(e, this);
	}, proto.widgetgrid.v1.ChatEvent.toObject = function(e, n) {
		var r, i = {
			chatId: t.Message.getFieldWithDefault(n, 1, ""),
			message: (r = n.getMessage()) && proto.widgetgrid.v1.ChatMessage.toObject(e, r),
			isNewChat: t.Message.getBooleanFieldWithDefault(n, 3, !1),
			chatLabel: t.Message.getFieldWithDefault(n, 4, "")
		};
		return e && (i.$jspbMessageInstance = n), i;
	}), proto.widgetgrid.v1.ChatEvent.deserializeBinary = function(e) {
		var n = new t.BinaryReader(e), r = new proto.widgetgrid.v1.ChatEvent();
		return proto.widgetgrid.v1.ChatEvent.deserializeBinaryFromReader(r, n);
	}, proto.widgetgrid.v1.ChatEvent.deserializeBinaryFromReader = function(e, t) {
		for (; t.nextField() && !t.isEndGroup();) switch (t.getFieldNumber()) {
			case 1:
				var n = t.readString();
				e.setChatId(n);
				break;
			case 2:
				var n = new proto.widgetgrid.v1.ChatMessage();
				t.readMessage(n, proto.widgetgrid.v1.ChatMessage.deserializeBinaryFromReader), e.setMessage(n);
				break;
			case 3:
				var n = t.readBool();
				e.setIsNewChat(n);
				break;
			case 4:
				var n = t.readString();
				e.setChatLabel(n);
				break;
			default: t.skipField();
		}
		return e;
	}, proto.widgetgrid.v1.ChatEvent.prototype.serializeBinary = function() {
		var e = new t.BinaryWriter();
		return proto.widgetgrid.v1.ChatEvent.serializeBinaryToWriter(this, e), e.getResultBuffer();
	}, proto.widgetgrid.v1.ChatEvent.serializeBinaryToWriter = function(e, t) {
		var n = void 0;
		n = e.getChatId(), n.length > 0 && t.writeString(1, n), n = e.getMessage(), n != null && t.writeMessage(2, n, proto.widgetgrid.v1.ChatMessage.serializeBinaryToWriter), n = e.getIsNewChat(), n && t.writeBool(3, n), n = e.getChatLabel(), n.length > 0 && t.writeString(4, n);
	}, proto.widgetgrid.v1.ChatEvent.prototype.getChatId = function() {
		return t.Message.getFieldWithDefault(this, 1, "");
	}, proto.widgetgrid.v1.ChatEvent.prototype.setChatId = function(e) {
		return t.Message.setProto3StringField(this, 1, e);
	}, proto.widgetgrid.v1.ChatEvent.prototype.getMessage = function() {
		return t.Message.getWrapperField(this, proto.widgetgrid.v1.ChatMessage, 2);
	}, proto.widgetgrid.v1.ChatEvent.prototype.setMessage = function(e) {
		return t.Message.setWrapperField(this, 2, e);
	}, proto.widgetgrid.v1.ChatEvent.prototype.clearMessage = function() {
		return this.setMessage(void 0);
	}, proto.widgetgrid.v1.ChatEvent.prototype.hasMessage = function() {
		return t.Message.getField(this, 2) != null;
	}, proto.widgetgrid.v1.ChatEvent.prototype.getIsNewChat = function() {
		return t.Message.getBooleanFieldWithDefault(this, 3, !1);
	}, proto.widgetgrid.v1.ChatEvent.prototype.setIsNewChat = function(e) {
		return t.Message.setProto3BooleanField(this, 3, e);
	}, proto.widgetgrid.v1.ChatEvent.prototype.getChatLabel = function() {
		return t.Message.getFieldWithDefault(this, 4, "");
	}, proto.widgetgrid.v1.ChatEvent.prototype.setChatLabel = function(e) {
		return t.Message.setProto3StringField(this, 4, e);
	}, n.object.extend(e, proto.widgetgrid.v1);
})), require_grpc_web = /* @__PURE__ */ __commonJSMin(((e, t) => {
	var n, r = r || {}, i = e || self;
	function o(e, t) {
		e = e.split("."), t ||= i;
		for (var n = 0; n < e.length; n++) if (t = t[e[n]], t == null) return null;
		return t;
	}
	function s(e) {
		var t = typeof e;
		return t == "object" && e != null || t == "function";
	}
	function c(e) {
		return Object.prototype.hasOwnProperty.call(e, l) && e[l] || (e[l] = ++u);
	}
	var l = "closure_uid_" + (Math.random() * 1e9 >>> 0), u = 0;
	function d(e, t, n) {
		return e.call.apply(e.bind, arguments);
	}
	function f(e, t, n) {
		if (!e) throw Error();
		if (arguments.length > 2) {
			var r = Array.prototype.slice.call(arguments, 2);
			return function() {
				var n = Array.prototype.slice.call(arguments);
				return Array.prototype.unshift.apply(n, r), e.apply(t, n);
			};
		}
		return function() {
			return e.apply(t, arguments);
		};
	}
	function p(e, t, n) {
		return p = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? d : f, p.apply(null, arguments);
	}
	function m(e, t) {
		function n() {}
		n.prototype = t.prototype, e.N = t.prototype, e.prototype = new n(), e.prototype.constructor = e, e.aa = function(e, n, r) {
			for (var i = Array(arguments.length - 2), o = 2; o < arguments.length; o++) i[o - 2] = arguments[o];
			return t.prototype[n].apply(e, i);
		};
	}
	var ee = class {
		constructor(e) {
			this.g = e || {};
		}
		get(e) {
			return this.g[e];
		}
	}, te = class {
		constructor(e, t, n) {
			var r = new ee();
			this.j = e, this.h = t, this.g = n, this.i = r;
		}
		getRequestMessage() {
			return this.j;
		}
		getMethodDescriptor() {
			return this.h;
		}
		getMetadata() {
			return this.g;
		}
		getCallOptions() {
			return this.i;
		}
	}, ne = class {
		constructor(e, t, n = {}, r = null) {
			this.i = e, this.g = n, this.h = t, this.j = r;
		}
		getResponseMessage() {
			return this.i;
		}
		getMetadata() {
			return this.g;
		}
		getMethodDescriptor() {
			return this.h;
		}
		getStatus() {
			return this.j;
		}
	};
	function re(e, t, n = {}) {
		return new te(t, e, n);
	}
	function ie(e, t, n = {}, r = null) {
		return new ne(t, e, n, r);
	}
	var ae = class {
		constructor(e, t, n, r, i, o) {
			this.name = e, this.g = i, this.h = o;
		}
		getName() {
			return this.name;
		}
	};
	ae.prototype.getName = ae.prototype.getName;
	var oe = class {
		constructor(e) {
			this.g = e;
		}
		on(e, t) {
			return e == "data" || e == "error" ? this : this.g.on(e, t);
		}
		removeListener(e, t) {
			return this.g.removeListener(e, t);
		}
		cancel() {
			this.g.cancel();
		}
	};
	function se(e) {
		switch (e) {
			case 0: return "No Error";
			case 1: return "Access denied to content document";
			case 2: return "File not found";
			case 3: return "Firefox silently errored";
			case 4: return "Application custom error";
			case 5: return "An exception occurred";
			case 6: return "Http response at 400 or 500 level";
			case 7: return "Request was aborted";
			case 8: return "Request timed out";
			case 9: return "The resource is not available offline";
			default: return "Unrecognized error code";
		}
	}
	function h(e, t) {
		if (Error.captureStackTrace) Error.captureStackTrace(this, h);
		else {
			let e = Error().stack;
			e && (this.stack = e);
		}
		e && (this.message = String(e)), t !== void 0 && (this.cause = t);
	}
	m(h, Error), h.prototype.name = "CustomError";
	function g(e, t) {
		e = e.split("%s");
		let n = "", r = e.length - 1;
		for (let i = 0; i < r; i++) n += e[i] + (i < t.length ? t[i] : "%s");
		h.call(this, n + e[r]);
	}
	m(g, h), g.prototype.name = "AssertionError";
	function ce(e, t) {
		throw new g("Failure" + (e ? ": " + e : ""), Array.prototype.slice.call(arguments, 1));
	}
	function le(e, t) {
		function n(e) {
			e == v || e == y ? s.o = e : me(s, c, l, "invalid frame byte"), s.h = de, s.g = 0, s.l = 0;
		}
		function r(e) {
			s.l++, s.g = (s.g << 8) + e, s.l == 4 && (s.h = fe, s.m = 0, s.i = typeof Uint8Array < "u" ? new Uint8Array(s.g) : Array(s.g), s.g == 0 && o());
		}
		function i(e) {
			s.i[s.m++] = e, s.m == s.g && o();
		}
		function o() {
			var e = {};
			e[s.o] = s.i, s.j.push(e), s.h = _;
		}
		var s = e, c, l = 0;
		for (c = t instanceof Uint8Array || t instanceof Array ? t : new Uint8Array(t); l < c.length;) {
			switch (s.h) {
				case pe:
					me(s, c, l, "stream already broken");
					break;
				case _:
					n(c[l]);
					break;
				case de:
					r(c[l]);
					break;
				case fe:
					i(c[l]);
					break;
				default: throw Error("unexpected parser state: " + s.h);
			}
			s.v++, l++;
		}
		return e = s.j, s.j = [], e.length > 0 ? e : null;
	}
	var ue = class {
		constructor() {
			this.u = null, this.j = [], this.v = 0, this.h = _, this.l = this.g = this.o = 0, this.i = null, this.m = 0;
		}
	}, _ = 0, de = 1, fe = 2, pe = 3, v = 0, y = 128;
	function me(e, t, n, r) {
		throw e.h = pe, e.u = "The stream is broken @" + e.v + "/" + n + ". Error: " + r + ". With input:\n" + t, Error(e.u);
	}
	function he(e) {
		switch (e) {
			case 200: return 0;
			case 400: return 3;
			case 401: return 16;
			case 403: return 7;
			case 404: return 5;
			case 409: return 10;
			case 412: return 9;
			case 429: return 8;
			case 499: return 1;
			case 500: return 2;
			case 501: return 12;
			case 503: return 14;
			case 504: return 4;
			default: return 2;
		}
	}
	function ge(e) {
		switch (e) {
			case 0: return "OK";
			case 1: return "CANCELLED";
			case 2: return "UNKNOWN";
			case 3: return "INVALID_ARGUMENT";
			case 4: return "DEADLINE_EXCEEDED";
			case 5: return "NOT_FOUND";
			case 6: return "ALREADY_EXISTS";
			case 7: return "PERMISSION_DENIED";
			case 16: return "UNAUTHENTICATED";
			case 8: return "RESOURCE_EXHAUSTED";
			case 9: return "FAILED_PRECONDITION";
			case 10: return "ABORTED";
			case 11: return "OUT_OF_RANGE";
			case 12: return "UNIMPLEMENTED";
			case 13: return "INTERNAL";
			case 14: return "UNAVAILABLE";
			case 15: return "DATA_LOSS";
			default: return "";
		}
	}
	var x = class extends Error {
		constructor(e, t, n = {}) {
			super(t), this.code = e, this.metadata = n;
		}
		toString() {
			let e = `RpcError(${ge(this.code) || String(this.code)})`;
			return this.message && (e += ": " + this.message), e;
		}
	};
	x.prototype.name = "RpcError";
	var _e = Array.prototype.indexOf ? function(e, t) {
		return Array.prototype.indexOf.call(e, t, void 0);
	} : function(e, t) {
		if (typeof e == "string") return typeof t != "string" || t.length != 1 ? -1 : e.indexOf(t, 0);
		for (let n = 0; n < e.length; n++) if (n in e && e[n] === t) return n;
		return -1;
	};
	function ve() {
		var e = i.navigator;
		return (e &&= e.userAgent) ? e : "";
	}
	function S(e) {
		return ve().indexOf(e) != -1;
	}
	function C(e) {
		return C[" "](e), e;
	}
	C[" "] = function() {};
	var ye = S("Trident") || S("MSIE"), be = S("Gecko") && !(ve().toLowerCase().indexOf("webkit") != -1 && !S("Edge")) && !(S("Trident") || S("MSIE")) && !S("Edge"), xe = class {
		constructor(e) {
			if (Se !== Se) throw Error("SafeUrl is not meant to be built directly");
			this.g = e;
		}
		toString() {
			return this.g.toString();
		}
	}, Se = {};
	new xe("about:invalid#zClosurez"), new xe("about:blank");
	var Ce = {};
	new class {
		constructor() {
			if (Ce !== Ce) throw Error("SafeStyle is not meant to be built directly");
		}
		toString() {
			return "";
		}
	}();
	function we(e, t) {
		for (let n in e) t.call(void 0, e[n], n, e);
	}
	function Te(e, t) {
		let n = {};
		for (let r in e) n[r] = t.call(void 0, e[r], r, e);
		return n;
	}
	var Ee = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
	function De(e, t) {
		let n, r;
		for (let t = 1; t < arguments.length; t++) {
			for (n in r = arguments[t], r) e[n] = r[n];
			for (let t = 0; t < Ee.length; t++) n = Ee[t], Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
		}
	}
	var Oe = {};
	new class {
		constructor() {
			if (Oe !== Oe) throw Error("SafeStyleSheet is not meant to be built directly");
		}
		toString() {
			return "";
		}
	}();
	var ke = {};
	new class {
		constructor() {
			var e = i.trustedTypes && i.trustedTypes.emptyHTML || "";
			if (ke !== ke) throw Error("SafeHtml is not meant to be built directly");
			this.g = e;
		}
		toString() {
			return this.g.toString();
		}
	}();
	function Ae(e) {
		var t = 1;
		e = e.split(":");
		let n = [];
		for (; t > 0 && e.length;) n.push(e.shift()), t--;
		return e.length && n.push(e.join(":")), n;
	}
	function w() {
		T != 0 && (je[c(this)] = this), this.v = this.v, this.o = this.o;
	}
	var T = 0, je = {};
	w.prototype.v = !1, w.prototype.dispose = function() {
		if (!this.v && (this.v = !0, this.C(), T != 0)) {
			var e = c(this);
			if (T != 0 && this.o && this.o.length > 0) throw Error(this + " did not empty its onDisposeCallbacks queue. This probably means it overrode dispose() or disposeInternal() without calling the superclass' method.");
			delete je[e];
		}
	}, w.prototype.C = function() {
		if (this.o) for (; this.o.length;) this.o.shift()();
	};
	var Me = Object.freeze || function(e) {
		return e;
	};
	function E(e, t) {
		this.type = e, this.g = this.target = t, this.defaultPrevented = !1;
	}
	E.prototype.h = function() {
		this.defaultPrevented = !0;
	};
	var Ne = function() {
		if (!i.addEventListener || !Object.defineProperty) return !1;
		var e = !1, t = Object.defineProperty({}, "passive", { get: function() {
			e = !0;
		} });
		try {
			let e = () => {};
			i.addEventListener("test", e, t), i.removeEventListener("test", e, t);
		} catch {}
		return e;
	}();
	function D(e, t) {
		E.call(this, e ? e.type : ""), this.relatedTarget = this.g = this.target = null, this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0, this.key = "", this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1, this.state = null, this.pointerId = 0, this.pointerType = "", this.i = null, e && this.init(e, t);
	}
	m(D, E);
	var Pe = Me({
		2: "touch",
		3: "pen",
		4: "mouse"
	});
	D.prototype.init = function(e, t) {
		var n = this.type = e.type, r = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null;
		if (this.target = e.target || e.srcElement, this.g = t, t = e.relatedTarget) {
			if (be) {
				a: {
					try {
						C(t.nodeName);
						var i = !0;
						break a;
					} catch {}
					i = !1;
				}
				i || (t = null);
			}
		} else n == "mouseover" ? t = e.fromElement : n == "mouseout" && (t = e.toElement);
		this.relatedTarget = t, r ? (this.clientX = r.clientX === void 0 ? r.pageX : r.clientX, this.clientY = r.clientY === void 0 ? r.pageY : r.clientY, this.screenX = r.screenX || 0, this.screenY = r.screenY || 0) : (this.clientX = e.clientX === void 0 ? e.pageX : e.clientX, this.clientY = e.clientY === void 0 ? e.pageY : e.clientY, this.screenX = e.screenX || 0, this.screenY = e.screenY || 0), this.button = e.button, this.key = e.key || "", this.ctrlKey = e.ctrlKey, this.altKey = e.altKey, this.shiftKey = e.shiftKey, this.metaKey = e.metaKey, this.pointerId = e.pointerId || 0, this.pointerType = typeof e.pointerType == "string" ? e.pointerType : Pe[e.pointerType] || "", this.state = e.state, this.i = e, e.defaultPrevented && D.N.h.call(this);
	}, D.prototype.h = function() {
		D.N.h.call(this);
		var e = this.i;
		e.preventDefault ? e.preventDefault() : e.returnValue = !1;
	};
	var O = "closure_listenable_" + (Math.random() * 1e6 | 0), Fe = 0;
	function Ie(e, t, n, r, i) {
		this.listener = e, this.proxy = null, this.src = t, this.type = n, this.capture = !!r, this.M = i, this.key = ++Fe, this.D = this.L = !1;
	}
	function k(e) {
		e.D = !0, e.listener = null, e.proxy = null, e.src = null, e.M = null;
	}
	function A(e) {
		this.src = e, this.g = {}, this.h = 0;
	}
	A.prototype.add = function(e, t, n, r, i) {
		var o = e.toString();
		e = this.g[o], e || (e = this.g[o] = [], this.h++);
		var s = Re(e, t, r, i);
		return s > -1 ? (t = e[s], n || (t.L = !1)) : (t = new Ie(t, this.src, o, !!r, i), t.L = n, e.push(t)), t;
	};
	function Le(e, t) {
		var n = t.type;
		if (n in e.g) {
			var r = e.g[n], i = _e(r, t), o;
			(o = i >= 0) && Array.prototype.splice.call(r, i, 1), o && (k(t), e.g[n].length == 0 && (delete e.g[n], e.h--));
		}
	}
	function Re(e, t, n, r) {
		for (var i = 0; i < e.length; ++i) {
			var o = e[i];
			if (!o.D && o.listener == t && o.capture == !!n && o.M == r) return i;
		}
		return -1;
	}
	var ze = "closure_lm_" + (Math.random() * 1e6 | 0), Be = {}, Ve = 0;
	function j(e, t, n, r, i) {
		if (r && r.once) We(e, t, n, r, i);
		else if (Array.isArray(t)) for (var o = 0; o < t.length; o++) j(e, t[o], n, r, i);
		else n = P(n), e && e[O] ? e.j.add(String(t), n, !1, s(r) ? !!r.capture : !!r, i) : He(e, t, n, !1, r, i);
	}
	function He(e, t, n, r, i, o) {
		if (!t) throw Error("Invalid event type");
		var c = s(i) ? !!i.capture : !!i, l = M(e);
		if (l || (e[ze] = l = new A(e)), n = l.add(t, n, r, c, o), !n.proxy) {
			if (r = Ue(), n.proxy = r, r.src = e, r.listener = n, e.addEventListener) Ne || (i = c), i === void 0 && (i = !1), e.addEventListener(t.toString(), r, i);
			else if (e.attachEvent) e.attachEvent(qe(t.toString()), r);
			else if (e.addListener && e.removeListener) e.addListener(r);
			else throw Error("addEventListener and attachEvent are unavailable.");
			Ve++;
		}
	}
	function Ue() {
		function e(n) {
			return t.call(e.src, e.listener, n);
		}
		let t = Je;
		return e;
	}
	function We(e, t, n, r, i) {
		if (Array.isArray(t)) for (var o = 0; o < t.length; o++) We(e, t[o], n, r, i);
		else n = P(n), e && e[O] ? e.j.add(String(t), n, !0, s(r) ? !!r.capture : !!r, i) : He(e, t, n, !0, r, i);
	}
	function Ge(e, t, n, r, i) {
		if (Array.isArray(t)) for (var o = 0; o < t.length; o++) Ge(e, t[o], n, r, i);
		else r = s(r) ? !!r.capture : !!r, n = P(n), e && e[O] ? (e = e.j, t = String(t).toString(), t in e.g && (o = e.g[t], n = Re(o, n, r, i), n > -1 && (k(o[n]), Array.prototype.splice.call(o, n, 1), o.length == 0 && (delete e.g[t], e.h--)))) : (e &&= M(e)) && (t = e.g[t.toString()], e = -1, t && (e = Re(t, n, r, i)), (n = e > -1 ? t[e] : null) && Ke(n));
	}
	function Ke(e) {
		if (typeof e != "number" && e && !e.D) {
			var t = e.src;
			if (t && t[O]) Le(t.j, e);
			else {
				var n = e.type, r = e.proxy;
				t.removeEventListener ? t.removeEventListener(n, r, e.capture) : t.detachEvent ? t.detachEvent(qe(n), r) : t.addListener && t.removeListener && t.removeListener(r), Ve--, (n = M(t)) ? (Le(n, e), n.h == 0 && (n.src = null, t[ze] = null)) : k(e);
			}
		}
	}
	function qe(e) {
		return e in Be ? Be[e] : Be[e] = "on" + e;
	}
	function Je(e, t) {
		if (e.D) e = !0;
		else {
			t = new D(t, this);
			var n = e.listener, r = e.M || e.src;
			e.L && Ke(e), e = n.call(r, t);
		}
		return e;
	}
	function M(e) {
		return e = e[ze], e instanceof A ? e : null;
	}
	var N = "__closure_events_fn_" + (Math.random() * 1e9 >>> 0);
	function P(e) {
		return typeof e == "function" ? e : (e[N] || (e[N] = function(t) {
			return e.handleEvent(t);
		}), e[N]);
	}
	function F() {
		w.call(this), this.j = new A(this), this.W = this, this.S = null;
	}
	m(F, w), F.prototype[O] = !0, F.prototype.removeEventListener = function(e, t, n, r) {
		Ge(this, e, t, n, r);
	};
	function I(e, t) {
		var n, r = e.S;
		if (r) for (n = []; r; r = r.S) n.push(r);
		if (e = e.W, r = t.type || t, typeof t == "string") t = new E(t, e);
		else if (t instanceof E) t.target = t.target || e;
		else {
			var i = t;
			t = new E(r, e), De(t, i);
		}
		if (i = !0, n) for (var o = n.length - 1; o >= 0; o--) {
			var s = t.g = n[o];
			i = L(s, r, !0, t) && i;
		}
		if (s = t.g = e, i = L(s, r, !0, t) && i, i = L(s, r, !1, t) && i, n) for (o = 0; o < n.length; o++) s = t.g = n[o], i = L(s, r, !1, t) && i;
	}
	F.prototype.C = function() {
		if (F.N.C.call(this), this.j) {
			var e = this.j, t = 0, n;
			for (n in e.g) {
				for (var r = e.g[n], i = 0; i < r.length; i++) ++t, k(r[i]);
				delete e.g[n], e.h--;
			}
		}
		this.S = null;
	};
	function L(e, t, n, r) {
		if (t = e.j.g[String(t)], !t) return !0;
		t = t.concat();
		for (var i = !0, o = 0; o < t.length; ++o) {
			var s = t[o];
			if (s && !s.D && s.capture == n) {
				var c = s.listener, l = s.M || s.src;
				s.L && Le(e.j, s), i = c.call(l, r) !== !1 && i;
			}
		}
		return i && !r.defaultPrevented;
	}
	var R = i;
	function Ye(e, t, n) {
		if (typeof e == "function") n && (e = p(e, n));
		else if (e && typeof e.handleEvent == "function") e = p(e.handleEvent, e);
		else throw Error("Invalid listener argument");
		return Number(t) > 2147483647 ? -1 : R.setTimeout(e, t || 0);
	}
	var z = class {
		constructor(e, t) {
			this.name = e, this.value = t;
		}
		toString() {
			return this.name;
		}
	}, B = new z("OFF", Infinity), Xe = new z("SEVERE", 1e3), Ze = new z("CONFIG", 700), Qe = new z("FINE", 500), $e = class {}, et, tt = class {
		constructor(e, t, n) {
			this.reset(e || B, t, n, void 0, void 0);
		}
		reset() {}
	};
	function nt(e) {
		return e.g ? e.g : e.h ? nt(e.h) : (ce("Root logger has no level set."), B);
	}
	function rt(e, t) {
		for (; e;) e.j.forEach((e) => {
			e(t);
		}), e = e.h;
	}
	var it = class {
		constructor(e, t = null) {
			this.g = null, this.j = [], this.h = t || null, this.i = [], this.l = { getName: () => e };
		}
	};
	function V(e, t) {
		var n = e.entries[t];
		if (n) return n;
		n = V(e, t.slice(0, Math.max(t.lastIndexOf("."), 0)));
		let r = new it(t, n);
		return e.entries[t] = r, n.i.push(r), r;
	}
	var at = class {
		constructor() {
			this.entries = {};
			let e = new it("");
			e.g = Ze, this.entries[""] = e;
		}
	}, ot;
	function H() {
		return ot ||= new at(), ot;
	}
	function st(e, t, n) {
		var r;
		if ((r = e) && (r = e && t)) {
			r = t.value;
			var i = e ? nt(V(H(), e.getName())) : B;
			r = r >= i.value;
		}
		r && (t ||= B, r = V(H(), e.getName()), typeof n == "function" && (n = n()), et ||= new $e(), e = e.getName(), e = new tt(t, n, e), rt(r, e));
	}
	function ct(e, t) {
		e && st(e, Xe, t);
	}
	function U(e, t) {
		e && st(e, Qe, t);
	}
	function lt() {}
	lt.prototype.g = null;
	function ut(e) {
		var t;
		return (t = e.g) || (t = {}, pt(e) && (t[0] = !0, t[1] = !0), t = e.g = t), t;
	}
	var W;
	function dt() {}
	m(dt, lt);
	function ft(e) {
		return (e = pt(e)) ? new ActiveXObject(e) : new XMLHttpRequest();
	}
	function pt(e) {
		if (!e.h && typeof XMLHttpRequest > "u" && typeof ActiveXObject < "u") {
			let t = [
				"MSXML2.XMLHTTP.6.0",
				"MSXML2.XMLHTTP.3.0",
				"MSXML2.XMLHTTP",
				"Microsoft.XMLHTTP"
			];
			for (let n = 0; n < t.length; n++) {
				let r = t[n];
				try {
					return new ActiveXObject(r), e.h = r;
				} catch {}
			}
			throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");
		}
		return e.h;
	}
	W = new dt();
	var mt = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
	function G(e) {
		F.call(this), this.headers = /* @__PURE__ */ new Map(), this.K = e || null, this.i = !1, this.J = this.g = null, this.T = this.G = "", this.m = 0, this.A = "", this.l = this.R = this.F = this.P = !1, this.u = 0, this.H = null, this.B = ht, this.I = this.O = !1;
	}
	m(G, F);
	var ht = "";
	G.prototype.h = V(H(), "goog.net.XhrIo").l;
	var gt = /^https?$/i, _t = ["POST", "PUT"];
	function vt(e, t, n) {
		if (e.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + e.G + "; newUri=" + t);
		e.G = t, e.A = "", e.m = 0, e.T = "POST", e.P = !1, e.i = !0, e.g = e.K ? ft(e.K) : ft(W), e.J = e.K ? ut(e.K) : ut(W), e.g.onreadystatechange = p(e.U, e);
		try {
			U(e.h, J(e, "Opening Xhr")), e.R = !0, e.g.open("POST", String(t), !0), e.R = !1;
		} catch (t) {
			U(e.h, J(e, "Error opening Xhr: " + t.message)), bt(e, t);
			return;
		}
		t = n || "", n = new Map(e.headers);
		let r = Array.from(n.keys()).find((e) => e.toLowerCase() == "content-type"), o = i.FormData && t instanceof i.FormData;
		!(_e(_t, "POST") >= 0) || r || o || n.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
		for (let [t, r] of n) e.g.setRequestHeader(t, r);
		e.B && (e.g.responseType = e.B), "withCredentials" in e.g && e.g.withCredentials !== e.O && (e.g.withCredentials = e.O);
		try {
			Ct(e), e.u > 0 && (e.I = yt(e.g), U(e.h, J(e, "Will abort after " + e.u + "ms if incomplete, xhr2 " + e.I)), e.I ? (e.g.timeout = e.u, e.g.ontimeout = p(e.V, e)) : e.H = Ye(e.V, e.u, e)), U(e.h, J(e, "Sending request")), e.F = !0, e.g.send(t), e.F = !1;
		} catch (t) {
			U(e.h, J(e, "Send error: " + t.message)), bt(e, t);
		}
	}
	function yt(e) {
		return ye && typeof e.timeout == "number" && e.ontimeout !== void 0;
	}
	n = G.prototype, n.V = function() {
		r !== void 0 && this.g && (this.A = "Timed out after " + this.u + "ms, aborting", this.m = 8, U(this.h, J(this, this.A)), I(this, "timeout"), this.abort(8));
	};
	function bt(e, t) {
		e.i = !1, e.g && (e.l = !0, e.g.abort(), e.l = !1), e.A = t, e.m = 5, xt(e), K(e);
	}
	function xt(e) {
		e.P || (e.P = !0, I(e, "complete"), I(e, "error"));
	}
	n.abort = function(e) {
		this.g && this.i && (U(this.h, J(this, "Aborting")), this.i = !1, this.l = !0, this.g.abort(), this.l = !1, this.m = e || 7, I(this, "complete"), I(this, "abort"), K(this));
	}, n.C = function() {
		this.g && (this.i && (this.i = !1, this.l = !0, this.g.abort(), this.l = !1), K(this, !0)), G.N.C.call(this);
	}, n.U = function() {
		this.v || (this.R || this.F || this.l ? St(this) : this.X());
	}, n.X = function() {
		St(this);
	};
	function St(e) {
		if (e.i && r !== void 0) {
			if (e.J[1] && q(e) == 4 && e.getStatus() == 2) U(e.h, J(e, "Local request error detected and ignored"));
			else if (e.F && q(e) == 4) Ye(e.U, 0, e);
			else if (I(e, "readystatechange"), q(e) == 4) {
				U(e.h, J(e, "Request complete")), e.i = !1;
				try {
					let r = e.getStatus();
					a: switch (r) {
						case 200:
						case 201:
						case 202:
						case 204:
						case 206:
						case 304:
						case 1223:
							var t = !0;
							break a;
						default: t = !1;
					}
					var n;
					if (!(n = t)) {
						var o;
						if (o = r === 0) {
							var s = String(e.G).match(mt)[1] || null;
							!s && i.self && i.self.location && (s = i.self.location.protocol.slice(0, -1)), o = !gt.test(s ? s.toLowerCase() : "");
						}
						n = o;
					}
					if (n) I(e, "complete"), I(e, "success");
					else {
						e.m = 6;
						try {
							var c = q(e) > 2 ? e.g.statusText : "";
						} catch (t) {
							U(e.h, "Can not get status: " + t.message), c = "";
						}
						e.A = c + " [" + e.getStatus() + "]", xt(e);
					}
				} finally {
					K(e);
				}
			}
		}
	}
	function K(e, t) {
		if (e.g) {
			Ct(e);
			let n = e.g, r = e.J[0] ? () => {} : null;
			e.g = null, e.J = null, t || I(e, "ready");
			try {
				n.onreadystatechange = r;
			} catch (t) {
				ct(e.h, "Problem encountered resetting onreadystatechange: " + t.message);
			}
		}
	}
	function Ct(e) {
		e.g && e.I && (e.g.ontimeout = null), e.H &&= (R.clearTimeout(e.H), null);
	}
	n.isActive = function() {
		return !!this.g;
	};
	function q(e) {
		return e.g ? e.g.readyState : 0;
	}
	n.getStatus = function() {
		try {
			return q(this) > 2 ? this.g.status : -1;
		} catch {
			return -1;
		}
	};
	function wt(e) {
		try {
			if (!e.g) return null;
			if ("response" in e.g) return e.g.response;
			switch (e.B) {
				case ht:
				case "text": return e.g.responseText;
				case "arraybuffer": if ("mozResponseArrayBuffer" in e.g) return e.g.mozResponseArrayBuffer;
			}
			return ct(e.h, "Response type " + e.B + " is not supported on this browser"), null;
		} catch (t) {
			return U(e.h, "Can not get response: " + t.message), null;
		}
	}
	function Tt(e) {
		let t = {};
		e = (e.g && q(e) >= 2 && e.g.getAllResponseHeaders() || "").split("\r\n");
		for (let r = 0; r < e.length; r++) {
			if (/^[\s\xa0]*$/.test(e[r])) continue;
			var n = Ae(e[r]);
			let i = n[0];
			if (n = n[1], typeof n != "string") continue;
			n = n.trim();
			let o = t[i] || [];
			t[i] = o, o.push(n);
		}
		return Te(t, function(e) {
			return e.join(", ");
		});
	}
	function J(e, t) {
		return t + " [" + e.T + " " + e.G + " " + e.getStatus() + "]";
	}
	var Et = {}, Y = null;
	function Dt(e) {
		var t = e.length, n = t * 3 / 4;
		n % 3 ? n = Math.floor(n) : "=.".indexOf(e[t - 1]) != -1 && (n = "=.".indexOf(e[t - 2]) == -1 ? n - 1 : n - 2);
		var r = new Uint8Array(n), i = 0;
		return Ot(e, function(e) {
			r[i++] = e;
		}), i === n ? r : r.subarray(0, i);
	}
	function Ot(e, t) {
		function n(t) {
			for (; r < e.length;) {
				var n = e.charAt(r++), i = Y[n];
				if (i != null) return i;
				if (!/^[\s\xa0]*$/.test(n)) throw Error("Unknown base64 encoding at char: " + n);
			}
			return t;
		}
		kt();
		for (var r = 0;;) {
			var i = n(-1), o = n(0), s = n(64), c = n(64);
			if (c === 64 && i === -1) break;
			t(i << 2 | o >> 4), s != 64 && (t(o << 4 & 240 | s >> 2), c != 64 && t(s << 6 & 192 | c));
		}
	}
	function kt() {
		if (!Y) {
			Y = {};
			for (var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), t = [
				"+/=",
				"+/",
				"-_=",
				"-_.",
				"-_"
			], n = 0; n < 5; n++) {
				var r = e.concat(t[n].split(""));
				Et[n] = r;
				for (var i = 0; i < r.length; i++) {
					var o = r[i];
					Y[o] === void 0 && (Y[o] = i);
				}
			}
		}
	}
	var At = [
		"content-type",
		"grpc-status",
		"grpc-message"
	];
	function X(e, t) {
		if (t.code != 0) {
			var n = new x(t.code, decodeURIComponent(t.message || ""), t.metadata);
			for (let t = 0; t < e.j.length; t++) e.j[t](n);
		}
		for (t = {
			code: t.code,
			details: decodeURIComponent(t.message || ""),
			metadata: t.metadata
		}, n = 0; n < e.m.length; n++) e.m[n](t);
	}
	function jt(e, t) {
		for (let n = 0; n < e.l.length; n++) e.l[n](t);
	}
	function Mt(e) {
		for (let t = 0; t < e.i.length; t++) e.i[t]();
	}
	function Z(e, t) {
		t = e.indexOf(t), t > -1 && e.splice(t, 1);
	}
	var Q = class {
		constructor(e) {
			this.g = e.$, this.v = null, this.h = [], this.m = [], this.l = [], this.j = [], this.i = [], this.u = !1, this.o = 0, this.A = new ue();
			let t = this;
			j(this.g, "readystatechange", function() {
				var e = t.g;
				if (e = e.g ? e.g.getResponseHeader("Content-Type") : null) {
					if (e = e.toLowerCase(), e.lastIndexOf("application/grpc-web-text", 0) == 0) {
						e = t.g;
						try {
							var n = e.g ? e.g.responseText : "";
						} catch (t) {
							U(e.h, "Can not get responseText: " + t.message), n = "";
						}
						if (e = n || "", n = e.length - e.length % 4, e = e.substr(t.o, n - t.o), e.length == 0) return;
						t.o = n, e = Dt(e);
					} else if (e.lastIndexOf("application/grpc", 0) == 0) e = new Uint8Array(wt(t.g));
					else {
						X(t, new x(2, "Unknown Content-type received."));
						return;
					}
					n = null;
					try {
						n = le(t.A, e);
					} catch {
						X(t, new x(2, "Error in parsing response body"));
					}
					if (n) for (e = 0; e < n.length; e++) {
						if (v in n[e]) {
							var r = n[e][v];
							if (r) {
								var i = !1;
								let e;
								try {
									e = t.v(r), i = !0;
								} catch (n) {
									X(t, new x(13, `Error when deserializing response data; error: ${n}, response: ${e}`));
								}
								if (i) {
									r = t, i = e;
									for (var o = 0; o < r.h.length; o++) r.h[o](i);
								}
							}
						}
						if (y in n[e] && n[e][y].length > 0) {
							for (r = "", i = 0; i < n[e][y].length; i++) r += String.fromCharCode(n[e][y][i]);
							for (r = r.trim().split("\r\n"), i = {}, o = 0; o < r.length; o++) {
								let e = r[o].indexOf(":");
								i[r[o].substring(0, e).trim()] = r[o].substring(e + 1).trim();
							}
							r = i, i = 0, o = "", "grpc-status" in r && (i = Number(r["grpc-status"]), delete r["grpc-status"]), "grpc-message" in r && (o = r["grpc-message"], delete r["grpc-message"]), X(t, new x(i, o, r));
						}
					}
				}
			}), j(this.g, "complete", function() {
				var e = t.g.m, n = 2, r = "";
				let i = {};
				n = Tt(t.g);
				let o = {};
				for (var s in n) n.hasOwnProperty(s) && (o[s.toLowerCase()] = n[s]);
				if (Object.keys(o).forEach((e) => {
					At.includes(e) || (i[e] = o[e]);
				}), jt(t, i), s = -1, e != 0) {
					switch (e) {
						case 7:
							n = 10;
							break;
						case 8:
							n = 4;
							break;
						case 6:
							s = t.g.getStatus(), n = he(s);
							break;
						default: n = 14;
					}
					n == 10 && t.u || (r = se(e), s != -1 && (r += ", http status code: " + s), X(t, new x(n, r)));
				} else e = !1, "grpc-status" in o && (n = Number(o["grpc-status"]), "grpc-message" in o && (r = o["grpc-message"]), n != 0 && (X(t, new x(n, r || "", o)), e = !0)), e || Mt(t);
			});
		}
		on(e, t) {
			return e == "data" ? this.h.push(t) : e == "status" ? this.m.push(t) : e == "metadata" ? this.l.push(t) : e == "end" ? this.i.push(t) : e == "error" && this.j.push(t), this;
		}
		removeListener(e, t) {
			return e == "data" ? Z(this.h, t) : e == "status" ? Z(this.m, t) : e == "metadata" ? Z(this.l, t) : e == "end" ? Z(this.i, t) : e == "error" && Z(this.j, t), this;
		}
		cancel() {
			this.u = !0, this.g.abort();
		}
	};
	Q.prototype.cancel = Q.prototype.cancel, Q.prototype.removeListener = Q.prototype.removeListener, Q.prototype.on = Q.prototype.on;
	function Nt(e) {
		let t = "";
		return we(e, function(e, n) {
			t += n, t += ":", t += e, t += "\r\n";
		}), t;
	}
	function Pt(e, t) {
		return t.reduce((e, t) => (n) => t.intercept(n, e), e);
	}
	function Ft(e, t, n) {
		let r = !1, i = null, o = !1;
		e.on("data", function(e) {
			r = !0, i = e;
		}), e.on("error", function(e) {
			e.code == 0 || o || (o = !0, t(e, null));
		}), e.on("status", function(e) {
			e.code == 0 || o ? n && t(null, null, e) : (o = !0, t({
				code: e.code,
				message: e.details,
				metadata: e.metadata
			}, null));
		}), n && e.on("metadata", function(e) {
			t(null, null, null, e);
		}), e.on("end", function() {
			o || (r ? n ? t(null, i, null, null, !0) : t(null, i) : t({
				code: 2,
				message: "Incomplete response"
			})), n && t(null, null);
		});
	}
	function It(e, t, n) {
		var r = t.getMethodDescriptor(), i = n + r.getName();
		n = e.i ? e.i : new G(), n.O = e.j;
		let o = new Q({ $: n });
		o.v = r.h;
		var s = t.getMetadata();
		for (var c in s) n.headers.set(c, s[c]);
		if (e.g == "text" ? (n.headers.set("Content-Type", "application/grpc-web-text"), n.headers.set("Accept", "application/grpc-web-text")) : n.headers.set("Content-Type", "application/grpc-web+proto"), n.headers.set("X-User-Agent", "grpc-web-javascript/0.1"), n.headers.set("X-Grpc-Web", "1"), n.headers.has("deadline") && (c = Number(n.headers.get("deadline")), c = Math.ceil(c - (/* @__PURE__ */ new Date()).getTime()), n.headers.delete("deadline"), c === Infinity && (c = 0), c > 0 && (n.headers.set("grpc-timeout", c + "m"), n.u = Math.max(0, Math.max(1e3, Math.ceil(c * 1.1))))), e.l) {
			c = n.headers, s = {};
			for (l of c.keys()) s[l] = c.get(l);
			var l = s;
			n.headers.clear();
			b: {
				for (u in l) {
					var u = !1;
					break b;
				}
				u = !0;
			}
			u || (l = Nt(l), typeof i == "string" ? (u = "%24httpHeaders", l = l == null ? "" : "=" + encodeURIComponent(String(l)), (u += l) && (l = i.indexOf("#"), l < 0 && (l = i.length), c = i.indexOf("?"), c < 0 || c > l ? (c = l, s = "") : s = i.substring(c + 1, l), i = [
				i.slice(0, c),
				s,
				i.slice(l)
			], l = i[1], i[1] = u ? l ? l + "&" + u : u : l, i = i[0] + (i[1] ? "?" + i[1] : "") + i[2])) : i.g("$httpHeaders", l));
		}
		for (t = (0, r.g)(t.getRequestMessage()), r = t.length, u = [
			0,
			0,
			0,
			0
		], l = new Uint8Array(5 + r), c = 3; c >= 0; c--) u[c] = r % 256, r >>>= 8;
		if (l.set(new Uint8Array(u), 1), l.set(t, 5), t = l, e.g == "text") {
			e = t;
			var d;
			for (d === void 0 && (d = 0), kt(), d = Et[d], t = Array(Math.floor(e.length / 3)), r = d[64] || "", u = l = 0; l < e.length - 2; l += 3) {
				var f = e[l], p = e[l + 1];
				s = e[l + 2], c = d[f >> 2], f = d[(f & 3) << 4 | p >> 4], p = d[(p & 15) << 2 | s >> 6], s = d[s & 63], t[u++] = c + f + p + s;
			}
			switch (c = 0, s = r, e.length - l) {
				case 2: c = e[l + 1], s = d[(c & 15) << 2] || r;
				case 1: e = e[l], t[u] = d[e >> 2] + d[(e & 3) << 4 | c >> 4] + s + r;
			}
			t = t.join("");
		} else e.g == "binary" && (n.B = "arraybuffer");
		return vt(n, i, t), o;
	}
	function Lt(e, t, n, r, i, o = {}) {
		let s = t.substr(0, t.length - i.name.length), c = o && o.signal;
		return Pt((t) => new Promise((n, r) => {
			if (c && c.aborted) {
				let e = new x(1, "Aborted");
				e.cause = c.reason, r(e);
			} else {
				var i = It(e, t, s), o, l, u;
				Ft(i, (e, i, s, c, d) => {
					e ? r(e) : d ? u = i : s ? l = s : c ? o = c : n(ie(t.getMethodDescriptor(), u, o, l));
				}, !0), c && c.addEventListener("abort", () => {
					i.cancel();
					let e = new x(1, "Aborted");
					e.cause = c.reason, r(e);
				});
			}
		}), e.m).call(e, re(i, n, r)).then((e) => e.getResponseMessage());
	}
	var $ = class {
		constructor(e = {}, t) {
			this.g = e.format || o("format", e) || "text", this.l = e.ca || o("suppressCorsPreflight", e) || !1, this.j = e.withCredentials || o("withCredentials", e) || !1, this.h = e.ba || o("streamInterceptors", e) || [], this.m = e.da || o("unaryInterceptors", e) || [], this.i = t || null;
		}
		Y(e, t, n, r, i) {
			let o = e.substr(0, e.length - r.name.length);
			return e = Pt((e) => It(this, e, o), this.h).call(this, re(r, t, n)), Ft(e, i, !1), new oe(e);
		}
		unaryCall(e, t, n, r, i = {}) {
			return Lt(this, e, t, n, r, i);
		}
		Z(e, t, n, r) {
			let i = e.substr(0, e.length - r.name.length);
			return Pt((e) => It(this, e, i), this.h).call(this, re(r, t, n));
		}
	};
	$.prototype.serverStreaming = $.prototype.Z, $.prototype.unaryCall = $.prototype.unaryCall, $.prototype.rpcCall = $.prototype.Y, t.exports.CallOptions = ee, t.exports.MethodDescriptor = ae, t.exports.GrpcWebClientBase = $, t.exports.RpcError = x, t.exports.StatusCode = {
		OK: 0,
		CANCELLED: 1,
		UNKNOWN: 2,
		INVALID_ARGUMENT: 3,
		DEADLINE_EXCEEDED: 4,
		NOT_FOUND: 5,
		ALREADY_EXISTS: 6,
		PERMISSION_DENIED: 7,
		UNAUTHENTICATED: 16,
		RESOURCE_EXHAUSTED: 8,
		FAILED_PRECONDITION: 9,
		ABORTED: 10,
		OUT_OF_RANGE: 11,
		UNIMPLEMENTED: 12,
		INTERNAL: 13,
		UNAVAILABLE: 14,
		DATA_LOSS: 15
	}, t.exports.MethodType = {
		UNARY: "unary",
		SERVER_STREAMING: "server_streaming",
		BIDI_STREAMING: "bidi_streaming"
	}, R = typeof globalThis < "u" && globalThis || self;
})), require_chat_grpc_web_pb = /* @__PURE__ */ __commonJSMin(((e, t) => {
	var n = {};
	n.web = require_grpc_web();
	var r = {};
	r.widgetgrid = {}, r.widgetgrid.v1 = require_chat_pb(), r.widgetgrid.v1.ChatServiceClient = function(e, t, r) {
		r ||= {}, r.format = "text", this.client_ = new n.web.GrpcWebClientBase(r), this.hostname_ = e.replace(/\/+$/, "");
	}, r.widgetgrid.v1.ChatServicePromiseClient = function(e, t, r) {
		r ||= {}, r.format = "text", this.client_ = new n.web.GrpcWebClientBase(r), this.hostname_ = e.replace(/\/+$/, "");
	};
	var i = new n.web.MethodDescriptor("/widgetgrid.v1.ChatService/StartOrGetChat", n.web.MethodType.UNARY, r.widgetgrid.v1.StartOrGetChatRequest, r.widgetgrid.v1.StartOrGetChatResponse, function(e) {
		return e.serializeBinary();
	}, r.widgetgrid.v1.StartOrGetChatResponse.deserializeBinary);
	r.widgetgrid.v1.ChatServiceClient.prototype.startOrGetChat = function(e, t, n) {
		return this.client_.rpcCall(this.hostname_ + "/widgetgrid.v1.ChatService/StartOrGetChat", e, t || {}, i, n);
	}, r.widgetgrid.v1.ChatServicePromiseClient.prototype.startOrGetChat = function(e, t) {
		return this.client_.unaryCall(this.hostname_ + "/widgetgrid.v1.ChatService/StartOrGetChat", e, t || {}, i);
	};
	var o = new n.web.MethodDescriptor("/widgetgrid.v1.ChatService/SendMessage", n.web.MethodType.UNARY, r.widgetgrid.v1.SendMessageRequest, r.widgetgrid.v1.SendMessageResponse, function(e) {
		return e.serializeBinary();
	}, r.widgetgrid.v1.SendMessageResponse.deserializeBinary);
	r.widgetgrid.v1.ChatServiceClient.prototype.sendMessage = function(e, t, n) {
		return this.client_.rpcCall(this.hostname_ + "/widgetgrid.v1.ChatService/SendMessage", e, t || {}, o, n);
	}, r.widgetgrid.v1.ChatServicePromiseClient.prototype.sendMessage = function(e, t) {
		return this.client_.unaryCall(this.hostname_ + "/widgetgrid.v1.ChatService/SendMessage", e, t || {}, o);
	};
	var s = new n.web.MethodDescriptor("/widgetgrid.v1.ChatService/ListMessages", n.web.MethodType.UNARY, r.widgetgrid.v1.ListMessagesRequest, r.widgetgrid.v1.ListMessagesResponse, function(e) {
		return e.serializeBinary();
	}, r.widgetgrid.v1.ListMessagesResponse.deserializeBinary);
	r.widgetgrid.v1.ChatServiceClient.prototype.listMessages = function(e, t, n) {
		return this.client_.rpcCall(this.hostname_ + "/widgetgrid.v1.ChatService/ListMessages", e, t || {}, s, n);
	}, r.widgetgrid.v1.ChatServicePromiseClient.prototype.listMessages = function(e, t) {
		return this.client_.unaryCall(this.hostname_ + "/widgetgrid.v1.ChatService/ListMessages", e, t || {}, s);
	};
	var c = new n.web.MethodDescriptor("/widgetgrid.v1.ChatService/ListChats", n.web.MethodType.UNARY, r.widgetgrid.v1.ListChatsRequest, r.widgetgrid.v1.ListChatsResponse, function(e) {
		return e.serializeBinary();
	}, r.widgetgrid.v1.ListChatsResponse.deserializeBinary);
	r.widgetgrid.v1.ChatServiceClient.prototype.listChats = function(e, t, n) {
		return this.client_.rpcCall(this.hostname_ + "/widgetgrid.v1.ChatService/ListChats", e, t || {}, c, n);
	}, r.widgetgrid.v1.ChatServicePromiseClient.prototype.listChats = function(e, t) {
		return this.client_.unaryCall(this.hostname_ + "/widgetgrid.v1.ChatService/ListChats", e, t || {}, c);
	};
	var l = new n.web.MethodDescriptor("/widgetgrid.v1.ChatService/RenameChat", n.web.MethodType.UNARY, r.widgetgrid.v1.RenameChatRequest, r.widgetgrid.v1.RenameChatResponse, function(e) {
		return e.serializeBinary();
	}, r.widgetgrid.v1.RenameChatResponse.deserializeBinary);
	r.widgetgrid.v1.ChatServiceClient.prototype.renameChat = function(e, t, n) {
		return this.client_.rpcCall(this.hostname_ + "/widgetgrid.v1.ChatService/RenameChat", e, t || {}, l, n);
	}, r.widgetgrid.v1.ChatServicePromiseClient.prototype.renameChat = function(e, t) {
		return this.client_.unaryCall(this.hostname_ + "/widgetgrid.v1.ChatService/RenameChat", e, t || {}, l);
	};
	var u = new n.web.MethodDescriptor("/widgetgrid.v1.ChatService/MarkRead", n.web.MethodType.UNARY, r.widgetgrid.v1.MarkReadRequest, r.widgetgrid.v1.MarkReadResponse, function(e) {
		return e.serializeBinary();
	}, r.widgetgrid.v1.MarkReadResponse.deserializeBinary);
	r.widgetgrid.v1.ChatServiceClient.prototype.markRead = function(e, t, n) {
		return this.client_.rpcCall(this.hostname_ + "/widgetgrid.v1.ChatService/MarkRead", e, t || {}, u, n);
	}, r.widgetgrid.v1.ChatServicePromiseClient.prototype.markRead = function(e, t) {
		return this.client_.unaryCall(this.hostname_ + "/widgetgrid.v1.ChatService/MarkRead", e, t || {}, u);
	};
	var d = new n.web.MethodDescriptor("/widgetgrid.v1.ChatService/SubscribeChatEvents", n.web.MethodType.SERVER_STREAMING, r.widgetgrid.v1.SubscribeChatEventsRequest, r.widgetgrid.v1.ChatEvent, function(e) {
		return e.serializeBinary();
	}, r.widgetgrid.v1.ChatEvent.deserializeBinary);
	r.widgetgrid.v1.ChatServiceClient.prototype.subscribeChatEvents = function(e, t) {
		return this.client_.serverStreaming(this.hostname_ + "/widgetgrid.v1.ChatService/SubscribeChatEvents", e, t || {}, d);
	}, r.widgetgrid.v1.ChatServicePromiseClient.prototype.subscribeChatEvents = function(e, t) {
		return this.client_.serverStreaming(this.hostname_ + "/widgetgrid.v1.ChatService/SubscribeChatEvents", e, t || {}, d);
	}, t.exports = r.widgetgrid.v1;
})), import_chat_pb = require_chat_pb(), import_chat_grpc_web_pb = require_chat_grpc_web_pb(), client = new import_chat_grpc_web_pb.ChatServicePromiseClient("http://localhost:8080"), TOKEN_KEY = "widgetgrid:ownerToken", VISITOR_ID_KEY = "widgetgrid:visitorId";
function getOwnerToken() {
	return localStorage.getItem(TOKEN_KEY);
}
function getOrCreateVisitorId() {
	let e = localStorage.getItem(VISITOR_ID_KEY);
	return e || (e = crypto.randomUUID(), localStorage.setItem(VISITOR_ID_KEY, e)), e;
}
function identityMetadata() {
	let e = getOwnerToken();
	return e ? { authorization: `Bearer ${e}` } : { "visitor-id": getOrCreateVisitorId() };
}
var chatClient = {
	async startOrGetChat() {
		return (await client.startOrGetChat(new import_chat_pb.StartOrGetChatRequest(), identityMetadata())).toObject().chat;
	},
	async sendMessage(e, t) {
		let n = new import_chat_pb.SendMessageRequest();
		return n.setChatId(e), n.setBody(t), (await client.sendMessage(n, identityMetadata())).toObject().message;
	},
	async listMessages(e) {
		let t = new import_chat_pb.ListMessagesRequest();
		return t.setChatId(e), (await client.listMessages(t, identityMetadata())).toObject().messagesList;
	},
	async listChats() {
		return (await client.listChats(new import_chat_pb.ListChatsRequest(), identityMetadata())).toObject().chatsList;
	},
	async renameChat(e, t) {
		let n = new import_chat_pb.RenameChatRequest();
		n.setChatId(e), n.setLabel(t), await client.renameChat(n, identityMetadata());
	},
	async markRead(e) {
		let t = new import_chat_pb.MarkReadRequest();
		t.setChatId(e), await client.markRead(t, identityMetadata());
	}
}, _plugin_vue_export_helper_default = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, _sfc_main = {
	name: "ChatWidget",
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
			isOwner: !!getOwnerToken(),
			status: "loading",
			chats: [],
			selectedChatId: null,
			myChatId: null,
			messages: [],
			newMessageBody: "",
			renamingChatId: null,
			renameValue: ""
		};
	},
	created() {
		window.addEventListener("widgetgrid:chat-event", this.onChatEvent), this.isOwner ? this.loadChats() : chatClient.startOrGetChat().then((e) => (this.myChatId = e.id, this.loadMessages(e.id))).then(() => {
			this.status = "ready";
		}).catch(() => {
			this.status = "error";
		});
	},
	beforeUnmount() {
		window.removeEventListener("widgetgrid:chat-event", this.onChatEvent);
	},
	updated() {
		this.scrollToBottom();
	},
	methods: {
		async loadChats() {
			try {
				let e = await chatClient.listChats();
				this.chats = e, this.status = "ready", !this.selectedChatId && e.length > 0 && this.selectChat(e[0].id);
			} catch {
				this.status = "error";
			}
		},
		async loadMessages(e) {
			this.messages = await chatClient.listMessages(e);
		},
		selectChat(e) {
			this.selectedChatId = e, this.loadMessages(e), chatClient.markRead(e);
			let t = this.chats.find((t) => t.id === e);
			t && (t.hasUnread = !1);
		},
		startRename(e) {
			this.renamingChatId = e.id, this.renameValue = e.label;
		},
		async confirmRename() {
			let e = this.renamingChatId, t = this.renameValue.trim();
			if (this.renamingChatId = null, !e || !t) return;
			await chatClient.renameChat(e, t);
			let n = this.chats.find((t) => t.id === e);
			n && (n.label = t);
		},
		cancelRename() {
			this.renamingChatId = null;
		},
		async sendMessage() {
			let e = this.newMessageBody.trim(), t = this.isOwner ? this.selectedChatId : this.myChatId;
			if (!e || !t) return;
			this.newMessageBody = "";
			let n = await chatClient.sendMessage(t, e);
			this.messages.push(n);
		},
		async onChatEvent(e) {
			if (this.isOwner) {
				if (await this.loadChats(), e.detail.chatId === this.selectedChatId) {
					await this.loadMessages(this.selectedChatId), await chatClient.markRead(this.selectedChatId);
					let e = this.chats.find((e) => e.id === this.selectedChatId);
					e && (e.hasUnread = !1);
				}
			} else {
				if (!this.myChatId) return;
				await this.loadMessages(this.myChatId), await chatClient.markRead(this.myChatId);
			}
		},
		scrollToBottom() {
			let e = this.$refs.messagesEl;
			e && (e.scrollTop = e.scrollHeight);
		}
	}
}, _hoisted_1 = { class: "widget widget-chat" }, _hoisted_2 = {
	key: 0,
	class: "chat-shell"
}, _hoisted_3 = { class: "chat-list" }, _hoisted_4 = {
	key: 0,
	class: "chat-status"
}, _hoisted_5 = {
	key: 1,
	class: "chat-status"
}, _hoisted_6 = ["onClick"], _hoisted_7 = ["onClick"], _hoisted_8 = { class: "chat-thread" }, _hoisted_9 = {
	ref: "messagesEl",
	class: "chat-messages"
}, _hoisted_10 = { class: "chat-message-body" }, _hoisted_11 = ["disabled"], _hoisted_12 = {
	key: 1,
	class: "chat-status"
}, _hoisted_13 = {
	key: 1,
	class: "chat-thread chat-thread-visitor"
}, _hoisted_14 = {
	key: 0,
	class: "chat-status"
}, _hoisted_15 = {
	ref: "messagesEl",
	class: "chat-messages"
}, _hoisted_16 = {
	key: 0,
	class: "chat-status"
}, _hoisted_17 = { class: "chat-message-body" }, _hoisted_18 = ["disabled"];
function _sfc_render(e, t, n, r, i, o) {
	return openBlock(), createElementBlock("div", _hoisted_1, [i.isOwner ? (openBlock(), createElementBlock("div", _hoisted_2, [createElementVNode("aside", _hoisted_3, [i.status === "loading" ? (openBlock(), createElementBlock("p", _hoisted_4, "Loading…")) : i.chats.length === 0 ? (openBlock(), createElementBlock("p", _hoisted_5, "No conversations yet.")) : createCommentVNode("", !0), (openBlock(!0), createElementBlock(Fragment, null, renderList(i.chats, (e) => (openBlock(), createElementBlock("div", {
		key: e.id,
		class: normalizeClass(["chat-list-item", { "chat-list-item-active": e.id === i.selectedChatId }]),
		onClick: (t) => o.selectChat(e.id)
	}, [i.renamingChatId === e.id ? withDirectives((openBlock(), createElementBlock("input", {
		key: 0,
		"onUpdate:modelValue": t[0] ||= (e) => i.renameValue = e,
		class: "chat-rename-input",
		autofocus: "",
		onClick: t[1] ||= withModifiers(() => {}, ["stop"]),
		onKeyup: [t[2] ||= withKeys((...e) => o.confirmRename && o.confirmRename(...e), ["enter"]), t[3] ||= withKeys((...e) => o.cancelRename && o.cancelRename(...e), ["esc"])],
		onBlur: t[4] ||= (...e) => o.confirmRename && o.confirmRename(...e)
	}, null, 544)), [[vModelText, i.renameValue]]) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createElementVNode("span", { class: normalizeClass(["chat-list-label", { "chat-list-label-unread": e.hasUnread }]) }, toDisplayString(e.label), 3), createElementVNode("button", {
		type: "button",
		class: "chat-rename-btn",
		title: "Rename",
		"aria-label": "Rename",
		onClick: withModifiers((t) => o.startRename(e), ["stop"])
	}, "✎", 8, _hoisted_7)], 64))], 10, _hoisted_6))), 128))]), createElementVNode("section", _hoisted_8, [i.selectedChatId ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createElementVNode("div", _hoisted_9, [(openBlock(!0), createElementBlock(Fragment, null, renderList(i.messages, (e) => (openBlock(), createElementBlock("div", {
		key: e.id,
		class: normalizeClass(["chat-message", e.sender === "owner" ? "chat-message-mine" : "chat-message-theirs"])
	}, [createElementVNode("p", _hoisted_10, toDisplayString(e.body), 1)], 2))), 128))], 512), createElementVNode("form", {
		class: "chat-composer",
		onSubmit: t[6] ||= withModifiers((...e) => o.sendMessage && o.sendMessage(...e), ["prevent"])
	}, [withDirectives(createElementVNode("input", {
		"onUpdate:modelValue": t[5] ||= (e) => i.newMessageBody = e,
		type: "text",
		class: "chat-input",
		placeholder: "Type a message…"
	}, null, 512), [[vModelText, i.newMessageBody]]), createElementVNode("button", {
		type: "submit",
		class: "chat-send",
		disabled: !i.newMessageBody.trim()
	}, "Send", 8, _hoisted_11)], 32)], 64)) : (openBlock(), createElementBlock("p", _hoisted_12, "Select a conversation."))])])) : (openBlock(), createElementBlock("div", _hoisted_13, [i.status === "loading" ? (openBlock(), createElementBlock("p", _hoisted_14, "Connecting…")) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createElementVNode("div", _hoisted_15, [i.messages.length === 0 ? (openBlock(), createElementBlock("p", _hoisted_16, "Say hello — Matt will get back to you here.")) : createCommentVNode("", !0), (openBlock(!0), createElementBlock(Fragment, null, renderList(i.messages, (e) => (openBlock(), createElementBlock("div", {
		key: e.id,
		class: normalizeClass(["chat-message", e.sender === "visitor" ? "chat-message-mine" : "chat-message-theirs"])
	}, [createElementVNode("p", _hoisted_17, toDisplayString(e.body), 1)], 2))), 128))], 512), createElementVNode("form", {
		class: "chat-composer",
		onSubmit: t[8] ||= withModifiers((...e) => o.sendMessage && o.sendMessage(...e), ["prevent"])
	}, [withDirectives(createElementVNode("input", {
		"onUpdate:modelValue": t[7] ||= (e) => i.newMessageBody = e,
		type: "text",
		class: "chat-input",
		placeholder: "Type a message…"
	}, null, 512), [[vModelText, i.newMessageBody]]), createElementVNode("button", {
		type: "submit",
		class: "chat-send",
		disabled: !i.newMessageBody.trim()
	}, "Send", 8, _hoisted_18)], 32)], 64))]))]);
}
var ChatWidget_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-97112f78"]]);
//#endregion
export { ChatWidget_default as default };
