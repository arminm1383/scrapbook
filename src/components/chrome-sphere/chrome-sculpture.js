// Dependency-free WebGL component. The sphere and every prong are triangle meshes.
const vertex=`
attribute vec3 aPosition; attribute vec3 aNormal;
uniform mat4 uProjection; uniform mat4 uModel; uniform mat4 uView;
varying vec3 vNormal; varying vec3 vWorld; varying vec3 vLocal;
void main(){vec4 world=uModel*vec4(aPosition,1.);vWorld=world.xyz;vNormal=mat3(uModel)*aNormal;vLocal=aPosition;gl_Position=uProjection*uView*world;}`;
const fragment=`
precision highp float;
varying vec3 vNormal; varying vec3 vWorld; varying vec3 vLocal;
uniform sampler2D uPhoto; uniform float uCore;
vec3 environment(vec3 r){
 float band=sin(r.y*15.+r.x*4.);
 float window=pow(max(0.,sin(r.x*9.+r.z*2.)),14.);
 vec3 lower=vec3(.13,.15,.17),upper=vec3(.89,.91,.93);
 vec3 color=mix(lower,upper,smoothstep(-.35,.5,r.y));
 color*=.58+.42*smoothstep(-.25,.3,band);
 color+=vec3(.5)*window;
 color+=vec3(.16,.12,.065)*pow(max(0.,dot(r,normalize(vec3(-1.,1.,1.)))),24.);
 return color;
}
void main(){
 vec3 n=normalize(vNormal),view=normalize(vec3(0.,0.,7.7)-vWorld);
 vec3 r=reflect(-view,n); vec3 chrome=environment(r);
 float fresnel=pow(1.-max(0.,dot(n,view)),4.);
 vec3 color=chrome;
 if(uCore>.5){
   // Keep the actual photographed reflection, including the couple and floor motif.
   vec2 uv=vec2((vLocal.x*570.+526.)/1536.,(1200.-vLocal.y*630.)/2048.);
   vec3 photo=texture2D(uPhoto,uv).rgb;
   float front=smoothstep(-.12,.25,vLocal.z);
   color=mix(chrome,photo,front*.94);
   color=mix(color,environment(r),fresnel*.37);
 }
 float highlight=pow(max(0.,dot(n,normalize(vec3(-.7,1.,1.7)))),85.);
 color+=vec3(.14)*highlight;
 gl_FragColor=vec4(color,1.);
}`;

