var b = Object.defineProperty;
var z = (c, l, e) => l in c ? b(c, l, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[l] = e;
var n = (c, l, e) => z(c, typeof l != "symbol" ? l + "" : l, e);
import { C as v, c as C, R as P, P as T, V as f, W as E, A as R, S, d as A, e as F, D as L, f as x, g as O, G as y, M as d, B as k, h as I, L as w, i as U, j as G, O as Z, E as W, k as u } from "./chunks/three-runtime-DAVnG4av.js";
import { D as B, c as D } from "./chunks/text-geometry-CWYxAHtU.js";
const Y = {
  text: `Hello
World`,
  color: "#ff6600",
  font: B,
  fontSize: 120,
  depth: 0.8,
  metalness: 0.95,
  roughness: 0.15,
  envIntensity: 1.5,
  fov: 75,
  capitalize: !1,
  rotateZ: 0
}, H = new T(new f(0, 0, 1), 0), X = (
  /* glsl */
  `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
), j = 4;
function M(c, l) {
  return [
    new u(0, 0, 0, 0),
    new u(0.33, c.r * 0.35, c.g * 0.35, c.b * 0.35),
    new u(0.66, c.r, c.g, c.b),
    new u(1, l.r, l.g, l.b),
    new u(0, 0, 0, 0)
  ];
}
const q = (
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
), V = `
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
  }
  canvas {
    display: block;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100%; height: 100%;
  }
`;
class N extends HTMLElement {
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  constructor() {
    super();
    n(this, "_cfg", { ...Y });
    n(this, "_shadow");
    n(this, "_canvas");
    n(this, "_renderer", null);
    n(this, "_scene", null);
    n(this, "_camera", null);
    n(this, "_mesh", null);
    n(this, "_animId", null);
    n(this, "_resizeOb", null);
    n(this, "_updateId", 0);
    n(this, "_debounceTimer", null);
    n(this, "_rotation", { x: 0, y: 0 });
    n(this, "_drag", !1);
    n(this, "_lastMouse", { x: 0, y: 0 });
    n(this, "_scrollZoom", !1);
    n(this, "_dragRotate", !0);
    n(this, "_autoSize", !0);
    n(this, "_textBoundingSize", null);
    n(this, "_styleObserver", null);
    n(this, "_startTime", performance.now());
    n(this, "_envMap", null);
    n(this, "_primaryColor", new v("#ff6600"));
    n(this, "_secondaryColor", new v("#0066ff"));
    n(this, "_plasmaRt", null);
    n(this, "_plasmaMat", null);
    n(this, "_plasmaScene", null);
    n(this, "_plasmaCamera", null);
    n(this, "_pmremGenerator", null);
    n(this, "_pmremRt", null);
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
  attributeChangedCallback(e, s, t) {
    var i;
    if (t !== null) {
      switch (e) {
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
          this._dragRotate = t !== "false", (i = this._canvas) == null || i.style.setProperty(
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
      }
      this._scheduleUpdate();
    }
  }
  // ── Public property ────────────────────────────────────────────────────────
  get config() {
    return { ...this._cfg };
  }
  set config(e) {
    Object.assign(this._cfg, e), this._scheduleUpdate();
  }
  // ── DOM build ─────────────────────────────────────────────────────────────
  _buildDOM() {
    const e = document.createElement("style");
    e.textContent = V, this._shadow.appendChild(e), this._canvas = document.createElement("canvas"), this._shadow.appendChild(this._canvas), this._styleObserver = new MutationObserver(() => this._onFontSizeChange()), this._styleObserver.observe(this, {
      attributes: !0,
      attributeFilter: ["style", "class"]
    }), this._canvas.style.cursor = "grab", this._canvas.addEventListener("mousedown", (t) => {
      this._dragRotate && (this._drag = !0, this._canvas.style.cursor = "grabbing", this._lastMouse = { x: t.clientX, y: t.clientY });
    }), window.addEventListener("mousemove", (t) => {
      this._drag && (this._rotation.y += (t.clientX - this._lastMouse.x) * 0.01, this._rotation.x += (t.clientY - this._lastMouse.y) * 0.01, this._lastMouse = { x: t.clientX, y: t.clientY });
    }), window.addEventListener("mouseup", () => {
      this._drag && (this._drag = !1, this._canvas.style.cursor = this._dragRotate ? "grab" : "default");
    }), this._canvas.addEventListener(
      "wheel",
      (t) => {
        const i = t.ctrlKey;
        if (!this._scrollZoom && !i || (t.preventDefault(), !this._camera)) return;
        const a = Math.pow(
          1.001,
          t.deltaY * (t.deltaMode === 1 ? 40 : t.deltaMode === 2 ? 800 : 1)
        );
        this._zoomCameraAtClientPoint(t.clientX, t.clientY, a);
      },
      { passive: !1 }
    );
    let s = 0;
    this._canvas.addEventListener(
      "touchstart",
      (t) => {
        t.touches.length === 2 && (s = Math.hypot(
          t.touches[0].clientX - t.touches[1].clientX,
          t.touches[0].clientY - t.touches[1].clientY
        ));
      },
      { passive: !0 }
    ), this._canvas.addEventListener(
      "touchmove",
      (t) => {
        if (t.touches.length !== 2 || !this._camera) return;
        t.preventDefault();
        const i = Math.hypot(
          t.touches[0].clientX - t.touches[1].clientX,
          t.touches[0].clientY - t.touches[1].clientY
        );
        if (s > 0) {
          const a = s / i;
          this._zoomCameraAtClientPoint(
            (t.touches[0].clientX + t.touches[1].clientX) / 2,
            (t.touches[0].clientY + t.touches[1].clientY) / 2,
            a
          );
        }
        s = i;
      },
      { passive: !1 }
    ), this._canvas.addEventListener(
      "touchend",
      () => {
        s = 0;
      },
      { passive: !0 }
    );
  }
  _zoomCameraAtClientPoint(e, s, t) {
    if (!this._camera) return;
    const i = this._worldPointAtClientPoint(e, s), a = Math.max(2, Math.min(80, this._camera.position.z * t));
    if (a === this._camera.position.z) return;
    this._camera.position.z = a;
    const o = this._worldPointAtClientPoint(e, s);
    !i || !o || (this._camera.position.x += i.x - o.x, this._camera.position.y += i.y - o.y, this._camera.updateMatrixWorld(!0));
  }
  _worldPointAtClientPoint(e, s) {
    if (!this._camera || !this._canvas) return null;
    const t = this._canvas.getBoundingClientRect();
    if (t.width <= 0 || t.height <= 0) return null;
    const i = new C(
      (e - t.left) / t.width * 2 - 1,
      -((s - t.top) / t.height) * 2 + 1
    ), a = new P(), o = new f();
    return this._camera.updateMatrixWorld(!0), a.setFromCamera(i, this._camera), a.ray.intersectPlane(H, o);
  }
  _updatePlasmaColors() {
    if (!this._plasmaMat) return;
    const e = M(this._primaryColor, this._secondaryColor), s = this._plasmaMat.uniforms;
    s.uStop0.value = e[0], s.uStop1.value = e[1], s.uStop2.value = e[2], s.uStop3.value = e[3], s.uStop4.value = e[4];
  }
  _scheduleUpdate() {
    this._debounceTimer && clearTimeout(this._debounceTimer), this._debounceTimer = setTimeout(() => this._updateMesh(), 60);
  }
  // ── Three.js scene ────────────────────────────────────────────────────────
  _initScene() {
    const e = this._canvas, s = new E({
      canvas: e,
      antialias: !0,
      alpha: !0,
      premultipliedAlpha: !1
    });
    s.toneMapping = R, s.toneMappingExposure = 1, this._renderer = s;
    const t = new S();
    this._scene = t;
    const i = new A(75, 1, 0.1, 1e4);
    i.position.z = 15, this._camera = i, t.add(new F(16777215, 0.5));
    const a = new L(16777215, 1);
    a.position.set(10, 10, 10), t.add(a);
    const o = new x(16711935, 1);
    o.position.set(-8, 5, 8), t.add(o);
    const r = new x(65535, 0.8);
    r.position.set(8, -5, 8), t.add(r);
    const h = this._setupPlasmaEnvMap();
    this._updatePlasma(0), this._pmremGenerator = new O(s), this._pmremGenerator.compileEquirectangularShader(), this._pmremRt = this._pmremGenerator.fromEquirectangular(h), this._envMap = this._pmremRt.texture, t.environment = this._envMap, this._resizeOb = new ResizeObserver(() => this._resize()), this._resizeOb.observe(this), this._resize(), this._updateMesh(), this._loop();
  }
  _resize() {
    var t, i;
    const e = this.offsetWidth || 800, s = this.offsetHeight || 400;
    (t = this._renderer) == null || t.setPixelRatio(window.devicePixelRatio), (i = this._renderer) == null || i.setSize(e, s, !1), this._camera && (this._camera.aspect = e / s, this._camera.updateProjectionMatrix());
  }
  _applyAutoSize() {
    if (!this._textBoundingSize || !this._autoSize) return;
    const e = this._cfg.rotateZ * (Math.PI / 180), s = Math.abs(Math.cos(e)), t = Math.abs(Math.sin(e)), i = this._textBoundingSize.x, a = this._textBoundingSize.y, o = i * s + a * t, r = i * t + a * s, h = this._cfg.fontSize * (r / Math.max(a, 1e-3)), p = this._cfg.fontSize * (o / Math.max(a, 1e-3));
    Math.abs(this.offsetHeight - h) > 0.5 && (this.style.height = `${h}px`), Math.abs(this.offsetWidth - p) > 0.5 && (this.style.width = `${p}px`);
  }
  _onFontSizeChange() {
    if (!(!this._autoSize || !this._textBoundingSize)) {
      if (this._applyAutoSize(), this._camera) {
        const e = this.offsetWidth || 800, s = this.offsetHeight || 400;
        this._camera.aspect = e / s, this._camera.updateProjectionMatrix();
      }
      this._textBoundingSize && this._fitCameraToTextSize(this._textBoundingSize);
    }
  }
  _fitCameraToTextSize(e) {
    if (!this._camera) return;
    const s = this._camera.fov * Math.PI / 180, t = Math.tan(s / 2), i = this._camera.aspect, a = this._cfg.rotateZ * (Math.PI / 180), o = Math.abs(Math.cos(a)), r = Math.abs(Math.sin(a)), h = e.x * o + e.y * r, m = (e.x * r + e.y * o) / 2 / t, _ = h / 2 / (t * i), g = Math.max(m, _) + e.z / 2;
    this._camera.position.set(0, 0, Math.max(g, 0.5)), this._camera.lookAt(0, 0, 0), this._camera.updateMatrixWorld(!0);
  }
  async _updateMesh() {
    if (!this._scene || !this._envMap) return;
    const e = ++this._updateId;
    this._camera && this._camera.fov !== this._cfg.fov && (this._camera.fov = this._cfg.fov, this._camera.updateProjectionMatrix());
    const s = `${this._cfg.fontSize}px`;
    this.style.fontSize !== s && (this.style.fontSize = s);
    try {
      const t = this._cfg.capitalize ? this._cfg.text.toUpperCase() : this._cfg.text, { geometry: i, material: a } = await D({
        text: t,
        fontFamily: this._cfg.font,
        size: 2,
        // fixed internal 3D size — visual scale comes from camera/canvas fitting
        height: this._cfg.depth,
        color: new v(this._cfg.color),
        metalness: this._cfg.metalness,
        roughness: this._cfg.roughness,
        envMap: this._envMap,
        envMapIntensity: this._cfg.envIntensity
      });
      if (e !== this._updateId)
        return;
      this._removeMesh();
      const o = new y();
      let r;
      i instanceof y ? (r = i, r.traverse((_) => {
        _ instanceof d && (_.material = a, _.castShadow = !0);
      })) : (r = new d(i, a), r.castShadow = !0), o.add(r), this._scene.add(o), this._mesh = o;
      const h = new k().setFromObject(o), p = h.getCenter(new f());
      r.position.sub(p);
      const m = h.getSize(new f());
      if (this._textBoundingSize = m, this._autoSize && (this._applyAutoSize(), this._camera)) {
        const _ = this.offsetWidth || 800, g = this.offsetHeight || 400;
        this._camera.aspect = _ / g, this._camera.updateProjectionMatrix();
      }
      this._fitCameraToTextSize(m);
    } catch (t) {
      console.error("[threed-text-wc] mesh update failed:", t);
    }
  }
  _removeMesh() {
    !this._mesh || !this._scene || (this._scene.remove(this._mesh), this._mesh.traverse((e) => {
      var s;
      e instanceof d && ((s = e.geometry) == null || s.dispose(), (Array.isArray(e.material) ? e.material : [e.material]).forEach((i) => i == null ? void 0 : i.dispose()));
    }), this._mesh = null);
  }
  _loop() {
    this._animId = requestAnimationFrame(() => this._loop());
    const e = (performance.now() - this._startTime) / 1e3;
    this._updatePlasma(e), this._mesh && (this._mesh.rotation.x = this._rotation.x, this._mesh.rotation.y = this._rotation.y, this._mesh.rotation.z = this._cfg.rotateZ * (Math.PI / 180)), this._renderer && this._scene && this._camera && this._renderer.render(this._scene, this._camera);
  }
  _setupPlasmaEnvMap() {
    const s = new I(256, 256, {
      minFilter: w,
      magFilter: w
    }), t = M(this._primaryColor, this._secondaryColor), i = new U({
      uniforms: {
        uTime: { value: 0 },
        uZoom: { value: 8 },
        uStop0: { value: t[0] },
        uStop1: { value: t[1] },
        uStop2: { value: t[2] },
        uStop3: { value: t[3] },
        uStop4: { value: t[4] },
        uStopCount: { value: j }
      },
      vertexShader: X,
      fragmentShader: q
    }), a = new S();
    a.add(new d(new G(2, 2), i));
    const o = new Z(-1, 1, 1, -1, 0, 1);
    this._plasmaRt = s, this._plasmaMat = i, this._plasmaScene = a, this._plasmaCamera = o;
    const r = s.texture;
    return r.mapping = W, r;
  }
  _updatePlasma(e) {
    const { _plasmaRt: s, _plasmaMat: t, _plasmaScene: i, _plasmaCamera: a, _renderer: o } = this;
    if (!s || !t || !i || !a || !o) return;
    t.uniforms.uTime.value = e;
    const r = o.getRenderTarget();
    if (o.setRenderTarget(s), o.render(i, a), o.setRenderTarget(r), this._pmremGenerator && this._pmremRt) {
      this._pmremGenerator.fromEquirectangular(s.texture, this._pmremRt);
      const h = o.domElement;
      o.setViewport(0, 0, h.clientWidth || h.width, h.clientHeight || h.height), o.setScissorTest(!1);
    }
  }
  _dispose() {
    var e, s, t, i, a, o, r;
    this._animId !== null && cancelAnimationFrame(this._animId), (e = this._resizeOb) == null || e.disconnect(), (s = this._styleObserver) == null || s.disconnect(), this._removeMesh(), (t = this._plasmaRt) == null || t.dispose(), (i = this._plasmaMat) == null || i.dispose(), (a = this._pmremRt) == null || a.dispose(), (o = this._pmremGenerator) == null || o.dispose(), (r = this._renderer) == null || r.dispose();
  }
}
customElements.get("threed-text") || customElements.define("threed-text", N);
export {
  N as ThreedTextElement
};
