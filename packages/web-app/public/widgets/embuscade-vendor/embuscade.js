const Z = Object.freeze({
  None: 0,
  Up: 1,
  Down: 2,
  North: 4,
  South: 8,
  East: 16,
  West: 32
});
function Ln(l, w, h, b, y) {
  const m = w * l + l / 2, f = h * l + l / 2, d = !!(b & y.Up), T = !!(b & y.Down), u = [];
  return d && T ? (u.push({ dir: "up", x: m - 32, y: f }), u.push({ dir: "down", x: m + 32, y: f })) : d ? u.push({ dir: "up", x: m, y: f }) : T && u.push({ dir: "down", x: m, y: f }), u;
}
const q = 32, Re = 4;
function He() {
  return new Array(q * q).fill(Re);
}
function Ct(l, w, h, b) {
  w < 0 || w >= q || h < 0 || h >= q || (l[h * q + w] = b);
}
function g(l, w, h, b, y, m) {
  for (let f = h; f <= y; f++)
    for (let d = w; d <= b; d++)
      Ct(l, d, f, m);
}
function X(l, w, h, b, y) {
  for (let m = -b; m <= b; m++)
    for (let f = -b; f <= b; f++)
      f * f + m * m <= b * b && Ct(l, w + f, h + m, y);
}
function zn() {
  const l = He();
  return g(l, 2, 2, 29, 6, 1), g(l, 2, 25, 29, 29, 1), g(l, 4, 9, 27, 22, 2), X(l, 16, 16, 7, 3), g(l, 16, 14, 29, 17, 3), l;
}
function Tn() {
  const l = He();
  return g(l, 3, 10, 28, 21, 1), g(l, 4, 11, 27, 20, 2), g(l, 22, 12, 27, 19, 3), g(l, 5, 13, 11, 18, 3), g(l, 2, 8, 6, 11, 1), g(l, 2, 20, 6, 23, 1), g(l, 25, 8, 29, 11, 1), g(l, 25, 20, 29, 23, 1), l;
}
function Mn() {
  const l = He();
  return X(l, 16, 16, 11, 2), g(l, 24, 10, 29, 14, 3), g(l, 24, 18, 29, 22, 3), g(l, 2, 13, 8, 19, 3), X(l, 19, 16, 4, 0), X(l, 19, 16, 4, 1), X(l, 19, 16, 3, 0), l;
}
const O = {
  tank: zn(),
  racecar: Tn(),
  spaceship: Mn()
}, ye = { light: "#e8e8e8", dark: "#333333" }, I = 14, p = 32, C = 640, E = 480, Pn = 256, Nn = 25e3, An = 2e3, vt = "bolo:playerProfile", gt = "bolo:sessionToken", wt = 6.25, Rn = `
    <div id="emb-mobile-block" style="display: none;">
      <div id="emb-mobile-block-box">
        <h2>Embuscade needs a keyboard</h2>
        <p>Embuscade is played with arrow keys, WASD, and other keyboard shortcuts -- it isn't playable on a phone or touch-only tablet.</p>
        <p>Please come back on a desktop, laptop, or a tablet with a physical keyboard attached.</p>
      </div>
    </div>

    <div class="embuscade-screens">
      <div id="emb-loading-status">Connecting...</div>

      <div id="emb-join-dialog" style="display: none;">
        <h2>Join Embuscade</h2>
        <label for="emb-player-name">Name</label>
        <input type="text" id="emb-player-name" maxlength="20" />

        <label for="emb-primary-color">Primary colour</label>
        <input type="color" id="emb-primary-color" />

        <label for="emb-secondary-color">Secondary colour</label>
        <input type="color" id="emb-secondary-color" />

        <label>Tank style</label>
        <div id="emb-preset-list"></div>

        <button id="emb-join-button">Next</button>
      </div>

      <div id="emb-browser-screen" class="screen-with-rail" style="display: none;">
        <div class="chat-main">
          <div id="emb-browser-chat-messages" class="chat-messages"></div>
          <div class="chat-input-row">
            <button id="emb-browser-who-button">Who</button>
            <input type="text" id="emb-browser-chat-input" placeholder="Say something..." />
            <button id="emb-browser-chat-send-button">Chat</button>
          </div>
        </div>
        <div id="emb-right-rail">
          <h3>Games</h3>
          <div class="button-row">
            <button id="emb-browser-create-button">Create Game</button>
            <button id="emb-browser-leave-button">Leave Game</button>
          </div>
          <ul id="emb-games-list"></ul>
          <div id="emb-browser-empty-message">No open games -- create one!</div>
        </div>
      </div>

      <div id="emb-builder-dialog" style="display: none;">
        <h2>Create Game</h2>
        <label for="emb-game-name">Game name</label>
        <input type="text" id="emb-game-name" maxlength="120" placeholder="My Embuscade Game" />

        <label for="emb-game-password">Password (optional)</label>
        <input type="text" id="emb-game-password" placeholder="Leave blank for no password" />

        <label for="emb-human-count">Human players: <span id="emb-human-count-value">2</span></label>
        <div class="slider-row"><input type="range" id="emb-human-count" min="1" max="16" value="2" /></div>

        <label for="emb-ai-count">AI players: <span id="emb-ai-count-value">0</span></label>
        <div class="slider-row"><input type="range" id="emb-ai-count" min="0" max="15" value="0" /></div>

        <label for="emb-maze-width">Width: <span id="emb-maze-width-value">10</span></label>
        <div class="slider-row"><input type="range" id="emb-maze-width" min="2" max="10" value="10" /></div>

        <label for="emb-maze-length">Length: <span id="emb-maze-length-value">10</span></label>
        <div class="slider-row"><input type="range" id="emb-maze-length" min="2" max="10" value="10" /></div>

        <label for="emb-maze-height">Height: <span id="emb-maze-height-value">1</span></label>
        <div class="slider-row"><input type="range" id="emb-maze-height" min="1" max="10" value="1" /></div>

        <div id="emb-maze-size-summary"></div>
        <div id="emb-maze-size-error"></div>

        <label for="emb-score-target">Play to: <span id="emb-score-target-value">10</span> points</label>
        <div class="slider-row"><input type="range" id="emb-score-target" min="1" max="30" value="10" /></div>

        <label>
          <input type="checkbox" id="emb-unlimited-time-checkbox" checked /> Unlimited time
        </label>
        <div id="emb-time-limit-row" class="slider-row" style="display: none;">
          <label for="emb-time-limit">Time limit: <span id="emb-time-limit-value">15</span> minutes</label>
          <input type="range" id="emb-time-limit" min="2" max="60" value="15" />
        </div>

        <button id="emb-create-game-button">Create Game</button>
      </div>

      <div id="emb-lobby-screen" class="screen-with-rail" style="display: none;">
        <div class="chat-main">
          <div id="emb-lobby-chat-messages" class="chat-messages"></div>
          <div class="chat-input-row">
            <input type="text" id="emb-lobby-chat-input" placeholder="Say something..." />
            <button id="emb-lobby-chat-send-button">Chat</button>
          </div>
        </div>
        <div id="emb-lobby-right-rail">
          <h3 id="emb-lobby-game-name"></h3>
          <div id="emb-lobby-size"></div>
          <ul id="emb-lobby-roster"></ul>
          <div class="button-row">
            <button id="emb-start-game-button" style="display: none;">Start Game</button>
            <button id="emb-lobby-leave-button">Leave Game</button>
          </div>
          <div id="emb-lobby-waiting-message">Waiting for the host to start the game...</div>
        </div>
      </div>

      <div id="emb-game-view" class="screen-with-rail" style="display: none;">
        <div id="emb-game-view-inner">
          <canvas id="emb-maze-canvas"></canvas>
          <div class="chat-main" id="emb-game-chat-panel" style="height: 120px; margin-top: 8px; position: relative;">
            <div id="emb-game-chat-messages" class="chat-messages chat-messages-tight"></div>
            <div id="emb-game-chat-hint">press '/' to chat</div>
            <div class="chat-input-row" id="emb-game-chat-input-row" style="display: none;">
              <input type="text" id="emb-game-chat-input" placeholder="Say something..." />
              <button id="emb-game-chat-send-button">Chat</button>
            </div>
          </div>
        </div>
        <div id="emb-game-right-rail">
          <h3>Embuscade</h3>
          <ol id="emb-scoreboard"></ol>
          <button id="emb-game-leave-button">Leave Game</button>
        </div>
      </div>
    </div>

    <div id="emb-who-modal-overlay" style="display: none;">
      <div id="emb-who-modal-box">
        <div id="emb-who-modal-header">
          <h3>Players</h3>
          <button id="emb-who-modal-close">✕</button>
        </div>
        <ul id="emb-who-modal-list"></ul>
      </div>
    </div>

    <div id="emb-game-end-overlay" style="display: none;">
      <div id="emb-game-end-box">
        <div id="emb-game-end-header">
          <canvas id="emb-game-end-sprite" width="32" height="32"></canvas>
          <h2 id="emb-game-end-title"></h2>
        </div>
        <div class="chat-main" style="height: 300px;">
          <div id="emb-end-chat-messages" class="chat-messages"></div>
          <div class="chat-input-row">
            <button id="emb-end-who-button">Who</button>
            <input type="text" id="emb-end-chat-input" placeholder="Say something..." />
            <button id="emb-end-chat-send-button">Chat</button>
          </div>
        </div>
        <button id="emb-game-end-leave-button">Leave</button>
      </div>
    </div>

    <div id="emb-connection-status">
      <span id="emb-connection-dot"></span>
      <span id="emb-connection-text"></span>
    </div>


`;
function Hn() {
  const l = window.matchMedia && window.matchMedia("(pointer: coarse)").matches, w = window.matchMedia && window.matchMedia("(hover: none)").matches, h = window.innerWidth < 1280;
  return (window.matchMedia ? l && w : !1) || h;
}
function On() {
  let l = localStorage.getItem(gt);
  return l || (l = crypto.randomUUID(), localStorage.setItem(gt, l)), l;
}
function _n(l, { wsUrl: w }) {
  let h = null, b = null, y = null, m = [], f = [], d = null, T = !1, u = null, W = null, Oe = null, _ = [], Q = !1;
  const B = /* @__PURE__ */ new Map();
  l.innerHTML = `<div class="embuscade">${Rn}</div>`;
  const Et = l.firstElementChild, o = (t) => Et.querySelector("#emb-" + t), We = [];
  function ee(t, e, n) {
    t.addEventListener(e, n), We.push([t, e, n]);
  }
  function _e() {
    if (!Q) {
      Q = !0, clearInterval(W), clearTimeout(Oe), d && d.close();
      for (const [t, e, n] of We)
        t.removeEventListener(e, n);
      l.innerHTML = "";
    }
  }
  if (Hn())
    return o("mobile-block").style.display = "flex", o("loading-status").style.display = "none", _e;
  const fe = On();
  function te(t, e, n) {
    const s = document.createElement("canvas");
    s.width = p, s.height = p;
    const i = s.getContext("2d"), r = [ye.light, ye.dark, e, n];
    for (let c = 0; c < p; c++)
      for (let v = 0; v < p; v++) {
        const S = t[c * p + v];
        S !== Re && (i.fillStyle = r[S], i.fillRect(v, c, 1, 1));
      }
    return s;
  }
  function ne(t) {
    const e = te(t.sprite, t.primaryColor, t.secondaryColor);
    B.set(t.playerId, { ...t, canvas: e });
  }
  function Be(t) {
    const e = document.createElement("li"), n = document.createElement("canvas");
    n.width = p, n.height = p, n.className = "roster-sprite";
    const s = n.getContext("2d"), i = te(t.sprite, t.primaryColor, t.secondaryColor);
    s.drawImage(i, 0, 0);
    const r = document.createElement("span");
    if (r.textContent = t.name + (t.isHost ? " (host)" : ""), e.appendChild(n), e.appendChild(r), t.afk) {
      const c = document.createElement("span");
      c.textContent = "AFK", c.style.color = "#f66", c.style.fontWeight = "bold", c.style.fontSize = "11px", e.appendChild(c);
    }
    return e;
  }
  function ae() {
    _ = [], A();
  }
  function xt(t) {
    _.push(t), _.length > 200 && _.shift(), A();
  }
  function St(t) {
    t.innerHTML = "";
    for (const e of _) {
      const n = document.createElement("div");
      n.className = "chat-message-row";
      const s = document.createElement("canvas");
      s.width = p, s.height = p, s.className = "chat-sprite";
      const i = s.getContext("2d"), r = te(e.sprite, e.primaryColor, e.secondaryColor);
      i.drawImage(r, 0, 0);
      const c = document.createElement("span");
      c.className = "chat-name", c.textContent = e.name + ":";
      const v = document.createElement("span");
      v.className = "chat-text", v.textContent = e.text, n.appendChild(s), n.appendChild(c), n.appendChild(v), t.appendChild(n);
    }
    t.scrollTop = t.scrollHeight;
  }
  function k(t) {
    const e = t.trim();
    e && d && d.readyState === WebSocket.OPEN && d.send(JSON.stringify({ type: "chat", text: e }));
  }
  let Ge = [];
  function $e(t) {
    De.innerHTML = "";
    for (const e of t)
      De.appendChild(Be(e));
    G.style.display = "flex";
  }
  function ve() {
    G.style.display = "none";
  }
  ee(document, "keydown", (t) => {
    t.key === "Escape" && G.style.display !== "none" && ve();
  });
  const G = o("who-modal-overlay"), It = o("who-modal-close"), De = o("who-modal-list"), Je = o("loading-status"), ge = o("join-dialog"), Ke = o("browser-screen"), Fe = o("builder-dialog"), we = o("lobby-screen"), oe = o("game-view"), kt = o("connection-dot"), Lt = o("connection-text"), Ue = o("player-name"), $ = o("primary-color"), D = o("secondary-color"), se = o("preset-list"), zt = o("join-button"), Ve = o("games-list"), Tt = o("browser-empty-message"), Mt = o("browser-create-button"), Pt = o("browser-leave-button"), Nt = o("browser-chat-messages"), J = o("browser-chat-input"), At = o("browser-chat-send-button"), Rt = o("browser-who-button"), Ce = o("game-name"), Ht = o("game-password"), L = o("human-count"), z = o("ai-count"), Ye = o("human-count-value"), je = o("ai-count-value"), ie = o("maze-width"), le = o("maze-length"), re = o("maze-height"), Ot = o("maze-width-value"), Wt = o("maze-length-value"), _t = o("maze-height-value"), Bt = o("maze-size-summary"), Ee = o("maze-size-error"), Ze = o("create-game-button"), Xe = o("lobby-game-name"), Gt = o("lobby-size"), qe = o("lobby-roster"), Qe = o("start-game-button"), $t = o("lobby-leave-button"), Dt = o("lobby-waiting-message"), Jt = o("lobby-chat-messages"), K = o("lobby-chat-input"), Kt = o("lobby-chat-send-button"), Ft = o("game-leave-button"), Ut = o("game-chat-messages"), M = o("game-chat-input"), Vt = o("game-chat-send-button");
  o("game-chat-panel");
  const et = o("game-chat-hint"), tt = o("game-chat-input-row"), xe = o("score-target"), Yt = o("score-target-value"), Se = o("unlimited-time-checkbox"), jt = o("time-limit-row"), Ie = o("time-limit"), Zt = o("time-limit-value"), ke = o("game-end-overlay"), Xt = o("game-end-sprite"), qt = o("game-end-title"), Qt = o("end-chat-messages"), F = o("end-chat-input"), en = o("end-chat-send-button"), tn = o("end-who-button"), nn = o("game-end-leave-button"), nt = o("scoreboard");
  It.addEventListener("click", ve), G.addEventListener("click", (t) => {
    t.target === G && ve();
  });
  function x() {
    Je.style.display = "none", ge.style.display = "none", Ke.style.display = "none", Fe.style.display = "none", we.style.display = "none", oe.style.display = "none";
  }
  function ce() {
    x(), Ke.style.display = "flex", A(), d && d.readyState === WebSocket.OPEN && u && d.send(JSON.stringify({
      type: "browse",
      playerName: u.name,
      primaryColor: u.primaryColor,
      secondaryColor: u.secondaryColor,
      sprite: u.sprite
    }));
  }
  function Le(t) {
    kt.classList.toggle("disconnected", !t), Lt.textContent = t ? "" : "client disconnected";
  }
  const at = ["tank", "racecar", "spaceship"];
  let U = "tank";
  function ze() {
    try {
      const t = localStorage.getItem(vt);
      return t ? JSON.parse(t) : null;
    } catch {
      return null;
    }
  }
  function an(t) {
    try {
      localStorage.setItem(vt, JSON.stringify(t));
    } catch {
    }
  }
  function ot() {
    se.innerHTML = "";
    for (const e of at) {
      const n = document.createElement("div");
      n.className = "preset-option" + (e === U ? " selected" : ""), n.dataset.preset = e;
      const s = document.createElement("canvas");
      s.width = p, s.height = p, s.style.width = "48px", s.style.height = "48px";
      const i = document.createElement("div");
      i.textContent = e, n.appendChild(s), n.appendChild(i), se.appendChild(n), st(s, e), n.addEventListener("click", () => {
        U = e, ot();
      });
    }
    const t = document.createElement("div");
    t.className = "preset-option disabled", t.title = "Coming soon", t.textContent = "Custom (soon)", se.appendChild(t);
  }
  function st(t, e) {
    const n = t.getContext("2d");
    n.clearRect(0, 0, p, p);
    const s = O[e], i = [ye.light, ye.dark, $.value, D.value];
    for (let r = 0; r < p; r++)
      for (let c = 0; c < p; c++) {
        const v = s[r * p + c];
        v !== Re && (n.fillStyle = i[v], n.fillRect(c, r, 1, 1));
      }
  }
  function it() {
    for (const t of se.querySelectorAll(".preset-option[data-preset]")) {
      const e = t.querySelector("canvas");
      st(e, t.dataset.preset);
    }
  }
  const P = ze();
  P ? (Ue.value = P.name ?? "", $.value = P.primaryColor ?? "#0af", D.value = P.secondaryColor ?? "#f80", U = at.includes(P.preset) ? P.preset : "tank") : ($.value = "#0af", D.value = "#f80"), ot(), $.addEventListener("input", it), D.addEventListener("input", it), zt.addEventListener("click", () => {
    const t = Ue.value.trim() || "Player", e = $.value, n = D.value, s = O[U];
    an({ name: t, primaryColor: e, secondaryColor: n, preset: U }), u = { name: t, primaryColor: e, secondaryColor: n, sprite: s }, ce();
  });
  let lt = [];
  function rt() {
    d = new WebSocket(w), d.addEventListener("open", () => {
      Le(!0), W && clearInterval(W), W = setInterval(() => {
        d.readyState === WebSocket.OPEN && d.send(JSON.stringify({ type: "ping" }));
      }, Nn), d.send(JSON.stringify({ type: "resume", sessionToken: fe }));
    }), d.addEventListener("message", (t) => {
      if (Q) return;
      const e = JSON.parse(t.data);
      if (e.type === "resumed") {
        h = e.playerId;
        const n = ze();
        n && (u = {
          name: n.name,
          primaryColor: n.primaryColor,
          secondaryColor: n.secondaryColor,
          sprite: O[n.preset] ?? O.tank
        });
        for (const s of e.roster)
          ne(s);
        ae(), e.started ? (y = {
          largeur: e.maze.largeur,
          longeur: e.maze.longeur,
          hauteur: e.maze.hauteur,
          cellSize: e.maze.cellSize
        }, b = e.maze.cells, x(), oe.style.display = "flex", bt(), me(), Ae()) : (x(), we.style.display = "flex", dt(e));
      } else if (e.type === "resume-failed") {
        const n = ze();
        n ? (u = {
          name: n.name,
          primaryColor: n.primaryColor,
          secondaryColor: n.secondaryColor,
          sprite: O[n.preset] ?? O.tank
        }, ce()) : (x(), ge.style.display = "block");
      } else if (e.type === "games-list")
        on(e.games);
      else if (e.type === "browser-players")
        Ge = e.players;
      else if (e.type === "chat-message")
        xt(e);
      else if (e.type === "join-rejected")
        alert(e.reason === "bad-password" ? "Incorrect password." : "That game is full.");
      else if (e.type === "lobby-joined")
        h = e.playerId, ne({ playerId: h, ...u }), ae(), x(), we.style.display = "flex";
      else if (e.type === "lobby-state")
        dt(e);
      else if (e.type === "left-game")
        h = null, m = [], f = [], b = null, ae(), ke.style.display = "none", ce();
      else if (e.type === "game-started") {
        y = {
          largeur: e.maze.largeur,
          longeur: e.maze.longeur,
          hauteur: e.maze.hauteur,
          cellSize: e.maze.cellSize
        }, b = e.maze.cells;
        for (const n of e.roster)
          B.has(n.playerId) || ne(n);
        x(), oe.style.display = "flex", bt(), A(), me(), Ae();
      } else if (e.type === "state")
        m = e.tanks, f = e.shots, Ae();
      else if (e.type === "game-ended") {
        lt = e.scores;
        const n = te(e.winner.sprite, e.winner.primaryColor, e.winner.secondaryColor);
        Xt.getContext("2d").drawImage(n, 0, 0), qt.textContent = `${e.winner.name} Wins!`, ke.style.display = "flex", A();
      } else e.type === "left-game" && (h = null, m = [], f = [], b = null, ae(), ke.style.display = "none", ce());
    }), d.addEventListener("close", () => {
      clearInterval(W), !Q && (Le(!1), console.log("Disconnected from Bolo server"), Oe = setTimeout(rt, An));
    }), d.addEventListener("error", () => {
      Le(!1);
    });
  }
  x(), Je.style.display = "block", rt();
  function on(t) {
    Ve.innerHTML = "", Tt.style.display = t.length === 0 ? "block" : "none";
    for (const e of t) {
      const n = document.createElement("li"), s = document.createElement("div");
      if (s.className = "game-info", s.textContent = `${e.name} -- ${e.width}x${e.length}x${e.height} -- ${e.playerCount}/${e.humanSlots} players` + (e.aiSlots > 0 ? ` + ${e.aiSlots} AI` : "") + ` -- ${e.preview}`, e.hasPassword) {
        const r = document.createElement("span");
        r.textContent = " 🔒", s.appendChild(r);
      }
      const i = document.createElement("button");
      i.textContent = "Join", i.disabled = e.playerCount >= e.humanSlots, i.addEventListener("click", () => {
        let r = null;
        e.hasPassword && (r = prompt("This game requires a password:") ?? ""), d.send(JSON.stringify({
          type: "join-game",
          gameId: e.id,
          password: r,
          sessionToken: fe,
          playerName: u.name,
          primaryColor: u.primaryColor,
          secondaryColor: u.secondaryColor,
          sprite: u.sprite
        }));
      }), n.appendChild(s), n.appendChild(i), Ve.appendChild(n);
    }
  }
  Mt.addEventListener("click", () => {
    x(), Fe.style.display = "block";
  }), Pt.addEventListener("click", () => {
    x(), ge.style.display = "block";
  }), At.addEventListener("click", () => {
    k(J.value), J.value = "";
  }), J.addEventListener("keydown", (t) => {
    t.key === "Enter" && (k(J.value), J.value = "");
  }), Rt.addEventListener("click", () => {
    $e(Ge);
  }), en.addEventListener("click", () => {
    k(F.value), F.value = "";
  }), F.addEventListener("keydown", (t) => {
    t.key === "Enter" && (k(F.value), F.value = "");
  }), tn.addEventListener("click", () => {
    $e(lt);
  }), nn.addEventListener("click", () => {
    d.send(JSON.stringify({ type: "leave-game" }));
  });
  function de() {
    return parseInt(L.value, 10) + parseInt(z.value, 10);
  }
  function ct() {
    const t = parseInt(ie.value, 10), e = parseInt(le.value, 10), n = parseInt(re.value, 10), s = t * e * n, i = de(), r = s < i, c = Ce.value.trim().length === 0;
    Ze.disabled = r || c;
  }
  function N() {
    const t = de(), e = Math.floor(t * wt), n = parseInt(ie.value, 10), s = parseInt(le.value, 10), i = parseInt(re.value, 10), r = n * s * i;
    Ot.textContent = n, Wt.textContent = s, _t.textContent = i, Bt.textContent = `Maze size: ${n} x ${s} x ${i} = ${r} cells. Recommended size is ${e} cells (~${wt}/player) for ${t} player${t === 1 ? "" : "s"}.`, r < t ? (Ee.textContent = `Too cramped: ${r} cells for ${t} players is below the 1 cell/player minimum. Increase maze size or reduce player count.`, Ee.style.display = "block") : Ee.style.display = "none", ct();
  }
  L.addEventListener("input", () => {
    Ye.textContent = L.value, de() > 16 && (z.value = Math.max(0, 16 - parseInt(L.value, 10)), je.textContent = z.value), N();
  }), z.addEventListener("input", () => {
    je.textContent = z.value, de() > 16 && (L.value = Math.max(1, 16 - parseInt(z.value, 10)), Ye.textContent = L.value), N();
  }), ie.addEventListener("input", N), le.addEventListener("input", N), re.addEventListener("input", N), Ce.addEventListener("input", ct), xe.addEventListener("input", () => {
    Yt.textContent = xe.value;
  }), Se.addEventListener("change", () => {
    jt.style.display = Se.checked ? "none" : "flex";
  }), Ie.addEventListener("input", () => {
    Zt.textContent = Ie.value;
  }), Ze.addEventListener("click", () => {
    d.send(JSON.stringify({
      type: "create-game",
      name: Ce.value.trim() || "Untitled Game",
      password: Ht.value || null,
      humanCount: parseInt(L.value, 10),
      aiCount: parseInt(z.value, 10),
      width: parseInt(ie.value, 10),
      length: parseInt(le.value, 10),
      height: parseInt(re.value, 10),
      sessionToken: fe,
      playerName: u.name,
      primaryColor: u.primaryColor,
      secondaryColor: u.secondaryColor,
      sprite: u.sprite,
      scoreTarget: parseInt(xe.value, 10),
      timeLimitMs: Se.checked ? null : parseInt(Ie.value, 10)
    }));
  }), N();
  function dt(t) {
    Xe.textContent = t.name, t.hasPassword && (Xe.textContent += " 🔒"), Gt.textContent = `${t.width} x ${t.length} x ${t.height} -- ${t.humanSlots} human, ${t.aiSlots} AI -- ${t.preview}`, qe.innerHTML = "";
    for (const e of t.roster)
      B.has(e.playerId) || ne(e), qe.appendChild(Be(e)), e.playerId === h && (T = e.isHost);
    Qe.style.display = T ? "inline-block" : "none", Dt.style.display = T ? "none" : "block", A();
  }
  Qe.addEventListener("click", () => {
    d.send(JSON.stringify({ type: "start-game" }));
  }), $t.addEventListener("click", () => {
    d.send(JSON.stringify({ type: "leave-game" }));
  }), Kt.addEventListener("click", () => {
    k(K.value), K.value = "";
  }), K.addEventListener("keydown", (t) => {
    t.key === "Enter" && (k(K.value), K.value = "");
  });
  function A() {
    for (const t of [Nt, Jt, Ut, Qt])
      t && t.offsetParent !== null && St(t);
  }
  Ft.addEventListener("click", () => {
    d.send(JSON.stringify({ type: "leave-game" }));
  });
  function sn() {
    tt.style.display = "flex", et.style.display = "none", M.focus();
  }
  function me() {
    tt.style.display = "none", et.style.display = "block", M.blur();
  }
  function mt() {
    k(M.value), M.value = "", me();
  }
  Vt.addEventListener("click", mt), M.addEventListener("keydown", (t) => {
    t.key === "Enter" ? (t.preventDefault(), mt()) : t.key === "Escape" && (t.preventDefault(), M.value = "", me());
  });
  const ue = {
    turnLeft: !1,
    turnRight: !1,
    throttleUp: !1,
    throttleDown: !1
  };
  function ut() {
    d && d.readyState === WebSocket.OPEN && d.send(JSON.stringify({ type: "input", ...ue }));
  }
  const pt = {
    ArrowLeft: "turnLeft",
    ArrowRight: "turnRight",
    ArrowUp: "throttleUp",
    ArrowDown: "throttleDown"
  }, ln = {
    w: "fireForward",
    s: "fireBack",
    a: "fireLeft",
    d: "fireRight"
  };
  let ht = !1;
  function bt() {
    ht || (ht = !0, ee(window, "keydown", (t) => {
      if (Wn(t.target) || oe.style.display === "none") return;
      if (t.key === "/") {
        t.preventDefault(), sn();
        return;
      }
      const e = ln[t.key.toLowerCase()];
      if (e) {
        d.readyState === WebSocket.OPEN && d.send(JSON.stringify({ type: "fire", direction: e }));
        return;
      }
      const n = pt[t.key];
      n && (t.preventDefault(), !ue[n] && (ue[n] = !0, ut()));
    }), ee(window, "keyup", (t) => {
      const e = pt[t.key];
      e && (ue[e] = !1, ut());
    }), ee(document, "visibilitychange", () => {
      d && d.readyState === WebSocket.OPEN && d.send(JSON.stringify({ type: "visibility", hidden: document.hidden }));
    }));
  }
  const Te = o("maze-canvas");
  Te.width = C, Te.height = E;
  const a = Te.getContext("2d");
  function rn() {
    return m.find((t) => t.playerId === h);
  }
  function cn(t) {
    return t ? t.transitioning ? t.transitionProgress >= 0.5 ? t.transitionToZ : t.transitionFromZ : t.z : 0;
  }
  function dn(t) {
    return t.transitioning ? [t.transitionFromZ, t.transitionToZ] : [t.z];
  }
  function mn(t, e, n, s) {
    a.strokeStyle = "#0f0", a.lineWidth = 2;
    const i = Math.max(0, Math.floor((e - C / 2) / y.cellSize)), r = Math.min(y.largeur - 1, Math.ceil((e + C / 2) / y.cellSize)), c = Math.max(0, Math.floor((n - E / 2) / y.cellSize)), v = Math.min(y.longeur - 1, Math.ceil((n + E / 2) / y.cellSize));
    for (let S = c; S <= v; S++)
      for (let H = i; H <= r; H++) {
        const V = b[t][S][H], Y = H * y.cellSize - e + C / 2, j = S * y.cellSize - n + E / 2, pe = Y + y.cellSize, he = j + y.cellSize;
        a.beginPath(), V & Z.North || (a.moveTo(Y, j), a.lineTo(pe, j)), V & Z.South || (a.moveTo(Y, he), a.lineTo(pe, he)), V & Z.West || (a.moveTo(Y, j), a.lineTo(Y, he)), V & Z.East || (a.moveTo(pe, j), a.lineTo(pe, he)), a.stroke();
        const xn = Ln(y.cellSize, H, S, V, Z);
        a.font = "bold 32px sans-serif", a.textAlign = "center", a.textBaseline = "middle";
        for (const be of xn) {
          const Sn = be.x - e + C / 2, In = be.y - n + E / 2, kn = s && s.verticalCooldown && s.verticalCooldown.direction === be.dir && s.verticalCooldown.cellX === H && s.verticalCooldown.cellY === S;
          a.globalAlpha = kn ? 0.3 : 1, a.fillStyle = "#0af", a.fillText(be.dir === "up" ? "↑" : "↓", Sn, In), a.globalAlpha = 1;
        }
      }
  }
  const yt = 6, Me = 24, un = 4, pn = 2, Pe = 10;
  function ft(t, e, n) {
    const s = Me / Pe, i = Math.round(n * Pe);
    a.strokeStyle = "#0f0", a.lineWidth = 2;
    for (let r = 0; r < Pe; r++) {
      if (r >= i) continue;
      const v = e + Me - (r + 1) * s + s / 2;
      a.beginPath(), a.moveTo(t, v), a.lineTo(t + yt, v), a.stroke();
    }
  }
  function hn(t) {
    const e = t.health ?? 100, n = Math.min(e, 100) / 100, s = Math.max(0, e - 100) / 100, i = I + un, r = -Me / 2;
    a.save(), a.rotate(Math.PI / 2), ft(i, r, n), e > 100 && ft(i + yt + pn, r, s), a.restore();
  }
  function bn(t, e) {
    a.save(), a.font = 'bold 14px Impact, "Arial Narrow", sans-serif', a.textAlign = "center", a.textBaseline = "middle", a.fillStyle = "#f00", a.strokeStyle = "#000", a.lineWidth = 3, a.strokeText("AFK", t, e - I - 10), a.fillText("AFK", t, e - I - 10), a.restore();
  }
  function yn(t, e, n) {
    a.save(), a.font = "bold 12px sans-serif", a.textAlign = "center", a.textBaseline = "middle", a.fillStyle = "#fff", a.strokeStyle = "#000", a.lineWidth = 3, a.strokeText(n, t, e + I + 12), a.fillText(n, t, e + I + 12), a.restore();
  }
  function fn(t, e, n, s) {
    const i = t.x - e + C / 2, r = t.y - n + E / 2, c = B.get(t.playerId);
    a.save(), a.globalAlpha = s, a.translate(i, r), a.rotate(t.heading), c ? a.drawImage(c.canvas, -p / 2, -p / 2, p, p) : (a.fillStyle = "#888", a.beginPath(), a.arc(0, 0, I, 0, Math.PI * 2), a.fill()), hn(t), a.restore(), a.globalAlpha = s, c && yn(i, r, c.name), t.afk && bn(i, r), a.globalAlpha = 1;
  }
  function vn(t, e, n) {
    const s = t.x - e + C / 2, i = t.y - n + E / 2;
    a.fillStyle = "#ff0", a.fillRect(s - 2, i - 2, 4, 4);
  }
  function gn() {
    const t = C / 2, e = E / 2;
    a.save(), a.beginPath(), a.rect(0, 0, C, E), a.arc(t, e, Pn, 0, Math.PI * 2, !0), a.closePath(), a.fillStyle = "#000", a.fill("evenodd"), a.restore();
  }
  const R = /* @__PURE__ */ new Map();
  function wn() {
    const t = new Set(m.filter((e) => e.dead).map((e) => e.playerId));
    new Set(m.filter((e) => !e.dead).map((e) => e.playerId));
    for (const e of m)
      if (e.dead && !R.has(e.playerId)) {
        const n = Ne.get(e.playerId);
        if (!n) continue;
        R.set(e.playerId, {
          x: n.x,
          y: n.y,
          z: n.z,
          lastPopTime: 0,
          pops: []
        });
      }
    for (const e of R.keys())
      t.has(e) || R.delete(e);
    for (const e of R.values()) {
      const n = Date.now();
      n - e.lastPopTime > 150 + Math.random() * 200 && (e.lastPopTime = n, e.pops.push({
        x: e.x + (Math.random() - 0.5) * I * 1.5,
        y: e.y + (Math.random() - 0.5) * I * 1.5,
        spawnTime: n
      }));
    }
    for (const e of m)
      e.dead || Ne.set(e.playerId, { x: e.x, y: e.y, z: e.z });
  }
  const Ne = /* @__PURE__ */ new Map();
  function Cn(t, e, n) {
    for (const s of R.values())
      if (s.z === n)
        for (const i of s.pops) {
          const r = i.x - t + C / 2, c = i.y - e + E / 2;
          a.save(), a.font = "20px sans-serif", a.textAlign = "center", a.textBaseline = "middle", a.fillText("🔥", r, c), a.restore();
        }
  }
  function En() {
    const t = [...m].sort((e, n) => n.score - e.score);
    nt.innerHTML = "";
    for (const e of t) {
      const n = B.get(e.playerId);
      if (!n) continue;
      const s = document.createElement("li"), i = document.createElement("canvas");
      i.width = p, i.height = p, i.className = "roster-sprite", i.getContext("2d").drawImage(n.canvas, 0, 0);
      const r = document.createElement("span");
      r.textContent = n.name;
      const c = document.createElement("span");
      c.className = "score-value", c.textContent = e.score, s.appendChild(i), s.appendChild(r), s.appendChild(c), nt.appendChild(s);
    }
  }
  function Ae() {
    if (!b) return;
    a.clearRect(0, 0, C, E);
    const t = rn();
    let e, n, s;
    if (t)
      e = t.x, n = t.y, s = cn(t);
    else {
      const i = h !== null ? Ne.get(h) : null;
      e = i ? i.x : 0, n = i ? i.y : 0, s = i ? i.z : 0;
    }
    mn(s, e, n, t);
    for (const i of m) {
      if (i.dead || !dn(i).includes(s)) continue;
      const c = i.transitioning ? 0.55 : 1;
      fn(i, e, n, c);
    }
    wn(), Cn(e, n, s);
    for (const i of f)
      i.z === s && vn(i, e, n);
    gn(), En();
  }
  return _e;
}
function Wn(l) {
  return l instanceof HTMLElement && (l.tagName === "INPUT" || l.tagName === "TEXTAREA" || l.isContentEditable);
}
export {
  _n as mount
};
