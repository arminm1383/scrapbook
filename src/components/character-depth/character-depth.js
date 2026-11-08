import { buildCharacterMesh } from './mesh.js';
const vertex = `attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUv;
uniform mat4 uModel;uniform vec2 uScale;varying vec2 vUv;varying vec3 vNormal;
void main(){vec4 p=uModel*vec4(aPosition,1.);gl_Position=vec4(p.xy*uScale,-p.z*.25,1.);vUv=aUv;vNormal=mat3(uModel)*aNormal;}`;
const fragment = `precision highp float;uniform sampler2D uTexture;uniform float uTextureHeight;uniform float uSurface;
varying vec2 vUv;varying vec3 vNormal;
void main(){vec4 c=texture2D(uTexture,vec2(vUv.x,vUv.y*uTextureHeight));if(c.a<.003)discard;
float shade=uSurface>.5?1.:uSurface<-.5?.72:.86+.10*abs(normalize(vNormal).z);
gl_FragColor=vec4(c.rgb*shade,c.a);}`;
function rotation(rx,ry){const x=rx*Math.PI/180,y=ry*Math.PI/180,c=Math.cos(x),s=Math.sin(x),C=Math.cos(y),S=Math.sin(y);return new Float32Array([C,s*S,-c*S,0,0,c,s,0,S,-s*C,c*C,0,0,0,0,1]);}

