(function(x,w){typeof exports=="object"&&typeof module<"u"?w(exports,require("three"),require("three/examples/jsm/geometries/TextGeometry.js"),require("three/examples/jsm/loaders/FontLoader.js")):typeof define=="function"&&define.amd?define(["exports","three","three/examples/jsm/geometries/TextGeometry.js","three/examples/jsm/loaders/FontLoader.js"],w):(x=typeof globalThis<"u"?globalThis:x||self,w(x.ThreedTextWC={},x.THREE,x.TextGeometry_js,x.FontLoader_js))})(this,function(x,w,C,Q){"use strict";var Ee=Object.defineProperty;var ke=(x,w,C)=>w in x?Ee(x,w,{enumerable:!0,configurable:!0,writable:!0,value:C}):x[w]=C;var p=(x,w,C)=>ke(x,typeof w!="symbol"?w+"":w,C);function me(r){const e=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const i in r)if(i!=="default"){const s=Object.getOwnPropertyDescriptor(r,i);Object.defineProperty(e,i,s.get?s:{enumerable:!0,get:()=>r[i]})}}return e.default=r,Object.freeze(e)}const o=me(w),re={},ee="droid_sans",te=[{id:"droid_sans",label:"Droid Sans",urls:["https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_regular.typeface.json"]},{id:"inter",label:"Inter (Latin-ext: PL, DE, ES)",urls:[]},{id:"roboto",label:"Roboto (Latin-ext: PL, DE, ES)",urls:[]},{id:"helvetiker",label:"Helvetiker (sans)",urls:["https://threejs.org/examples/fonts/helvetiker_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_regular.typeface.json"]},{id:"helvetiker_bold",label:"Helvetiker Bold",urls:["https://threejs.org/examples/fonts/helvetiker_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/helvetiker_bold.typeface.json"]},{id:"optimer",label:"Optimer (humanist)",urls:["https://threejs.org/examples/fonts/optimer_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_regular.typeface.json"]},{id:"optimer_bold",label:"Optimer Bold",urls:["https://threejs.org/examples/fonts/optimer_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/optimer_bold.typeface.json"]},{id:"gentilis",label:"Gentilis (serif)",urls:["https://threejs.org/examples/fonts/gentilis_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_regular.typeface.json"]},{id:"gentilis_bold",label:"Gentilis Bold",urls:["https://threejs.org/examples/fonts/gentilis_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/gentilis_bold.typeface.json"]},{id:"droid_sans_bold",label:"Droid Sans Bold",urls:["https://threejs.org/examples/fonts/droid/droid_sans_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_sans_bold.typeface.json"]},{id:"droid_serif",label:"Droid Serif",urls:["https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_regular.typeface.json"]},{id:"droid_serif_bold",label:"Droid Serif Bold",urls:["https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json","https://unpkg.com/three@latest/examples/fonts/droid/droid_serif_bold.typeface.json"]}],ge={size:2,height:.8,curveSegments:48,bevelEnabled:!0,bevelThickness:.15,bevelSize:.08,bevelOffset:0,bevelSegments:5,metalness:.95,roughness:.15,envMapIntensity:1.5,equalizeLineWidths:!1,equalizationMethod:"fontSize",targetWidth:20,lineSpacing:1};function le(r){r.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
      if (normal.z < 0.0) normal = normalize(vec3(normal.xy, 1e-4));`)},r.customProgramCacheKey=()=>"text-bevel-normal-clamp"}const G=new Map;function ce(r){const e=[],i=/<b>(.*?)<\/b>/gi;let s=0,t;for(;(t=i.exec(r))!==null;)t.index>s&&e.push({text:r.slice(s,t.index),bold:!1}),t[1]&&e.push({text:t[1],bold:!0}),s=i.lastIndex;return s<r.length&&e.push({text:r.slice(s),bold:!1}),e.filter(a=>a.text.length>0)}function _e(r){return r.replace(/<\/?b>/gi,"")}const ve={droid_sans:"droid_sans_bold",helvetiker:"helvetiker_bold",optimer:"optimer_bold",gentilis:"gentilis_bold",droid_serif:"droid_serif_bold"};function be(r){return ve[r]??r}async function he(r=ee){if(G.has(r))return G.get(r);const e=te.find(s=>s.id===r)??te[0];if(e.id==="roboto"){const s=new Q.Font(re);return G.set(e.id,s),r!==e.id&&G.set(r,s),s}if(e.id==="inter"){const s=new Q.Font(re);return G.set(e.id,s),r!==e.id&&G.set(r,s),s}const i=e.urls;return new Promise((s,t)=>{const a=async c=>{if(c>=i.length){t(new Error(`All URLs failed for font "${r}"`));return}try{const l=await fetch(i[c]);if(!l.ok)throw new Error(`HTTP ${l.status}`);const h=await l.json(),u=new Q.Font(h);G.set(r,u),s(u)}catch(l){console.error(`Font "${r}" failed from ${i[c]}:`,l),a(c+1)}};a(0)})}async function xe(r){var a,c,l,h,u,T,M,y,E,A;const e={...ge,...Object.fromEntries(Object.entries(r).filter(([S,n])=>n!==void 0))},i=e.text.split(`
`),s=i.some(S=>/<b>/i.test(S)),t=i.map(_e);try{const S=e.fontFamily??ee,n=be(S),[g,R]=await Promise.all([he(S),s&&n!==S?he(n).catch(()=>null):Promise.resolve(null)]),W=R??g,B=[],N=t.map(()=>1);for(let d=0;d<t.length;d++){const v=t[d];if(!v.trim()){B.push(0);continue}const b=i[d];if(/<b>/i.test(b)){const m=ce(b);let k=0;for(const z of m){const O=z.bold?W:g,P=new C.TextGeometry(z.text,{font:O,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});P.computeBoundingBox(),k+=(((a=P.boundingBox)==null?void 0:a.max.x)??0)-(((c=P.boundingBox)==null?void 0:c.min.x)??0),P.dispose()}B.push(k)}else{const m=new C.TextGeometry(v,{font:g,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});m.computeBoundingBox();const k=(((l=m.boundingBox)==null?void 0:l.max.x)??0)-(((h=m.boundingBox)==null?void 0:h.min.x)??0);B.push(k),m.dispose()}}if(e.equalizeLineWidths)for(let d=0;d<B.length;d++){const v=B[d]||1;N[d]=e.targetWidth/v}const $=new o.Group,f=[];for(let d=0;d<t.length;d++){const v=t[d],b=N[d];if(e.equalizationMethod==="fontSize"||!e.equalizeLineWidths){if(!v.trim()){const D=new o.Group,F=e.size*b;f.push({geometry:D,minY:0,maxY:F*.8});continue}if(/<b>/i.test(i[d])){const D=ce(i[d]),F=e.size*b,ie={size:F,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*b,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments},U=[];let q=0;for(const H of D){const ae=H.bold?W:g,Z=new C.TextGeometry(H.text,{font:ae,...ie});Z.computeBoundingBox();const I=Z.boundingBox,J=I.max.x-I.min.x;U.push({geo:Z,width:J,minY:I.min.y,maxY:I.max.y,startX:I.min.x}),q+=J}let fe=-q/2,ne=((u=U[0])==null?void 0:u.minY)??0,oe=((T=U[0])==null?void 0:T.maxY)??F;const ue=new o.Group;for(const{geo:H,width:ae,minY:Z,maxY:I,startX:J}of U)H.translate(fe-J,0,0),ue.add(new o.Mesh(H)),fe+=ae,ne=Math.min(ne,Z),oe=Math.max(oe,I);f.push({geometry:ue,minY:ne,maxY:oe});continue}const m=new C.TextGeometry(v,{font:g,size:e.size*b,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize*b,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});m.computeBoundingBox();const k=((M=m.boundingBox)==null?void 0:M.min.x)??0,z=((y=m.boundingBox)==null?void 0:y.max.x)??0,O=z-k,P=(k+z)/2,se=((E=m.boundingBox)==null?void 0:E.min.y)??0,Y=((A=m.boundingBox)==null?void 0:A.max.y)??e.size;m.translate(-P,0,0),f.push({geometry:m,minY:se,maxY:Y})}else{if(!v.trim()){const Y=new o.Group;f.push({geometry:Y,minY:0,maxY:e.size*.8});continue}const m=B[d],k=(e.targetWidth-m)/Math.max(1,v.length-1),z=new o.Group;let O=0;for(let Y=0;Y<v.length;Y++){const D=v[Y];if(D===" "){const q=new C.TextGeometry(" ",{font:g,size:e.size});q.computeBoundingBox(),O+=q.boundingBox.max.x-q.boundingBox.min.x+k,q.dispose();continue}const F=new C.TextGeometry(D,{font:g,size:e.size,depth:e.height,curveSegments:e.curveSegments,bevelEnabled:e.bevelEnabled,bevelThickness:e.bevelThickness,bevelSize:e.bevelSize,bevelOffset:e.bevelOffset,bevelSegments:e.bevelSegments});F.computeBoundingBox();const ie=F.boundingBox.max.x-F.boundingBox.min.x;F.translate(O,0,0);const U=new o.Mesh(F);z.add(U),O+=ie+k}const P=z.children.length>0?new o.Box3().setFromObject(z):new o.Box3(new o.Vector3(0,0,0),new o.Vector3(0,e.size,0)),se=(P.max.x+P.min.x)/2;z.position.x=-se,f.push({geometry:z,minY:P.min.y,maxY:P.max.y})}}const _=new Array(f.length).fill(0);for(let d=1;d<f.length;d++)_[d]=_[d-1]+f[d-1].minY-e.lineSpacing-f[d].maxY;const L=f.length>0?_[0]+f[0].maxY:0,j=f.length>0?_[f.length-1]+f[f.length-1].minY:0,V=(L+j)/2;for(let d=0;d<f.length;d++){const v=_[d]-V,{geometry:b}=f[d];if(b instanceof o.Group)b.position.y=v,$.add(b);else{b.translate(0,v,0);const m=new o.Mesh(b);$.add(m)}}const K=e.color||new o.Color().setHSL(Math.random(),.8,.5),X=new o.MeshStandardMaterial({color:K,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return le(X),{geometry:$,material:X}}catch(S){console.error("Failed to load font, creating fallback geometry:",S);const n=new o.Group,g=e.size*.8,R=e.size+e.lineSpacing,W=[],B=t.map(()=>1);for(const f of t){let _=0;for(let L=0;L<f.length;L++)f[L]!==" "?_+=g:_+=g*.5;W.push(_)}if(e.equalizeLineWidths){const f=e.targetWidth;for(let _=0;_<W.length;_++){const L=W[_]||1,j=f/L;B[_]=j}}for(let f=0;f<t.length;f++){const _=t[f],L=B[f],j=new o.Group;let V=0;const K=e.equalizationMethod==="spacing"?g*L:g,X=e.equalizationMethod==="fontSize"?e.size*L:e.size;for(let m=0;m<_.length;m++){if(_[m]===" "){V+=K*.5;continue}const z=new o.BoxGeometry(X*.6,X,e.height),O=new o.Mesh(z);O.position.x=V,j.add(O),V+=K}const v=new o.Box3().setFromObject(j).getCenter(new o.Vector3);j.position.x=-v.x;const b=(t.length-1)*R/2-f*R;j.position.y=b,n.add(j)}const N=e.color||new o.Color().setHSL(Math.random(),.8,.5),$=new o.MeshStandardMaterial({color:N,metalness:e.metalness,roughness:e.roughness,envMap:e.envMap||void 0,envMapIntensity:e.envMapIntensity});return le($),{geometry:n,material:$}}}const ye=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`,Se=4;function de(r,e){return[new o.Vector4(0,0,0,0),new o.Vector4(.33,r.r*.35,r.g*.35,r.b*.35),new o.Vector4(.66,r.r,r.g,r.b),new o.Vector4(1,e.r,e.g,e.b),new o.Vector4(0,0,0,0)]}const we=`
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
World`,color:"#ff6600",font:ee,fontSize:120,depth:.8,metalness:.95,roughness:.15,envIntensity:1.5,fov:75,capitalize:!1,rotateZ:0},Me=new o.Plane(new o.Vector3(0,0,1),0),Ce=`
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
`;function Te(r,e){const i=e.filter(s=>s.urls.length>0).map(s=>`<option value="${s.id}"${s.id===r.font?" selected":""}>${s.label}</option>`).join("");return`
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
  `}class pe extends HTMLElement{constructor(){super();p(this,"_cfg",{...ze});p(this,"_shadow");p(this,"_canvas");p(this,"_renderer",null);p(this,"_scene",null);p(this,"_camera",null);p(this,"_mesh",null);p(this,"_envMap",null);p(this,"_animId",null);p(this,"_resizeOb",null);p(this,"_updateId",0);p(this,"_debounceTimer",null);p(this,"_rotation",{x:0,y:0});p(this,"_drag",!1);p(this,"_lastMouse",{x:0,y:0});p(this,"_startTime",performance.now());p(this,"_scrollZoom",!1);p(this,"_dragRotate",!0);p(this,"_autoSize",!0);p(this,"_textBoundingSize",null);p(this,"_styleObserver",null);p(this,"_primaryColor",new o.Color("#ff6600"));p(this,"_secondaryColor",new o.Color("#0066ff"));p(this,"_plasmaRt",null);p(this,"_plasmaMat",null);p(this,"_plasmaScene",null);p(this,"_plasmaCamera",null);p(this,"_pmremGenerator",null);p(this,"_pmremRt",null);this._shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["text","color","font","font-size","depth","metalness","roughness","env-intensity","fov","show-config","scroll-zoom","primary-color","secondary-color","auto-size","drag-rotate","capitalize","rotate-z"]}connectedCallback(){this._buildDOM(),this._initScene()}disconnectedCallback(){this._dispose()}attributeChangedCallback(i,s,t){var a,c,l;if(t!==null){switch(i){case"text":this._cfg.text=t.replace(/\\n/g,`
`);break;case"color":this._cfg.color=t;break;case"font":this._cfg.font=t;break;case"font-size":this._cfg.fontSize=parseFloat(t);break;case"depth":this._cfg.depth=parseFloat(t);break;case"metalness":this._cfg.metalness=parseFloat(t);break;case"roughness":this._cfg.roughness=parseFloat(t);break;case"env-intensity":this._cfg.envIntensity=parseFloat(t);break;case"fov":this._cfg.fov=parseFloat(t);break;case"capitalize":this._cfg.capitalize=t!=="false";break;case"rotate-z":this._cfg.rotateZ=parseFloat(t);break;case"scroll-zoom":this._scrollZoom=t!=="false";return;case"drag-rotate":this._dragRotate=t!=="false",(a=this._canvas)==null||a.style.setProperty("cursor",this._dragRotate?"grab":"default");return;case"auto-size":this._autoSize=t!=="false",this._autoSize&&this._textBoundingSize&&(this._applyAutoSize(),this._fitCameraToTextSize(this._textBoundingSize));return;case"primary-color":this.style.setProperty("--primary-color",t),this._primaryColor.set(t),this._updatePlasmaColors(),this.hasAttribute("color")||(this._cfg.color=t,this._scheduleUpdate());return;case"secondary-color":this.style.setProperty("--secondary-color",t),this._secondaryColor.set(t),this._updatePlasmaColors();return;case"show-config":(l=(c=this._shadow)==null?void 0:c.querySelector(".cfg-panel"))==null||l.classList.toggle("open",t!=="false");return}this._scheduleUpdate()}}get config(){return{...this._cfg}}set config(i){Object.assign(this._cfg,i),this._scheduleUpdate()}_buildDOM(){const i=document.createElement("style");i.textContent=Ce;const s=document.createElement("div");for(s.innerHTML=Te(this._cfg,te),this._shadow.appendChild(i);s.firstChild;)this._shadow.appendChild(s.firstChild);this._canvas=this._shadow.querySelector("canvas");const t=this._shadow.querySelector(".cfg-panel");this.hasAttribute("show-config")&&this.getAttribute("show-config")!=="false"&&t.classList.add("open");const c=()=>t.classList.add("open");this._canvas.addEventListener("contextmenu",n=>{n.preventDefault(),c()});let l=null;this._canvas.addEventListener("touchstart",n=>{n.touches.length===1&&(l=setTimeout(()=>{l=null,c()},500))},{passive:!0});const h=()=>{l!==null&&(clearTimeout(l),l=null)};this._canvas.addEventListener("touchend",h,{passive:!0}),this._canvas.addEventListener("touchcancel",h,{passive:!0}),this._canvas.addEventListener("touchmove",h,{passive:!0}),this._shadow.querySelector(".cfg-close").addEventListener("click",()=>t.classList.remove("open")),this._bindControl("#cfg-text","input",n=>{this._cfg.text=n}),this._bindControl("#cfg-font","change",n=>{this._cfg.font=n}),this._bindControl("#cfg-color","input",n=>{this._cfg.color=n}),this._bindRange("#cfg-depth","#cfg-depth-v",n=>{this._cfg.depth=n}),this._bindRange("#cfg-metalness","#cfg-metalness-v",n=>{this._cfg.metalness=n}),this._bindRange("#cfg-roughness","#cfg-roughness-v",n=>{this._cfg.roughness=n}),this._bindRange("#cfg-env","#cfg-env-v",n=>{this._cfg.envIntensity=n});const u=this._shadow.querySelector("#cfg-fov"),T=this._shadow.querySelector("#cfg-fov-v");u&&u.addEventListener("input",()=>{const n=parseInt(u.value);this._cfg.fov=n,T&&(T.textContent=`${n}°`),this._camera&&(this._camera.fov=n,this._camera.updateProjectionMatrix(),this._textBoundingSize&&this._fitCameraToTextSize(this._textBoundingSize)),this._dispatchChange()});const M=this._shadow.querySelector("#cfg-font-size"),y=this._shadow.querySelector("#cfg-font-size-v");M&&(M.value=String(this._cfg.fontSize),y&&(y.textContent=`${this._cfg.fontSize}px`),M.addEventListener("input",()=>{const n=parseInt(M.value);y&&(y.textContent=`${n}px`),this._cfg.fontSize=n,this.style.fontSize=`${n}px`}));const E=this._shadow.querySelector("#cfg-capitalize");E&&(E.checked=this._cfg.capitalize,E.addEventListener("change",()=>{this._cfg.capitalize=E.checked,this._scheduleUpdate(),this._dispatchChange()}));const A=this._shadow.querySelector("#cfg-drag-rotate");A&&(A.checked=this._dragRotate,A.addEventListener("change",()=>{this._dragRotate=A.checked,this._canvas.style.cursor=this._dragRotate?"grab":"default"})),this._styleObserver=new MutationObserver(()=>this._onFontSizeChange()),this._styleObserver.observe(this,{attributes:!0,attributeFilter:["style","class"]}),this._canvas.style.cursor="grab",this._canvas.addEventListener("mousedown",n=>{this._dragRotate&&(this._drag=!0,this._canvas.style.cursor="grabbing",this._lastMouse={x:n.clientX,y:n.clientY})}),window.addEventListener("mousemove",n=>{this._drag&&(this._rotation.y+=(n.clientX-this._lastMouse.x)*.01,this._rotation.x+=(n.clientY-this._lastMouse.y)*.01,this._lastMouse={x:n.clientX,y:n.clientY})}),window.addEventListener("mouseup",()=>{this._drag&&(this._drag=!1,this._canvas.style.cursor=this._dragRotate?"grab":"default")}),this._canvas.addEventListener("wheel",n=>{const g=n.ctrlKey;if(!this._scrollZoom&&!g||(n.preventDefault(),!this._camera))return;const R=Math.pow(1.001,n.deltaY*(n.deltaMode===1?40:n.deltaMode===2?800:1));this._zoomCameraAtClientPoint(n.clientX,n.clientY,R)},{passive:!1});let S=0;this._canvas.addEventListener("touchstart",n=>{n.touches.length===2&&(S=Math.hypot(n.touches[0].clientX-n.touches[1].clientX,n.touches[0].clientY-n.touches[1].clientY))},{passive:!0}),this._canvas.addEventListener("touchmove",n=>{if(n.touches.length!==2||!this._camera)return;n.preventDefault();const g=Math.hypot(n.touches[0].clientX-n.touches[1].clientX,n.touches[0].clientY-n.touches[1].clientY);if(S>0){const R=S/g;this._zoomCameraAtClientPoint((n.touches[0].clientX+n.touches[1].clientX)/2,(n.touches[0].clientY+n.touches[1].clientY)/2,R)}S=g},{passive:!1}),this._canvas.addEventListener("touchend",()=>{S=0},{passive:!0})}_zoomCameraAtClientPoint(i,s,t){if(!this._camera)return;const a=this._worldPointAtClientPoint(i,s),c=Math.max(2,Math.min(80,this._camera.position.z*t));if(c===this._camera.position.z)return;this._camera.position.z=c;const l=this._worldPointAtClientPoint(i,s);!a||!l||(this._camera.position.x+=a.x-l.x,this._camera.position.y+=a.y-l.y,this._camera.updateMatrixWorld(!0))}_worldPointAtClientPoint(i,s){if(!this._camera||!this._canvas)return null;const t=this._canvas.getBoundingClientRect();if(t.width<=0||t.height<=0)return null;const a=new o.Vector2((i-t.left)/t.width*2-1,-((s-t.top)/t.height)*2+1),c=new o.Raycaster,l=new o.Vector3;return this._camera.updateMatrixWorld(!0),c.setFromCamera(a,this._camera),c.ray.intersectPlane(Me,l)}_bindControl(i,s,t){const a=this._shadow.querySelector(i);a&&a.addEventListener(s,()=>{t(a.value),this._scheduleUpdate(),this._dispatchChange()})}_bindRange(i,s,t){const a=this._shadow.querySelector(i),c=this._shadow.querySelector(s);a&&a.addEventListener("input",()=>{const l=parseFloat(a.value);t(l),c&&(c.textContent=l.toFixed(a.step.includes(".0")?1:2)),this._scheduleUpdate(),this._dispatchChange()})}_updatePlasmaColors(){if(!this._plasmaMat)return;const i=de(this._primaryColor,this._secondaryColor),s=this._plasmaMat.uniforms;s.uStop0.value=i[0],s.uStop1.value=i[1],s.uStop2.value=i[2],s.uStop3.value=i[3],s.uStop4.value=i[4]}_scheduleUpdate(){this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>this._updateMesh(),60)}_dispatchChange(){this.dispatchEvent(new CustomEvent("config-change",{detail:{...this._cfg},bubbles:!0,composed:!0}))}_initScene(){const i=this._canvas,s=new o.WebGLRenderer({canvas:i,antialias:!0,alpha:!0,premultipliedAlpha:!1});s.toneMapping=o.ACESFilmicToneMapping,s.toneMappingExposure=1,this._renderer=s;const t=new o.Scene;this._scene=t;const a=new o.PerspectiveCamera(75,1,.1,1e4);a.position.z=15,this._camera=a,t.add(new o.AmbientLight(16777215,.5));const c=new o.DirectionalLight(16777215,1);c.position.set(10,10,10),t.add(c);const l=new o.PointLight(16711935,1);l.position.set(-8,5,8),t.add(l);const h=new o.PointLight(65535,.8);h.position.set(8,-5,8),t.add(h);const u=this._setupPlasmaEnvMap();this._updatePlasma(0),this._pmremGenerator=new o.PMREMGenerator(s),this._pmremGenerator.compileEquirectangularShader(),this._pmremRt=this._pmremGenerator.fromEquirectangular(u),this._envMap=this._pmremRt.texture,t.environment=this._envMap,this._resizeOb=new ResizeObserver(()=>this._resize()),this._resizeOb.observe(this),this._resize(),this._updateMesh(),this._loop()}_resize(){var t,a;const i=this.offsetWidth||800,s=this.offsetHeight||400;(t=this._renderer)==null||t.setPixelRatio(window.devicePixelRatio),(a=this._renderer)==null||a.setSize(i,s,!1),this._camera&&(this._camera.aspect=i/s,this._camera.updateProjectionMatrix())}_applyAutoSize(){if(!this._textBoundingSize||!this._autoSize)return;const i=this._cfg.rotateZ*(Math.PI/180),s=Math.abs(Math.cos(i)),t=Math.abs(Math.sin(i)),a=this._textBoundingSize.x,c=this._textBoundingSize.y,l=a*s+c*t,h=a*t+c*s,u=this._cfg.fontSize*(h/Math.max(c,.001)),T=this._cfg.fontSize*(l/Math.max(c,.001));Math.abs(this.offsetHeight-u)>.5&&(this.style.height=`${u}px`),Math.abs(this.offsetWidth-T)>.5&&(this.style.width=`${T}px`)}_onFontSizeChange(){if(!(!this._autoSize||!this._textBoundingSize)){if(this._applyAutoSize(),this._camera){const i=this.offsetWidth||800,s=this.offsetHeight||400;this._camera.aspect=i/s,this._camera.updateProjectionMatrix()}this._textBoundingSize&&this._fitCameraToTextSize(this._textBoundingSize)}}_fitCameraToTextSize(i){if(!this._camera)return;const s=this._camera.fov*Math.PI/180,t=Math.tan(s/2),a=this._camera.aspect,c=this._cfg.rotateZ*(Math.PI/180),l=Math.abs(Math.cos(c)),h=Math.abs(Math.sin(c)),u=i.x*l+i.y*h,M=(i.x*h+i.y*l)/2/t,y=u/2/(t*a),E=Math.max(M,y)+i.z/2;this._camera.position.set(0,0,Math.max(E,.5)),this._camera.lookAt(0,0,0),this._camera.updateMatrixWorld(!0)}async _updateMesh(){if(!this._scene||!this._envMap)return;const i=++this._updateId;this._camera&&this._camera.fov!==this._cfg.fov&&(this._camera.fov=this._cfg.fov,this._camera.updateProjectionMatrix());const s=`${this._cfg.fontSize}px`;this.style.fontSize!==s&&(this.style.fontSize=s);try{const t=this._cfg.capitalize?this._cfg.text.toUpperCase():this._cfg.text,{geometry:a,material:c}=await xe({text:t,fontFamily:this._cfg.font,size:2,height:this._cfg.depth,color:new o.Color(this._cfg.color),metalness:this._cfg.metalness,roughness:this._cfg.roughness,envMap:this._envMap,envMapIntensity:this._cfg.envIntensity});if(i!==this._updateId)return;this._removeMesh();const l=new o.Group;let h;a instanceof o.Group?(h=a,h.traverse(y=>{y instanceof o.Mesh&&(y.material=c,y.castShadow=!0)})):(h=new o.Mesh(a,c),h.castShadow=!0),l.add(h),this._scene.add(l),this._mesh=l;const u=new o.Box3().setFromObject(l),T=u.getCenter(new o.Vector3);h.position.sub(T);const M=u.getSize(new o.Vector3);if(this._textBoundingSize=M,this._autoSize&&(this._applyAutoSize(),this._camera)){const y=this.offsetWidth||800,E=this.offsetHeight||400;this._camera.aspect=y/E,this._camera.updateProjectionMatrix()}this._fitCameraToTextSize(M)}catch(t){console.error("[threed-text-wc] mesh update failed:",t)}}_removeMesh(){!this._mesh||!this._scene||(this._scene.remove(this._mesh),this._mesh.traverse(i=>{var s;i instanceof o.Mesh&&((s=i.geometry)==null||s.dispose(),(Array.isArray(i.material)?i.material:[i.material]).forEach(a=>a==null?void 0:a.dispose()))}),this._mesh=null)}_loop(){this._animId=requestAnimationFrame(()=>this._loop());const i=(performance.now()-this._startTime)/1e3;this._updatePlasma(i),this._mesh&&(this._mesh.rotation.x=this._rotation.x,this._mesh.rotation.y=this._rotation.y,this._mesh.rotation.z=this._cfg.rotateZ*(Math.PI/180)),this._renderer&&this._scene&&this._camera&&this._renderer.render(this._scene,this._camera)}_setupPlasmaEnvMap(){const s=new o.WebGLRenderTarget(256,256,{minFilter:o.LinearFilter,magFilter:o.LinearFilter}),t=de(this._primaryColor,this._secondaryColor),a=new o.ShaderMaterial({uniforms:{uTime:{value:0},uZoom:{value:8},uStop0:{value:t[0]},uStop1:{value:t[1]},uStop2:{value:t[2]},uStop3:{value:t[3]},uStop4:{value:t[4]},uStopCount:{value:Se}},vertexShader:ye,fragmentShader:we}),c=new o.Scene;c.add(new o.Mesh(new o.PlaneGeometry(2,2),a));const l=new o.OrthographicCamera(-1,1,1,-1,0,1);this._plasmaRt=s,this._plasmaMat=a,this._plasmaScene=c,this._plasmaCamera=l;const h=s.texture;return h.mapping=o.EquirectangularReflectionMapping,h}_updatePlasma(i){const{_plasmaRt:s,_plasmaMat:t,_plasmaScene:a,_plasmaCamera:c,_renderer:l}=this;if(!s||!t||!a||!c||!l)return;t.uniforms.uTime.value=i;const h=l.getRenderTarget();if(l.setRenderTarget(s),l.render(a,c),l.setRenderTarget(h),this._pmremGenerator&&this._pmremRt){this._pmremGenerator.fromEquirectangular(s.texture,this._pmremRt);const u=l.domElement;l.setViewport(0,0,u.clientWidth||u.width,u.clientHeight||u.height),l.setScissorTest(!1)}}_dispose(){var i,s,t,a,c,l,h;this._animId!==null&&cancelAnimationFrame(this._animId),(i=this._resizeOb)==null||i.disconnect(),(s=this._styleObserver)==null||s.disconnect(),this._removeMesh(),(t=this._plasmaRt)==null||t.dispose(),(a=this._plasmaMat)==null||a.dispose(),(c=this._pmremRt)==null||c.dispose(),(l=this._pmremGenerator)==null||l.dispose(),(h=this._renderer)==null||h.dispose()}}customElements.get("threed-text")||customElements.define("threed-text",pe),x.ThreedTextElement=pe,Object.defineProperty(x,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=threed-text.umd.js.map
