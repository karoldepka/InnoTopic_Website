(function(_,b){typeof exports=="object"&&typeof module<"u"?b(exports,require("three"),require("three/examples/jsm/geometries/TextGeometry.js"),require("three/examples/jsm/loaders/FontLoader.js")):typeof define=="function"&&define.amd?define(["exports","three","three/examples/jsm/geometries/TextGeometry.js","three/examples/jsm/loaders/FontLoader.js"],b):(_=typeof globalThis<"u"?globalThis:_||self,b(_.ThreedTextWC={},_.THREE,_.TextGeometry_js,_.FontLoader_js))})(this,function(_,b,w,N){"use strict";var ke=Object.defineProperty;var Ee=(_,b,w)=>b in _?ke(_,b,{enumerable:!0,configurable:!0,writable:!0,value:w}):_[b]=w;var d=(_,b,w)=>Ee(_,typeof b!="symbol"?b+"":b,w);function me(r){const e=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const o in r)if(o!=="default"){const n=Object.getOwnPropertyDescriptor(r,o);Object.defineProperty(e,o,n.get?n:{enumerable:!0,get:()=>r[o]})}}return e.default=r,Object.freeze(e)}const i=me(b),oe={},K="droid_sans",J=[{id:"droid_sans",label:"Droid Sans",urls:["https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_regular.typeface.json"]},{id:"inter",label:"Inter (Latin-ext: PL, DE, ES)",urls:[]},{id:"roboto",label:"Roboto (Latin-ext: PL, DE, ES)",urls:[]},{id:"helvetiker",label:"Helvetiker (sans)",urls:["https://threejs.org/examples/fonts/helvetiker_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_regular.typeface.json"]},{id:"helvetiker_bold",label:"Helvetiker Bold",urls:["https://threejs.org/examples/fonts/helvetiker_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_bold.typeface.json"]},{id:"optimer",label:"Optimer (humanist)",urls:["https://threejs.org/examples/fonts/optimer_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_regular.typeface.json"]},{id:"optimer_bold",label:"Optimer Bold",urls:["https://threejs.org/examples/fonts/optimer_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_bold.typeface.json"]},{id:"gentilis",label:"Gentilis (serif)",urls:["https://threejs.org/examples/fonts/gentilis_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_regular.typeface.json"]},{id:"gentilis_bold",label:"Gentilis Bold",urls:["https://threejs.org/examples/fonts/gentilis_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_bold.typeface.json"]},{id:"droid_sans_bold",label:"Droid Sans Bold",urls:["https://threejs.org/examples/fonts/droid/droid_sans_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_bold.typeface.json"]},{id:"droid_serif",label:"Droid Serif",urls:["https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_regular.typeface.json"]},{id:"droid_serif_bold",label:"Droid Serif Bold",urls:["https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_bold.typeface.json"]}],ge={size:2,height:.8,curveSegments:48,bevelEnabled:!0,bevelThickness:.15,bevelSize:.08,bevelOffset:0,bevelSegments:5,metalness:.95,roughness:.15,envMapIntensity:1.5,equalizeLineWidths:!1,equalizationMethod:"fontSize",targetWidth:20,lineSpacing:1};function ie(r){r.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
      if (normal.z < 0.0) normal = normalize(vec3(normal.xy, 1e-4));`)},r.customProgramCacheKey=()=>"text-bevel-normal-clamp"}const j=new Map;function ae(r){const e=[],o=/<b>(.*?)<\/b>/gi;let n=0,t;for(;(t=o.exec(r))!==null;)t.index>n&&e.push({text:r.slice(n,t.index),bold:!1}),t[1]&&e.push({text:t[1],bold:!0}),n=o.lastIndex;return n<r.length&&e.push({text:r.slice(n),bold:!1}),e.filter(a=>a.text.length>0)}function _e(r){return r.replace(/<\/?b>/gi,"")}const be={droid_sans:"droid_sans_bold",helvetiker:"helvetiker_bold",optimer:"optimer_bold",gentilis:"gentilis_bold",droid_serif:"droid_serif_bold"};function ve(r){return be[r]??r}async function re(r=K){if(j.has(r))return j.get(r);const e=J.find(n=>n.id===r)??J[0];if(e.id==="roboto"){const n=new N.Font(oe);return j.set(e.id,n),r!==e.id&&j.set(r,n),n}if(e.id==="inter"){const n=new N.Font(oe);return j.set(e.id,n),r!==e.id&&j.set(r,n),n}const o=e.urls;return new Promise((n,t)=>{const a=async l=>{if(l>=o.length){t(new Error(`All URLs failed for font "${r}"`));return}try{const s=await fetch(o[l]);if(!s.ok)throw new Error(`HTTP ${s.status}`);const u=await s.json(),x=new N.Font(u);j.set(r,x),n(x)}catch(s){console.error(`Font "${r}" failed from ${o[l]}:`,s),a(l+1)}};a(0)})}async function xe(r){var a,l,s,u,x,B,X,he,de,pe;const e={...ge,...Object.fromEntries(Object.entries(r).filter(([F,L])=>L!==void 0))},o=e.text.split(`
`),n=o.some(F=>/<b>/i.test(F)),t=o.map(_e);try{const F=e.fontFamily??K,L=ve(F),[y,$]=await Promise.all([re(F),n&&L!==F?re(L).catch(()=>null):Promise.resolve(null)]),Y=$??y,T=[],V=t.map(()=>1);for(let c=0;c<t.length;c++){const m=t[c];if(!m.trim()){T.push(0);continue}const g=o[c];if(/<b>/i.test(g)){const p=ae(g);let S=0;for(const v of p){const E=v.bold?Y:y,z=new w.TextGeometry(v.text,{font:E,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});z.computeBoundingBox(),S+=(((a=z.boundingBox)==null?void 0:a.max.x)??0)-(((l=z.boundingBox)==null?void 0:l.min.x)??0),z.dispose()}T.push(S)}else{const p=new w.TextGeometry(m,{font:y,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});p.computeBoundingBox();const S=(((s=p.boundingBox)==null?void 0:s.max.x)??0)-(((u=p.boundingBox)==null?void 0:u.min.x)??0);T.push(S),p.dispose()}}if(e.equalizeLineWidths)for(let c=0;c<T.length;c++){const m=T[c]||1;V[c]=e.targetWidth/m}const G=new i.Group,h=[];for(let c=0;c<t.length;c++){const m=t[c],g=V[c];if(e.equalizationMethod==="fontSize"||!e.equalizeLineWidths){if(!m.trim()){const R=new i.Group,C=e.size*g;h.push({geometry:R,minY:0,maxY:C*.8});continue}if(/<b>/i.test(o[c])){const R=ae(o[c]),C=e.size*g,ee={size:C,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*g,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments},W=[];let P=0;for(const D of R){const ne=D.bold?Y:y,U=new w.TextGeometry(D.text,{font:ne,...ee});U.computeBoundingBox();const A=U.boundingBox,Z=A.max.x-A.min.x;W.push({geo:U,width:Z,minY:A.min.y,maxY:A.max.y,startX:A.min.x}),P+=Z}let ue=-P/2,te=((x=W[0])==null?void 0:x.minY)??0,se=((B=W[0])==null?void 0:B.maxY)??C;const fe=new i.Group;for(const{geo:D,width:ne,minY:U,maxY:A,startX:Z}of W)D.translate(ue-Z,0,0),fe.add(new i.Mesh(D)),ue+=ne,te=Math.min(te,U),se=Math.max(se,A);h.push({geometry:fe,minY:te,maxY:se});continue}const p=new w.TextGeometry(m,{font:y,size:e.size*g,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*g,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});p.computeBoundingBox();const S=((X=p.boundingBox)==null?void 0:X.min.x)??0,v=((he=p.boundingBox)==null?void 0:he.max.x)??0,E=v-S,z=(S+v)/2,Q=((de=p.boundingBox)==null?void 0:de.min.y)??0,O=((pe=p.boundingBox)==null?void 0:pe.max.y)??e.size;p.translate(-z,0,0),h.push({geometry:p,minY:Q,maxY:O})}else{if(!m.trim()){const O=new i.Group;h.push({geometry:O,minY:0,maxY:e.size*.8});continue}const p=T[c],S=(e.targetWidth-p)/Math.max(1,m.length-1),v=new i.Group;let E=0;for(let O=0;O<m.length;O++){const R=m[O];if(R===" "){const P=new w.TextGeometry(" ",{font:y,size:e.size});P.computeBoundingBox(),E+=P.boundingBox.max.x-P.boundingBox.min.x+S,P.dispose();continue}const C=new w.TextGeometry(R,{font:y,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});C.computeBoundingBox();const ee=C.boundingBox.max.x-C.boundingBox.min.x;C.translate(E,0,0);const W=new i.Mesh(C);v.add(W),E+=ee+S}const z=v.children.length>0?new i.Box3().setFromObject(v):new i.Box3(new i.Vector3(0,0,0),new i.Vector3(0,e.size,0)),Q=(z.max.x+z.min.x)/2;v.position.x=-Q,h.push({geometry:v,minY:z.min.y,maxY:z.max.y})}}const f=new Array(h.length).fill(0);for(let c=1;c<h.length;c++)f[c]=f[c-1]+h[c-1].minY-e.lineSpacing-h[c].maxY;const M=h.length>0?f[0]+h[0].maxY:0,k=h.length>0?f[h.length-1]+h[h.length-1].minY:0,I=(M+k)/2;for(let c=0;c<h.length;c++){const m=f[c]-I,{geometry:g}=h[c];if(g instanceof i.Group)g.position.y=m,G.add(g);else{g.translate(0,m,0);const p=new i.Mesh(g);G.add(p)}}const H=e.color||new i.Color().setHSL(Math.random(),.8,.5),q=new i.MeshStandardMaterial({color:H,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return ie(q),{geometry:G,material:q}}catch(F){console.error("Failed to load font, creating fallback geometry:",F);const L=new i.Group,y=e.size*.8,$=e.size+e.lineSpacing,Y=[],T=t.map(()=>1);for(const h of t){let f=0;for(let M=0;M<h.length;M++)h[M]!==" "?f+=y:f+=y*.5;Y.push(f)}if(e.equalizeLineWidths){const h=e.targetWidth;for(let f=0;f<Y.length;f++){const M=Y[f]||1,k=h/M;T[f]=k}}for(let h=0;h<t.length;h++){const f=t[h],M=T[h],k=new i.Group;let I=0;const H=e.equalizationMethod==="spacing"?y*M:y,q=e.equalizationMethod==="fontSize"?e.size*M:e.size;for(let p=0;p<f.length;p++){if(f[p]===" "){I+=H*.5;continue}const v=new i.BoxGeometry(q*.6,q,e.height),E=new i.Mesh(v);E.position.x=I,k.add(E),I+=H}const m=new i.Box3().setFromObject(k).getCenter(new i.Vector3);k.position.x=-m.x;const g=(t.length-1)*$/2-h*$;k.position.y=g,L.add(k)}const V=e.color||new i.Color().setHSL(Math.random(),.8,.5),G=new i.MeshStandardMaterial({color:V,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return ie(G),{geometry:L,material:G}}}const ye=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`,we=4;function le(r,e){return[new i.Vector4(0,0,0,0),new i.Vector4(.33,r.r*.35,r.g*.35,r.b*.35),new i.Vector4(.66,r.r,r.g,r.b),new i.Vector4(1,e.r,e.g,e.b),new i.Vector4(0,0,0,0)]}const Se=`
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
World`,color:"#ff6600",font:K,size:2,depth:.8,metalness:.95,roughness:.15,envIntensity:1.5},Me=new i.Plane(new i.Vector3(0,0,1),0),Ce=`
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
`;function Te(r,e){const o=e.filter(n=>n.urls.length>0).map(n=>`<option value="${n.id}"${n.id===r.font?" selected":""}>${n.label}</option>`).join("");return`
    <canvas></canvas>
    <button class="cfg-btn" type="button">⚙ Configure</button>
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
  `}class ce extends HTMLElement{constructor(){super();d(this,"_cfg",{...ze});d(this,"_shadow");d(this,"_canvas");d(this,"_renderer",null);d(this,"_scene",null);d(this,"_camera",null);d(this,"_mesh",null);d(this,"_envMap",null);d(this,"_animId",null);d(this,"_resizeOb",null);d(this,"_updateId",0);d(this,"_debounceTimer",null);d(this,"_rotation",{x:0,y:0});d(this,"_drag",!1);d(this,"_lastMouse",{x:0,y:0});d(this,"_startTime",performance.now());d(this,"_scrollZoom",!1);d(this,"_autoSize",!0);d(this,"_textBoundingSize",null);d(this,"_styleObserver",null);d(this,"_primaryColor",new i.Color("#ff6600"));d(this,"_secondaryColor",new i.Color("#0066ff"));d(this,"_plasmaRt",null);d(this,"_plasmaMat",null);d(this,"_plasmaScene",null);d(this,"_plasmaCamera",null);this._shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["text","color","font","size","depth","metalness","roughness","env-intensity","show-config","scroll-zoom","primary-color","secondary-color","auto-size"]}connectedCallback(){this._buildDOM(),this._initScene()}disconnectedCallback(){this._dispose()}attributeChangedCallback(o,n,t){var a,l;if(t!==null){switch(o){case"text":this._cfg.text=t.replace(/\\n/g,`
`);break;case"color":this._cfg.color=t;break;case"font":this._cfg.font=t;break;case"size":this._cfg.size=parseFloat(t);break;case"depth":this._cfg.depth=parseFloat(t);break;case"metalness":this._cfg.metalness=parseFloat(t);break;case"roughness":this._cfg.roughness=parseFloat(t);break;case"env-intensity":this._cfg.envIntensity=parseFloat(t);break;case"scroll-zoom":this._scrollZoom=t!=="false";return;case"auto-size":this._autoSize=t!=="false",this._autoSize&&this._textBoundingSize&&(this._applyAutoSize(),this._fitCameraToTextSize(this._textBoundingSize));return;case"primary-color":this.style.setProperty("--primary-color",t),this._primaryColor.set(t),this._updatePlasmaColors(),this.hasAttribute("color")||(this._cfg.color=t,this._scheduleUpdate());return;case"secondary-color":this.style.setProperty("--secondary-color",t),this._secondaryColor.set(t),this._updatePlasmaColors();return;case"show-config":(l=(a=this._shadow)==null?void 0:a.querySelector(".cfg-panel"))==null||l.classList.toggle("open",t!=="false");return}this._scheduleUpdate()}}get config(){return{...this._cfg}}set config(o){Object.assign(this._cfg,o),this._scheduleUpdate()}_buildDOM(){const o=document.createElement("style");o.textContent=Ce;const n=document.createElement("div");for(n.innerHTML=Te(this._cfg,J),this._shadow.appendChild(o);n.firstChild;)this._shadow.appendChild(n.firstChild);this._canvas=this._shadow.querySelector("canvas");const t=this._shadow.querySelector(".cfg-panel");this.hasAttribute("show-config")&&this.getAttribute("show-config")!=="false"&&t.classList.add("open"),this._shadow.querySelector(".cfg-btn").addEventListener("click",()=>t.classList.toggle("open")),this._shadow.querySelector(".cfg-close").addEventListener("click",()=>t.classList.remove("open")),this._bindControl("#cfg-text","input",s=>{this._cfg.text=s}),this._bindControl("#cfg-font","change",s=>{this._cfg.font=s}),this._bindControl("#cfg-color","input",s=>{this._cfg.color=s}),this._bindRange("#cfg-depth","#cfg-depth-v",s=>{this._cfg.depth=s}),this._bindRange("#cfg-metalness","#cfg-metalness-v",s=>{this._cfg.metalness=s}),this._bindRange("#cfg-roughness","#cfg-roughness-v",s=>{this._cfg.roughness=s}),this._bindRange("#cfg-env","#cfg-env-v",s=>{this._cfg.envIntensity=s}),this._styleObserver=new MutationObserver(()=>this._onFontSizeChange()),this._styleObserver.observe(this,{attributes:!0,attributeFilter:["style","class"]}),this._canvas.addEventListener("mousedown",s=>{this._drag=!0,this._lastMouse={x:s.clientX,y:s.clientY}}),window.addEventListener("mousemove",s=>{this._drag&&(this._rotation.y+=(s.clientX-this._lastMouse.x)*.01,this._rotation.x+=(s.clientY-this._lastMouse.y)*.01,this._lastMouse={x:s.clientX,y:s.clientY})}),window.addEventListener("mouseup",()=>{this._drag=!1}),this._canvas.addEventListener("wheel",s=>{const u=s.ctrlKey;if(!this._scrollZoom&&!u||(s.preventDefault(),!this._camera))return;const x=Math.pow(1.001,s.deltaY*(s.deltaMode===1?40:s.deltaMode===2?800:1));this._zoomCameraAtClientPoint(s.clientX,s.clientY,x)},{passive:!1});let l=0;this._canvas.addEventListener("touchstart",s=>{s.touches.length===2&&(l=Math.hypot(s.touches[0].clientX-s.touches[1].clientX,s.touches[0].clientY-s.touches[1].clientY))},{passive:!0}),this._canvas.addEventListener("touchmove",s=>{if(s.touches.length!==2||!this._camera)return;s.preventDefault();const u=Math.hypot(s.touches[0].clientX-s.touches[1].clientX,s.touches[0].clientY-s.touches[1].clientY);if(l>0){const x=l/u;this._zoomCameraAtClientPoint((s.touches[0].clientX+s.touches[1].clientX)/2,(s.touches[0].clientY+s.touches[1].clientY)/2,x)}l=u},{passive:!1}),this._canvas.addEventListener("touchend",()=>{l=0},{passive:!0})}_zoomCameraAtClientPoint(o,n,t){if(!this._camera)return;const a=this._worldPointAtClientPoint(o,n),l=Math.max(2,Math.min(80,this._camera.position.z*t));if(l===this._camera.position.z)return;this._camera.position.z=l;const s=this._worldPointAtClientPoint(o,n);!a||!s||(this._camera.position.x+=a.x-s.x,this._camera.position.y+=a.y-s.y,this._camera.updateMatrixWorld(!0))}_worldPointAtClientPoint(o,n){if(!this._camera||!this._canvas)return null;const t=this._canvas.getBoundingClientRect();if(t.width<=0||t.height<=0)return null;const a=new i.Vector2((o-t.left)/t.width*2-1,-((n-t.top)/t.height)*2+1),l=new i.Raycaster,s=new i.Vector3;return this._camera.updateMatrixWorld(!0),l.setFromCamera(a,this._camera),l.ray.intersectPlane(Me,s)}_bindControl(o,n,t){const a=this._shadow.querySelector(o);a&&a.addEventListener(n,()=>{t(a.value),this._scheduleUpdate(),this._dispatchChange()})}_bindRange(o,n,t){const a=this._shadow.querySelector(o),l=this._shadow.querySelector(n);a&&a.addEventListener("input",()=>{const s=parseFloat(a.value);t(s),l&&(l.textContent=s.toFixed(a.step.includes(".0")?1:2)),this._scheduleUpdate(),this._dispatchChange()})}_updatePlasmaColors(){if(!this._plasmaMat)return;const o=le(this._primaryColor,this._secondaryColor),n=this._plasmaMat.uniforms;n.uStop0.value=o[0],n.uStop1.value=o[1],n.uStop2.value=o[2],n.uStop3.value=o[3],n.uStop4.value=o[4]}_scheduleUpdate(){this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>this._updateMesh(),60)}_dispatchChange(){this.dispatchEvent(new CustomEvent("config-change",{detail:{...this._cfg},bubbles:!0,composed:!0}))}_initScene(){const o=this._canvas,n=new i.WebGLRenderer({canvas:o,antialias:!0});n.toneMapping=i.ACESFilmicToneMapping,n.toneMappingExposure=1,this._renderer=n;const t=new i.Scene;t.background=new i.Color(1710618),this._scene=t;const a=new i.PerspectiveCamera(75,1,.1,1e4);a.position.z=15,this._camera=a,t.add(new i.AmbientLight(16777215,.5));const l=new i.DirectionalLight(16777215,1);l.position.set(10,10,10),t.add(l);const s=new i.PointLight(16711935,1);s.position.set(-8,5,8),t.add(s);const u=new i.PointLight(65535,.8);u.position.set(8,-5,8),t.add(u),this._envMap=this._setupPlasmaEnvMap(),this._envMap&&(t.environment=this._envMap),this._resizeOb=new ResizeObserver(()=>this._resize()),this._resizeOb.observe(this),this._resize(),this._updateMesh(),this._loop()}_resize(){var t,a;const o=this.offsetWidth||800,n=this.offsetHeight||400;(t=this._renderer)==null||t.setSize(o,n,!1),(a=this._renderer)==null||a.setPixelRatio(window.devicePixelRatio),this._camera&&(this._camera.aspect=o/n,this._camera.updateProjectionMatrix())}_applyAutoSize(){if(!this._textBoundingSize||!this._autoSize)return;const o=parseFloat(getComputedStyle(this).fontSize)||16,n=this._textBoundingSize.x/Math.max(this._textBoundingSize.y,.001),t=Math.max(Math.round(o*1.25),80),a=Math.round(t*n);Math.abs(this.offsetHeight-t)>1&&(this.style.height=`${t}px`),Math.abs(this.offsetWidth-a)>1&&(this.style.width=`${a}px`)}_onFontSizeChange(){if(!(!this._autoSize||!this._textBoundingSize)){if(this._applyAutoSize(),this._camera){const o=this.offsetWidth||800,n=this.offsetHeight||400;this._camera.aspect=o/n,this._camera.updateProjectionMatrix()}this._textBoundingSize&&this._fitCameraToTextSize(this._textBoundingSize)}}_fitCameraToTextSize(o){if(!this._camera)return;const n=this._camera.fov*Math.PI/180,t=Math.tan(n/2),a=this._camera.aspect,l=o.y/2/t,s=o.x/2/(t*a),u=Math.max(l,s)*1.25+o.z/2;this._camera.position.set(0,0,Math.max(u,2)),this._camera.lookAt(0,0,0),this._camera.updateMatrixWorld(!0)}async _updateMesh(){if(!this._scene||!this._envMap)return;const o=++this._updateId;try{const{geometry:n,material:t}=await xe({text:this._cfg.text,fontFamily:this._cfg.font,size:this._cfg.size,height:this._cfg.depth,color:new i.Color(this._cfg.color),metalness:this._cfg.metalness,roughness:this._cfg.roughness,envMap:this._envMap,envMapIntensity:this._cfg.envIntensity});if(o!==this._updateId)return;this._removeMesh();const a=new i.Group;let l;n instanceof i.Group?(l=n,l.traverse(B=>{B instanceof i.Mesh&&(B.material=t,B.castShadow=!0)})):(l=new i.Mesh(n,t),l.castShadow=!0),a.add(l),this._scene.add(a),this._mesh=a;const s=new i.Box3().setFromObject(a),u=s.getCenter(new i.Vector3);l.position.sub(u);const x=s.getSize(new i.Vector3);if(this._textBoundingSize=x,this._autoSize&&(this._applyAutoSize(),this._camera)){const B=this.offsetWidth||800,X=this.offsetHeight||400;this._camera.aspect=B/X,this._camera.updateProjectionMatrix()}this._fitCameraToTextSize(x)}catch(n){console.error("[threed-text-wc] mesh update failed:",n)}}_removeMesh(){!this._mesh||!this._scene||(this._scene.remove(this._mesh),this._mesh.traverse(o=>{var n;o instanceof i.Mesh&&((n=o.geometry)==null||n.dispose(),(Array.isArray(o.material)?o.material:[o.material]).forEach(a=>a==null?void 0:a.dispose()))}),this._mesh=null)}_loop(){this._animId=requestAnimationFrame(()=>this._loop());const o=(performance.now()-this._startTime)/1e3;this._updatePlasma(o),this._mesh&&(this._mesh.rotation.x=this._rotation.x,this._mesh.rotation.y=this._rotation.y),this._renderer&&this._scene&&this._camera&&this._renderer.render(this._scene,this._camera)}_setupPlasmaEnvMap(){const n=new i.WebGLRenderTarget(256,256,{minFilter:i.LinearFilter,magFilter:i.LinearFilter}),t=le(this._primaryColor,this._secondaryColor),a=new i.ShaderMaterial({uniforms:{uTime:{value:0},uZoom:{value:8},uStop0:{value:t[0]},uStop1:{value:t[1]},uStop2:{value:t[2]},uStop3:{value:t[3]},uStop4:{value:t[4]},uStopCount:{value:we}},vertexShader:ye,fragmentShader:Se}),l=new i.Scene;l.add(new i.Mesh(new i.PlaneGeometry(2,2),a));const s=new i.OrthographicCamera(-1,1,1,-1,0,1);this._plasmaRt=n,this._plasmaMat=a,this._plasmaScene=l,this._plasmaCamera=s;const u=n.texture;return u.mapping=i.EquirectangularReflectionMapping,u}_updatePlasma(o){const{_plasmaRt:n,_plasmaMat:t,_plasmaScene:a,_plasmaCamera:l,_renderer:s}=this;if(!n||!t||!a||!l||!s)return;t.uniforms.uTime.value=o;const u=s.getRenderTarget();s.setRenderTarget(n),s.render(a,l),s.setRenderTarget(u)}_dispose(){var o,n,t,a,l;this._animId!==null&&cancelAnimationFrame(this._animId),(o=this._resizeOb)==null||o.disconnect(),(n=this._styleObserver)==null||n.disconnect(),this._removeMesh(),(t=this._plasmaRt)==null||t.dispose(),(a=this._plasmaMat)==null||a.dispose(),(l=this._renderer)==null||l.dispose()}}customElements.get("threed-text")||customElements.define("threed-text",ce),_.ThreedTextElement=ce,Object.defineProperty(_,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=threed-text.umd.js.map