const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function model(rx,ry){const x=rx*Math.PI/180,y=ry*Math.PI/180,c=Math.cos(x),s=Math.sin(x),C=Math.cos(y),S=Math.sin(y);return new Float32Array([C,s*S,-c*S,0,0,c,s,0,S,-s*C,c*C,0,0,0,0,1]);}
function perspective(aspect){const f=1/Math.tan(32*Math.PI/360),near=.1,far=40;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
const norm=v=>{const l=Math.hypot(...v);return v.map(x=>x/l)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function sphere(){const p=[],n=[];const point=(i,j)=>{let lat=i/64*Math.PI,lon=j/96*Math.PI*2;return [Math.sin(lat)*Math.cos(lon),Math.cos(lat),Math.sin(lat)*Math.sin(lon)]};for(let i=0;i<64;i++)for(let j=0;j<96;j++){let a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);for(const v of [a,b,c,a,c,d]){p.push(...v);n.push(...v)}}return {p,n};}
function spikes(){const p=[],n=[];
 // Two offset rings create a dense silhouette with actual near/far occlusion.
 const directions=[];
 for(let ring=0;ring<2;ring++)for(let i=0;i<30;i++){
   let angle=(i+(ring?.47:0))/30*Math.PI*2;
   const z=ring===0?.16:-.43;const r=Math.sqrt(1-z*z);
   directions.push([Math.cos(angle)*r,Math.sin(angle)*r,z]);
 }
 // A few prongs emerge from the front surface, angled out rather than blocking the reflection.
 for(let i=0;i<11;i++){const a=(i/11)*Math.PI*2+.2;directions.push([Math.cos(a)*.79,Math.sin(a)*.79,.613]);}
 directions.forEach((dir,i)=>{
   const d=norm(dir),u=norm(cross(d,Math.abs(d[1])>.95?[1,0,0]:[0,1,0])),v=cross(d,u);
   const length=1.28+.16*Math.sin(i*2.39),base=.029+(i%3)*.003;
   const rings=[[.985,base],[1.04,base],[1.04+length,base*.66],[1.10+length,0]];
   const point=(ring,a)=>{const [t,r]=ring;return d.map((x,k)=>x*t+r*(Math.cos(a)*u[k]+Math.sin(a)*v[k]));};
   for(let j=0;j<rings.length-1;j++)for(let k=0;k<12;k++){
     let a=k/12*Math.PI*2,b=(k+1)/12*Math.PI*2;
     let A=point(rings[j],a),B=point(rings[j+1],a),C=point(rings[j+1],b),D=point(rings[j],b);
     const slope=(rings[j][1]-rings[j+1][1])/(rings[j+1][0]-rings[j][0]);
     const normal=t=>norm(u.map((x,k)=>Math.cos(t)*x+Math.sin(t)*v[k]+slope*d[k]));
     for(const [pt,theta] of [[A,a],[B,a],[C,b],[A,a],[C,b],[D,b]]){p.push(...pt);n.push(...normal(theta));}
   }
 });return {p,n};}

export class ChromeSculpture extends HTMLElement{
 connectedCallback(){
  if(this.initialized)return;this.initialized=true;
  const root=this.shadowRoot||this.attachShadow({mode:'open'});
  root.innerHTML=`<style>:host{display:block;position:relative;width:100%;aspect-ratio:1;isolation:isolate;background:transparent;outline:none;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}:host(:active){cursor:grabbing}:host(:focus-visible){outline:1px solid #7c8893;outline-offset:-4px}canvas{display:block;position:absolute;inset:0;width:100%;height:100%}.error{padding:40px;text-align:center;font:14px sans-serif}</style><canvas aria-hidden="true"></canvas>`;
  this.canvas=this.shadowRoot.querySelector('canvas');
  const gl=this.gl=this.canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl){this.shadowRoot.innerHTML='<p class="error">This browser needs WebGL enabled to display the sculpture.</p>';return;}
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
  const program=this.program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  this.uniforms=Object.fromEntries(['uProjection','uModel','uView','uPhoto','uCore'].map(name=>[name,gl.getUniformLocation(program,name)]));
  this.meshes=[sphere(),spikes()].map(mesh=>{const out={count:mesh.p.length/3};for(const [key,name]of [['p','aPosition'],['n','aNormal']]){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mesh[key]),gl.STATIC_DRAW);out[key]=buffer;}return out;});
  this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array([155,158,160]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const image=new Image();image.onload=()=>{if(!this.isConnected)return;gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);this.render();this.dataset.ready='true';};image.onerror=()=>{this.dataset.error='reflection-image';};image.src=this.getAttribute('reflection')||new URL('./assets/reflection.jpg',import.meta.url);
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  this.current={x:0,y:0};this.target={x:0,y:0};this.velocity={x:0,y:0};this.maxTilt=Math.min(8,Math.max(1,Number(this.getAttribute('max-tilt'))||5));this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.abort=new AbortController();const opts={signal:this.abort.signal};
  this.addEventListener('pointerdown',e=>{if(e.button!==0||this.drag)return;this.focus({preventScroll:true});this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,rx:this.target.x,ry:this.target.y};this.setPointerCapture(e.pointerId);this.dataset.dragging='true';},opts);
  this.addEventListener('pointermove',e=>{if(!this.drag||e.pointerId!==this.drag.id)return;const sensitivity=this.maxTilt/Math.max(110,this.clientWidth*.24);this.setTarget(this.drag.rx-(e.clientY-this.drag.y)*sensitivity,this.drag.ry+(e.clientX-this.drag.x)*sensitivity);},opts);
  const release=e=>{if(!this.drag||e.pointerId!==this.drag.id)return;this.drag=null;delete this.dataset.dragging;this.reset();};
  for(const name of ['pointerup','pointercancel','lostpointercapture'])this.addEventListener(name,release,opts);
  this.addEventListener('keydown',e=>{let{x,y}=this.target;const key=e.key;if(key==='Escape'||key==='Home'){e.preventDefault();this.reset();return;}if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key))return;e.preventDefault();if(key==='ArrowLeft')y-=.6;if(key==='ArrowRight')y+=.6;if(key==='ArrowUp')x+=.6;if(key==='ArrowDown')x-=.6;this.setTarget(x,y);},opts);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this);this.resize();
 }
 setTarget(x,y){const len=Math.hypot(x,y),scale=len>this.maxTilt?this.maxTilt/len:1;this.target={x:x*scale,y:y*scale};if(this.reduced){this.current={...this.target};this.render();}else this.animate();}
 reset(){if(this.gl)this.setTarget(0,0);}
 resize(){if(!this.gl)return;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.clientWidth*dpr);this.canvas.height=Math.round(this.clientHeight*dpr);this.render();}
 animate(){if(this.raf)return;let prev=performance.now();const step=now=>{const dt=Math.min((now-prev)/1000,.032);prev=now;let energy=0;for(const k of ['x','y']){const force=(this.target[k]-this.current[k])*145-this.velocity[k]*24;this.velocity[k]+=force*dt;this.current[k]+=this.velocity[k]*dt;this.current[k]=Math.max(-this.maxTilt,Math.min(this.maxTilt,this.current[k]));energy+=Math.abs(this.target[k]-this.current[k])+Math.abs(this.velocity[k]);}this.render();if(energy>.004)this.raf=requestAnimationFrame(step);else{this.current={...this.target};this.velocity={x:0,y:0};this.raf=null;this.render();}};this.raf=requestAnimationFrame(step);}
 render(){const gl=this.gl;if(!gl||!this.current)return;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);const aspect=this.canvas.width/Math.max(1,this.canvas.height);gl.uniformMatrix4fv(this.uniforms.uProjection,false,perspective(aspect));const view=identity();view[14]=-9.5*Math.max(1,1/aspect);gl.uniformMatrix4fv(this.uniforms.uView,false,view);gl.uniformMatrix4fv(this.uniforms.uModel,false,model(this.current.x,this.current.y));gl.uniform1i(this.uniforms.uPhoto,0);gl.bindTexture(gl.TEXTURE_2D,this.texture);this.meshes.forEach((mesh,i)=>{gl.uniform1f(this.uniforms.uCore,i===0?1:0);for(const [key,name]of[['p','aPosition'],['n','aNormal']]){gl.bindBuffer(gl.ARRAY_BUFFER,mesh[key]);const loc=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}gl.drawArrays(gl.TRIANGLES,0,mesh.count);});this.dataset.tiltX=this.current.x.toFixed(3);this.dataset.tiltY=this.current.y.toFixed(3);}
 disconnectedCallback(){this.abort?.abort();this.resizeObserver?.disconnect();cancelAnimationFrame(this.raf);if(this.gl){for(const mesh of this.meshes){this.gl.deleteBuffer(mesh.p);this.gl.deleteBuffer(mesh.n)}this.gl.deleteTexture(this.texture);this.gl.deleteProgram(this.program);}this.initialized=false;}
}
customElements.define('chrome-sculpture',ChromeSculpture);
