var pe = Object.defineProperty;
var fe = (r, e, i) => e in r ? pe(r, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : r[e] = i;
var p = (r, e, i) => fe(r, typeof e != "symbol" ? e + "" : e, i);
import * as o from "three";
import { TextGeometry as $ } from "three/examples/jsm/geometries/TextGeometry.js";
import { Font as se } from "three/examples/jsm/loaders/FontLoader.js";
const re = {}, ne = "droid_sans", ie = [
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
], ue = {
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
const A = /* @__PURE__ */ new Map();
function ce(r) {
  const e = [], i = /<b>(.*?)<\/b>/gi;
  let s = 0, t;
  for (; (t = i.exec(r)) !== null; )
    t.index > s && e.push({ text: r.slice(s, t.index), bold: !1 }), t[1] && e.push({ text: t[1], bold: !0 }), s = i.lastIndex;
  return s < r.length && e.push({ text: r.slice(s), bold: !1 }), e.filter((a) => a.text.length > 0);
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
async function he(r = ne) {
  if (A.has(r)) return A.get(r);
  const e = ie.find((s) => s.id === r) ?? ie[0];
  if (e.id === "roboto") {
    const s = new se(re);
    return A.set(e.id, s), r !== e.id && A.set(r, s), s;
  }
  if (e.id === "inter") {
    const s = new se(re);
    return A.set(e.id, s), r !== e.id && A.set(r, s), s;
  }
  const i = e.urls;
  return new Promise((s, t) => {
    const a = async (c) => {
      if (c >= i.length) {
        t(new Error(`All URLs failed for font "${r}"`));
        return;
      }
      try {
        const l = await fetch(i[c]);
        if (!l.ok) throw new Error(`HTTP ${l.status}`);
        const h = await l.json(), u = new se(h);
        A.set(r, u), s(u);
      } catch (l) {
        console.error(`Font "${r}" failed from ${i[c]}:`, l), a(c + 1);
      }
    };
    a(0);
  });
}
async function ve(r) {
  var a, c, l, h, u, z, w, x, M, R;
  const e = { ...ue, ...Object.fromEntries(Object.entries(r).filter(([y, n]) => n !== void 0)) }, i = e.text.split(`
`), s = i.some((y) => /<b>/i.test(y)), t = i.map(me);
  try {
    const y = e.fontFamily ?? ne, n = _e(y), [g, F] = await Promise.all([
      he(y),
      s && n !== y ? he(n).catch(() => null) : Promise.resolve(null)
    ]), Y = F ?? g, L = [], H = t.map(() => 1);
    for (let d = 0; d < t.length; d++) {
      const v = t[d];
      if (!v.trim()) {
        L.push(0);
        continue;
      }
      const b = i[d];
      if (/<b>/i.test(b)) {
        const m = ce(b);
        let C = 0;
        for (const S of m) {
          const B = S.bold ? Y : g, T = new $(S.text, {
            font: B,
            size: e.size,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          });
          T.computeBoundingBox(), C += (((a = T.boundingBox) == null ? void 0 : a.max.x) ?? 0) - (((c = T.boundingBox) == null ? void 0 : c.min.x) ?? 0), T.dispose();
        }
        L.push(C);
      } else {
        const m = new $(v, {
          font: g,
          size: e.size,
          depth: e.height,
          curveSegments: e.curveSegments,
          bevelEnabled: e.bevelEnabled,
          bevelThickness: e.bevelThickness,
          bevelSize: e.bevelSize,
          bevelOffset: e.bevelOffset,
          bevelSegments: e.bevelSegments
        });
        m.computeBoundingBox();
        const C = (((l = m.boundingBox) == null ? void 0 : l.max.x) ?? 0) - (((h = m.boundingBox) == null ? void 0 : h.min.x) ?? 0);
        L.push(C), m.dispose();
      }
    }
    if (e.equalizeLineWidths)
      for (let d = 0; d < L.length; d++) {
        const v = L[d] || 1;
        H[d] = e.targetWidth / v;
      }
    const I = new o.Group(), f = [];
    for (let d = 0; d < t.length; d++) {
      const v = t[d], b = H[d];
      if (e.equalizationMethod === "fontSize" || !e.equalizeLineWidths) {
        if (!v.trim()) {
          const q = new o.Group(), k = e.size * b;
          f.push({ geometry: q, minY: 0, maxY: k * 0.8 });
          continue;
        }
        if (/<b>/i.test(i[d])) {
          const q = ce(i[d]), k = e.size * b, J = {
            size: k,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize * b,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          }, W = [];
          let j = 0;
          for (const V of q) {
            const te = V.bold ? Y : g, X = new $(V.text, { font: te, ...J });
            X.computeBoundingBox();
            const G = X.boundingBox, N = G.max.x - G.min.x;
            W.push({ geo: X, width: N, minY: G.min.y, maxY: G.max.y, startX: G.min.x }), j += N;
          }
          let oe = -j / 2, Q = ((u = W[0]) == null ? void 0 : u.minY) ?? 0, ee = ((z = W[0]) == null ? void 0 : z.maxY) ?? k;
          const ae = new o.Group();
          for (const { geo: V, width: te, minY: X, maxY: G, startX: N } of W)
            V.translate(oe - N, 0, 0), ae.add(new o.Mesh(V)), oe += te, Q = Math.min(Q, X), ee = Math.max(ee, G);
          f.push({ geometry: ae, minY: Q, maxY: ee });
          continue;
        }
        const m = new $(v, {
          font: g,
          size: e.size * b,
          depth: e.height,
          curveSegments: e.curveSegments,
          bevelEnabled: e.bevelEnabled,
          bevelThickness: e.bevelThickness,
          bevelSize: e.bevelSize * b,
          bevelOffset: e.bevelOffset,
          bevelSegments: e.bevelSegments
        });
        m.computeBoundingBox();
        const C = ((w = m.boundingBox) == null ? void 0 : w.min.x) ?? 0, S = ((x = m.boundingBox) == null ? void 0 : x.max.x) ?? 0, B = S - C, T = (C + S) / 2, K = ((M = m.boundingBox) == null ? void 0 : M.min.y) ?? 0, O = ((R = m.boundingBox) == null ? void 0 : R.max.y) ?? e.size;
        m.translate(-T, 0, 0), f.push({ geometry: m, minY: K, maxY: O });
      } else {
        if (!v.trim()) {
          const O = new o.Group();
          f.push({ geometry: O, minY: 0, maxY: e.size * 0.8 });
          continue;
        }
        const m = L[d], C = (e.targetWidth - m) / Math.max(1, v.length - 1), S = new o.Group();
        let B = 0;
        for (let O = 0; O < v.length; O++) {
          const q = v[O];
          if (q === " ") {
            const j = new $(" ", {
              font: g,
              size: e.size
            });
            j.computeBoundingBox(), B += j.boundingBox.max.x - j.boundingBox.min.x + C, j.dispose();
            continue;
          }
          const k = new $(q, {
            font: g,
            size: e.size,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          });
          k.computeBoundingBox();
          const J = k.boundingBox.max.x - k.boundingBox.min.x;
          k.translate(B, 0, 0);
          const W = new o.Mesh(k);
          S.add(W), B += J + C;
        }
        const T = S.children.length > 0 ? new o.Box3().setFromObject(S) : new o.Box3(new o.Vector3(0, 0, 0), new o.Vector3(0, e.size, 0)), K = (T.max.x + T.min.x) / 2;
        S.position.x = -K, f.push({ geometry: S, minY: T.min.y, maxY: T.max.y });
      }
    }
    const _ = new Array(f.length).fill(0);
    for (let d = 1; d < f.length; d++)
      _[d] = _[d - 1] + f[d - 1].minY - e.lineSpacing - f[d].maxY;
    const E = f.length > 0 ? _[0] + f[0].maxY : 0, P = f.length > 0 ? _[f.length - 1] + f[f.length - 1].minY : 0, U = (E + P) / 2;
    for (let d = 0; d < f.length; d++) {
      const v = _[d] - U, { geometry: b } = f[d];
      if (b instanceof o.Group)
        b.position.y = v, I.add(b);
      else {
        b.translate(0, v, 0);
        const m = new o.Mesh(b);
        I.add(m);
      }
    }
    const Z = e.color || new o.Color().setHSL(Math.random(), 0.8, 0.5), D = new o.MeshStandardMaterial({
      color: Z,
      metalness: e.metalness,
      roughness: e.roughness,
      envMap: e.envMap || void 0,
      envMapIntensity: e.envMapIntensity
    });
    return le(D), { geometry: I, material: D };
  } catch (y) {
    console.error("Failed to load font, creating fallback geometry:", y);
    const n = new o.Group(), g = e.size * 0.8, F = e.size + e.lineSpacing, Y = [], L = t.map(() => 1);
    for (const f of t) {
      let _ = 0;
      for (let E = 0; E < f.length; E++)
        f[E] !== " " ? _ += g : _ += g * 0.5;
      Y.push(_);
    }
    if (e.equalizeLineWidths) {
      const f = e.targetWidth;
      for (let _ = 0; _ < Y.length; _++) {
        const E = Y[_] || 1, P = f / E;
        L[_] = P;
      }
    }
    for (let f = 0; f < t.length; f++) {
      const _ = t[f], E = L[f], P = new o.Group();
      let U = 0;
      const Z = e.equalizationMethod === "spacing" ? g * E : g, D = e.equalizationMethod === "fontSize" ? e.size * E : e.size;
      for (let m = 0; m < _.length; m++) {
        if (_[m] === " ") {
          U += Z * 0.5;
          continue;
        }
        const S = new o.BoxGeometry(
          D * 0.6,
          D,
          e.height
        ), B = new o.Mesh(S);
        B.position.x = U, P.add(B), U += Z;
      }
      const v = new o.Box3().setFromObject(P).getCenter(new o.Vector3());
      P.position.x = -v.x;
      const b = (t.length - 1) * F / 2 - f * F;
      P.position.y = b, n.add(P);
    }
    const H = e.color || new o.Color().setHSL(Math.random(), 0.8, 0.5), I = new o.MeshStandardMaterial({
      color: H,
      metalness: e.metalness,
      roughness: e.roughness,
      envMap: e.envMap || void 0,
      envMapIntensity: e.envMapIntensity
    });
    return le(I), { geometry: n, material: I };
  }
}
const be = (
  /* glsl */
  `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
), xe = 4;
function de(r, e) {
  return [
    new o.Vector4(0, 0, 0, 0),
    new o.Vector4(
      0.33,
      r.r * 0.35,
      r.g * 0.35,
      r.b * 0.35
    ),
    new o.Vector4(0.66, r.r, r.g, r.b),
    new o.Vector4(1, e.r, e.g, e.b),
    new o.Vector4(0, 0, 0, 0)
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
), Se = {
  text: `Hello
World`,
  color: "#ff6600",
  font: ne,
  fontSize: 120,
  depth: 0.8,
  metalness: 0.95,
  roughness: 0.15,
  envIntensity: 1.5,
  fov: 75,
  capitalize: !1,
  rotateZ: 0
}, we = new o.Plane(new o.Vector3(0, 0, 1), 0), ze = `
  :host {
    --primary-color: #ff6600;
    --secondary-color: #0066ff;
    display: inline-block;
    position: relative;
    width: 400px;
    height: 400px;
    background: transparent;
    border-radius: 5px;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
  }
  canvas {
    display: block;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100%;
    height: 100%;
  }
  /* ── Config panel ── */
  .cfg-panel {
    position: absolute;
    top: 0; right: 0;
    width: 270px;
    height: 100%;
    background: rgba(10,10,10,0.97);
    border-left: 1px solid rgba(255,255,255,0.09);
    padding: 14px 14px 20px;
    box-sizing: border-box;
    overflow-y: auto;
    z-index: 20;
    transform: translateX(calc(100% + 2px));
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
  const i = e.filter((s) => s.urls.length > 0).map(
    (s) => `<option value="${s.id}"${s.id === r.font ? " selected" : ""}>${s.label}</option>`
  ).join("");
  return `
    <canvas></canvas>
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
        <select id="cfg-font">${i}</select>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-color">Color</label>
        <input type="color" id="cfg-color" value="${r.color}">
      </div>

      <div class="field">
        <label class="field-label">Extrude</label>
        <div class="range-row">
          <input type="range" id="cfg-depth" min="0.05" max="3" step="0.05" value="${r.depth}">
          <span class="range-val" id="cfg-depth-v">${r.depth.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Perspective (FOV)</label>
        <div class="range-row">
          <input type="range" id="cfg-fov" min="10" max="120" step="1" value="${r.fov}">
          <span class="range-val" id="cfg-fov-v">${r.fov}°</span>
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

      <div class="field">
        <label class="field-label">Font size</label>
        <div class="range-row">
          <input type="range" id="cfg-font-size" min="20" max="600" step="10" value="120">
          <span class="range-val" id="cfg-font-size-v">120px</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label" style="display:flex;align-items:center;gap:8px;text-transform:none;font-size:12px;cursor:pointer;">
          <input type="checkbox" id="cfg-drag-rotate" checked style="accent-color:var(--primary-color,#ff6600);width:auto;cursor:pointer;">
          Drag to rotate
        </label>
      </div>
      <div class="field">
        <label class="field-label" style="display:flex;align-items:center;gap:8px;text-transform:none;font-size:12px;cursor:pointer;">
          <input type="checkbox" id="cfg-capitalize" style="accent-color:var(--primary-color,#ff6600);width:auto;cursor:pointer;">
          Capitalize
        </label>
      </div>

    </div>
  `;
}
class Ce extends HTMLElement {
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  constructor() {
    super();
    p(this, "_cfg", { ...Se });
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
    p(this, "_scrollZoom", !1);
    p(this, "_dragRotate", !0);
    p(this, "_autoSize", !0);
    p(this, "_textBoundingSize", null);
    p(this, "_styleObserver", null);
    p(this, "_primaryColor", new o.Color("#ff6600"));
    p(this, "_secondaryColor", new o.Color("#0066ff"));
    // Plasma env-map
    p(this, "_plasmaRt", null);
    p(this, "_plasmaMat", null);
    p(this, "_plasmaScene", null);
    p(this, "_plasmaCamera", null);
    p(this, "_pmremGenerator", null);
    p(this, "_pmremRt", null);
    this._shadow = this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return [
      "text",
      "color",
      "font",
      "font-size",
      "depth",
      "metalness",
      "roughness",
      "env-intensity",
      "fov",
      "show-config",
      "scroll-zoom",
      "primary-color",
      "secondary-color",
      "auto-size",
      "drag-rotate",
      "capitalize",
      "rotate-z"
    ];
  }
  connectedCallback() {
    this._buildDOM(), this._initScene();
  }
  disconnectedCallback() {
    this._dispose();
  }
  attributeChangedCallback(i, s, t) {
    var a, c, l;
    if (t !== null) {
      switch (i) {
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
        case "font-size":
          this._cfg.fontSize = parseFloat(t);
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
        case "fov":
          this._cfg.fov = parseFloat(t);
          break;
        case "capitalize":
          this._cfg.capitalize = t !== "false";
          break;
        case "rotate-z":
          this._cfg.rotateZ = parseFloat(t);
          break;
        case "scroll-zoom":
          this._scrollZoom = t !== "false";
          return;
        case "drag-rotate":
          this._dragRotate = t !== "false", (a = this._canvas) == null || a.style.setProperty(
            "cursor",
            this._dragRotate ? "grab" : "default"
          );
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
          (l = (c = this._shadow) == null ? void 0 : c.querySelector(".cfg-panel")) == null || l.classList.toggle("open", t !== "false");
          return;
      }
      this._scheduleUpdate();
    }
  }
  // ── Public property ────────────────────────────────────────────────────────
  get config() {
    return { ...this._cfg };
  }
  set config(i) {
    Object.assign(this._cfg, i), this._scheduleUpdate();
  }
  // ── DOM build ─────────────────────────────────────────────────────────────
  _buildDOM() {
    const i = document.createElement("style");
    i.textContent = ze;
    const s = document.createElement("div");
    for (s.innerHTML = Me(this._cfg, ie), this._shadow.appendChild(i); s.firstChild; ) this._shadow.appendChild(s.firstChild);
    this._canvas = this._shadow.querySelector("canvas");
    const t = this._shadow.querySelector(".cfg-panel");
    this.hasAttribute("show-config") && this.getAttribute("show-config") !== "false" && t.classList.add("open");
    const c = () => t.classList.add("open");
    this._canvas.addEventListener("contextmenu", (n) => {
      n.preventDefault(), c();
    });
    let l = null;
    this._canvas.addEventListener(
      "touchstart",
      (n) => {
        n.touches.length === 1 && (l = setTimeout(() => {
          l = null, c();
        }, 500));
      },
      { passive: !0 }
    );
    const h = () => {
      l !== null && (clearTimeout(l), l = null);
    };
    this._canvas.addEventListener("touchend", h, {
      passive: !0
    }), this._canvas.addEventListener("touchcancel", h, {
      passive: !0
    }), this._canvas.addEventListener("touchmove", h, {
      passive: !0
    }), this._shadow.querySelector(".cfg-close").addEventListener("click", () => t.classList.remove("open")), this._bindControl("#cfg-text", "input", (n) => {
      this._cfg.text = n;
    }), this._bindControl("#cfg-font", "change", (n) => {
      this._cfg.font = n;
    }), this._bindControl("#cfg-color", "input", (n) => {
      this._cfg.color = n;
    }), this._bindRange("#cfg-depth", "#cfg-depth-v", (n) => {
      this._cfg.depth = n;
    }), this._bindRange("#cfg-metalness", "#cfg-metalness-v", (n) => {
      this._cfg.metalness = n;
    }), this._bindRange("#cfg-roughness", "#cfg-roughness-v", (n) => {
      this._cfg.roughness = n;
    }), this._bindRange("#cfg-env", "#cfg-env-v", (n) => {
      this._cfg.envIntensity = n;
    });
    const u = this._shadow.querySelector(
      "#cfg-fov"
    ), z = this._shadow.querySelector(
      "#cfg-fov-v"
    );
    u && u.addEventListener("input", () => {
      const n = parseInt(u.value);
      this._cfg.fov = n, z && (z.textContent = `${n}°`), this._camera && (this._camera.fov = n, this._camera.updateProjectionMatrix(), this._textBoundingSize && this._fitCameraToTextSize(this._textBoundingSize)), this._dispatchChange();
    });
    const w = this._shadow.querySelector(
      "#cfg-font-size"
    ), x = this._shadow.querySelector(
      "#cfg-font-size-v"
    );
    w && (w.value = String(this._cfg.fontSize), x && (x.textContent = `${this._cfg.fontSize}px`), w.addEventListener("input", () => {
      const n = parseInt(w.value);
      x && (x.textContent = `${n}px`), this._cfg.fontSize = n, this.style.fontSize = `${n}px`;
    }));
    const M = this._shadow.querySelector(
      "#cfg-capitalize"
    );
    M && (M.checked = this._cfg.capitalize, M.addEventListener("change", () => {
      this._cfg.capitalize = M.checked, this._scheduleUpdate(), this._dispatchChange();
    }));
    const R = this._shadow.querySelector(
      "#cfg-drag-rotate"
    );
    R && (R.checked = this._dragRotate, R.addEventListener("change", () => {
      this._dragRotate = R.checked, this._canvas.style.cursor = this._dragRotate ? "grab" : "default";
    })), this._styleObserver = new MutationObserver(() => this._onFontSizeChange()), this._styleObserver.observe(this, {
      attributes: !0,
      attributeFilter: ["style", "class"]
    }), this._canvas.style.cursor = "grab", this._canvas.addEventListener("mousedown", (n) => {
      this._dragRotate && (this._drag = !0, this._canvas.style.cursor = "grabbing", this._lastMouse = { x: n.clientX, y: n.clientY });
    }), window.addEventListener("mousemove", (n) => {
      this._drag && (this._rotation.y += (n.clientX - this._lastMouse.x) * 0.01, this._rotation.x += (n.clientY - this._lastMouse.y) * 0.01, this._lastMouse = { x: n.clientX, y: n.clientY });
    }), window.addEventListener("mouseup", () => {
      this._drag && (this._drag = !1, this._canvas.style.cursor = this._dragRotate ? "grab" : "default");
    }), this._canvas.addEventListener(
      "wheel",
      (n) => {
        const g = n.ctrlKey;
        if (!this._scrollZoom && !g || (n.preventDefault(), !this._camera)) return;
        const F = Math.pow(
          1.001,
          n.deltaY * (n.deltaMode === 1 ? 40 : n.deltaMode === 2 ? 800 : 1)
        );
        this._zoomCameraAtClientPoint(n.clientX, n.clientY, F);
      },
      { passive: !1 }
    );
    let y = 0;
    this._canvas.addEventListener(
      "touchstart",
      (n) => {
        n.touches.length === 2 && (y = Math.hypot(
          n.touches[0].clientX - n.touches[1].clientX,
          n.touches[0].clientY - n.touches[1].clientY
        ));
      },
      { passive: !0 }
    ), this._canvas.addEventListener(
      "touchmove",
      (n) => {
        if (n.touches.length !== 2 || !this._camera) return;
        n.preventDefault();
        const g = Math.hypot(
          n.touches[0].clientX - n.touches[1].clientX,
          n.touches[0].clientY - n.touches[1].clientY
        );
        if (y > 0) {
          const F = y / g;
          this._zoomCameraAtClientPoint(
            (n.touches[0].clientX + n.touches[1].clientX) / 2,
            (n.touches[0].clientY + n.touches[1].clientY) / 2,
            F
          );
        }
        y = g;
      },
      { passive: !1 }
    ), this._canvas.addEventListener(
      "touchend",
      () => {
        y = 0;
      },
      { passive: !0 }
    );
  }
  _zoomCameraAtClientPoint(i, s, t) {
    if (!this._camera) return;
    const a = this._worldPointAtClientPoint(i, s), c = Math.max(2, Math.min(80, this._camera.position.z * t));
    if (c === this._camera.position.z) return;
    this._camera.position.z = c;
    const l = this._worldPointAtClientPoint(i, s);
    !a || !l || (this._camera.position.x += a.x - l.x, this._camera.position.y += a.y - l.y, this._camera.updateMatrixWorld(!0));
  }
  _worldPointAtClientPoint(i, s) {
    if (!this._camera || !this._canvas) return null;
    const t = this._canvas.getBoundingClientRect();
    if (t.width <= 0 || t.height <= 0) return null;
    const a = new o.Vector2(
      (i - t.left) / t.width * 2 - 1,
      -((s - t.top) / t.height) * 2 + 1
    ), c = new o.Raycaster(), l = new o.Vector3();
    return this._camera.updateMatrixWorld(!0), c.setFromCamera(a, this._camera), c.ray.intersectPlane(we, l);
  }
  // ── Control wiring ────────────────────────────────────────────────────────
  _bindControl(i, s, t) {
    const a = this._shadow.querySelector(i);
    a && a.addEventListener(s, () => {
      t(a.value), this._scheduleUpdate(), this._dispatchChange();
    });
  }
  _bindRange(i, s, t) {
    const a = this._shadow.querySelector(i), c = this._shadow.querySelector(s);
    a && a.addEventListener("input", () => {
      const l = parseFloat(a.value);
      t(l), c && (c.textContent = l.toFixed(a.step.includes(".0") ? 1 : 2)), this._scheduleUpdate(), this._dispatchChange();
    });
  }
  _updatePlasmaColors() {
    if (!this._plasmaMat) return;
    const i = de(this._primaryColor, this._secondaryColor), s = this._plasmaMat.uniforms;
    s.uStop0.value = i[0], s.uStop1.value = i[1], s.uStop2.value = i[2], s.uStop3.value = i[3], s.uStop4.value = i[4];
  }
  _scheduleUpdate() {
    this._debounceTimer && clearTimeout(this._debounceTimer), this._debounceTimer = setTimeout(() => this._updateMesh(), 60);
  }
  _dispatchChange() {
    this.dispatchEvent(
      new CustomEvent("config-change", {
        detail: { ...this._cfg },
        bubbles: !0,
        composed: !0
      })
    );
  }
  // ── Three.js scene ────────────────────────────────────────────────────────
  _initScene() {
    const i = this._canvas, s = new o.WebGLRenderer({
      canvas: i,
      antialias: !0,
      alpha: !0,
      premultipliedAlpha: !1
    });
    s.toneMapping = o.ACESFilmicToneMapping, s.toneMappingExposure = 1, this._renderer = s;
    const t = new o.Scene();
    this._scene = t;
    const a = new o.PerspectiveCamera(75, 1, 0.1, 1e4);
    a.position.z = 15, this._camera = a, t.add(new o.AmbientLight(16777215, 0.5));
    const c = new o.DirectionalLight(16777215, 1);
    c.position.set(10, 10, 10), t.add(c);
    const l = new o.PointLight(16711935, 1);
    l.position.set(-8, 5, 8), t.add(l);
    const h = new o.PointLight(65535, 0.8);
    h.position.set(8, -5, 8), t.add(h);
    const u = this._setupPlasmaEnvMap();
    this._updatePlasma(0), this._pmremGenerator = new o.PMREMGenerator(s), this._pmremGenerator.compileEquirectangularShader(), this._pmremRt = this._pmremGenerator.fromEquirectangular(u), this._envMap = this._pmremRt.texture, t.environment = this._envMap, this._resizeOb = new ResizeObserver(() => this._resize()), this._resizeOb.observe(this), this._resize(), this._updateMesh(), this._loop();
  }
  _resize() {
    var t, a;
    const i = this.offsetWidth || 800, s = this.offsetHeight || 400;
    (t = this._renderer) == null || t.setPixelRatio(window.devicePixelRatio), (a = this._renderer) == null || a.setSize(i, s, !1), this._camera && (this._camera.aspect = i / s, this._camera.updateProjectionMatrix());
  }
  _applyAutoSize() {
    if (!this._textBoundingSize || !this._autoSize) return;
    const i = this._cfg.rotateZ * (Math.PI / 180), s = Math.abs(Math.cos(i)), t = Math.abs(Math.sin(i)), a = this._textBoundingSize.x, c = this._textBoundingSize.y, l = a * s + c * t, h = a * t + c * s, u = this._cfg.fontSize * (h / Math.max(c, 1e-3)), z = this._cfg.fontSize * (l / Math.max(c, 1e-3));
    Math.abs(this.offsetHeight - u) > 0.5 && (this.style.height = `${u}px`), Math.abs(this.offsetWidth - z) > 0.5 && (this.style.width = `${z}px`);
  }
  _onFontSizeChange() {
    if (!(!this._autoSize || !this._textBoundingSize)) {
      if (this._applyAutoSize(), this._camera) {
        const i = this.offsetWidth || 800, s = this.offsetHeight || 400;
        this._camera.aspect = i / s, this._camera.updateProjectionMatrix();
      }
      this._textBoundingSize && this._fitCameraToTextSize(this._textBoundingSize);
    }
  }
  _fitCameraToTextSize(i) {
    if (!this._camera) return;
    const s = this._camera.fov * Math.PI / 180, t = Math.tan(s / 2), a = this._camera.aspect, c = this._cfg.rotateZ * (Math.PI / 180), l = Math.abs(Math.cos(c)), h = Math.abs(Math.sin(c)), u = i.x * l + i.y * h, w = (i.x * h + i.y * l) / 2 / t, x = u / 2 / (t * a), M = Math.max(w, x) + i.z / 2;
    this._camera.position.set(0, 0, Math.max(M, 0.5)), this._camera.lookAt(0, 0, 0), this._camera.updateMatrixWorld(!0);
  }
  async _updateMesh() {
    if (!this._scene || !this._envMap) return;
    const i = ++this._updateId;
    this._camera && this._camera.fov !== this._cfg.fov && (this._camera.fov = this._cfg.fov, this._camera.updateProjectionMatrix());
    const s = `${this._cfg.fontSize}px`;
    this.style.fontSize !== s && (this.style.fontSize = s);
    try {
      const t = this._cfg.capitalize ? this._cfg.text.toUpperCase() : this._cfg.text, { geometry: a, material: c } = await ve({
        text: t,
        fontFamily: this._cfg.font,
        size: 2,
        // fixed internal 3D size — visual scale comes from camera/canvas fitting
        height: this._cfg.depth,
        color: new o.Color(this._cfg.color),
        metalness: this._cfg.metalness,
        roughness: this._cfg.roughness,
        envMap: this._envMap,
        envMapIntensity: this._cfg.envIntensity
      });
      if (i !== this._updateId)
        return;
      this._removeMesh();
      const l = new o.Group();
      let h;
      a instanceof o.Group ? (h = a, h.traverse((x) => {
        x instanceof o.Mesh && (x.material = c, x.castShadow = !0);
      })) : (h = new o.Mesh(a, c), h.castShadow = !0), l.add(h), this._scene.add(l), this._mesh = l;
      const u = new o.Box3().setFromObject(l), z = u.getCenter(new o.Vector3());
      h.position.sub(z);
      const w = u.getSize(new o.Vector3());
      if (this._textBoundingSize = w, this._autoSize && (this._applyAutoSize(), this._camera)) {
        const x = this.offsetWidth || 800, M = this.offsetHeight || 400;
        this._camera.aspect = x / M, this._camera.updateProjectionMatrix();
      }
      this._fitCameraToTextSize(w);
    } catch (t) {
      console.error("[threed-text-wc] mesh update failed:", t);
    }
  }
  _removeMesh() {
    !this._mesh || !this._scene || (this._scene.remove(this._mesh), this._mesh.traverse((i) => {
      var s;
      i instanceof o.Mesh && ((s = i.geometry) == null || s.dispose(), (Array.isArray(i.material) ? i.material : [i.material]).forEach((a) => a == null ? void 0 : a.dispose()));
    }), this._mesh = null);
  }
  _loop() {
    this._animId = requestAnimationFrame(() => this._loop());
    const i = (performance.now() - this._startTime) / 1e3;
    this._updatePlasma(i), this._mesh && (this._mesh.rotation.x = this._rotation.x, this._mesh.rotation.y = this._rotation.y, this._mesh.rotation.z = this._cfg.rotateZ * (Math.PI / 180)), this._renderer && this._scene && this._camera && this._renderer.render(this._scene, this._camera);
  }
  // ── Animated plasma env-map ────────────────────────────────────────────────
  _setupPlasmaEnvMap() {
    const s = new o.WebGLRenderTarget(256, 256, {
      minFilter: o.LinearFilter,
      magFilter: o.LinearFilter
    }), t = de(
      this._primaryColor,
      this._secondaryColor
    ), a = new o.ShaderMaterial({
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
      vertexShader: be,
      fragmentShader: ye
    }), c = new o.Scene();
    c.add(new o.Mesh(new o.PlaneGeometry(2, 2), a));
    const l = new o.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._plasmaRt = s, this._plasmaMat = a, this._plasmaScene = c, this._plasmaCamera = l;
    const h = s.texture;
    return h.mapping = o.EquirectangularReflectionMapping, h;
  }
  _updatePlasma(i) {
    const {
      _plasmaRt: s,
      _plasmaMat: t,
      _plasmaScene: a,
      _plasmaCamera: c,
      _renderer: l
    } = this;
    if (!s || !t || !a || !c || !l) return;
    t.uniforms.uTime.value = i;
    const h = l.getRenderTarget();
    if (l.setRenderTarget(s), l.render(a, c), l.setRenderTarget(h), this._pmremGenerator && this._pmremRt) {
      this._pmremGenerator.fromEquirectangular(s.texture, this._pmremRt);
      const u = l.domElement;
      l.setViewport(
        0,
        0,
        u.clientWidth || u.width,
        u.clientHeight || u.height
      ), l.setScissorTest(!1);
    }
  }
  _dispose() {
    var i, s, t, a, c, l, h;
    this._animId !== null && cancelAnimationFrame(this._animId), (i = this._resizeOb) == null || i.disconnect(), (s = this._styleObserver) == null || s.disconnect(), this._removeMesh(), (t = this._plasmaRt) == null || t.dispose(), (a = this._plasmaMat) == null || a.dispose(), (c = this._pmremRt) == null || c.dispose(), (l = this._pmremGenerator) == null || l.dispose(), (h = this._renderer) == null || h.dispose();
  }
}
customElements.get("threed-text") || customElements.define("threed-text", Ce);
export {
  Ce as ThreedTextElement
};
//# sourceMappingURL=threed-text.js.map