export class CharacterDepth extends HTMLElement {
  connectedCallback(){
    if(this.active)return;this.active=true;this.buffers=[];this.shaders=[];this.abort=new AbortController();
    this.current={x:0,y:0};this.target={x:0,y:0};this.velocity={x:0,y:0};this.maxTilt=2;
    this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    const root=this.shadowRoot||this.attachShadow({mode:'open'});
    root.innerHTML=`<style>:host{display:block;position:relative;width:100%;height:100%;outline:none;cursor:grab;touch-action:none;user-select:none}:host([data-dragging]){cursor:grabbing}:host(:focus-visible){outline:1px solid #596b5d;outline-offset:-3px}canvas{position:absolute;inset:0;width:100%;height:100%;display:block}</style><canvas aria-hidden="true"></canvas>`;
    this.canvas=root.querySelector('canvas');
    this.gl=this.canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});
    if(!this.gl){this.dataset.error='webgl-unavailable';return;}
    try{this.initialize();this.bind();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this);this.load();}
    catch{this.dataset.error='renderer';}
  }
  initialize(){
    const gl=this.gl;this.program=gl.createProgram();
    for(const [type,source]of[[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const shader=gl.createShader(type);this.shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader compilation failed');gl.attachShader(this.program,shader);
    }
    gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error('Shader linking failed');
    this.uniforms=Object.fromEntries(['uModel','uScale','uTexture','uTextureHeight','uSurface'].map(key=>[key,gl.getUniformLocation(this.program,key)]));
    this.locations=Object.fromEntries(['aPosition','aNormal','aUv'].map(key=>[key,gl.getAttribLocation(this.program,key)]));
    gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  }
  async load(){
    try{
      const image=new Image();image.src=this.getAttribute('src');await image.decode();if(!this.active)return;
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
      const mesh=buildCharacterMesh(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);
      const gl=this.gl;
      this.meshes=['front','sides','back'].map((name,index)=>{const buffer=gl.createBuffer();this.buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh[name],gl.STATIC_DRAW);return {buffer,count:mesh[name].length/8,surface:[1,0,-1][index]};});
      const padded=document.createElement('canvas');padded.width=2**Math.ceil(Math.log2(canvas.width));padded.height=2**Math.ceil(Math.log2(canvas.height));
      padded.getContext('2d').drawImage(canvas,0,0);this.textureHeight=canvas.height/padded.height;
      this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,padded);gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      this.dataset.triangles=String(this.meshes.reduce((sum,m)=>sum+m.count/3,0));this.dataset.surfaces='front back closed-sides';
      this.resize();this.render();
    }catch{if(this.active)this.dataset.error='image-or-mesh';}
  }
  bind(){
    const options={signal:this.abort.signal};
    this.addEventListener('pointerdown',event=>{if(event.button!==0||this.drag)return;this.focus({preventScroll:true});this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,rx:this.target.x,ry:this.target.y};this.setPointerCapture(event.pointerId);this.dataset.dragging='true';},options);
    this.addEventListener('pointermove',event=>{if(event.pointerId!==this.drag?.id)return;const sensitivity=this.maxTilt/Math.max(110,this.clientWidth*.24);this.setTarget(this.drag.rx-(event.clientY-this.drag.y)*sensitivity,this.drag.ry+(event.clientX-this.drag.x)*sensitivity);},options);
    const release=event=>{if(event.pointerId!==this.drag?.id)return;this.drag=null;delete this.dataset.dragging;this.reset();};
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.addEventListener(name,release,options);
    this.addEventListener('keydown',event=>{let{x,y}=this.target;const key=event.key;if(key==='Escape'||key==='Home'){event.preventDefault();this.reset();return;}if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key))return;event.preventDefault();if(key==='ArrowLeft')y-=.25;if(key==='ArrowRight')y+=.25;if(key==='ArrowUp')x+=.25;if(key==='ArrowDown')x-=.25;this.setTarget(x,y);},options);
    this.motion.addEventListener('change',()=>{if(this.motion.matches){cancelAnimationFrame(this.raf);this.raf=null;this.current={...this.target};this.velocity={x:0,y:0};this.render();}},options);
    this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(this.raf);this.raf=null;delete this.dataset.ready;this.dataset.error='context-lost';},options);
  }
  setTarget(x,y){const length=Math.hypot(x,y),scale=length>this.maxTilt?this.maxTilt/length:1;this.target={x:x*scale,y:y*scale};if(this.motion.matches){this.current={...this.target};this.render();}else this.animate();}
  reset(){this.setTarget(0,0);}
  animate(){if(this.raf)return;let previous=performance.now();const step=now=>{if(!this.active)return;const dt=Math.min((now-previous)/1000,.032);previous=now;let energy=0;for(const key of ['x','y']){this.velocity[key]+=((this.target[key]-this.current[key])*145-this.velocity[key]*24)*dt;this.current[key]+=this.velocity[key]*dt;energy+=Math.abs(this.target[key]-this.current[key])+Math.abs(this.velocity[key]);}this.render();if(energy>.004)this.raf=requestAnimationFrame(step);else{this.current={...this.target};this.velocity={x:0,y:0};this.raf=null;this.render();}};this.raf=requestAnimationFrame(step);}
  resize(){if(!this.active||!this.clientWidth||!this.clientHeight)return;const style=getComputedStyle(this);this.width=parseFloat(style.width);this.height=parseFloat(style.height);const ratio=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*ratio);this.canvas.height=Math.round(this.height*ratio);this.render();}
  render(){const gl=this.gl;if(!this.active||!this.meshes||!this.clientWidth||!this.clientHeight||gl.isContextLost())return;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.uniformMatrix4fv(this.uniforms.uModel,false,rotation(this.current.x,this.current.y));gl.uniform2f(this.uniforms.uScale,this.height/this.width,1);gl.uniform1i(this.uniforms.uTexture,0);gl.uniform1f(this.uniforms.uTextureHeight,this.textureHeight);gl.bindTexture(gl.TEXTURE_2D,this.texture);
    for(const mesh of this.meshes){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);for(const [key,size,offset]of[['aPosition',3,0],['aNormal',3,12],['aUv',2,24]]){gl.enableVertexAttribArray(this.locations[key]);gl.vertexAttribPointer(this.locations[key],size,gl.FLOAT,false,32,offset);}gl.uniform1f(this.uniforms.uSurface,mesh.surface);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
    this.dataset.ready='true';this.dataset.tiltX=this.current.x.toFixed(3);this.dataset.tiltY=this.current.y.toFixed(3);
  }
  disconnectedCallback(){this.active=false;this.abort?.abort();this.observer?.disconnect();cancelAnimationFrame(this.raf);this.raf=null;if(this.gl){for(const buffer of this.buffers)this.gl.deleteBuffer(buffer);for(const shader of this.shaders)this.gl.deleteShader(shader);if(this.texture)this.gl.deleteTexture(this.texture);if(this.program)this.gl.deleteProgram(this.program);}delete this.dataset.ready;}
}
if(!customElements.get('character-depth'))customElements.define('character-depth',CharacterDepth);
