(function(b,v){typeof exports=="object"&&typeof module<"u"?v(exports,require("three"),require("three/examples/jsm/geometries/TextGeometry.js"),require("three/examples/jsm/loaders/FontLoader.js")):typeof define=="function"&&define.amd?define(["exports","three","three/examples/jsm/geometries/TextGeometry.js","three/examples/jsm/loaders/FontLoader.js"],v):(b=typeof globalThis<"u"?globalThis:b||self,v(b.ThreedTextWC={},b.THREE,b.TextGeometry_js,b.FontLoader_js))})(this,function(b,v,y,V){"use strict";var Te=Object.defineProperty;var Ce=(b,v,y)=>v in b?Te(b,v,{enumerable:!0,configurable:!0,writable:!0,value:y}):b[v]=y;var p=(b,v,y)=>Ce(b,typeof v!="symbol"?v+"":v,y);function me(a){const e=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(a){for(const n in a)if(n!=="default"){const s=Object.getOwnPropertyDescriptor(a,n);Object.defineProperty(e,n,s.get?s:{enumerable:!0,get:()=>a[n]})}}return e.default=a,Object.freeze(e)}const i=me(v),ne={},N="droid_sans",K=[{id:"droid_sans",label:"Droid Sans",urls:["https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_regular.typeface.json"]},{id:"inter",label:"Inter (Latin-ext: PL, DE, ES)",urls:[]},{id:"roboto",label:"Roboto (Latin-ext: PL, DE, ES)",urls:[]},{id:"helvetiker",label:"Helvetiker (sans)",urls:["https://threejs.org/examples/fonts/helvetiker_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_regular.typeface.json"]},{id:"helvetiker_bold",label:"Helvetiker Bold",urls:["https://threejs.org/examples/fonts/helvetiker_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_bold.typeface.json"]},{id:"optimer",label:"Optimer (humanist)",urls:["https://threejs.org/examples/fonts/optimer_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_regular.typeface.json"]},{id:"optimer_bold",label:"Optimer Bold",urls:["https://threejs.org/examples/fonts/optimer_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_bold.typeface.json"]},{id:"gentilis",label:"Gentilis (serif)",urls:["https://threejs.org/examples/fonts/gentilis_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_regular.typeface.json"]},{id:"gentilis_bold",label:"Gentilis Bold",urls:["https://threejs.org/examples/fonts/gentilis_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_bold.typeface.json"]},{id:"droid_sans_bold",label:"Droid Sans Bold",urls:["https://threejs.org/examples/fonts/droid/droid_sans_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_bold.typeface.json"]},{id:"droid_serif",label:"Droid Serif",urls:["https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_regular.typeface.json"]},{id:"droid_serif_bold",label:"Droid Serif Bold",urls:["https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_bold.typeface.json"]}],ge={size:2,height:.8,curveSegments:48,bevelEnabled:!0,bevelThickness:.15,bevelSize:.08,bevelOffset:0,bevelSegments:5,metalness:.95,roughness:.15,envMapIntensity:1.5,equalizeLineWidths:!1,equalizationMethod:"fontSize",targetWidth:20,lineSpacing:1};function oe(a){a.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
      if (normal.z < 0.0) normal = normalize(vec3(normal.xy, 1e-4));`)},a.customProgramCacheKey=()=>"text-bevel-normal-clamp"}const j=new Map;function ie(a){const e=[],n=/<b>(.*?)<\/b>/gi;let s=0,t;for(;(t=n.exec(a))!==null;)t.index>s&&e.push({text:a.slice(s,t.index),bold:!1}),t[1]&&e.push({text:t[1],bold:!0}),s=n.lastIndex;return s<a.length&&e.push({text:a.slice(s),bold:!1}),e.filter(r=>r.text.length>0)}function be(a){return a.replace(/<\/?b>/gi,"")}const ve={droid_sans:"droid_sans_bold",helvetiker:"helvetiker_bold",optimer:"optimer_bold",gentilis:"gentilis_bold",droid_serif:"droid_serif_bold"};function _e(a){return ve[a]??a}async function ae(a=N){if(j.has(a))return j.get(a);const e=K.find(s=>s.id===a)??K[0];if(e.id==="roboto"){const s=new V.Font(ne);return j.set(e.id,s),a!==e.id&&j.set(a,s),s}if(e.id==="inter"){const s=new V.Font(ne);return j.set(e.id,s),a!==e.id&&j.set(a,s),s}const n=e.urls;return new Promise((s,t)=>{const r=async l=>{if(l>=n.length){t(new Error(`All URLs failed for font "${a}"`));return}try{const h=await fetch(n[l]);if(!h.ok)throw new Error(`HTTP ${h.status}`);const o=await h.json(),z=new V.Font(o);j.set(a,z),s(z)}catch(h){console.error(`Font "${a}" failed from ${n[l]}:`,h),r(l+1)}};r(0)})}async function xe(a){var r,l,h,o,z,Y,ce,de,he,pe;const e={...ge,...Object.fromEntries(Object.entries(a).filter(([L,F])=>F!==void 0))},n=e.text.split(`
`),s=n.some(L=>/<b>/i.test(L)),t=n.map(be);try{const L=e.fontFamily??N,F=_e(L),[x,U]=await Promise.all([ae(L),s&&F!==L?ae(F).catch(()=>null):Promise.resolve(null)]),G=U??x,T=[],X=t.map(()=>1);for(let c=0;c<t.length;c++){const m=t[c];if(!m.trim()){T.push(0);continue}const g=n[c];if(/<b>/i.test(g)){const u=ie(g);let w=0;for(const _ of u){const E=_.bold?G:x,S=new y.TextGeometry(_.text,{font:E,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});S.computeBoundingBox(),w+=(((r=S.boundingBox)==null?void 0:r.max.x)??0)-(((l=S.boundingBox)==null?void 0:l.min.x)??0),S.dispose()}T.push(w)}else{const u=new y.TextGeometry(m,{font:x,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});u.computeBoundingBox();const w=(((h=u.boundingBox)==null?void 0:h.max.x)??0)-(((o=u.boundingBox)==null?void 0:o.min.x)??0);T.push(w),u.dispose()}}if(e.equalizeLineWidths)for(let c=0;c<T.length;c++){const m=T[c]||1;X[c]=e.targetWidth/m}const R=new i.Group,d=[];for(let c=0;c<t.length;c++){const m=t[c],g=X[c];if(e.equalizationMethod==="fontSize"||!e.equalizeLineWidths){if(!m.trim()){const q=new i.Group,k=e.size*g;d.push({geometry:q,minY:0,maxY:k*.8});continue}if(/<b>/i.test(n[c])){const q=ie(n[c]),k=e.size*g,Q={size:k,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*g,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments},A=[];let B=0;for(const $ of q){const se=$.bold?G:x,D=new y.TextGeometry($.text,{font:se,...Q});D.computeBoundingBox();const P=D.boundingBox,H=P.max.x-P.min.x;A.push({geo:D,width:H,minY:P.min.y,maxY:P.max.y,startX:P.min.x}),B+=H}let ue=-B/2,ee=((z=A[0])==null?void 0:z.minY)??0,te=((Y=A[0])==null?void 0:Y.maxY)??k;const fe=new i.Group;for(const{geo:$,width:se,minY:D,maxY:P,startX:H}of A)$.translate(ue-H,0,0),fe.add(new i.Mesh($)),ue+=se,ee=Math.min(ee,D),te=Math.max(te,P);d.push({geometry:fe,minY:ee,maxY:te});continue}const u=new y.TextGeometry(m,{font:x,size:e.size*g,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*g,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});u.computeBoundingBox();const w=((ce=u.boundingBox)==null?void 0:ce.min.x)??0,_=((de=u.boundingBox)==null?void 0:de.max.x)??0,E=_-w,S=(w+_)/2,J=((he=u.boundingBox)==null?void 0:he.min.y)??0,O=((pe=u.boundingBox)==null?void 0:pe.max.y)??e.size;u.translate(-S,0,0),d.push({geometry:u,minY:J,maxY:O})}else{if(!m.trim()){const O=new i.Group;d.push({geometry:O,minY:0,maxY:e.size*.8});continue}const u=T[c],w=(e.targetWidth-u)/Math.max(1,m.length-1),_=new i.Group;let E=0;for(let O=0;O<m.length;O++){const q=m[O];if(q===" "){const B=new y.TextGeometry(" ",{font:x,size:e.size});B.computeBoundingBox(),E+=B.boundingBox.max.x-B.boundingBox.min.x+w,B.dispose();continue}const k=new y.TextGeometry(q,{font:x,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});k.computeBoundingBox();const Q=k.boundingBox.max.x-k.boundingBox.min.x;k.translate(E,0,0);const A=new i.Mesh(k);_.add(A),E+=Q+w}const S=_.children.length>0?new i.Box3().setFromObject(_):new i.Box3(new i.Vector3(0,0,0),new i.Vector3(0,e.size,0)),J=(S.max.x+S.min.x)/2;_.position.x=-J,d.push({geometry:_,minY:S.min.y,maxY:S.max.y})}}const f=new Array(d.length).fill(0);for(let c=1;c<d.length;c++)f[c]=f[c-1]+d[c-1].minY-e.lineSpacing-d[c].maxY;const M=d.length>0?f[0]+d[0].maxY:0,C=d.length>0?f[d.length-1]+d[d.length-1].minY:0,I=(M+C)/2;for(let c=0;c<d.length;c++){const m=f[c]-I,{geometry:g}=d[c];if(g instanceof i.Group)g.position.y=m,R.add(g);else{g.translate(0,m,0);const u=new i.Mesh(g);R.add(u)}}const Z=e.color||new i.Color().setHSL(Math.random(),.8,.5),W=new i.MeshStandardMaterial({color:Z,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return oe(W),{geometry:R,material:W}}catch(L){console.error("Failed to load font, creating fallback geometry:",L);const F=new i.Group,x=e.size*.8,U=e.size+e.lineSpacing,G=[],T=t.map(()=>1);for(const d of t){let f=0;for(let M=0;M<d.length;M++)d[M]!==" "?f+=x:f+=x*.5;G.push(f)}if(e.equalizeLineWidths){const d=e.targetWidth;for(let f=0;f<G.length;f++){const M=G[f]||1,C=d/M;T[f]=C}}for(let d=0;d<t.length;d++){const f=t[d],M=T[d],C=new i.Group;let I=0;const Z=e.equalizationMethod==="spacing"?x*M:x,W=e.equalizationMethod==="fontSize"?e.size*M:e.size;for(let u=0;u<f.length;u++){if(f[u]===" "){I+=Z*.5;continue}const _=new i.BoxGeometry(W*.6,W,e.height),E=new i.Mesh(_);E.position.x=I,C.add(E),I+=Z}const m=new i.Box3().setFromObject(C).getCenter(new i.Vector3);C.position.x=-m.x;const g=(t.length-1)*U/2-d*U;C.position.y=g,F.add(C)}const X=e.color||new i.Color().setHSL(Math.random(),.8,.5),R=new i.MeshStandardMaterial({color:X,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return oe(R),{geometry:F,material:R}}}const ye=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`,we=4;function re(a,e){return[new i.Vector4(0,0,0,0),new i.Vector4(.33,a.r*.35,a.g*.35,a.b*.35),new i.Vector4(.66,a.r,a.g,a.b),new i.Vector4(1,e.r,e.g,e.b),new i.Vector4(0,0,0,0)]}const Se=`
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
World`,color:"#ff6600",font:N,size:2,depth:.8,metalness:.95,roughness:.15,envIntensity:1.5},Me=`
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
`;function ke(a,e,n){const s=e.filter(t=>t.urls.length>0).map(t=>`<option value="${t.id}"${t.id===a.font?" selected":""}>${t.label}</option>`).join("");return`
    <canvas></canvas>
    <button class="cfg-btn" type="button">⚙ Configure</button>
    <div class="cfg-panel">
      <div class="cfg-header">
        <h3 class="cfg-title">3D Text Config</h3>
        <button class="cfg-close" type="button" title="Close">✕</button>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-text">Text</label>
        <textarea id="cfg-text" rows="3">${a.text.replace(/\n/g,"&#10;")}</textarea>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-font">Font</label>
        <select id="cfg-font">${s}</select>
      </div>

      <div class="field">
        <label class="field-label" for="cfg-color">Color</label>
        <input type="color" id="cfg-color" value="${a.color}">
      </div>

      <div class="field">
        <label class="field-label">Size</label>
        <div class="range-row">
          <input type="range" id="cfg-size" min="0.5" max="6" step="0.1" value="${a.size}">
          <span class="range-val" id="cfg-size-v">${a.size.toFixed(1)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Depth</label>
        <div class="range-row">
          <input type="range" id="cfg-depth" min="0.05" max="3" step="0.05" value="${a.depth}">
          <span class="range-val" id="cfg-depth-v">${a.depth.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Metalness</label>
        <div class="range-row">
          <input type="range" id="cfg-metalness" min="0" max="1" step="0.01" value="${a.metalness}">
          <span class="range-val" id="cfg-metalness-v">${a.metalness.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Roughness</label>
        <div class="range-row">
          <input type="range" id="cfg-roughness" min="0" max="1" step="0.01" value="${a.roughness}">
          <span class="range-val" id="cfg-roughness-v">${a.roughness.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Env-map intensity</label>
        <div class="range-row">
          <input type="range" id="cfg-env" min="0" max="4" step="0.05" value="${a.envIntensity}">
          <span class="range-val" id="cfg-env-v">${a.envIntensity.toFixed(2)}</span>
        </div>
      </div>

      <div class="field">
        <div class="checkbox-row">
          <input type="checkbox" id="cfg-scroll-zoom"${n?" checked":""}>
          <label class="field-label" for="cfg-scroll-zoom" style="margin:0;text-transform:none;font-size:13px;">Scroll to zoom</label>
        </div>
      </div>
    </div>
  `}class le extends HTMLElement{constructor(){super();p(this,"_cfg",{...ze});p(this,"_shadow");p(this,"_canvas");p(this,"_renderer",null);p(this,"_scene",null);p(this,"_camera",null);p(this,"_mesh",null);p(this,"_envMap",null);p(this,"_animId",null);p(this,"_resizeOb",null);p(this,"_updateId",0);p(this,"_debounceTimer",null);p(this,"_rotation",{x:0,y:0});p(this,"_drag",!1);p(this,"_lastMouse",{x:0,y:0});p(this,"_startTime",performance.now());p(this,"_scrollZoom",!0);p(this,"_primaryColor",new i.Color("#ff6600"));p(this,"_secondaryColor",new i.Color("#0066ff"));p(this,"_plasmaRt",null);p(this,"_plasmaMat",null);p(this,"_plasmaScene",null);p(this,"_plasmaCamera",null);this._shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["text","color","font","size","depth","metalness","roughness","env-intensity","show-config","scroll-zoom","primary-color","secondary-color"]}connectedCallback(){this._buildDOM(),this._initScene()}disconnectedCallback(){this._dispose()}attributeChangedCallback(n,s,t){var r,l;if(t!==null){switch(n){case"text":this._cfg.text=t.replace(/\\n/g,`
`);break;case"color":this._cfg.color=t;break;case"font":this._cfg.font=t;break;case"size":this._cfg.size=parseFloat(t);break;case"depth":this._cfg.depth=parseFloat(t);break;case"metalness":this._cfg.metalness=parseFloat(t);break;case"roughness":this._cfg.roughness=parseFloat(t);break;case"env-intensity":this._cfg.envIntensity=parseFloat(t);break;case"scroll-zoom":this._scrollZoom=t!=="false",this._syncScrollZoomCheckbox();return;case"primary-color":this.style.setProperty("--primary-color",t),this._primaryColor.set(t),this._updatePlasmaColors(),this.hasAttribute("color")||(this._cfg.color=t,this._scheduleUpdate());return;case"secondary-color":this.style.setProperty("--secondary-color",t),this._secondaryColor.set(t),this._updatePlasmaColors();return;case"show-config":(l=(r=this._shadow)==null?void 0:r.querySelector(".cfg-panel"))==null||l.classList.toggle("open",t!=="false");return}this._scheduleUpdate()}}get config(){return{...this._cfg}}set config(n){Object.assign(this._cfg,n),this._scheduleUpdate()}_buildDOM(){const n=document.createElement("style");n.textContent=Me;const s=document.createElement("div");for(s.innerHTML=ke(this._cfg,K,this._scrollZoom),this._shadow.appendChild(n);s.firstChild;)this._shadow.appendChild(s.firstChild);this._canvas=this._shadow.querySelector("canvas");const t=this._shadow.querySelector(".cfg-panel");this.hasAttribute("show-config")&&this.getAttribute("show-config")!=="false"&&t.classList.add("open"),this._shadow.querySelector(".cfg-btn").addEventListener("click",()=>t.classList.toggle("open")),this._shadow.querySelector(".cfg-close").addEventListener("click",()=>t.classList.remove("open")),this._bindControl("#cfg-text","input",o=>{this._cfg.text=o}),this._bindControl("#cfg-font","change",o=>{this._cfg.font=o}),this._bindControl("#cfg-color","input",o=>{this._cfg.color=o}),this._bindRange("#cfg-size","#cfg-size-v",o=>{this._cfg.size=o}),this._bindRange("#cfg-depth","#cfg-depth-v",o=>{this._cfg.depth=o}),this._bindRange("#cfg-metalness","#cfg-metalness-v",o=>{this._cfg.metalness=o}),this._bindRange("#cfg-roughness","#cfg-roughness-v",o=>{this._cfg.roughness=o}),this._bindRange("#cfg-env","#cfg-env-v",o=>{this._cfg.envIntensity=o}),this._canvas.addEventListener("mousedown",o=>{this._drag=!0,this._lastMouse={x:o.clientX,y:o.clientY}}),window.addEventListener("mousemove",o=>{this._drag&&(this._rotation.y+=(o.clientX-this._lastMouse.x)*.01,this._rotation.x+=(o.clientY-this._lastMouse.y)*.01,this._lastMouse={x:o.clientX,y:o.clientY})}),window.addEventListener("mouseup",()=>{this._drag=!1}),this._canvas.addEventListener("wheel",o=>{const z=o.ctrlKey;if(!this._scrollZoom&&!z||(o.preventDefault(),!this._camera))return;const Y=Math.pow(1.001,o.deltaY*(o.deltaMode===1?40:o.deltaMode===2?800:1));this._camera.position.z=Math.max(2,Math.min(80,this._camera.position.z*Y))},{passive:!1});let l=0;this._canvas.addEventListener("touchstart",o=>{o.touches.length===2&&(l=Math.hypot(o.touches[0].clientX-o.touches[1].clientX,o.touches[0].clientY-o.touches[1].clientY))},{passive:!0}),this._canvas.addEventListener("touchmove",o=>{if(o.touches.length!==2||!this._camera)return;o.preventDefault();const z=Math.hypot(o.touches[0].clientX-o.touches[1].clientX,o.touches[0].clientY-o.touches[1].clientY);if(l>0){const Y=l/z;this._camera.position.z=Math.max(2,Math.min(80,this._camera.position.z*Y))}l=z},{passive:!1}),this._canvas.addEventListener("touchend",()=>{l=0},{passive:!0});const h=this._shadow.querySelector("#cfg-scroll-zoom");h==null||h.addEventListener("change",()=>{this._scrollZoom=h.checked})}_bindControl(n,s,t){const r=this._shadow.querySelector(n);r&&r.addEventListener(s,()=>{t(r.value),this._scheduleUpdate(),this._dispatchChange()})}_bindRange(n,s,t){const r=this._shadow.querySelector(n),l=this._shadow.querySelector(s);r&&r.addEventListener("input",()=>{const h=parseFloat(r.value);t(h),l&&(l.textContent=h.toFixed(r.step.includes(".0")?1:2)),this._scheduleUpdate(),this._dispatchChange()})}_updatePlasmaColors(){if(!this._plasmaMat)return;const n=re(this._primaryColor,this._secondaryColor),s=this._plasmaMat.uniforms;s.uStop0.value=n[0],s.uStop1.value=n[1],s.uStop2.value=n[2],s.uStop3.value=n[3],s.uStop4.value=n[4]}_syncScrollZoomCheckbox(){var s;const n=(s=this._shadow)==null?void 0:s.querySelector("#cfg-scroll-zoom");n&&(n.checked=this._scrollZoom)}_scheduleUpdate(){this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>this._updateMesh(),60)}_dispatchChange(){this.dispatchEvent(new CustomEvent("config-change",{detail:{...this._cfg},bubbles:!0,composed:!0}))}_initScene(){const n=this._canvas,s=new i.WebGLRenderer({canvas:n,antialias:!0});s.toneMapping=i.ACESFilmicToneMapping,s.toneMappingExposure=1,this._renderer=s;const t=new i.Scene;t.background=new i.Color(1710618),this._scene=t;const r=new i.PerspectiveCamera(75,1,.1,1e4);r.position.z=15,this._camera=r,t.add(new i.AmbientLight(16777215,.5));const l=new i.DirectionalLight(16777215,1);l.position.set(10,10,10),t.add(l);const h=new i.PointLight(16711935,1);h.position.set(-8,5,8),t.add(h);const o=new i.PointLight(65535,.8);o.position.set(8,-5,8),t.add(o),this._envMap=this._setupPlasmaEnvMap(),this._envMap&&(t.environment=this._envMap),this._resizeOb=new ResizeObserver(()=>this._resize()),this._resizeOb.observe(this),this._resize(),this._updateMesh(),this._loop()}_resize(){var t,r;const n=this.offsetWidth||800,s=this.offsetHeight||400;(t=this._renderer)==null||t.setSize(n,s,!1),(r=this._renderer)==null||r.setPixelRatio(window.devicePixelRatio),this._camera&&(this._camera.aspect=n/s,this._camera.updateProjectionMatrix())}async _updateMesh(){if(!this._scene||!this._envMap)return;const n=++this._updateId;try{const{geometry:s,material:t}=await xe({text:this._cfg.text,fontFamily:this._cfg.font,size:this._cfg.size,height:this._cfg.depth,color:new i.Color(this._cfg.color),metalness:this._cfg.metalness,roughness:this._cfg.roughness,envMap:this._envMap,envMapIntensity:this._cfg.envIntensity});if(n!==this._updateId)return;this._removeMesh();let r;s instanceof i.Group?(r=s,r.traverse(l=>{l instanceof i.Mesh&&(l.material=t,l.castShadow=!0)})):(r=new i.Mesh(s,t),r.castShadow=!0),this._scene.add(r),this._mesh=r}catch(s){console.error("[threed-text-wc] mesh update failed:",s)}}_removeMesh(){!this._mesh||!this._scene||(this._scene.remove(this._mesh),this._mesh.traverse(n=>{var s;n instanceof i.Mesh&&((s=n.geometry)==null||s.dispose(),(Array.isArray(n.material)?n.material:[n.material]).forEach(r=>r==null?void 0:r.dispose()))}),this._mesh=null)}_loop(){this._animId=requestAnimationFrame(()=>this._loop());const n=(performance.now()-this._startTime)/1e3;this._updatePlasma(n),this._mesh&&(this._mesh.rotation.x=this._rotation.x,this._mesh.rotation.y=this._rotation.y),this._renderer&&this._scene&&this._camera&&this._renderer.render(this._scene,this._camera)}_setupPlasmaEnvMap(){const s=new i.WebGLRenderTarget(256,256,{minFilter:i.LinearFilter,magFilter:i.LinearFilter}),t=re(this._primaryColor,this._secondaryColor),r=new i.ShaderMaterial({uniforms:{uTime:{value:0},uZoom:{value:8},uStop0:{value:t[0]},uStop1:{value:t[1]},uStop2:{value:t[2]},uStop3:{value:t[3]},uStop4:{value:t[4]},uStopCount:{value:we}},vertexShader:ye,fragmentShader:Se}),l=new i.Scene;l.add(new i.Mesh(new i.PlaneGeometry(2,2),r));const h=new i.OrthographicCamera(-1,1,1,-1,0,1);this._plasmaRt=s,this._plasmaMat=r,this._plasmaScene=l,this._plasmaCamera=h;const o=s.texture;return o.mapping=i.EquirectangularReflectionMapping,o}_updatePlasma(n){const{_plasmaRt:s,_plasmaMat:t,_plasmaScene:r,_plasmaCamera:l,_renderer:h}=this;if(!s||!t||!r||!l||!h)return;t.uniforms.uTime.value=n;const o=h.getRenderTarget();h.setRenderTarget(s),h.render(r,l),h.setRenderTarget(o)}_dispose(){var n,s,t,r;this._animId!==null&&cancelAnimationFrame(this._animId),(n=this._resizeOb)==null||n.disconnect(),this._removeMesh(),(s=this._plasmaRt)==null||s.dispose(),(t=this._plasmaMat)==null||t.dispose(),(r=this._renderer)==null||r.dispose()}}customElements.get("threed-text")||customElements.define("threed-text",le),b.ThreedTextElement=le,Object.defineProperty(b,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=threed-text.umd.js.map
