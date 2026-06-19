(function(v,x){typeof exports=="object"&&typeof module<"u"?x(exports,require("three"),require("three/examples/jsm/geometries/TextGeometry.js"),require("three/examples/jsm/loaders/FontLoader.js")):typeof define=="function"&&define.amd?define(["exports","three","three/examples/jsm/geometries/TextGeometry.js","three/examples/jsm/loaders/FontLoader.js"],x):(v=typeof globalThis<"u"?globalThis:v||self,x(v.ThreedTextWC={},v.THREE,v.TextGeometry_js,v.FontLoader_js))})(this,function(v,x,z,Q){"use strict";var Ee=Object.defineProperty;var Le=(v,x,z)=>x in v?Ee(v,x,{enumerable:!0,configurable:!0,writable:!0,value:z}):v[x]=z;var d=(v,x,z)=>Le(v,typeof x!="symbol"?x+"":x,z);function fe(r){const e=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const n in r)if(n!=="default"){const s=Object.getOwnPropertyDescriptor(r,n);Object.defineProperty(e,n,s.get?s:{enumerable:!0,get:()=>r[n]})}}return e.default=r,Object.freeze(e)}const i=fe(x),re={},ee="droid_sans",te=[{id:"droid_sans",label:"Droid Sans",urls:["https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_regular.typeface.json"]},{id:"inter",label:"Inter (Latin-ext: PL, DE, ES)",urls:[]},{id:"roboto",label:"Roboto (Latin-ext: PL, DE, ES)",urls:[]},{id:"helvetiker",label:"Helvetiker (sans)",urls:["https://threejs.org/examples/fonts/helvetiker_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_regular.typeface.json"]},{id:"helvetiker_bold",label:"Helvetiker Bold",urls:["https://threejs.org/examples/fonts/helvetiker_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_bold.typeface.json"]},{id:"optimer",label:"Optimer (humanist)",urls:["https://threejs.org/examples/fonts/optimer_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_regular.typeface.json"]},{id:"optimer_bold",label:"Optimer Bold",urls:["https://threejs.org/examples/fonts/optimer_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_bold.typeface.json"]},{id:"gentilis",label:"Gentilis (serif)",urls:["https://threejs.org/examples/fonts/gentilis_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_regular.typeface.json"]},{id:"gentilis_bold",label:"Gentilis Bold",urls:["https://threejs.org/examples/fonts/gentilis_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_bold.typeface.json"]},{id:"droid_sans_bold",label:"Droid Sans Bold",urls:["https://threejs.org/examples/fonts/droid/droid_sans_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_bold.typeface.json"]},{id:"droid_serif",label:"Droid Serif",urls:["https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_regular.typeface.json"]},{id:"droid_serif_bold",label:"Droid Serif Bold",urls:["https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_bold.typeface.json"]}],ge={size:2,height:.8,curveSegments:48,bevelEnabled:!0,bevelThickness:.15,bevelSize:.08,bevelOffset:0,bevelSegments:5,metalness:.95,roughness:.15,envMapIntensity:1.5,equalizeLineWidths:!1,equalizationMethod:"fontSize",targetWidth:20,lineSpacing:1};function le(r){r.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
      if (normal.z < 0.0) normal = normalize(vec3(normal.xy, 1e-4));`)},r.customProgramCacheKey=()=>"text-bevel-normal-clamp"}const O=new Map;function ce(r){const e=[],n=/<b>(.*?)<\/b>/gi;let s=0,t;for(;(t=n.exec(r))!==null;)t.index>s&&e.push({text:r.slice(s,t.index),bold:!1}),t[1]&&e.push({text:t[1],bold:!0}),s=n.lastIndex;return s<r.length&&e.push({text:r.slice(s),bold:!1}),e.filter(a=>a.text.length>0)}function _e(r){return r.replace(/<\/?b>/gi,"")}const ve={droid_sans:"droid_sans_bold",helvetiker:"helvetiker_bold",optimer:"optimer_bold",gentilis:"gentilis_bold",droid_serif:"droid_serif_bold"};function be(r){return ve[r]??r}async function he(r=ee){if(O.has(r))return O.get(r);const e=te.find(s=>s.id===r)??te[0];if(e.id==="roboto"){const s=new Q.Font(re);return O.set(e.id,s),r!==e.id&&O.set(r,s),s}if(e.id==="inter"){const s=new Q.Font(re);return O.set(e.id,s),r!==e.id&&O.set(r,s),s}const n=e.urls;return new Promise((s,t)=>{const a=async l=>{if(l>=n.length){t(new Error(`All URLs failed for font "${r}"`));return}try{const c=await fetch(n[l]);if(!c.ok)throw new Error(`HTTP ${c.status}`);const u=await c.json(),b=new Q.Font(u);O.set(r,b),s(b)}catch(c){console.error(`Font "${r}" failed from ${n[l]}:`,c),a(l+1)}};a(0)})}async function xe(r){var a,l,c,u,b,y,T,o,E,q;const e={...ge,...Object.fromEntries(Object.entries(r).filter(([j,G])=>G!==void 0))},n=e.text.split(`
`),s=n.some(j=>/<b>/i.test(j)),t=n.map(_e);try{const j=e.fontFamily??ee,G=be(j),[w,Z]=await Promise.all([he(j),s&&G!==j?he(G).catch(()=>null):Promise.resolve(null)]),W=Z??w,F=[],N=t.map(()=>1);for(let h=0;h<t.length;h++){const g=t[h];if(!g.trim()){F.push(0);continue}const _=n[h];if(/<b>/i.test(_)){const m=ce(_);let M=0;for(const S of m){const B=S.bold?W:w,C=new z.TextGeometry(S.text,{font:B,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});C.computeBoundingBox(),M+=(((a=C.boundingBox)==null?void 0:a.max.x)??0)-(((l=C.boundingBox)==null?void 0:l.min.x)??0),C.dispose()}F.push(M)}else{const m=new z.TextGeometry(g,{font:w,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});m.computeBoundingBox();const M=(((c=m.boundingBox)==null?void 0:c.max.x)??0)-(((u=m.boundingBox)==null?void 0:u.min.x)??0);F.push(M),m.dispose()}}if(e.equalizeLineWidths)for(let h=0;h<F.length;h++){const g=F[h]||1;N[h]=e.targetWidth/g}const I=new i.Group,p=[];for(let h=0;h<t.length;h++){const g=t[h],_=N[h];if(e.equalizationMethod==="fontSize"||!e.equalizeLineWidths){if(!g.trim()){const D=new i.Group,k=e.size*_;p.push({geometry:D,minY:0,maxY:k*.8});continue}if(/<b>/i.test(n[h])){const D=ce(n[h]),k=e.size*_,ne={size:k,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*_,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments},$=[];let R=0;for(const V of D){const ae=V.bold?W:w,H=new z.TextGeometry(V.text,{font:ae,...ne});H.computeBoundingBox();const Y=H.boundingBox,J=Y.max.x-Y.min.x;$.push({geo:H,width:J,minY:Y.min.y,maxY:Y.max.y,startX:Y.min.x}),R+=J}let ue=-R/2,ie=((b=$[0])==null?void 0:b.minY)??0,oe=((y=$[0])==null?void 0:y.maxY)??k;const me=new i.Group;for(const{geo:V,width:ae,minY:H,maxY:Y,startX:J}of $)V.translate(ue-J,0,0),me.add(new i.Mesh(V)),ue+=ae,ie=Math.min(ie,H),oe=Math.max(oe,Y);p.push({geometry:me,minY:ie,maxY:oe});continue}const m=new z.TextGeometry(g,{font:w,size:e.size*_,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*_,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});m.computeBoundingBox();const M=((T=m.boundingBox)==null?void 0:T.min.x)??0,S=((o=m.boundingBox)==null?void 0:o.max.x)??0,B=S-M,C=(M+S)/2,se=((E=m.boundingBox)==null?void 0:E.min.y)??0,A=((q=m.boundingBox)==null?void 0:q.max.y)??e.size;m.translate(-C,0,0),p.push({geometry:m,minY:se,maxY:A})}else{if(!g.trim()){const A=new i.Group;p.push({geometry:A,minY:0,maxY:e.size*.8});continue}const m=F[h],M=(e.targetWidth-m)/Math.max(1,g.length-1),S=new i.Group;let B=0;for(let A=0;A<g.length;A++){const D=g[A];if(D===" "){const R=new z.TextGeometry(" ",{font:w,size:e.size});R.computeBoundingBox(),B+=R.boundingBox.max.x-R.boundingBox.min.x+M,R.dispose();continue}const k=new z.TextGeometry(D,{font:w,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});k.computeBoundingBox();const ne=k.boundingBox.max.x-k.boundingBox.min.x;k.translate(B,0,0);const $=new i.Mesh(k);S.add($),B+=ne+M}const C=S.children.length>0?new i.Box3().setFromObject(S):new i.Box3(new i.Vector3(0,0,0),new i.Vector3(0,e.size,0)),se=(C.max.x+C.min.x)/2;S.position.x=-se,p.push({geometry:S,minY:C.min.y,maxY:C.max.y})}}const f=new Array(p.length).fill(0);for(let h=1;h<p.length;h++)f[h]=f[h-1]+p[h-1].minY-e.lineSpacing-p[h].maxY;const L=p.length>0?f[0]+p[0].maxY:0,P=p.length>0?f[p.length-1]+p[p.length-1].minY:0,U=(L+P)/2;for(let h=0;h<p.length;h++){const g=f[h]-U,{geometry:_}=p[h];if(_ instanceof i.Group)_.position.y=g,I.add(_);else{_.translate(0,g,0);const m=new i.Mesh(_);I.add(m)}}const K=e.color||new i.Color().setHSL(Math.random(),.8,.5),X=new i.MeshStandardMaterial({color:K,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return le(X),{geometry:I,material:X}}catch(j){console.error("Failed to load font, creating fallback geometry:",j);const G=new i.Group,w=e.size*.8,Z=e.size+e.lineSpacing,W=[],F=t.map(()=>1);for(const p of t){let f=0;for(let L=0;L<p.length;L++)p[L]!==" "?f+=w:f+=w*.5;W.push(f)}if(e.equalizeLineWidths){const p=e.targetWidth;for(let f=0;f<W.length;f++){const L=W[f]||1,P=p/L;F[f]=P}}for(let p=0;p<t.length;p++){const f=t[p],L=F[p],P=new i.Group;let U=0;const K=e.equalizationMethod==="spacing"?w*L:w,X=e.equalizationMethod==="fontSize"?e.size*L:e.size;for(let m=0;m<f.length;m++){if(f[m]===" "){U+=K*.5;continue}const S=new i.BoxGeometry(X*.6,X,e.height),B=new i.Mesh(S);B.position.x=U,P.add(B),U+=K}const g=new i.Box3().setFromObject(P).getCenter(new i.Vector3);P.position.x=-g.x;const _=(t.length-1)*Z/2-p*Z;P.position.y=_,G.add(P)}const N=e.color||new i.Color().setHSL(Math.random(),.8,.5),I=new i.MeshStandardMaterial({color:N,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return le(I),{geometry:G,material:I}}}const ye=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`,Se=4;function de(r,e){return[new i.Vector4(0,0,0,0),new i.Vector4(.33,r.r*.35,r.g*.35,r.b*.35),new i.Vector4(.66,r.r,r.g,r.b),new i.Vector4(1,e.r,e.g,e.b),new i.Vector4(0,0,0,0)]}const we=`
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
`,ze={text:`Hello
World`,color:"#ff6600",font:ee,size:2,depth:.8,metalness:.95,roughness:.15,envIntensity:1.5},Me=new i.Plane(new i.Vector3(0,0,1),0),Ce=`
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
    width: 100%;
    height: 100%;
  }
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
`;function Te(r,e){const n=e.filter(s=>s.urls.length>0).map(s=>`<option value="${s.id}"${s.id===r.font?" selected":""}>${s.label}</option>`).join("");return`
    <canvas></canvas>
    <div class="cfg-panel">
      <div class="cfg-header">
        <h3 class="cfg-title">3D Text Config</h3>
        <button class="cfg-close" type="button" title="Close">✕</button>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-text">Text</label>
        <textarea id="cfg-text" rows="3">${r.text.replace(/\n/g,"&#10;")}</textarea>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-font">Font</label>
        <select id="cfg-font">${n}</select>
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

      <div class="field">
        <label class="field-label">Font size</label>
        <div class="range-row">
          <input type="range" id="cfg-font-size" min="20" max="600" step="10" value="120">
          <span class="range-val" id="cfg-font-size-v">120px</span>
        </div>
      </div>

    </div>
  `}class pe extends HTMLElement{constructor(){super();d(this,"_cfg",{...ze});d(this,"_shadow");d(this,"_canvas");d(this,"_renderer",null);d(this,"_scene",null);d(this,"_camera",null);d(this,"_mesh",null);d(this,"_envMap",null);d(this,"_animId",null);d(this,"_resizeOb",null);d(this,"_updateId",0);d(this,"_debounceTimer",null);d(this,"_rotation",{x:0,y:0});d(this,"_drag",!1);d(this,"_lastMouse",{x:0,y:0});d(this,"_startTime",performance.now());d(this,"_scrollZoom",!1);d(this,"_autoSize",!0);d(this,"_textBoundingSize",null);d(this,"_styleObserver",null);d(this,"_primaryColor",new i.Color("#ff6600"));d(this,"_secondaryColor",new i.Color("#0066ff"));d(this,"_plasmaRt",null);d(this,"_plasmaMat",null);d(this,"_plasmaScene",null);d(this,"_plasmaCamera",null);d(this,"_pmremGenerator",null);d(this,"_pmremRt",null);this._shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["text","color","font","size","depth","metalness","roughness","env-intensity","show-config","scroll-zoom","primary-color","secondary-color","auto-size"]}connectedCallback(){this._buildDOM(),this._initScene()}disconnectedCallback(){this._dispose()}attributeChangedCallback(n,s,t){var a,l;if(t!==null){switch(n){case"text":this._cfg.text=t.replace(/\\n/g,`
`);break;case"color":this._cfg.color=t;break;case"font":this._cfg.font=t;break;case"size":this._cfg.size=parseFloat(t);break;case"depth":this._cfg.depth=parseFloat(t);break;case"metalness":this._cfg.metalness=parseFloat(t);break;case"roughness":this._cfg.roughness=parseFloat(t);break;case"env-intensity":this._cfg.envIntensity=parseFloat(t);break;case"scroll-zoom":this._scrollZoom=t!=="false";return;case"auto-size":this._autoSize=t!=="false",this._autoSize&&this._textBoundingSize&&(this._applyAutoSize(),this._fitCameraToTextSize(this._textBoundingSize));return;case"primary-color":this.style.setProperty("--primary-color",t),this._primaryColor.set(t),this._updatePlasmaColors(),this.hasAttribute("color")||(this._cfg.color=t,this._scheduleUpdate());return;case"secondary-color":this.style.setProperty("--secondary-color",t),this._secondaryColor.set(t),this._updatePlasmaColors();return;case"show-config":(l=(a=this._shadow)==null?void 0:a.querySelector(".cfg-panel"))==null||l.classList.toggle("open",t!=="false");return}this._scheduleUpdate()}}get config(){return{...this._cfg}}set config(n){Object.assign(this._cfg,n),this._scheduleUpdate()}_buildDOM(){const n=document.createElement("style");n.textContent=Ce;const s=document.createElement("div");for(s.innerHTML=Te(this._cfg,te),this._shadow.appendChild(n);s.firstChild;)this._shadow.appendChild(s.firstChild);this._canvas=this._shadow.querySelector("canvas");const t=this._shadow.querySelector(".cfg-panel");this.hasAttribute("show-config")&&this.getAttribute("show-config")!=="false"&&t.classList.add("open");const l=()=>t.classList.add("open");this._canvas.addEventListener("contextmenu",o=>{o.preventDefault(),l()});let c=null;this._canvas.addEventListener("touchstart",o=>{o.touches.length===1&&(c=setTimeout(()=>{c=null,l()},500))},{passive:!0});const u=()=>{c!==null&&(clearTimeout(c),c=null)};this._canvas.addEventListener("touchend",u,{passive:!0}),this._canvas.addEventListener("touchcancel",u,{passive:!0}),this._canvas.addEventListener("touchmove",u,{passive:!0}),this._shadow.querySelector(".cfg-close").addEventListener("click",()=>t.classList.remove("open")),this._bindControl("#cfg-text","input",o=>{this._cfg.text=o}),this._bindControl("#cfg-font","change",o=>{this._cfg.font=o}),this._bindControl("#cfg-color","input",o=>{this._cfg.color=o}),this._bindRange("#cfg-depth","#cfg-depth-v",o=>{this._cfg.depth=o}),this._bindRange("#cfg-metalness","#cfg-metalness-v",o=>{this._cfg.metalness=o}),this._bindRange("#cfg-roughness","#cfg-roughness-v",o=>{this._cfg.roughness=o}),this._bindRange("#cfg-env","#cfg-env-v",o=>{this._cfg.envIntensity=o});const b=this._shadow.querySelector("#cfg-font-size"),y=this._shadow.querySelector("#cfg-font-size-v");if(b){const o=Math.round(parseFloat(getComputedStyle(this).fontSize)||120);b.value=String(o),y&&(y.textContent=`${o}px`),b.addEventListener("input",()=>{const E=parseInt(b.value);y&&(y.textContent=`${E}px`),this.style.fontSize=`${E}px`})}this._styleObserver=new MutationObserver(()=>this._onFontSizeChange()),this._styleObserver.observe(this,{attributes:!0,attributeFilter:["style","class"]}),this._canvas.addEventListener("mousedown",o=>{this._drag=!0,this._lastMouse={x:o.clientX,y:o.clientY}}),window.addEventListener("mousemove",o=>{this._drag&&(this._rotation.y+=(o.clientX-this._lastMouse.x)*.01,this._rotation.x+=(o.clientY-this._lastMouse.y)*.01,this._lastMouse={x:o.clientX,y:o.clientY})}),window.addEventListener("mouseup",()=>{this._drag=!1}),this._canvas.addEventListener("wheel",o=>{const E=o.ctrlKey;if(!this._scrollZoom&&!E||(o.preventDefault(),!this._camera))return;const q=Math.pow(1.001,o.deltaY*(o.deltaMode===1?40:o.deltaMode===2?800:1));this._zoomCameraAtClientPoint(o.clientX,o.clientY,q)},{passive:!1});let T=0;this._canvas.addEventListener("touchstart",o=>{o.touches.length===2&&(T=Math.hypot(o.touches[0].clientX-o.touches[1].clientX,o.touches[0].clientY-o.touches[1].clientY))},{passive:!0}),this._canvas.addEventListener("touchmove",o=>{if(o.touches.length!==2||!this._camera)return;o.preventDefault();const E=Math.hypot(o.touches[0].clientX-o.touches[1].clientX,o.touches[0].clientY-o.touches[1].clientY);if(T>0){const q=T/E;this._zoomCameraAtClientPoint((o.touches[0].clientX+o.touches[1].clientX)/2,(o.touches[0].clientY+o.touches[1].clientY)/2,q)}T=E},{passive:!1}),this._canvas.addEventListener("touchend",()=>{T=0},{passive:!0})}_zoomCameraAtClientPoint(n,s,t){if(!this._camera)return;const a=this._worldPointAtClientPoint(n,s),l=Math.max(2,Math.min(80,this._camera.position.z*t));if(l===this._camera.position.z)return;this._camera.position.z=l;const c=this._worldPointAtClientPoint(n,s);!a||!c||(this._camera.position.x+=a.x-c.x,this._camera.position.y+=a.y-c.y,this._camera.updateMatrixWorld(!0))}_worldPointAtClientPoint(n,s){if(!this._camera||!this._canvas)return null;const t=this._canvas.getBoundingClientRect();if(t.width<=0||t.height<=0)return null;const a=new i.Vector2((n-t.left)/t.width*2-1,-((s-t.top)/t.height)*2+1),l=new i.Raycaster,c=new i.Vector3;return this._camera.updateMatrixWorld(!0),l.setFromCamera(a,this._camera),l.ray.intersectPlane(Me,c)}_bindControl(n,s,t){const a=this._shadow.querySelector(n);a&&a.addEventListener(s,()=>{t(a.value),this._scheduleUpdate(),this._dispatchChange()})}_bindRange(n,s,t){const a=this._shadow.querySelector(n),l=this._shadow.querySelector(s);a&&a.addEventListener("input",()=>{const c=parseFloat(a.value);t(c),l&&(l.textContent=c.toFixed(a.step.includes(".0")?1:2)),this._scheduleUpdate(),this._dispatchChange()})}_updatePlasmaColors(){if(!this._plasmaMat)return;const n=de(this._primaryColor,this._secondaryColor),s=this._plasmaMat.uniforms;s.uStop0.value=n[0],s.uStop1.value=n[1],s.uStop2.value=n[2],s.uStop3.value=n[3],s.uStop4.value=n[4]}_scheduleUpdate(){this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>this._updateMesh(),60)}_dispatchChange(){this.dispatchEvent(new CustomEvent("config-change",{detail:{...this._cfg},bubbles:!0,composed:!0}))}_initScene(){const n=this._canvas,s=new i.WebGLRenderer({canvas:n,antialias:!0,alpha:!0});s.toneMapping=i.ACESFilmicToneMapping,s.toneMappingExposure=1,this._renderer=s;const t=new i.Scene;this._scene=t;const a=new i.PerspectiveCamera(75,1,.1,1e4);a.position.z=15,this._camera=a,t.add(new i.AmbientLight(16777215,.5));const l=new i.DirectionalLight(16777215,1);l.position.set(10,10,10),t.add(l);const c=new i.PointLight(16711935,1);c.position.set(-8,5,8),t.add(c);const u=new i.PointLight(65535,.8);u.position.set(8,-5,8),t.add(u);const b=this._setupPlasmaEnvMap();this._updatePlasma(0),this._pmremGenerator=new i.PMREMGenerator(s),this._pmremGenerator.compileEquirectangularShader(),this._pmremRt=this._pmremGenerator.fromEquirectangular(b),this._envMap=this._pmremRt.texture,t.environment=this._envMap,this._resizeOb=new ResizeObserver(()=>this._resize()),this._resizeOb.observe(this),this._resize(),this._updateMesh(),this._loop()}_resize(){var t,a;const n=this.offsetWidth||800,s=this.offsetHeight||400;(t=this._renderer)==null||t.setSize(n,s,!1),(a=this._renderer)==null||a.setPixelRatio(window.devicePixelRatio),this._camera&&(this._camera.aspect=n/s,this._camera.updateProjectionMatrix())}_applyAutoSize(){if(!this._textBoundingSize||!this._autoSize)return;const n=parseFloat(getComputedStyle(this).fontSize)||16,s=this._textBoundingSize.x/Math.max(this._textBoundingSize.y,.001),t=Math.max(Math.round(n*1.25),80),a=Math.round(t*s);Math.abs(this.offsetHeight-t)>1&&(this.style.height=`${t}px`),Math.abs(this.offsetWidth-a)>1&&(this.style.width=`${a}px`)}_onFontSizeChange(){if(!(!this._autoSize||!this._textBoundingSize)){if(this._applyAutoSize(),this._camera){const n=this.offsetWidth||800,s=this.offsetHeight||400;this._camera.aspect=n/s,this._camera.updateProjectionMatrix()}this._textBoundingSize&&this._fitCameraToTextSize(this._textBoundingSize)}}_fitCameraToTextSize(n){if(!this._camera)return;const s=this._camera.fov*Math.PI/180,t=Math.tan(s/2),a=this._camera.aspect,l=n.y/2/t,c=n.x/2/(t*a),u=Math.max(l,c)*1.25+n.z/2;this._camera.position.set(0,0,Math.max(u,2)),this._camera.lookAt(0,0,0),this._camera.updateMatrixWorld(!0)}async _updateMesh(){if(!this._scene||!this._envMap)return;const n=++this._updateId;try{const{geometry:s,material:t}=await xe({text:this._cfg.text,fontFamily:this._cfg.font,size:this._cfg.size,height:this._cfg.depth,color:new i.Color(this._cfg.color),metalness:this._cfg.metalness,roughness:this._cfg.roughness,envMap:this._envMap,envMapIntensity:this._cfg.envIntensity});if(n!==this._updateId)return;this._removeMesh();const a=new i.Group;let l;s instanceof i.Group?(l=s,l.traverse(y=>{y instanceof i.Mesh&&(y.material=t,y.castShadow=!0)})):(l=new i.Mesh(s,t),l.castShadow=!0),a.add(l),this._scene.add(a),this._mesh=a;const c=new i.Box3().setFromObject(a),u=c.getCenter(new i.Vector3);l.position.sub(u);const b=c.getSize(new i.Vector3);if(this._textBoundingSize=b,this._autoSize&&(this._applyAutoSize(),this._camera)){const y=this.offsetWidth||800,T=this.offsetHeight||400;this._camera.aspect=y/T,this._camera.updateProjectionMatrix()}this._fitCameraToTextSize(b)}catch(s){console.error("[threed-text-wc] mesh update failed:",s)}}_removeMesh(){!this._mesh||!this._scene||(this._scene.remove(this._mesh),this._mesh.traverse(n=>{var s;n instanceof i.Mesh&&((s=n.geometry)==null||s.dispose(),(Array.isArray(n.material)?n.material:[n.material]).forEach(a=>a==null?void 0:a.dispose()))}),this._mesh=null)}_loop(){this._animId=requestAnimationFrame(()=>this._loop());const n=(performance.now()-this._startTime)/1e3;this._updatePlasma(n),this._mesh&&(this._mesh.rotation.x=this._rotation.x,this._mesh.rotation.y=this._rotation.y),this._renderer&&this._scene&&this._camera&&this._renderer.render(this._scene,this._camera)}_setupPlasmaEnvMap(){const s=new i.WebGLRenderTarget(256,256,{minFilter:i.LinearFilter,magFilter:i.LinearFilter}),t=de(this._primaryColor,this._secondaryColor),a=new i.ShaderMaterial({uniforms:{uTime:{value:0},uZoom:{value:8},uStop0:{value:t[0]},uStop1:{value:t[1]},uStop2:{value:t[2]},uStop3:{value:t[3]},uStop4:{value:t[4]},uStopCount:{value:Se}},vertexShader:ye,fragmentShader:we}),l=new i.Scene;l.add(new i.Mesh(new i.PlaneGeometry(2,2),a));const c=new i.OrthographicCamera(-1,1,1,-1,0,1);this._plasmaRt=s,this._plasmaMat=a,this._plasmaScene=l,this._plasmaCamera=c;const u=s.texture;return u.mapping=i.EquirectangularReflectionMapping,u}_updatePlasma(n){const{_plasmaRt:s,_plasmaMat:t,_plasmaScene:a,_plasmaCamera:l,_renderer:c}=this;if(!s||!t||!a||!l||!c)return;t.uniforms.uTime.value=n;const u=c.getRenderTarget();c.setRenderTarget(s),c.render(a,l),c.setRenderTarget(u),this._pmremGenerator&&this._pmremRt&&this._pmremGenerator.fromEquirectangular(s.texture,this._pmremRt)}_dispose(){var n,s,t,a,l,c,u;this._animId!==null&&cancelAnimationFrame(this._animId),(n=this._resizeOb)==null||n.disconnect(),(s=this._styleObserver)==null||s.disconnect(),this._removeMesh(),(t=this._plasmaRt)==null||t.dispose(),(a=this._plasmaMat)==null||a.dispose(),(l=this._pmremRt)==null||l.dispose(),(c=this._pmremGenerator)==null||c.dispose(),(u=this._renderer)==null||u.dispose()}}customElements.get("threed-text")||customElements.define("threed-text",pe),v.ThreedTextElement=pe,Object.defineProperty(v,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=threed-text.umd.js.map
