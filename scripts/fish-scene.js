// Authoring-only articulated mesh rig using the original stippled artwork.
// The head stays anchored; a phase-lagged body wave strengthens toward the tail.
import * as THREE from 'three';
const W=426,H=788;
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W*2,H*2);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.append(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.OrthographicCamera(0,W,H,0,.1,100);camera.position.z=10;
const source=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=window.fishSource;});
const fishDefinitions=[
 {polygon:[[0,0],[1,0],[1,.40],[.55,.40],[.45,.31],[0,.31]],head:[245,190],axis:[.64,-.77],length:160,phase:0,cycles:5},
 {polygon:[[0,.31],[.45,.31],[.55,.40],[1,.40],[1,.58],[.51,.58],[.40,.67],[0,.67]],head:[265,397],axis:[-1,0],length:240,phase:1.5,cycles:6},
 {polygon:[[0,.67],[.40,.67],[.51,.58],[1,.58],[1,1],[0,1]],head:[114,590],axis:[.984,.178],length:270,phase:3,cycles:4},
];
const fishes=fishDefinitions.map((definition,index)=>{
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
 ctx.beginPath();definition.polygon.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();ctx.clip();ctx.drawImage(source,0,0,W,H);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const geometry=new THREE.PlaneGeometry(W,H,128,192);geometry.translate(W/2,H/2,0);
 const original=new Float32Array(geometry.attributes.position.array);
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=index;scene.add(mesh);
 return {...definition,mesh,original};
});
window.renderFishFrame=time=>{
 for(const f of fishes){
  const phase=time/4*Math.PI*2*f.cycles+f.phase;
  const p=f.mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=f.original[i*3],y=H-f.original[i*3+1];
   const dx=x-f.head[0],dy=y-f.head[1];
   const along=dx*f.axis[0]+dy*f.axis[1];
   const across=-dx*f.axis[1]+dy*f.axis[0];
   const rear=Math.max(0,Math.min(1,along/f.length));
   // Rearward traveling wave; subtract the rest pose so frame zero exactly
   // reproduces the original artwork rather than changing its silhouette.
   const rest=Math.sin(f.phase-rear*3.2);
   const beat=Math.sin(phase-rear*3.2)-rest;
   const flex=5.5*rear*rear*beat;
   // Small fin strokes are strongest away from the central body axis.
   const finWeight=Math.max(0,Math.min(1,(Math.abs(across)-28)/35))*Math.sin(rear*Math.PI);
   const fin=1.5*finWeight*(Math.sin(phase+.8)-Math.sin(f.phase+.8));
   p.setXYZ(i,x-f.axis[1]*(flex+fin),H-y-f.axis[0]*(flex+fin),0);
  }
  p.needsUpdate=true;
 }
 renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');
};
window.renderFishFrame(0);window.fishReady=true;
