(function(x,y){typeof exports=="object"&&typeof module<"u"?y(exports,require("three"),require("three/examples/jsm/geometries/TextGeometry.js"),require("three/examples/jsm/loaders/FontLoader.js")):typeof define=="function"&&define.amd?define(["exports","three","three/examples/jsm/geometries/TextGeometry.js","three/examples/jsm/loaders/FontLoader.js"],y):(x=typeof globalThis<"u"?globalThis:x||self,y(x.ThreedTextWC={},x.THREE,x.TextGeometry_js,x.FontLoader_js))})(this,function(x,y,z,Q){"use strict";var Ee=Object.defineProperty;var Pe=(x,y,z)=>y in x?Ee(x,y,{enumerable:!0,configurable:!0,writable:!0,value:z}):x[y]=z;var d=(x,y,z)=>Pe(x,typeof y!="symbol"?y+"":y,z);function me(r){const e=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const n in r)if(n!=="default"){const s=Object.getOwnPropertyDescriptor(r,n);Object.defineProperty(e,n,s.get?s:{enumerable:!0,get:()=>r[n]})}}return e.default=r,Object.freeze(e)}const i=me(y),re={},ee="droid_sans",te=[{id:"droid_sans",label:"Droid Sans",urls:["https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_regular.typeface.json"]},{id:"inter",label:"Inter (Latin-ext: PL, DE, ES)",urls:[]},{id:"roboto",label:"Roboto (Latin-ext: PL, DE, ES)",urls:[]},{id:"helvetiker",label:"Helvetiker (sans)",urls:["https://threejs.org/examples/fonts/helvetiker_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_regular.typeface.json"]},{id:"helvetiker_bold",label:"Helvetiker Bold",urls:["https://threejs.org/examples/fonts/helvetiker_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_bold.typeface.json"]},{id:"optimer",label:"Optimer (humanist)",urls:["https://threejs.org/examples/fonts/optimer_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_regular.typeface.json"]},{id:"optimer_bold",label:"Optimer Bold",urls:["https://threejs.org/examples/fonts/optimer_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_bold.typeface.json"]},{id:"gentilis",label:"Gentilis (serif)",urls:["https://threejs.org/examples/fonts/gentilis_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_regular.typeface.json"]},{id:"gentilis_bold",label:"Gentilis Bold",urls:["https://threejs.org/examples/fonts/gentilis_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_bold.typeface.json"]},{id:"droid_sans_bold",label:"Droid Sans Bold",urls:["https://threejs.org/examples/fonts/droid/droid_sans_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_bold.typeface.json"]},{id:"droid_serif",label:"Droid Serif",urls:["https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_regular.typeface.json"]},{id:"droid_serif_bold",label:"Droid Serif Bold",urls:["https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_bold.typeface.json"]}],ge={size:2,height:.8,curveSegments:48,bevelEnabled:!0,bevelThickness:.15,bevelSize:.08,bevelOffset:0,bevelSegments:5,metalness:.95,roughness:.15,envMapIntensity:1.5,equalizeLineWidths:!1,equalizationMethod:"fontSize",targetWidth:20,lineSpacing:1};function le(r){r.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
      if (normal.z < 0.0) normal = normalize(vec3(normal.xy, 1e-4));`)},r.customProgramCacheKey=()=>"text-bevel-normal-clamp"}const G=new Map;function ce(r){const e=[],n=/<b>(.*?)<\/b>/gi;let s=0,t;for(;(t=n.exec(r))!==null;)t.index>s&&e.push({text:r.slice(s,t.index),bold:!1}),t[1]&&e.push({text:t[1],bold:!0}),s=n.lastIndex;return s<r.length&&e.push({text:r.slice(s),bold:!1}),e.filter(a=>a.text.length>0)}function _e(r){return r.replace(/<\/?b>/gi,"")}const ve={droid_sans:"droid_sans_bold",helvetiker:"helvetiker_bold",optimer:"optimer_bold",gentilis:"gentilis_bold",droid_serif:"droid_serif_bold"};function be(r){return ve[r]??r}async function he(r=ee){if(G.has(r))return G.get(r);const e=te.find(s=>s.id===r)??te[0];if(e.id==="roboto"){const s=new Q.Font(re);return G.set(e.id,s),r!==e.id&&G.set(r,s),s}if(e.id==="inter"){const s=new Q.Font(re);return G.set(e.id,s),r!==e.id&&G.set(r,s),s}const n=e.urls;return new Promise((s,t)=>{const a=async c=>{if(c>=n.length){t(new Error(`All URLs failed for font "${r}"`));return}try{const l=await fetch(n[c]);if(!l.ok)throw new Error(`HTTP ${l.status}`);const u=await l.json(),m=new Q.Font(u);G.set(r,m),s(m)}catch(l){console.error(`Font "${r}" failed from ${n[c]}:`,l),a(c+1)}};a(0)})}async function xe(r){var a,c,l,u,m,M,L,A,O,o;const e={...ge,...Object.fromEntries(Object.entries(r).filter(([_,C])=>C!==void 0))},n=e.text.split(`
`),s=n.some(_=>/<b>/i.test(_)),t=n.map(_e);try{const _=e.fontFamily??ee,C=be(_),[w,Z]=await Promise.all([he(_),s&&C!==_?he(C).catch(()=>null):Promise.resolve(null)]),W=Z??w,k=[],N=t.map(()=>1);for(let h=0;h<t.length;h++){const v=t[h];if(!v.trim()){k.push(0);continue}const b=n[h];if(/<b>/i.test(b)){const f=ce(b);let T=0;for(const S of f){const j=S.bold?W:w,E=new z.TextGeometry(S.text,{font:j,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});E.computeBoundingBox(),T+=(((a=E.boundingBox)==null?void 0:a.max.x)??0)-(((c=E.boundingBox)==null?void 0:c.min.x)??0),E.dispose()}k.push(T)}else{const f=new z.TextGeometry(v,{font:w,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});f.computeBoundingBox();const T=(((l=f.boundingBox)==null?void 0:l.max.x)??0)-(((u=f.boundingBox)==null?void 0:u.min.x)??0);k.push(T),f.dispose()}}if(e.equalizeLineWidths)for(let h=0;h<k.length;h++){const v=k[h]||1;N[h]=e.targetWidth/v}const I=new i.Group,p=[];for(let h=0;h<t.length;h++){const v=t[h],b=N[h];if(e.equalizationMethod==="fontSize"||!e.equalizeLineWidths){if(!v.trim()){const $=new i.Group,F=e.size*b;p.push({geometry:$,minY:0,maxY:F*.8});continue}if(/<b>/i.test(n[h])){const $=ce(n[h]),F=e.size*b,ne={size:F,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*b,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments},D=[];let Y=0;for(const X of $){const ae=X.bold?W:w,H=new z.TextGeometry(X.text,{font:ae,...ne});H.computeBoundingBox();const q=H.boundingBox,J=q.max.x-q.min.x;D.push({geo:H,width:J,minY:q.min.y,maxY:q.max.y,startX:q.min.x}),Y+=J}let ue=-Y/2,ie=((m=D[0])==null?void 0:m.minY)??0,oe=((M=D[0])==null?void 0:M.maxY)??F;const fe=new i.Group;for(const{geo:X,width:ae,minY:H,maxY:q,startX:J}of D)X.translate(ue-J,0,0),fe.add(new i.Mesh(X)),ue+=ae,ie=Math.min(ie,H),oe=Math.max(oe,q);p.push({geometry:fe,minY:ie,maxY:oe});continue}const f=new z.TextGeometry(v,{font:w,size:e.size*b,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*b,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});f.computeBoundingBox();const T=((L=f.boundingBox)==null?void 0:L.min.x)??0,S=((A=f.boundingBox)==null?void 0:A.max.x)??0,j=S-T,E=(T+S)/2,se=((O=f.boundingBox)==null?void 0:O.min.y)??0,R=((o=f.boundingBox)==null?void 0:o.max.y)??e.size;f.translate(-E,0,0),p.push({geometry:f,minY:se,maxY:R})}else{if(!v.trim()){const R=new i.Group;p.push({geometry:R,minY:0,maxY:e.size*.8});continue}const f=k[h],T=(e.targetWidth-f)/Math.max(1,v.length-1),S=new i.Group;let j=0;for(let R=0;R<v.length;R++){const $=v[R];if($===" "){const Y=new z.TextGeometry(" ",{font:w,size:e.size});Y.computeBoundingBox(),j+=Y.boundingBox.max.x-Y.boundingBox.min.x+T,Y.dispose();continue}const F=new z.TextGeometry($,{font:w,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});F.computeBoundingBox();const ne=F.boundingBox.max.x-F.boundingBox.min.x;F.translate(j,0,0);const D=new i.Mesh(F);S.add(D),j+=ne+T}const E=S.children.length>0?new i.Box3().setFromObject(S):new i.Box3(new i.Vector3(0,0,0),new i.Vector3(0,e.size,0)),se=(E.max.x+E.min.x)/2;S.position.x=-se,p.push({geometry:S,minY:E.min.y,maxY:E.max.y})}}const g=new Array(p.length).fill(0);for(let h=1;h<p.length;h++)g[h]=g[h-1]+p[h-1].minY-e.lineSpacing-p[h].maxY;const P=p.length>0?g[0]+p[0].maxY:0,B=p.length>0?g[p.length-1]+p[p.length-1].minY:0,U=(P+B)/2;for(let h=0;h<p.length;h++){const v=g[h]-U,{geometry:b}=p[h];if(b instanceof i.Group)b.position.y=v,I.add(b);else{b.translate(0,v,0);const f=new i.Mesh(b);I.add(f)}}const K=e.color||new i.Color().setHSL(Math.random(),.8,.5),V=new i.MeshStandardMaterial({color:K,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return le(V),{geometry:I,material:V}}catch(_){console.error("Failed to load font, creating fallback geometry:",_);const C=new i.Group,w=e.size*.8,Z=e.size+e.lineSpacing,W=[],k=t.map(()=>1);for(const p of t){let g=0;for(let P=0;P<p.length;P++)p[P]!==" "?g+=w:g+=w*.5;W.push(g)}if(e.equalizeLineWidths){const p=e.targetWidth;for(let g=0;g<W.length;g++){const P=W[g]||1,B=p/P;k[g]=B}}for(let p=0;p<t.length;p++){const g=t[p],P=k[p],B=new i.Group;let U=0;const K=e.equalizationMethod==="spacing"?w*P:w,V=e.equalizationMethod==="fontSize"?e.size*P:e.size;for(let f=0;f<g.length;f++){if(g[f]===" "){U+=K*.5;continue}const S=new i.BoxGeometry(V*.6,V,e.height),j=new i.Mesh(S);j.position.x=U,B.add(j),U+=K}const v=new i.Box3().setFromObject(B).getCenter(new i.Vector3);B.position.x=-v.x;const b=(t.length-1)*Z/2-p*Z;B.position.y=b,C.add(B)}const N=e.color||new i.Color().setHSL(Math.random(),.8,.5),I=new i.MeshStandardMaterial({color:N,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return le(I),{geometry:C,material:I}}}const ye=`
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
World`,color:"#ff6600",font:ee,size:2,depth:.8,metalness:.95,roughness:.15,envIntensity:1.5,fov:75},Me=new i.Plane(new i.Vector3(0,0,1),0),Ce=`
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

    </div>
  `}class pe extends HTMLElement{constructor(){super();d(this,"_cfg",{...ze});d(this,"_shadow");d(this,"_canvas");d(this,"_renderer",null);d(this,"_scene",null);d(this,"_camera",null);d(this,"_mesh",null);d(this,"_envMap",null);d(this,"_animId",null);d(this,"_resizeOb",null);d(this,"_updateId",0);d(this,"_debounceTimer",null);d(this,"_rotation",{x:0,y:0});d(this,"_drag",!1);d(this,"_lastMouse",{x:0,y:0});d(this,"_startTime",performance.now());d(this,"_scrollZoom",!1);d(this,"_autoSize",!0);d(this,"_textBoundingSize",null);d(this,"_styleObserver",null);d(this,"_primaryColor",new i.Color("#ff6600"));d(this,"_secondaryColor",new i.Color("#0066ff"));d(this,"_plasmaRt",null);d(this,"_plasmaMat",null);d(this,"_plasmaScene",null);d(this,"_plasmaCamera",null);d(this,"_pmremGenerator",null);d(this,"_pmremRt",null);this._shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["text","color","font","size","depth","metalness","roughness","env-intensity","fov","show-config","scroll-zoom","primary-color","secondary-color","auto-size"]}connectedCallback(){this._buildDOM(),this._initScene()}disconnectedCallback(){this._dispose()}attributeChangedCallback(n,s,t){var a,c;if(t!==null){switch(n){case"text":this._cfg.text=t.replace(/\\n/g,`
`);break;case"color":this._cfg.color=t;break;case"font":this._cfg.font=t;break;case"size":this._cfg.size=parseFloat(t);break;case"depth":this._cfg.depth=parseFloat(t);break;case"metalness":this._cfg.metalness=parseFloat(t);break;case"roughness":this._cfg.roughness=parseFloat(t);break;case"env-intensity":this._cfg.envIntensity=parseFloat(t);break;case"fov":this._cfg.fov=parseFloat(t);break;case"scroll-zoom":this._scrollZoom=t!=="false";return;case"auto-size":this._autoSize=t!=="false",this._autoSize&&this._textBoundingSize&&(this._applyAutoSize(),this._fitCameraToTextSize(this._textBoundingSize));return;case"primary-color":this.style.setProperty("--primary-color",t),this._primaryColor.set(t),this._updatePlasmaColors(),this.hasAttribute("color")||(this._cfg.color=t,this._scheduleUpdate());return;case"secondary-color":this.style.setProperty("--secondary-color",t),this._secondaryColor.set(t),this._updatePlasmaColors();return;case"show-config":(c=(a=this._shadow)==null?void 0:a.querySelector(".cfg-panel"))==null||c.classList.toggle("open",t!=="false");return}this._scheduleUpdate()}}get config(){return{...this._cfg}}set config(n){Object.assign(this._cfg,n),this._scheduleUpdate()}_buildDOM(){const n=document.createElement("style");n.textContent=Ce;const s=document.createElement("div");for(s.innerHTML=Te(this._cfg,te),this._shadow.appendChild(n);s.firstChild;)this._shadow.appendChild(s.firstChild);this._canvas=this._shadow.querySelector("canvas");const t=this._shadow.querySelector(".cfg-panel");this.hasAttribute("show-config")&&this.getAttribute("show-config")!=="false"&&t.classList.add("open");const c=()=>t.classList.add("open");this._canvas.addEventListener("contextmenu",o=>{o.preventDefault(),c()});let l=null;this._canvas.addEventListener("touchstart",o=>{o.touches.length===1&&(l=setTimeout(()=>{l=null,c()},500))},{passive:!0});const u=()=>{l!==null&&(clearTimeout(l),l=null)};this._canvas.addEventListener("touchend",u,{passive:!0}),this._canvas.addEventListener("touchcancel",u,{passive:!0}),this._canvas.addEventListener("touchmove",u,{passive:!0}),this._shadow.querySelector(".cfg-close").addEventListener("click",()=>t.classList.remove("open")),this._bindControl("#cfg-text","input",o=>{this._cfg.text=o}),this._bindControl("#cfg-font","change",o=>{this._cfg.font=o}),this._bindControl("#cfg-color","input",o=>{this._cfg.color=o}),this._bindRange("#cfg-depth","#cfg-depth-v",o=>{this._cfg.depth=o}),this._bindRange("#cfg-metalness","#cfg-metalness-v",o=>{this._cfg.metalness=o}),this._bindRange("#cfg-roughness","#cfg-roughness-v",o=>{this._cfg.roughness=o}),this._bindRange("#cfg-env","#cfg-env-v",o=>{this._cfg.envIntensity=o});const m=this._shadow.querySelector("#cfg-fov"),M=this._shadow.querySelector("#cfg-fov-v");m&&m.addEventListener("input",()=>{const o=parseInt(m.value);this._cfg.fov=o,M&&(M.textContent=`${o}°`),this._camera&&(this._camera.fov=o,this._camera.updateProjectionMatrix(),this._textBoundingSize&&this._fitCameraToTextSize(this._textBoundingSize)),this._dispatchChange()});const L=this._shadow.querySelector("#cfg-font-size"),A=this._shadow.querySelector("#cfg-font-size-v");if(L){const o=Math.round(parseFloat(getComputedStyle(this).fontSize)||120);L.value=String(o),A&&(A.textContent=`${o}px`),L.addEventListener("input",()=>{const _=parseInt(L.value);A&&(A.textContent=`${_}px`),this.style.fontSize=`${_}px`})}this._styleObserver=new MutationObserver(()=>this._onFontSizeChange()),this._styleObserver.observe(this,{attributes:!0,attributeFilter:["style","class"]}),this._canvas.addEventListener("mousedown",o=>{this._drag=!0,this._lastMouse={x:o.clientX,y:o.clientY}}),window.addEventListener("mousemove",o=>{this._drag&&(this._rotation.y+=(o.clientX-this._lastMouse.x)*.01,this._rotation.x+=(o.clientY-this._lastMouse.y)*.01,this._lastMouse={x:o.clientX,y:o.clientY})}),window.addEventListener("mouseup",()=>{this._drag=!1}),this._canvas.addEventListener("wheel",o=>{const _=o.ctrlKey;if(!this._scrollZoom&&!_||(o.preventDefault(),!this._camera))return;const C=Math.pow(1.001,o.deltaY*(o.deltaMode===1?40:o.deltaMode===2?800:1));this._zoomCameraAtClientPoint(o.clientX,o.clientY,C)},{passive:!1});let O=0;this._canvas.addEventListener("touchstart",o=>{o.touches.length===2&&(O=Math.hypot(o.touches[0].clientX-o.touches[1].clientX,o.touches[0].clientY-o.touches[1].clientY))},{passive:!0}),this._canvas.addEventListener("touchmove",o=>{if(o.touches.length!==2||!this._camera)return;o.preventDefault();const _=Math.hypot(o.touches[0].clientX-o.touches[1].clientX,o.touches[0].clientY-o.touches[1].clientY);if(O>0){const C=O/_;this._zoomCameraAtClientPoint((o.touches[0].clientX+o.touches[1].clientX)/2,(o.touches[0].clientY+o.touches[1].clientY)/2,C)}O=_},{passive:!1}),this._canvas.addEventListener("touchend",()=>{O=0},{passive:!0})}_zoomCameraAtClientPoint(n,s,t){if(!this._camera)return;const a=this._worldPointAtClientPoint(n,s),c=Math.max(2,Math.min(80,this._camera.position.z*t));if(c===this._camera.position.z)return;this._camera.position.z=c;const l=this._worldPointAtClientPoint(n,s);!a||!l||(this._camera.position.x+=a.x-l.x,this._camera.position.y+=a.y-l.y,this._camera.updateMatrixWorld(!0))}_worldPointAtClientPoint(n,s){if(!this._camera||!this._canvas)return null;const t=this._canvas.getBoundingClientRect();if(t.width<=0||t.height<=0)return null;const a=new i.Vector2((n-t.left)/t.width*2-1,-((s-t.top)/t.height)*2+1),c=new i.Raycaster,l=new i.Vector3;return this._camera.updateMatrixWorld(!0),c.setFromCamera(a,this._camera),c.ray.intersectPlane(Me,l)}_bindControl(n,s,t){const a=this._shadow.querySelector(n);a&&a.addEventListener(s,()=>{t(a.value),this._scheduleUpdate(),this._dispatchChange()})}_bindRange(n,s,t){const a=this._shadow.querySelector(n),c=this._shadow.querySelector(s);a&&a.addEventListener("input",()=>{const l=parseFloat(a.value);t(l),c&&(c.textContent=l.toFixed(a.step.includes(".0")?1:2)),this._scheduleUpdate(),this._dispatchChange()})}_updatePlasmaColors(){if(!this._plasmaMat)return;const n=de(this._primaryColor,this._secondaryColor),s=this._plasmaMat.uniforms;s.uStop0.value=n[0],s.uStop1.value=n[1],s.uStop2.value=n[2],s.uStop3.value=n[3],s.uStop4.value=n[4]}_scheduleUpdate(){this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>this._updateMesh(),60)}_dispatchChange(){this.dispatchEvent(new CustomEvent("config-change",{detail:{...this._cfg},bubbles:!0,composed:!0}))}_initScene(){const n=this._canvas,s=new i.WebGLRenderer({canvas:n,antialias:!0,alpha:!0,premultipliedAlpha:!1});s.toneMapping=i.ACESFilmicToneMapping,s.toneMappingExposure=1,this._renderer=s;const t=new i.Scene;this._scene=t;const a=new i.PerspectiveCamera(75,1,.1,1e4);a.position.z=15,this._camera=a,t.add(new i.AmbientLight(16777215,.5));const c=new i.DirectionalLight(16777215,1);c.position.set(10,10,10),t.add(c);const l=new i.PointLight(16711935,1);l.position.set(-8,5,8),t.add(l);const u=new i.PointLight(65535,.8);u.position.set(8,-5,8),t.add(u);const m=this._setupPlasmaEnvMap();this._updatePlasma(0),this._pmremGenerator=new i.PMREMGenerator(s),this._pmremGenerator.compileEquirectangularShader(),this._pmremRt=this._pmremGenerator.fromEquirectangular(m),this._envMap=this._pmremRt.texture,t.environment=this._envMap,this._resizeOb=new ResizeObserver(()=>this._resize()),this._resizeOb.observe(this),this._resize(),this._updateMesh(),this._loop()}_resize(){var t,a;const n=this.offsetWidth||800,s=this.offsetHeight||400;(t=this._renderer)==null||t.setPixelRatio(window.devicePixelRatio),(a=this._renderer)==null||a.setSize(n,s,!1),this._camera&&(this._camera.aspect=n/s,this._camera.updateProjectionMatrix())}_applyAutoSize(){if(!this._textBoundingSize||!this._autoSize)return;const n=parseFloat(getComputedStyle(this).fontSize)||16,s=this._textBoundingSize.x/Math.max(this._textBoundingSize.y,.001),t=Math.max(Math.round(n*1.25),80),a=Math.round(t*s);Math.abs(this.offsetHeight-t)>1&&(this.style.height=`${t}px`),Math.abs(this.offsetWidth-a)>1&&(this.style.width=`${a}px`)}_onFontSizeChange(){if(!(!this._autoSize||!this._textBoundingSize)){if(this._applyAutoSize(),this._camera){const n=this.offsetWidth||800,s=this.offsetHeight||400;this._camera.aspect=n/s,this._camera.updateProjectionMatrix()}this._textBoundingSize&&this._fitCameraToTextSize(this._textBoundingSize)}}_fitCameraToTextSize(n){if(!this._camera)return;const s=this._camera.fov*Math.PI/180,t=Math.tan(s/2),a=this._camera.aspect,c=n.y/2/t,l=n.x/2/(t*a),u=Math.max(c,l)*1.25+n.z/2;this._camera.position.set(0,0,Math.max(u,2)),this._camera.lookAt(0,0,0),this._camera.updateMatrixWorld(!0)}async _updateMesh(){if(!this._scene||!this._envMap)return;const n=++this._updateId;this._camera&&this._camera.fov!==this._cfg.fov&&(this._camera.fov=this._cfg.fov,this._camera.updateProjectionMatrix());try{const{geometry:s,material:t}=await xe({text:this._cfg.text,fontFamily:this._cfg.font,size:this._cfg.size,height:this._cfg.depth,color:new i.Color(this._cfg.color),metalness:this._cfg.metalness,roughness:this._cfg.roughness,envMap:this._envMap,envMapIntensity:this._cfg.envIntensity});if(n!==this._updateId)return;this._removeMesh();const a=new i.Group;let c;s instanceof i.Group?(c=s,c.traverse(M=>{M instanceof i.Mesh&&(M.material=t,M.castShadow=!0)})):(c=new i.Mesh(s,t),c.castShadow=!0),a.add(c),this._scene.add(a),this._mesh=a;const l=new i.Box3().setFromObject(a),u=l.getCenter(new i.Vector3);c.position.sub(u);const m=l.getSize(new i.Vector3);if(this._textBoundingSize=m,this._autoSize&&(this._applyAutoSize(),this._camera)){const M=this.offsetWidth||800,L=this.offsetHeight||400;this._camera.aspect=M/L,this._camera.updateProjectionMatrix()}this._fitCameraToTextSize(m)}catch(s){console.error("[threed-text-wc] mesh update failed:",s)}}_removeMesh(){!this._mesh||!this._scene||(this._scene.remove(this._mesh),this._mesh.traverse(n=>{var s;n instanceof i.Mesh&&((s=n.geometry)==null||s.dispose(),(Array.isArray(n.material)?n.material:[n.material]).forEach(a=>a==null?void 0:a.dispose()))}),this._mesh=null)}_loop(){this._animId=requestAnimationFrame(()=>this._loop());const n=(performance.now()-this._startTime)/1e3;this._updatePlasma(n),this._mesh&&(this._mesh.rotation.x=this._rotation.x,this._mesh.rotation.y=this._rotation.y),this._renderer&&this._scene&&this._camera&&this._renderer.render(this._scene,this._camera)}_setupPlasmaEnvMap(){const s=new i.WebGLRenderTarget(256,256,{minFilter:i.LinearFilter,magFilter:i.LinearFilter}),t=de(this._primaryColor,this._secondaryColor),a=new i.ShaderMaterial({uniforms:{uTime:{value:0},uZoom:{value:8},uStop0:{value:t[0]},uStop1:{value:t[1]},uStop2:{value:t[2]},uStop3:{value:t[3]},uStop4:{value:t[4]},uStopCount:{value:Se}},vertexShader:ye,fragmentShader:we}),c=new i.Scene;c.add(new i.Mesh(new i.PlaneGeometry(2,2),a));const l=new i.OrthographicCamera(-1,1,1,-1,0,1);this._plasmaRt=s,this._plasmaMat=a,this._plasmaScene=c,this._plasmaCamera=l;const u=s.texture;return u.mapping=i.EquirectangularReflectionMapping,u}_updatePlasma(n){const{_plasmaRt:s,_plasmaMat:t,_plasmaScene:a,_plasmaCamera:c,_renderer:l}=this;if(!s||!t||!a||!c||!l)return;t.uniforms.uTime.value=n;const u=l.getRenderTarget();if(l.setRenderTarget(s),l.render(a,c),l.setRenderTarget(u),this._pmremGenerator&&this._pmremRt){this._pmremGenerator.fromEquirectangular(s.texture,this._pmremRt);const m=l.domElement;l.setViewport(0,0,m.clientWidth||m.width,m.clientHeight||m.height),l.setScissorTest(!1)}}_dispose(){var n,s,t,a,c,l,u;this._animId!==null&&cancelAnimationFrame(this._animId),(n=this._resizeOb)==null||n.disconnect(),(s=this._styleObserver)==null||s.disconnect(),this._removeMesh(),(t=this._plasmaRt)==null||t.dispose(),(a=this._plasmaMat)==null||a.dispose(),(c=this._pmremRt)==null||c.dispose(),(l=this._pmremGenerator)==null||l.dispose(),(u=this._renderer)==null||u.dispose()}}customElements.get("threed-text")||customElements.define("threed-text",pe),x.ThreedTextElement=pe,Object.defineProperty(x,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=threed-text.umd.js.map
