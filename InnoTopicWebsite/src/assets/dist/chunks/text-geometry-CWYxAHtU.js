import { T as q, G as y, M as $, B as Q, V as Z, C as re, a as ce, b as fe, F as ee } from "./three-runtime-DAVnG4av.js";
const me = {}, be = "droid_sans", he = [
  {
    id: "droid_sans",
    label: "Droid Sans",
    urls: [
      "https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json",
      "https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_regular.typeface.json"
    ]
  }
], pe = {
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
function de(t) {
  t.onBeforeCompile = (e) => {
    e.fragmentShader = e.fragmentShader.replace(
      "#include <normal_fragment_begin>",
      `#include <normal_fragment_begin>
      if (normal.z < 0.0) normal = normalize(vec3(normal.xy, 1e-4));`
    );
  }, t.customProgramCacheKey = () => "text-bevel-normal-clamp";
}
const G = /* @__PURE__ */ new Map();
function ge(t) {
  const e = [], d = /<b>(.*?)<\/b>/gi;
  let i = 0, l;
  for (; (l = d.exec(t)) !== null; )
    l.index > i && e.push({ text: t.slice(i, l.index), bold: !1 }), l[1] && e.push({ text: l[1], bold: !0 }), i = d.lastIndex;
  return i < t.length && e.push({ text: t.slice(i), bold: !1 }), e.filter((M) => M.text.length > 0);
}
function xe(t) {
  return t.replace(/<\/?b>/gi, "");
}
const ve = {
  droid_sans: "droid_sans_bold",
  helvetiker: "helvetiker_bold",
  optimer: "optimer_bold",
  gentilis: "gentilis_bold",
  droid_serif: "droid_serif_bold"
};
function Se(t) {
  return ve[t] ?? t;
}
async function ue(t = be) {
  if (G.has(t)) return G.get(t);
  const e = he.find((i) => i.id === t) ?? he[0];
  if (e.id === "roboto") {
    const i = new ee(me);
    return G.set(e.id, i), t !== e.id && G.set(t, i), i;
  }
  if (e.id === "inter") {
    const i = new ee(me);
    return G.set(e.id, i), t !== e.id && G.set(t, i), i;
  }
  const d = e.urls;
  return new Promise((i, l) => {
    const M = async (B) => {
      if (B >= d.length) {
        l(new Error(`All URLs failed for font "${t}"`));
        return;
      }
      try {
        const z = await fetch(d[B]);
        if (!z.ok) throw new Error(`HTTP ${z.status}`);
        const P = await z.json(), X = new ee(P);
        G.set(t, X), i(X);
      } catch (z) {
        console.error(`Font "${t}" failed from ${d[B]}:`, z), M(B + 1);
      }
    };
    M(0);
  });
}
async function we(t) {
  var M, B, z, P, X, ne, te, oe, se, ie;
  const e = { ...pe, ...Object.fromEntries(Object.entries(t).filter(([w, O]) => O !== void 0)) }, d = e.text.split(`
`), i = d.some((w) => /<b>/i.test(w)), l = d.map(xe);
  try {
    const w = e.fontFamily ?? be, O = Se(w), [g, C] = await Promise.all([
      ue(w),
      i && O !== w ? ue(O).catch(() => null) : Promise.resolve(null)
    ]), k = C ?? g, x = [], H = l.map(() => 1);
    for (let n = 0; n < l.length; n++) {
      const r = l[n];
      if (!r.trim()) {
        x.push(0);
        continue;
      }
      const c = d[n];
      if (/<b>/i.test(c)) {
        const o = ge(c);
        let u = 0;
        for (const h of o) {
          const S = h.bold ? k : g, b = new q(h.text, {
            font: S,
            size: e.size,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          });
          b.computeBoundingBox(), u += (((M = b.boundingBox) == null ? void 0 : M.max.x) ?? 0) - (((B = b.boundingBox) == null ? void 0 : B.min.x) ?? 0), b.dispose();
        }
        x.push(u);
      } else {
        const o = new q(r, {
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
        o.computeBoundingBox();
        const u = (((z = o.boundingBox) == null ? void 0 : z.max.x) ?? 0) - (((P = o.boundingBox) == null ? void 0 : P.min.x) ?? 0);
        x.push(u), o.dispose();
      }
    }
    if (e.equalizeLineWidths)
      for (let n = 0; n < x.length; n++) {
        const r = x[n] || 1;
        H[n] = e.targetWidth / r;
      }
    const Y = new y(), s = [];
    for (let n = 0; n < l.length; n++) {
      const r = l[n], c = H[n];
      if (e.equalizationMethod === "fontSize" || !e.equalizeLineWidths) {
        if (!r.trim()) {
          const L = new y(), p = e.size * c;
          s.push({ geometry: L, minY: 0, maxY: p * 0.8 });
          continue;
        }
        if (/<b>/i.test(d[n])) {
          const L = ge(d[n]), p = e.size * c, U = {
            size: p,
            depth: e.height,
            curveSegments: e.curveSegments,
            bevelEnabled: e.bevelEnabled,
            bevelThickness: e.bevelThickness,
            bevelSize: e.bevelSize * c,
            bevelOffset: e.bevelOffset,
            bevelSegments: e.bevelSegments
          }, W = [];
          let T = 0;
          for (const A of L) {
            const J = A.bold ? k : g, I = new q(A.text, { font: J, ...U });
            I.computeBoundingBox();
            const F = I.boundingBox, N = F.max.x - F.min.x;
            W.push({ geo: I, width: N, minY: F.min.y, maxY: F.max.y, startX: F.min.x }), T += N;
          }
          let le = -T / 2, V = ((X = W[0]) == null ? void 0 : X.minY) ?? 0, K = ((ne = W[0]) == null ? void 0 : ne.maxY) ?? p;
          const ae = new y();
          for (const { geo: A, width: J, minY: I, maxY: F, startX: N } of W)
            A.translate(le - N, 0, 0), ae.add(new $(A)), le += J, V = Math.min(V, I), K = Math.max(K, F);
          s.push({ geometry: ae, minY: V, maxY: K });
          continue;
        }
        const o = new q(r, {
          font: g,
          size: e.size * c,
          depth: e.height,
          curveSegments: e.curveSegments,
          bevelEnabled: e.bevelEnabled,
          bevelThickness: e.bevelThickness,
          bevelSize: e.bevelSize * c,
          bevelOffset: e.bevelOffset,
          bevelSegments: e.bevelSegments
        });
        o.computeBoundingBox();
        const u = ((te = o.boundingBox) == null ? void 0 : te.min.x) ?? 0, h = ((oe = o.boundingBox) == null ? void 0 : oe.max.x) ?? 0, S = h - u, b = (u + h) / 2, R = ((se = o.boundingBox) == null ? void 0 : se.min.y) ?? 0, _ = ((ie = o.boundingBox) == null ? void 0 : ie.max.y) ?? e.size;
        o.translate(-b, 0, 0), s.push({ geometry: o, minY: R, maxY: _ });
      } else {
        if (!r.trim()) {
          const _ = new y();
          s.push({ geometry: _, minY: 0, maxY: e.size * 0.8 });
          continue;
        }
        const o = x[n], u = (e.targetWidth - o) / Math.max(1, r.length - 1), h = new y();
        let S = 0;
        for (let _ = 0; _ < r.length; _++) {
          const L = r[_];
          if (L === " ") {
            const T = new q(" ", {
              font: g,
              size: e.size
            });
            T.computeBoundingBox(), S += T.boundingBox.max.x - T.boundingBox.min.x + u, T.dispose();
            continue;
          }
          const p = new q(L, {
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
          p.computeBoundingBox();
          const U = p.boundingBox.max.x - p.boundingBox.min.x;
          p.translate(S, 0, 0);
          const W = new $(p);
          h.add(W), S += U + u;
        }
        const b = h.children.length > 0 ? new Q().setFromObject(h) : new Q(new Z(0, 0, 0), new Z(0, e.size, 0)), R = (b.max.x + b.min.x) / 2;
        h.position.x = -R, s.push({ geometry: h, minY: b.min.y, maxY: b.max.y });
      }
    }
    const a = new Array(s.length).fill(0);
    for (let n = 1; n < s.length; n++)
      a[n] = a[n - 1] + s[n - 1].minY - e.lineSpacing - s[n].maxY;
    const m = s.length > 0 ? a[0] + s[0].maxY : 0, f = s.length > 0 ? a[s.length - 1] + s[s.length - 1].minY : 0, v = (m + f) / 2;
    for (let n = 0; n < s.length; n++) {
      const r = a[n] - v, { geometry: c } = s[n];
      if (c instanceof y)
        c.position.y = r, Y.add(c);
      else {
        c.translate(0, r, 0);
        const o = new $(c);
        Y.add(o);
      }
    }
    const E = {
      color: e.color || new re().setHSL(Math.random(), 0.8, 0.5),
      metalness: e.envMap ? e.metalness : Math.min(e.metalness ?? 0, 0.25),
      roughness: e.envMap ? e.roughness : Math.max(e.roughness ?? 0.45, 0.35)
    };
    e.envMap && (E.envMap = e.envMap, E.envMapIntensity = e.envMapIntensity);
    const j = new ce(E);
    return de(j), { geometry: Y, material: j };
  } catch (w) {
    console.error("Failed to load font, creating fallback geometry:", w);
    const O = new y(), g = e.size * 0.8, C = e.size + e.lineSpacing, k = [], x = l.map(() => 1);
    for (const a of l) {
      let m = 0;
      for (let f = 0; f < a.length; f++)
        a[f] !== " " ? m += g : m += g * 0.5;
      k.push(m);
    }
    if (e.equalizeLineWidths) {
      const a = e.targetWidth;
      for (let m = 0; m < k.length; m++) {
        const f = k[m] || 1, v = a / f;
        x[m] = v;
      }
    }
    for (let a = 0; a < l.length; a++) {
      const m = l[a], f = x[a], v = new y();
      let D = 0;
      const E = e.equalizationMethod === "spacing" ? g * f : g, j = e.equalizationMethod === "fontSize" ? e.size * f : e.size;
      for (let o = 0; o < m.length; o++) {
        if (m[o] === " ") {
          D += E * 0.5;
          continue;
        }
        const h = new fe(
          j * 0.6,
          j,
          e.height
        ), S = new $(h);
        S.position.x = D, v.add(S), D += E;
      }
      const r = new Q().setFromObject(v).getCenter(new Z());
      v.position.x = -r.x;
      const c = (l.length - 1) * C / 2 - a * C;
      v.position.y = c, O.add(v);
    }
    const Y = {
      color: e.color || new re().setHSL(Math.random(), 0.8, 0.5),
      metalness: e.envMap ? e.metalness : Math.min(e.metalness ?? 0, 0.25),
      roughness: e.envMap ? e.roughness : Math.max(e.roughness ?? 0.45, 0.35)
    };
    e.envMap && (Y.envMap = e.envMap, Y.envMapIntensity = e.envMapIntensity);
    const s = new ce(Y);
    return de(s), { geometry: O, material: s };
  }
}
export {
  be as D,
  we as c
};
