var pe = Object.defineProperty;
var ue = (i, e, o) => e in i ? pe(i, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : i[e] = o;
var p = (i, e, o) => ue(i, typeof e != "symbol" ? e + "" : e, o);
import * as a from "three";
import { TextGeometry as R } from "three/examples/jsm/geometries/TextGeometry.js";
import { Font as J } from "three/examples/jsm/loaders/FontLoader.js";
console.log("threed text")
const re = {}, ee = "droid_sans", Q = [
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
], me = {
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
function le(i) {
  i.onBeforeCompile = (e) => {
    e.fragmentShader = e.fragmentShader.replace(
      "#include <normal_fragment_begin>",
      `#include <normal_fragment_begin>
      if (normal.z < 0.0) normal = normalize(vec3(normal.xy, 1e-4));`
    );
  }, i.customProgramCacheKey = () => "text-bevel-normal-clamp";
}
const B = /* @__PURE__ */ new Map();
function ce(i) {
  const e = [], o = /<b>(.*?)<\/b>/gi;
  let s = 0, t;
  for (; (t = o.exec(i)) !== null; )
    t.index > s && e.push({ text: i.slice(s, t.index), bold: !1 }), t[1] && e.push({ text: t[1], bold: !0 }), s = o.lastIndex;
  return s < i.length && e.push({ text: i.slice(s), bold: !1 }), e.filter((r) => r.text.length > 0);
}
function fe(i) {
  return i.replace(/<\/?b>/gi, "");
}
const ge = {
  droid_sans: "droid_sans_bold",
  helvetiker: "helvetiker_bold",
  optimer: "optimer_bold",
  gentilis: "gentilis_bold",
  droid_serif: "droid_serif_bold"
};
function be(i) {
  return ge[i] ?? i;
}
async function de(i = ee) {
  if (B.has(i)) return B.get(i);
  const e = Q.find((s) => s.id === i) ?? Q[0];
  if (e.id === "roboto") {
    const s = new J(re);
    return B.set(e.id, s), i !== e.id && B.set(i, s), s;
  }
  if (e.id === "inter") {
    const s = new J(re);
    return B.set(e.id, s), i !== e.id && B.set(i, s), s;
  }
  const o = e.urls;
  return new Promise((s, t) => {
    const r = async (l) => {
      if (l >= o.length) {
        t(new Error(`All URLs failed for font "${i}"`));
        return;
      }
      try {
        const h = await fetch(o[l]);
        if (!h.ok) throw new Error(`HTTP ${h.status}`);
        const n = await h.json(), y = new J(n);
        B.set(i, y), s(y);
      } catch (h) {
        console.error(`Font "${i}" failed from ${o[l]}:`, h), r(l + 1);
      }
    };
    r(0);
  });
}
async function ve(i) {
  var r, l, h, n, y, j, te, se, oe, ne;
  const e = { ...me, ...Object.fromEntries(Object.entries(i).filter(([C, E]) => E !== void 0)) }, o = e.text.split(`
`), s = o.some((C) => /<b>/i.test(C)), t = o.map(fe);
  try {
    const C = e.fontFamily ?? ee, E = be(C), [v, U] = await Promise.all([
      de(C),
      s && E !== C ? de(E).catch(() => null) : Promise.resolve(null)
    ]), O = U ?? v, z = [], W = t.map(() => 1);
    for (let c = 0; c < t.length; c++) {
      const f = t[c];
      if (!f.trim()) {
        z.push(0);
        continue;
      }
      const g = o[c];
      if (/<b>/i.test(g)) {
        const u = ce(g);
        let _ = 0;
        for (const b of u) {
          const k = b.bold ? O : v, x = new R(b.text, {
            font: k,
            size: e.size,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          });
          x.computeBoundingBox(), _ += (((r = x.boundingBox) == null ? void 0 : r.max.x) ?? 0) - (((l = x.boundingBox) == null ? void 0 : l.min.x) ?? 0), x.dispose();
        }
        z.push(_);
      } else {
        const u = new R(f, {
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
        u.computeBoundingBox();
        const _ = (((h = u.boundingBox) == null ? void 0 : h.max.x) ?? 0) - (((n = u.boundingBox) == null ? void 0 : n.min.x) ?? 0);
        z.push(_), u.dispose();
      }
    }
    if (e.equalizeLineWidths)
      for (let c = 0; c < z.length; c++) {
        const f = z[c] || 1;
        W[c] = e.targetWidth / f;
      }
    const Y = new a.Group(), d = [];
    for (let c = 0; c < t.length; c++) {
      const f = t[c], g = W[c];
      if (e.equalizationMethod === "fontSize" || !e.equalizeLineWidths) {
        if (!f.trim()) {
          const P = new a.Group(), S = e.size * g;
          d.push({ geometry: P, minY: 0, maxY: S * 0.8 });
          continue;
        }
        if (/<b>/i.test(o[c])) {
          const P = ce(o[c]), S = e.size * g, V = {
            size: S,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize * g,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          }, G = [];
          let L = 0;
          for (const q of P) {
            const K = q.bold ? O : v, $ = new R(q.text, { font: K, ...V });
            $.computeBoundingBox();
            const F = $.boundingBox, X = F.max.x - F.min.x;
            G.push({ geo: $, width: X, minY: F.min.y, maxY: F.max.y, startX: F.min.x }), L += X;
          }
          let ie = -L / 2, H = ((y = G[0]) == null ? void 0 : y.minY) ?? 0, N = ((j = G[0]) == null ? void 0 : j.maxY) ?? S;
          const ae = new a.Group();
          for (const { geo: q, width: K, minY: $, maxY: F, startX: X } of G)
            q.translate(ie - X, 0, 0), ae.add(new a.Mesh(q)), ie += K, H = Math.min(H, $), N = Math.max(N, F);
          d.push({ geometry: ae, minY: H, maxY: N });
          continue;
        }
        const u = new R(f, {
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
        u.computeBoundingBox();
        const _ = ((te = u.boundingBox) == null ? void 0 : te.min.x) ?? 0, b = ((se = u.boundingBox) == null ? void 0 : se.max.x) ?? 0, k = b - _, x = (_ + b) / 2, Z = ((oe = u.boundingBox) == null ? void 0 : oe.min.y) ?? 0, T = ((ne = u.boundingBox) == null ? void 0 : ne.max.y) ?? e.size;
        u.translate(-x, 0, 0), d.push({ geometry: u, minY: Z, maxY: T });
      } else {
        if (!f.trim()) {
          const T = new a.Group();
          d.push({ geometry: T, minY: 0, maxY: e.size * 0.8 });
          continue;
        }
        const u = z[c], _ = (e.targetWidth - u) / Math.max(1, f.length - 1), b = new a.Group();
        let k = 0;
        for (let T = 0; T < f.length; T++) {
          const P = f[T];
          if (P === " ") {
            const L = new R(" ", {
              font: v,
              size: e.size
            });
            L.computeBoundingBox(), k += L.boundingBox.max.x - L.boundingBox.min.x + _, L.dispose();
            continue;
          }
          const S = new R(P, {
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
          const V = S.boundingBox.max.x - S.boundingBox.min.x;
          S.translate(k, 0, 0);
          const G = new a.Mesh(S);
          b.add(G), k += V + _;
        }
        const x = b.children.length > 0 ? new a.Box3().setFromObject(b) : new a.Box3(new a.Vector3(0, 0, 0), new a.Vector3(0, e.size, 0)), Z = (x.max.x + x.min.x) / 2;
        b.position.x = -Z, d.push({ geometry: b, minY: x.min.y, maxY: x.max.y });
      }
    }
    const m = new Array(d.length).fill(0);
    for (let c = 1; c < d.length; c++)
      m[c] = m[c - 1] + d[c - 1].minY - e.lineSpacing - d[c].maxY;
    const w = d.length > 0 ? m[0] + d[0].maxY : 0, M = d.length > 0 ? m[d.length - 1] + d[d.length - 1].minY : 0, A = (w + M) / 2;
    for (let c = 0; c < d.length; c++) {
      const f = m[c] - A, { geometry: g } = d[c];
      if (g instanceof a.Group)
        g.position.y = f, Y.add(g);
      else {
        g.translate(0, f, 0);
        const u = new a.Mesh(g);
        Y.add(u);
      }
    }
    const D = e.color || new a.Color().setHSL(Math.random(), 0.8, 0.5), I = new a.MeshStandardMaterial({
      color: D,
      metalness: e.metalness,
      roughness: e.roughness,
      envMap: e.envMap || void 0,
      envMapIntensity: e.envMapIntensity
    });
    return le(I), { geometry: Y, material: I };
  } catch (C) {
    console.error("Failed to load font, creating fallback geometry:", C);
    const E = new a.Group(), v = e.size * 0.8, U = e.size + e.lineSpacing, O = [], z = t.map(() => 1);
    for (const d of t) {
      let m = 0;
      for (let w = 0; w < d.length; w++)
        d[w] !== " " ? m += v : m += v * 0.5;
      O.push(m);
    }
    if (e.equalizeLineWidths) {
      const d = e.targetWidth;
      for (let m = 0; m < O.length; m++) {
        const w = O[m] || 1, M = d / w;
        z[m] = M;
      }
    }
    for (let d = 0; d < t.length; d++) {
      const m = t[d], w = z[d], M = new a.Group();
      let A = 0;
      const D = e.equalizationMethod === "spacing" ? v * w : v, I = e.equalizationMethod === "fontSize" ? e.size * w : e.size;
      for (let u = 0; u < m.length; u++) {
        if (m[u] === " ") {
          A += D * 0.5;
          continue;
        }
        const b = new a.BoxGeometry(
          I * 0.6,
          I,
          e.height
        ), k = new a.Mesh(b);
        k.position.x = A, M.add(k), A += D;
      }
      const f = new a.Box3().setFromObject(M).getCenter(new a.Vector3());
      M.position.x = -f.x;
      const g = (t.length - 1) * U / 2 - d * U;
      M.position.y = g, E.add(M);
    }
    const W = e.color || new a.Color().setHSL(Math.random(), 0.8, 0.5), Y = new a.MeshStandardMaterial({
      color: W,
      metalness: e.metalness,
      roughness: e.roughness,
      envMap: e.envMap || void 0,
      envMapIntensity: e.envMapIntensity
    });
    return le(Y), { geometry: E, material: Y };
  }
}
const _e = (
  /* glsl */
  `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
), xe = 4;
function he(i, e) {
  return [
    new a.Vector4(0, 0, 0, 0),
    new a.Vector4(0.33, i.r * 0.35, i.g * 0.35, i.b * 0.35),
    new a.Vector4(0.66, i.r, i.g, i.b),
    new a.Vector4(1, e.r, e.g, e.b),
    new a.Vector4(0, 0, 0, 0)
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
  font: ee,
  size: 2,
  depth: 0.8,
  metalness: 0.95,
  roughness: 0.15,
  envIntensity: 1.5
}, Se = `
  :host {
    --primary-color: #ff6600;
    --secondary-color: #0066ff;
    display: block;
    position: relative;
    width: 100%;
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
  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  input[type="checkbox"] {
    width: auto;
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
function ze(i, e, o) {
  const s = e.filter((t) => t.urls.length > 0).map((t) => `<option value="${t.id}"${t.id === i.font ? " selected" : ""}>${t.label}</option>`).join("");
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
        <textarea id="cfg-text" rows="3">${i.text.replace(/\n/g, "&#10;")}</textarea>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-font">Font</label>
        <select id="cfg-font">${s}</select>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-color">Color</label>
        <input type="color" id="cfg-color" value="${i.color}">
      </div>

      <div class="field">
        <label class="field-label">Size</label>
        <div class="range-row">
          <input type="range" id="cfg-size" min="0.5" max="6" step="0.1" value="${i.size}">
          <span class="range-val" id="cfg-size-v">${i.size.toFixed(1)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Depth</label>
        <div class="range-row">
          <input type="range" id="cfg-depth" min="0.05" max="3" step="0.05" value="${i.depth}">
          <span class="range-val" id="cfg-depth-v">${i.depth.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Metalness</label>
        <div class="range-row">
          <input type="range" id="cfg-metalness" min="0" max="1" step="0.01" value="${i.metalness}">
          <span class="range-val" id="cfg-metalness-v">${i.metalness.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Roughness</label>
        <div class="range-row">
          <input type="range" id="cfg-roughness" min="0" max="1" step="0.01" value="${i.roughness}">
          <span class="range-val" id="cfg-roughness-v">${i.roughness.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Env-map intensity</label>
        <div class="range-row">
          <input type="range" id="cfg-env" min="0" max="4" step="0.05" value="${i.envIntensity}">
          <span class="range-val" id="cfg-env-v">${i.envIntensity.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <div class="checkbox-row">
          <input type="checkbox" id="cfg-scroll-zoom"${o ? " checked" : ""}>
          <label class="field-label" for="cfg-scroll-zoom" style="margin:0;text-transform:none;font-size:13px;">Scroll to zoom</label>
        </div>
      </div>
    </div>
  `;
}
class Me extends HTMLElement {
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  constructor() {
    super();
    p(this, "_cfg", { ...we });
    p(this, "_shadow");
    p(this, "_canvas");
    p(this, "_renderer", null);
    p(this, "_scene", null);
    p(this, "_camera", null);
    p(this, "_mesh", null);
    p(this, "_envMap", null);
    p(this, "_animId", null);
    p(this, "_resizeOb", null);
    p(this, "_updateId", 0);
    p(this, "_debounceTimer", null);
    p(this, "_rotation", { x: 0, y: 0 });
    p(this, "_drag", !1);
    p(this, "_lastMouse", { x: 0, y: 0 });
    p(this, "_startTime", performance.now());
    p(this, "_scrollZoom", !0);
    p(this, "_primaryColor", new a.Color("#ff6600"));
    p(this, "_secondaryColor", new a.Color("#0066ff"));
    // Plasma env-map
    p(this, "_plasmaRt", null);
    p(this, "_plasmaMat", null);
    p(this, "_plasmaScene", null);
    p(this, "_plasmaCamera", null);
    this._shadow = this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["text", "color", "font", "size", "depth", "metalness", "roughness", "env-intensity", "show-config", "scroll-zoom", "primary-color", "secondary-color"];
  }
  connectedCallback() {
    this._buildDOM(), this._initScene();
  }
  disconnectedCallback() {
    this._dispose();
  }
  attributeChangedCallback(o, s, t) {
    var r, l;
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
          this._scrollZoom = t !== "false", this._syncScrollZoomCheckbox();
          return;
        case "primary-color":
          this.style.setProperty("--primary-color", t), this._primaryColor.set(t), this._updatePlasmaColors(), this.hasAttribute("color") || (this._cfg.color = t, this._scheduleUpdate());
          return;
        case "secondary-color":
          this.style.setProperty("--secondary-color", t), this._secondaryColor.set(t), this._updatePlasmaColors();
          return;
        case "show-config":
          (l = (r = this._shadow) == null ? void 0 : r.querySelector(".cfg-panel")) == null || l.classList.toggle("open", t !== "false");
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
    o.textContent = Se;
    const s = document.createElement("div");
    for (s.innerHTML = ze(this._cfg, Q, this._scrollZoom), this._shadow.appendChild(o); s.firstChild; ) this._shadow.appendChild(s.firstChild);
    this._canvas = this._shadow.querySelector("canvas");
    const t = this._shadow.querySelector(".cfg-panel");
    this.hasAttribute("show-config") && this.getAttribute("show-config") !== "false" && t.classList.add("open"), this._shadow.querySelector(".cfg-btn").addEventListener(
      "click",
      () => t.classList.toggle("open")
    ), this._shadow.querySelector(".cfg-close").addEventListener(
      "click",
      () => t.classList.remove("open")
    ), this._bindControl("#cfg-text", "input", (n) => {
      this._cfg.text = n;
    }), this._bindControl("#cfg-font", "change", (n) => {
      this._cfg.font = n;
    }), this._bindControl("#cfg-color", "input", (n) => {
      this._cfg.color = n;
    }), this._bindRange("#cfg-size", "#cfg-size-v", (n) => {
      this._cfg.size = n;
    }), this._bindRange("#cfg-depth", "#cfg-depth-v", (n) => {
      this._cfg.depth = n;
    }), this._bindRange("#cfg-metalness", "#cfg-metalness-v", (n) => {
      this._cfg.metalness = n;
    }), this._bindRange("#cfg-roughness", "#cfg-roughness-v", (n) => {
      this._cfg.roughness = n;
    }), this._bindRange("#cfg-env", "#cfg-env-v", (n) => {
      this._cfg.envIntensity = n;
    }), this._canvas.addEventListener("mousedown", (n) => {
      this._drag = !0, this._lastMouse = { x: n.clientX, y: n.clientY };
    }), window.addEventListener("mousemove", (n) => {
      this._drag && (this._rotation.y += (n.clientX - this._lastMouse.x) * 0.01, this._rotation.x += (n.clientY - this._lastMouse.y) * 0.01, this._lastMouse = { x: n.clientX, y: n.clientY });
    }), window.addEventListener("mouseup", () => {
      this._drag = !1;
    }), this._canvas.addEventListener("wheel", (n) => {
      const y = n.ctrlKey;
      if (!this._scrollZoom && !y || (n.preventDefault(), !this._camera)) return;
      const j = Math.pow(1.001, n.deltaY * (n.deltaMode === 1 ? 40 : n.deltaMode === 2 ? 800 : 1));
      this._camera.position.z = Math.max(2, Math.min(80, this._camera.position.z * j));
    }, { passive: !1 });
    let l = 0;
    this._canvas.addEventListener("touchstart", (n) => {
      n.touches.length === 2 && (l = Math.hypot(
        n.touches[0].clientX - n.touches[1].clientX,
        n.touches[0].clientY - n.touches[1].clientY
      ));
    }, { passive: !0 }), this._canvas.addEventListener("touchmove", (n) => {
      if (n.touches.length !== 2 || !this._camera) return;
      n.preventDefault();
      const y = Math.hypot(
        n.touches[0].clientX - n.touches[1].clientX,
        n.touches[0].clientY - n.touches[1].clientY
      );
      if (l > 0) {
        const j = l / y;
        this._camera.position.z = Math.max(2, Math.min(80, this._camera.position.z * j));
      }
      l = y;
    }, { passive: !1 }), this._canvas.addEventListener("touchend", () => {
      l = 0;
    }, { passive: !0 });
    const h = this._shadow.querySelector("#cfg-scroll-zoom");
    h == null || h.addEventListener("change", () => {
      this._scrollZoom = h.checked;
    });
  }
  // ── Control wiring ────────────────────────────────────────────────────────
  _bindControl(o, s, t) {
    const r = this._shadow.querySelector(o);
    r && r.addEventListener(s, () => {
      t(r.value), this._scheduleUpdate(), this._dispatchChange();
    });
  }
  _bindRange(o, s, t) {
    const r = this._shadow.querySelector(o), l = this._shadow.querySelector(s);
    r && r.addEventListener("input", () => {
      const h = parseFloat(r.value);
      t(h), l && (l.textContent = h.toFixed(r.step.includes(".0") ? 1 : 2)), this._scheduleUpdate(), this._dispatchChange();
    });
  }
  _updatePlasmaColors() {
    if (!this._plasmaMat) return;
    const o = he(this._primaryColor, this._secondaryColor), s = this._plasmaMat.uniforms;
    s.uStop0.value = o[0], s.uStop1.value = o[1], s.uStop2.value = o[2], s.uStop3.value = o[3], s.uStop4.value = o[4];
  }
  _syncScrollZoomCheckbox() {
    var s;
    const o = (s = this._shadow) == null ? void 0 : s.querySelector("#cfg-scroll-zoom");
    o && (o.checked = this._scrollZoom);
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
    const o = this._canvas, s = new a.WebGLRenderer({ canvas: o, antialias: !0 });
    s.toneMapping = a.ACESFilmicToneMapping, s.toneMappingExposure = 1, this._renderer = s;
    const t = new a.Scene();
    t.background = new a.Color(1710618), this._scene = t;
    const r = new a.PerspectiveCamera(75, 1, 0.1, 1e4);
    r.position.z = 15, this._camera = r, t.add(new a.AmbientLight(16777215, 0.5));
    const l = new a.DirectionalLight(16777215, 1);
    l.position.set(10, 10, 10), t.add(l);
    const h = new a.PointLight(16711935, 1);
    h.position.set(-8, 5, 8), t.add(h);
    const n = new a.PointLight(65535, 0.8);
    n.position.set(8, -5, 8), t.add(n), this._envMap = this._setupPlasmaEnvMap(), this._envMap && (t.environment = this._envMap), this._resizeOb = new ResizeObserver(() => this._resize()), this._resizeOb.observe(this), this._resize(), this._updateMesh(), this._loop();
  }
  _resize() {
    var t, r;
    const o = this.offsetWidth || 800, s = this.offsetHeight || 400;
    (t = this._renderer) == null || t.setSize(o, s, !1), (r = this._renderer) == null || r.setPixelRatio(window.devicePixelRatio), this._camera && (this._camera.aspect = o / s, this._camera.updateProjectionMatrix());
  }
  async _updateMesh() {
    if (!this._scene || !this._envMap) return;
    const o = ++this._updateId;
    try {
      const { geometry: s, material: t } = await ve({
        text: this._cfg.text,
        fontFamily: this._cfg.font,
        size: this._cfg.size,
        height: this._cfg.depth,
        color: new a.Color(this._cfg.color),
        metalness: this._cfg.metalness,
        roughness: this._cfg.roughness,
        envMap: this._envMap,
        envMapIntensity: this._cfg.envIntensity
      });
      if (o !== this._updateId)
        return;
      this._removeMesh();
      let r;
      s instanceof a.Group ? (r = s, r.traverse((l) => {
        l instanceof a.Mesh && (l.material = t, l.castShadow = !0);
      })) : (r = new a.Mesh(s, t), r.castShadow = !0), this._scene.add(r), this._mesh = r;
    } catch (s) {
      console.error("[threed-text-wc] mesh update failed:", s);
    }
  }
  _removeMesh() {
    !this._mesh || !this._scene || (this._scene.remove(this._mesh), this._mesh.traverse((o) => {
      var s;
      o instanceof a.Mesh && ((s = o.geometry) == null || s.dispose(), (Array.isArray(o.material) ? o.material : [o.material]).forEach((r) => r == null ? void 0 : r.dispose()));
    }), this._mesh = null);
  }
  _loop() {
    this._animId = requestAnimationFrame(() => this._loop());
    const o = (performance.now() - this._startTime) / 1e3;
    this._updatePlasma(o), this._mesh && (this._mesh.rotation.x = this._rotation.x, this._mesh.rotation.y = this._rotation.y), this._renderer && this._scene && this._camera && this._renderer.render(this._scene, this._camera);
  }
  // ── Animated plasma env-map ────────────────────────────────────────────────
  _setupPlasmaEnvMap() {
    const s = new a.WebGLRenderTarget(256, 256, {
      minFilter: a.LinearFilter,
      magFilter: a.LinearFilter
    }), t = he(this._primaryColor, this._secondaryColor), r = new a.ShaderMaterial({
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
      vertexShader: _e,
      fragmentShader: ye
    }), l = new a.Scene();
    l.add(new a.Mesh(new a.PlaneGeometry(2, 2), r));
    const h = new a.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._plasmaRt = s, this._plasmaMat = r, this._plasmaScene = l, this._plasmaCamera = h;
    const n = s.texture;
    return n.mapping = a.EquirectangularReflectionMapping, n;
  }
  _updatePlasma(o) {
    const { _plasmaRt: s, _plasmaMat: t, _plasmaScene: r, _plasmaCamera: l, _renderer: h } = this;
    if (!s || !t || !r || !l || !h) return;
    t.uniforms.uTime.value = o;
    const n = h.getRenderTarget();
    h.setRenderTarget(s), h.render(r, l), h.setRenderTarget(n);
  }
  _dispose() {
    var o, s, t, r;
    this._animId !== null && cancelAnimationFrame(this._animId), (o = this._resizeOb) == null || o.disconnect(), this._removeMesh(), (s = this._plasmaRt) == null || s.dispose(), (t = this._plasmaMat) == null || t.dispose(), (r = this._renderer) == null || r.dispose();
  }
}
customElements.get("threed-text") || customElements.define("threed-text", Me);
export {
  Me as ThreedTextElement
};
//# sourceMappingURL=threed-text.js.map
