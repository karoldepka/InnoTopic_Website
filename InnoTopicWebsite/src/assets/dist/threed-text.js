var pe = Object.defineProperty;
var ue = (r, e, o) => e in r ? pe(r, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : r[e] = o;
var d = (r, e, o) => ue(r, typeof e != "symbol" ? e + "" : e, o);
import * as i from "three";
import { TextGeometry as G } from "three/examples/jsm/geometries/TextGeometry.js";
import { Font as Q } from "three/examples/jsm/loaders/FontLoader.js";
const re = {}, te = "droid_sans", ee = [
  {
    id: "droid_sans",
    label: "Droid Sans",
    urls: [
      "https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_regular.typeface.json"
    ]
  },
  {
    id: "inter",
    label: "Inter (Latin-ext: PL, DE, ES)",
    urls: []
  },
  {
    id: "roboto",
    label: "Roboto (Latin-ext: PL, DE, ES)",
    urls: []
  },
  {
    id: "helvetiker",
    label: "Helvetiker (sans)",
    urls: [
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/helvetiker_regular.typeface.json"
    ]
  },
  {
    id: "helvetiker_bold",
    label: "Helvetiker Bold",
    urls: [
      "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/helvetiker_bold.typeface.json"
    ]
  },
  {
    id: "optimer",
    label: "Optimer (humanist)",
    urls: [
      "https://threejs.org/examples/fonts/optimer_regular.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/optimer_regular.typeface.json"
    ]
  },
  {
    id: "optimer_bold",
    label: "Optimer Bold",
    urls: [
      "https://threejs.org/examples/fonts/optimer_bold.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/optimer_bold.typeface.json"
    ]
  },
  {
    id: "gentilis",
    label: "Gentilis (serif)",
    urls: [
      "https://threejs.org/examples/fonts/gentilis_regular.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/gentilis_regular.typeface.json"
    ]
  },
  {
    id: "gentilis_bold",
    label: "Gentilis Bold",
    urls: [
      "https://threejs.org/examples/fonts/gentilis_bold.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/gentilis_bold.typeface.json"
    ]
  },
  {
    id: "droid_sans_bold",
    label: "Droid Sans Bold",
    urls: [
      "https://threejs.org/examples/fonts/droid/droid_sans_bold.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_bold.typeface.json"
    ]
  },
  {
    id: "droid_serif",
    label: "Droid Serif",
    urls: [
      "https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_regular.typeface.json"
    ]
  },
  {
    id: "droid_serif_bold",
    label: "Droid Serif Bold",
    urls: [
      "https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_bold.typeface.json"
    ]
  }
], fe = {
  size: 2,
  height: 0.8,
  curveSegments: 48,
  bevelEnabled: !0,
  bevelThickness: 0.15,
  bevelSize: 0.08,
  bevelOffset: 0,
  bevelSegments: 5,
  metalness: 0.95,
  roughness: 0.15,
  envMapIntensity: 1.5,
  equalizeLineWidths: !1,
  equalizationMethod: "fontSize",
  targetWidth: 20,
  lineSpacing: 1
};
function le(r) {
  r.onBeforeCompile = (e) => {
    e.fragmentShader = e.fragmentShader.replace(
      "#include <normal_fragment_begin>",
      `#include <normal_fragment_begin>
      if (normal.z < 0.0) normal = normalize(vec3(normal.xy, 1e-4));`
    );
  }, r.customProgramCacheKey = () => "text-bevel-normal-clamp";
}
const P = /* @__PURE__ */ new Map();
function ce(r) {
  const e = [], o = /<b>(.*?)<\/b>/gi;
  let n = 0, t;
  for (; (t = o.exec(r)) !== null; )
    t.index > n && e.push({ text: r.slice(n, t.index), bold: !1 }), t[1] && e.push({ text: t[1], bold: !0 }), n = o.lastIndex;
  return n < r.length && e.push({ text: r.slice(n), bold: !1 }), e.filter((a) => a.text.length > 0);
}
function me(r) {
  return r.replace(/<\/?b>/gi, "");
}
const ge = {
  droid_sans: "droid_sans_bold",
  helvetiker: "helvetiker_bold",
  optimer: "optimer_bold",
  gentilis: "gentilis_bold",
  droid_serif: "droid_serif_bold"
};
function _e(r) {
  return ge[r] ?? r;
}
async function he(r = te) {
  if (P.has(r)) return P.get(r);
  const e = ee.find((n) => n.id === r) ?? ee[0];
  if (e.id === "roboto") {
    const n = new Q(re);
    return P.set(e.id, n), r !== e.id && P.set(r, n), n;
  }
  if (e.id === "inter") {
    const n = new Q(re);
    return P.set(e.id, n), r !== e.id && P.set(r, n), n;
  }
  const o = e.urls;
  return new Promise((n, t) => {
    const a = async (l) => {
      if (l >= o.length) {
        t(new Error(`All URLs failed for font "${r}"`));
        return;
      }
      try {
        const s = await fetch(o[l]);
        if (!s.ok) throw new Error(`HTTP ${s.status}`);
        const u = await s.json(), b = new Q(u);
        P.set(r, b), n(b);
      } catch (s) {
        console.error(`Font "${r}" failed from ${o[l]}:`, s), a(l + 1);
      }
    };
    a(0);
  });
}
async function be(r) {
  var a, l, s, u, b, T, D, se, ne, oe;
  const e = { ...fe, ...Object.fromEntries(Object.entries(r).filter(([k, E]) => E !== void 0)) }, o = e.text.split(`
`), n = o.some((k) => /<b>/i.test(k)), t = o.map(me);
  try {
    const k = e.fontFamily ?? te, E = _e(k), [v, U] = await Promise.all([
      he(k),
      n && E !== k ? he(E).catch(() => null) : Promise.resolve(null)
    ]), O = U ?? v, z = [], X = t.map(() => 1);
    for (let c = 0; c < t.length; c++) {
      const m = t[c];
      if (!m.trim()) {
        z.push(0);
        continue;
      }
      const g = o[c];
      if (/<b>/i.test(g)) {
        const p = ce(g);
        let x = 0;
        for (const _ of p) {
          const C = _.bold ? O : v, y = new G(_.text, {
            font: C,
            size: e.size,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          });
          y.computeBoundingBox(), x += (((a = y.boundingBox) == null ? void 0 : a.max.x) ?? 0) - (((l = y.boundingBox) == null ? void 0 : l.min.x) ?? 0), y.dispose();
        }
        z.push(x);
      } else {
        const p = new G(m, {
          font: v,
          size: e.size,
          depth: e.height,
          curveSegments: e.curveSegments,
          bevelEnabled: e.bevelEnabled,
          bevelThickness: e.bevelThickness,
          bevelSize: e.bevelSize,
          bevelOffset: e.bevelOffset,
          bevelSegments: e.bevelSegments
        });
        p.computeBoundingBox();
        const x = (((s = p.boundingBox) == null ? void 0 : s.max.x) ?? 0) - (((u = p.boundingBox) == null ? void 0 : u.min.x) ?? 0);
        z.push(x), p.dispose();
      }
    }
    if (e.equalizeLineWidths)
      for (let c = 0; c < z.length; c++) {
        const m = z[c] || 1;
        X[c] = e.targetWidth / m;
      }
    const j = new i.Group(), h = [];
    for (let c = 0; c < t.length; c++) {
      const m = t[c], g = X[c];
      if (e.equalizationMethod === "fontSize" || !e.equalizeLineWidths) {
        if (!m.trim()) {
          const A = new i.Group(), S = e.size * g;
          h.push({ geometry: A, minY: 0, maxY: S * 0.8 });
          continue;
        }
        if (/<b>/i.test(o[c])) {
          const A = ce(o[c]), S = e.size * g, Z = {
            size: S,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize * g,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          }, Y = [];
          let F = 0;
          for (const I of A) {
            const J = I.bold ? O : v, q = new G(I.text, { font: J, ...Z });
            q.computeBoundingBox();
            const L = q.boundingBox, V = L.max.x - L.min.x;
            Y.push({ geo: q, width: V, minY: L.min.y, maxY: L.max.y, startX: L.min.x }), F += V;
          }
          let ie = -F / 2, N = ((b = Y[0]) == null ? void 0 : b.minY) ?? 0, K = ((T = Y[0]) == null ? void 0 : T.maxY) ?? S;
          const ae = new i.Group();
          for (const { geo: I, width: J, minY: q, maxY: L, startX: V } of Y)
            I.translate(ie - V, 0, 0), ae.add(new i.Mesh(I)), ie += J, N = Math.min(N, q), K = Math.max(K, L);
          h.push({ geometry: ae, minY: N, maxY: K });
          continue;
        }
        const p = new G(m, {
          font: v,
          size: e.size * g,
          depth: e.height,
          curveSegments: e.curveSegments,
          bevelEnabled: e.bevelEnabled,
          bevelThickness: e.bevelThickness,
          bevelSize: e.bevelSize * g,
          bevelOffset: e.bevelOffset,
          bevelSegments: e.bevelSegments
        });
        p.computeBoundingBox();
        const x = ((D = p.boundingBox) == null ? void 0 : D.min.x) ?? 0, _ = ((se = p.boundingBox) == null ? void 0 : se.max.x) ?? 0, C = _ - x, y = (x + _) / 2, H = ((ne = p.boundingBox) == null ? void 0 : ne.min.y) ?? 0, B = ((oe = p.boundingBox) == null ? void 0 : oe.max.y) ?? e.size;
        p.translate(-y, 0, 0), h.push({ geometry: p, minY: H, maxY: B });
      } else {
        if (!m.trim()) {
          const B = new i.Group();
          h.push({ geometry: B, minY: 0, maxY: e.size * 0.8 });
          continue;
        }
        const p = z[c], x = (e.targetWidth - p) / Math.max(1, m.length - 1), _ = new i.Group();
        let C = 0;
        for (let B = 0; B < m.length; B++) {
          const A = m[B];
          if (A === " ") {
            const F = new G(" ", {
              font: v,
              size: e.size
            });
            F.computeBoundingBox(), C += F.boundingBox.max.x - F.boundingBox.min.x + x, F.dispose();
            continue;
          }
          const S = new G(A, {
            font: v,
            size: e.size,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          });
          S.computeBoundingBox();
          const Z = S.boundingBox.max.x - S.boundingBox.min.x;
          S.translate(C, 0, 0);
          const Y = new i.Mesh(S);
          _.add(Y), C += Z + x;
        }
        const y = _.children.length > 0 ? new i.Box3().setFromObject(_) : new i.Box3(new i.Vector3(0, 0, 0), new i.Vector3(0, e.size, 0)), H = (y.max.x + y.min.x) / 2;
        _.position.x = -H, h.push({ geometry: _, minY: y.min.y, maxY: y.max.y });
      }
    }
    const f = new Array(h.length).fill(0);
    for (let c = 1; c < h.length; c++)
      f[c] = f[c - 1] + h[c - 1].minY - e.lineSpacing - h[c].maxY;
    const w = h.length > 0 ? f[0] + h[0].maxY : 0, M = h.length > 0 ? f[h.length - 1] + h[h.length - 1].minY : 0, R = (w + M) / 2;
    for (let c = 0; c < h.length; c++) {
      const m = f[c] - R, { geometry: g } = h[c];
      if (g instanceof i.Group)
        g.position.y = m, j.add(g);
      else {
        g.translate(0, m, 0);
        const p = new i.Mesh(g);
        j.add(p);
      }
    }
    const $ = e.color || new i.Color().setHSL(Math.random(), 0.8, 0.5), W = new i.MeshStandardMaterial({
      color: $,
      metalness: e.metalness,
      roughness: e.roughness,
      envMap: e.envMap || void 0,
      envMapIntensity: e.envMapIntensity
    });
    return le(W), { geometry: j, material: W };
  } catch (k) {
    console.error("Failed to load font, creating fallback geometry:", k);
    const E = new i.Group(), v = e.size * 0.8, U = e.size + e.lineSpacing, O = [], z = t.map(() => 1);
    for (const h of t) {
      let f = 0;
      for (let w = 0; w < h.length; w++)
        h[w] !== " " ? f += v : f += v * 0.5;
      O.push(f);
    }
    if (e.equalizeLineWidths) {
      const h = e.targetWidth;
      for (let f = 0; f < O.length; f++) {
        const w = O[f] || 1, M = h / w;
        z[f] = M;
      }
    }
    for (let h = 0; h < t.length; h++) {
      const f = t[h], w = z[h], M = new i.Group();
      let R = 0;
      const $ = e.equalizationMethod === "spacing" ? v * w : v, W = e.equalizationMethod === "fontSize" ? e.size * w : e.size;
      for (let p = 0; p < f.length; p++) {
        if (f[p] === " ") {
          R += $ * 0.5;
          continue;
        }
        const _ = new i.BoxGeometry(
          W * 0.6,
          W,
          e.height
        ), C = new i.Mesh(_);
        C.position.x = R, M.add(C), R += $;
      }
      const m = new i.Box3().setFromObject(M).getCenter(new i.Vector3());
      M.position.x = -m.x;
      const g = (t.length - 1) * U / 2 - h * U;
      M.position.y = g, E.add(M);
    }
    const X = e.color || new i.Color().setHSL(Math.random(), 0.8, 0.5), j = new i.MeshStandardMaterial({
      color: X,
      metalness: e.metalness,
      roughness: e.roughness,
      envMap: e.envMap || void 0,
      envMapIntensity: e.envMapIntensity
    });
    return le(j), { geometry: E, material: j };
  }
}
const ve = (
  /* glsl */
  `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
), xe = 4;
function de(r, e) {
  return [
    new i.Vector4(0, 0, 0, 0),
    new i.Vector4(0.33, r.r * 0.35, r.g * 0.35, r.b * 0.35),
    new i.Vector4(0.66, r.r, r.g, r.b),
    new i.Vector4(1, e.r, e.g, e.b),
    new i.Vector4(0, 0, 0, 0)
    // padding
  ];
}
const ye = (
  /* glsl */
  `
uniform float uTime;
uniform float uZoom;
uniform vec4  uStop0, uStop1, uStop2, uStop3, uStop4;
uniform int   uStopCount;
varying vec2  vUv;

vec3 palette(float t) {
  vec4 stops[5];
  stops[0]=uStop0; stops[1]=uStop1; stops[2]=uStop2; stops[3]=uStop3; stops[4]=uStop4;
  t=clamp(t,0.0,1.0);
  vec3 lo=stops[0].yzw, hi=stops[uStopCount-1].yzw;
  for(int i=0;i<4;i++){
    if(i>=uStopCount-1) break;
    float ta=stops[i].x, tb=stops[i+1].x;
    if(t>=ta && t<=tb){
      float f=(tb-ta)<0.0001?0.0:(t-ta)/(tb-ta);
      lo=stops[i].yzw; hi=stops[i+1].yzw;
      return mix(lo,hi,f);
    }
  }
  return mix(lo,hi,t);
}

void main() {
  float s = uZoom;
  float v  = sin(vUv.x*s + uTime*1.4);
        v += sin(vUv.y*s*0.9 + uTime*1.1);
        v += sin((vUv.x+vUv.y)*s*0.65 + uTime*0.75);
        v += sin(sqrt(pow(vUv.x-0.5,2.0)+pow(vUv.y-0.5,2.0))*s*2.5 - uTime*1.2);
  float t = (sin(v*1.5)+1.0)*0.5;
  gl_FragColor = vec4(palette(t), 1.0);
}
`
), we = {
  text: `Hello
World`,
  color: "#ff6600",
  font: te,
  size: 2,
  depth: 0.8,
  metalness: 0.95,
  roughness: 0.15,
  envIntensity: 1.5
}, Se = new i.Plane(new i.Vector3(0, 0, 1), 0), ze = `
  :host {
    --primary-color: #ff6600;
    --secondary-color: #0066ff;
    display: inline-block;
    position: relative;
    width: 400px;
    height: 400px;
    background: #1a1a1a;
    border-radius: 5px;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  /* ── Config button ── */
  .cfg-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 6px;
    padding: 6px 13px;
    cursor: pointer;
    font-size: 13px;
    backdrop-filter: blur(6px);
    z-index: 10;
    transition: background 0.15s;
    user-select: none;
  }
  .cfg-btn:hover { background: var(--primary-color, #ff6600); opacity: 0.9; }

  /* ── Config panel ── */
  .cfg-panel {
    position: absolute;
    top: 0; right: 0;
    width: 270px;
    height: 100%;
    background: rgba(14,14,14,0.93);
    backdrop-filter: blur(10px);
    border-left: 1px solid rgba(255,255,255,0.09);
    padding: 14px 14px 20px;
    box-sizing: border-box;
    overflow-y: auto;
    z-index: 20;
    transform: translateX(100%);
    transition: transform 0.22s ease;
    color: #e0e0e0;
    font-size: 13px;
  }
  .cfg-panel.open { transform: translateX(0); }

  .cfg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .cfg-title { margin: 0; font-size: 14px; color: var(--primary-color, #ff6600); font-weight: 600; }
  .cfg-close {
    background: none; border: none;
    color: #aaa; font-size: 18px;
    cursor: pointer; padding: 0; line-height: 1;
  }
  .cfg-close:hover { color: #fff; }

  /* ── Form controls ── */
  .field { margin-bottom: 13px; }
  .field-label {
    display: block;
    margin-bottom: 4px;
    color: #999;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  textarea, select, input[type="color"] {
    width: 100%;
    box-sizing: border-box;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px;
    color: #e0e0e0;
    padding: 6px 8px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }
  textarea:focus, select:focus { border-color: var(--primary-color, #ff6600); }
  textarea { resize: vertical; min-height: 72px; }
  select option { background: #1a1a1a; }

  input[type="color"] {
    height: 34px;
    padding: 2px 4px;
    cursor: pointer;
  }

  .range-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  input[type="range"] {
    flex: 1;
    accent-color: var(--primary-color, #ff6600);
    cursor: pointer;
  }
  .range-val {
    min-width: 36px;
    text-align: right;
    font-size: 12px;
    color: #aaa;
    font-variant-numeric: tabular-nums;
  }
`;
function Me(r, e) {
  const o = e.filter((n) => n.urls.length > 0).map((n) => `<option value="${n.id}"${n.id === r.font ? " selected" : ""}>${n.label}</option>`).join("");
  return `
    <canvas></canvas>
    <button class="cfg-btn" type="button">⚙ Configure</button>
    <div class="cfg-panel">
      <div class="cfg-header">
        <h3 class="cfg-title">3D Text Config</h3>
        <button class="cfg-close" type="button" title="Close">✕</button>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-text">Text</label>
        <textarea id="cfg-text" rows="3">${r.text.replace(/\n/g, "&#10;")}</textarea>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-font">Font</label>
        <select id="cfg-font">${o}</select>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-color">Color</label>
        <input type="color" id="cfg-color" value="${r.color}">
      </div>

      <div class="field">
        <label class="field-label">Depth</label>
        <div class="range-row">
          <input type="range" id="cfg-depth" min="0.05" max="3" step="0.05" value="${r.depth}">
          <span class="range-val" id="cfg-depth-v">${r.depth.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Metalness</label>
        <div class="range-row">
          <input type="range" id="cfg-metalness" min="0" max="1" step="0.01" value="${r.metalness}">
          <span class="range-val" id="cfg-metalness-v">${r.metalness.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Roughness</label>
        <div class="range-row">
          <input type="range" id="cfg-roughness" min="0" max="1" step="0.01" value="${r.roughness}">
          <span class="range-val" id="cfg-roughness-v">${r.roughness.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Env-map intensity</label>
        <div class="range-row">
          <input type="range" id="cfg-env" min="0" max="4" step="0.05" value="${r.envIntensity}">
          <span class="range-val" id="cfg-env-v">${r.envIntensity.toFixed(2)}</span>
        </div>
      </div>

    </div>
  `;
}
class Ce extends HTMLElement {
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  constructor() {
    super();
    d(this, "_cfg", { ...we });
    d(this, "_shadow");
    d(this, "_canvas");
    d(this, "_renderer", null);
    d(this, "_scene", null);
    d(this, "_camera", null);
    d(this, "_mesh", null);
    d(this, "_envMap", null);
    d(this, "_animId", null);
    d(this, "_resizeOb", null);
    d(this, "_updateId", 0);
    d(this, "_debounceTimer", null);
    d(this, "_rotation", { x: 0, y: 0 });
    d(this, "_drag", !1);
    d(this, "_lastMouse", { x: 0, y: 0 });
    d(this, "_startTime", performance.now());
    d(this, "_scrollZoom", !1);
    d(this, "_autoSize", !0);
    d(this, "_textBoundingSize", null);
    d(this, "_styleObserver", null);
    d(this, "_primaryColor", new i.Color("#ff6600"));
    d(this, "_secondaryColor", new i.Color("#0066ff"));
    // Plasma env-map
    d(this, "_plasmaRt", null);
    d(this, "_plasmaMat", null);
    d(this, "_plasmaScene", null);
    d(this, "_plasmaCamera", null);
    this._shadow = this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["text", "color", "font", "size", "depth", "metalness", "roughness", "env-intensity", "show-config", "scroll-zoom", "primary-color", "secondary-color", "auto-size"];
  }
  connectedCallback() {
    this._buildDOM(), this._initScene();
  }
  disconnectedCallback() {
    this._dispose();
  }
  attributeChangedCallback(o, n, t) {
    var a, l;
    if (t !== null) {
      switch (o) {
        case "text":
          this._cfg.text = t.replace(/\\n/g, `
`);
          break;
        case "color":
          this._cfg.color = t;
          break;
        case "font":
          this._cfg.font = t;
          break;
        case "size":
          this._cfg.size = parseFloat(t);
          break;
        case "depth":
          this._cfg.depth = parseFloat(t);
          break;
        case "metalness":
          this._cfg.metalness = parseFloat(t);
          break;
        case "roughness":
          this._cfg.roughness = parseFloat(t);
          break;
        case "env-intensity":
          this._cfg.envIntensity = parseFloat(t);
          break;
        case "scroll-zoom":
          this._scrollZoom = t !== "false";
          return;
        case "auto-size":
          this._autoSize = t !== "false", this._autoSize && this._textBoundingSize && (this._applyAutoSize(), this._fitCameraToTextSize(this._textBoundingSize));
          return;
        case "primary-color":
          this.style.setProperty("--primary-color", t), this._primaryColor.set(t), this._updatePlasmaColors(), this.hasAttribute("color") || (this._cfg.color = t, this._scheduleUpdate());
          return;
        case "secondary-color":
          this.style.setProperty("--secondary-color", t), this._secondaryColor.set(t), this._updatePlasmaColors();
          return;
        case "show-config":
          (l = (a = this._shadow) == null ? void 0 : a.querySelector(".cfg-panel")) == null || l.classList.toggle("open", t !== "false");
          return;
      }
      this._scheduleUpdate();
    }
  }
  // ── Public property ────────────────────────────────────────────────────────
  get config() {
    return { ...this._cfg };
  }
  set config(o) {
    Object.assign(this._cfg, o), this._scheduleUpdate();
  }
  // ── DOM build ─────────────────────────────────────────────────────────────
  _buildDOM() {
    const o = document.createElement("style");
    o.textContent = ze;
    const n = document.createElement("div");
    for (n.innerHTML = Me(this._cfg, ee), this._shadow.appendChild(o); n.firstChild; ) this._shadow.appendChild(n.firstChild);
    this._canvas = this._shadow.querySelector("canvas");
    const t = this._shadow.querySelector(".cfg-panel");
    this.hasAttribute("show-config") && this.getAttribute("show-config") !== "false" && t.classList.add("open"), this._shadow.querySelector(".cfg-btn").addEventListener(
      "click",
      () => t.classList.toggle("open")
    ), this._shadow.querySelector(".cfg-close").addEventListener(
      "click",
      () => t.classList.remove("open")
    ), this._bindControl("#cfg-text", "input", (s) => {
      this._cfg.text = s;
    }), this._bindControl("#cfg-font", "change", (s) => {
      this._cfg.font = s;
    }), this._bindControl("#cfg-color", "input", (s) => {
      this._cfg.color = s;
    }), this._bindRange("#cfg-depth", "#cfg-depth-v", (s) => {
      this._cfg.depth = s;
    }), this._bindRange("#cfg-metalness", "#cfg-metalness-v", (s) => {
      this._cfg.metalness = s;
    }), this._bindRange("#cfg-roughness", "#cfg-roughness-v", (s) => {
      this._cfg.roughness = s;
    }), this._bindRange("#cfg-env", "#cfg-env-v", (s) => {
      this._cfg.envIntensity = s;
    }), this._styleObserver = new MutationObserver(() => this._onFontSizeChange()), this._styleObserver.observe(this, { attributes: !0, attributeFilter: ["style", "class"] }), this._canvas.addEventListener("mousedown", (s) => {
      this._drag = !0, this._lastMouse = { x: s.clientX, y: s.clientY };
    }), window.addEventListener("mousemove", (s) => {
      this._drag && (this._rotation.y += (s.clientX - this._lastMouse.x) * 0.01, this._rotation.x += (s.clientY - this._lastMouse.y) * 0.01, this._lastMouse = { x: s.clientX, y: s.clientY });
    }), window.addEventListener("mouseup", () => {
      this._drag = !1;
    }), this._canvas.addEventListener("wheel", (s) => {
      const u = s.ctrlKey;
      if (!this._scrollZoom && !u || (s.preventDefault(), !this._camera)) return;
      const b = Math.pow(1.001, s.deltaY * (s.deltaMode === 1 ? 40 : s.deltaMode === 2 ? 800 : 1));
      this._zoomCameraAtClientPoint(s.clientX, s.clientY, b);
    }, { passive: !1 });
    let l = 0;
    this._canvas.addEventListener("touchstart", (s) => {
      s.touches.length === 2 && (l = Math.hypot(
        s.touches[0].clientX - s.touches[1].clientX,
        s.touches[0].clientY - s.touches[1].clientY
      ));
    }, { passive: !0 }), this._canvas.addEventListener("touchmove", (s) => {
      if (s.touches.length !== 2 || !this._camera) return;
      s.preventDefault();
      const u = Math.hypot(
        s.touches[0].clientX - s.touches[1].clientX,
        s.touches[0].clientY - s.touches[1].clientY
      );
      if (l > 0) {
        const b = l / u;
        this._zoomCameraAtClientPoint(
          (s.touches[0].clientX + s.touches[1].clientX) / 2,
          (s.touches[0].clientY + s.touches[1].clientY) / 2,
          b
        );
      }
      l = u;
    }, { passive: !1 }), this._canvas.addEventListener("touchend", () => {
      l = 0;
    }, { passive: !0 });
  }
  _zoomCameraAtClientPoint(o, n, t) {
    if (!this._camera) return;
    const a = this._worldPointAtClientPoint(o, n), l = Math.max(2, Math.min(80, this._camera.position.z * t));
    if (l === this._camera.position.z) return;
    this._camera.position.z = l;
    const s = this._worldPointAtClientPoint(o, n);
    !a || !s || (this._camera.position.x += a.x - s.x, this._camera.position.y += a.y - s.y, this._camera.updateMatrixWorld(!0));
  }
  _worldPointAtClientPoint(o, n) {
    if (!this._camera || !this._canvas) return null;
    const t = this._canvas.getBoundingClientRect();
    if (t.width <= 0 || t.height <= 0) return null;
    const a = new i.Vector2(
      (o - t.left) / t.width * 2 - 1,
      -((n - t.top) / t.height) * 2 + 1
    ), l = new i.Raycaster(), s = new i.Vector3();
    return this._camera.updateMatrixWorld(!0), l.setFromCamera(a, this._camera), l.ray.intersectPlane(Se, s);
  }
  // ── Control wiring ────────────────────────────────────────────────────────
  _bindControl(o, n, t) {
    const a = this._shadow.querySelector(o);
    a && a.addEventListener(n, () => {
      t(a.value), this._scheduleUpdate(), this._dispatchChange();
    });
  }
  _bindRange(o, n, t) {
    const a = this._shadow.querySelector(o), l = this._shadow.querySelector(n);
    a && a.addEventListener("input", () => {
      const s = parseFloat(a.value);
      t(s), l && (l.textContent = s.toFixed(a.step.includes(".0") ? 1 : 2)), this._scheduleUpdate(), this._dispatchChange();
    });
  }
  _updatePlasmaColors() {
    if (!this._plasmaMat) return;
    const o = de(this._primaryColor, this._secondaryColor), n = this._plasmaMat.uniforms;
    n.uStop0.value = o[0], n.uStop1.value = o[1], n.uStop2.value = o[2], n.uStop3.value = o[3], n.uStop4.value = o[4];
  }
  _scheduleUpdate() {
    this._debounceTimer && clearTimeout(this._debounceTimer), this._debounceTimer = setTimeout(() => this._updateMesh(), 60);
  }
  _dispatchChange() {
    this.dispatchEvent(new CustomEvent("config-change", {
      detail: { ...this._cfg },
      bubbles: !0,
      composed: !0
    }));
  }
  // ── Three.js scene ────────────────────────────────────────────────────────
  _initScene() {
    const o = this._canvas, n = new i.WebGLRenderer({ canvas: o, antialias: !0 });
    n.toneMapping = i.ACESFilmicToneMapping, n.toneMappingExposure = 1, this._renderer = n;
    const t = new i.Scene();
    t.background = new i.Color(1710618), this._scene = t;
    const a = new i.PerspectiveCamera(75, 1, 0.1, 1e4);
    a.position.z = 15, this._camera = a, t.add(new i.AmbientLight(16777215, 0.5));
    const l = new i.DirectionalLight(16777215, 1);
    l.position.set(10, 10, 10), t.add(l);
    const s = new i.PointLight(16711935, 1);
    s.position.set(-8, 5, 8), t.add(s);
    const u = new i.PointLight(65535, 0.8);
    u.position.set(8, -5, 8), t.add(u), this._envMap = this._setupPlasmaEnvMap(), this._envMap && (t.environment = this._envMap), this._resizeOb = new ResizeObserver(() => this._resize()), this._resizeOb.observe(this), this._resize(), this._updateMesh(), this._loop();
  }
  _resize() {
    var t, a;
    const o = this.offsetWidth || 800, n = this.offsetHeight || 400;
    (t = this._renderer) == null || t.setSize(o, n, !1), (a = this._renderer) == null || a.setPixelRatio(window.devicePixelRatio), this._camera && (this._camera.aspect = o / n, this._camera.updateProjectionMatrix());
  }
  _applyAutoSize() {
    if (!this._textBoundingSize || !this._autoSize) return;
    const o = parseFloat(getComputedStyle(this).fontSize) || 16, n = this._textBoundingSize.x / Math.max(this._textBoundingSize.y, 1e-3), t = Math.max(Math.round(o * 1.25), 80), a = Math.round(t * n);
    Math.abs(this.offsetHeight - t) > 1 && (this.style.height = `${t}px`), Math.abs(this.offsetWidth - a) > 1 && (this.style.width = `${a}px`);
  }
  _onFontSizeChange() {
    if (!(!this._autoSize || !this._textBoundingSize)) {
      if (this._applyAutoSize(), this._camera) {
        const o = this.offsetWidth || 800, n = this.offsetHeight || 400;
        this._camera.aspect = o / n, this._camera.updateProjectionMatrix();
      }
      this._textBoundingSize && this._fitCameraToTextSize(this._textBoundingSize);
    }
  }
  _fitCameraToTextSize(o) {
    if (!this._camera) return;
    const n = this._camera.fov * Math.PI / 180, t = Math.tan(n / 2), a = this._camera.aspect, l = o.y / 2 / t, s = o.x / 2 / (t * a), u = Math.max(l, s) * 1.25 + o.z / 2;
    this._camera.position.set(0, 0, Math.max(u, 2)), this._camera.lookAt(0, 0, 0), this._camera.updateMatrixWorld(!0);
  }
  async _updateMesh() {
    if (!this._scene || !this._envMap) return;
    const o = ++this._updateId;
    try {
      const { geometry: n, material: t } = await be({
        text: this._cfg.text,
        fontFamily: this._cfg.font,
        size: this._cfg.size,
        height: this._cfg.depth,
        color: new i.Color(this._cfg.color),
        metalness: this._cfg.metalness,
        roughness: this._cfg.roughness,
        envMap: this._envMap,
        envMapIntensity: this._cfg.envIntensity
      });
      if (o !== this._updateId)
        return;
      this._removeMesh();
      const a = new i.Group();
      let l;
      n instanceof i.Group ? (l = n, l.traverse((T) => {
        T instanceof i.Mesh && (T.material = t, T.castShadow = !0);
      })) : (l = new i.Mesh(n, t), l.castShadow = !0), a.add(l), this._scene.add(a), this._mesh = a;
      const s = new i.Box3().setFromObject(a), u = s.getCenter(new i.Vector3());
      l.position.sub(u);
      const b = s.getSize(new i.Vector3());
      if (this._textBoundingSize = b, this._autoSize && (this._applyAutoSize(), this._camera)) {
        const T = this.offsetWidth || 800, D = this.offsetHeight || 400;
        this._camera.aspect = T / D, this._camera.updateProjectionMatrix();
      }
      this._fitCameraToTextSize(b);
    } catch (n) {
      console.error("[threed-text-wc] mesh update failed:", n);
    }
  }
  _removeMesh() {
    !this._mesh || !this._scene || (this._scene.remove(this._mesh), this._mesh.traverse((o) => {
      var n;
      o instanceof i.Mesh && ((n = o.geometry) == null || n.dispose(), (Array.isArray(o.material) ? o.material : [o.material]).forEach((a) => a == null ? void 0 : a.dispose()));
    }), this._mesh = null);
  }
  _loop() {
    this._animId = requestAnimationFrame(() => this._loop());
    const o = (performance.now() - this._startTime) / 1e3;
    this._updatePlasma(o), this._mesh && (this._mesh.rotation.x = this._rotation.x, this._mesh.rotation.y = this._rotation.y), this._renderer && this._scene && this._camera && this._renderer.render(this._scene, this._camera);
  }
  // ── Animated plasma env-map ────────────────────────────────────────────────
  _setupPlasmaEnvMap() {
    const n = new i.WebGLRenderTarget(256, 256, {
      minFilter: i.LinearFilter,
      magFilter: i.LinearFilter
    }), t = de(this._primaryColor, this._secondaryColor), a = new i.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uZoom: { value: 8 },
        uStop0: { value: t[0] },
        uStop1: { value: t[1] },
        uStop2: { value: t[2] },
        uStop3: { value: t[3] },
        uStop4: { value: t[4] },
        uStopCount: { value: xe }
      },
      vertexShader: ve,
      fragmentShader: ye
    }), l = new i.Scene();
    l.add(new i.Mesh(new i.PlaneGeometry(2, 2), a));
    const s = new i.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._plasmaRt = n, this._plasmaMat = a, this._plasmaScene = l, this._plasmaCamera = s;
    const u = n.texture;
    return u.mapping = i.EquirectangularReflectionMapping, u;
  }
  _updatePlasma(o) {
    const { _plasmaRt: n, _plasmaMat: t, _plasmaScene: a, _plasmaCamera: l, _renderer: s } = this;
    if (!n || !t || !a || !l || !s) return;
    t.uniforms.uTime.value = o;
    const u = s.getRenderTarget();
    s.setRenderTarget(n), s.render(a, l), s.setRenderTarget(u);
  }
  _dispose() {
    var o, n, t, a, l;
    this._animId !== null && cancelAnimationFrame(this._animId), (o = this._resizeOb) == null || o.disconnect(), (n = this._styleObserver) == null || n.disconnect(), this._removeMesh(), (t = this._plasmaRt) == null || t.dispose(), (a = this._plasmaMat) == null || a.dispose(), (l = this._renderer) == null || l.dispose();
  }
}
customElements.get("threed-text") || customElements.define("threed-text", Ce);
export {
  Ce as ThreedTextElement
};
//# sourceMappingURL=threed-text.js.map
