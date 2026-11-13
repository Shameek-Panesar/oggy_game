import * as T from '../vendor/three.module.js';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.js';
import { buildHouse, rooms } from './house.js';
import { group } from './model.js';

const canvas=document.querySelector('canvas');
const status=document.querySelector('#status');
const scene=new T.Scene();
scene.background=new T.Color(0x8fcaf2);
scene.fog=new T.Fog(0x9bd3f6,43,100);
const renderer=new T.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFShadowMap;
renderer.setClearColor(0x9fd7fc);

const house=buildHouse();
scene.add(house.root);
const staticDetails=/^(Scalloped roof tile|Ceramic floor tile|Pink tile wall|Warm floorboard|Flower stem|Flower petal|Golden flower center|Wallpaper scallop)$/;
function batchDetails(parent) {
  const batches=new Map();
  for(const child of [...parent.children]) {
    if(!child.isMesh) {batchDetails(child);continue;}
    if(!staticDetails.test(child.name)) continue;
    child.updateMatrix();
    const key=child.material.uuid;
    if(!batches.has(key)) batches.set(key,[]);
    batches.get(key).push(child);
  }
  for(const items of batches.values()) {
    if(items.length<3) continue;
    const geometries=items.map(item=>{
      const geometry=item.geometry.index?item.geometry.toNonIndexed():item.geometry.clone();
      return geometry.applyMatrix4(item.matrix);
    });
    const merged=new T.Mesh(mergeGeometries(geometries),items[0].material);
    merged.castShadow=true;merged.receiveShadow=true;
    parent.remove(...items);
    parent.add(merged);
    geometries.forEach(geometry=>geometry.dispose());
  }
}
batchDetails(house.root);
scene.add(new T.HemisphereLight(0xfff6ea,0xb7a4e4,1.63));
const sunlight=new T.DirectionalLight(0xffebc8,1.75);
sunlight.position.set(-13,23,12);
sunlight.castShadow=true;
sunlight.shadow.mapSize.set(2048,2048);
Object.assign(sunlight.shadow.camera,{left:-19,right:19,top:19,bottom:-19,near:1,far:63});
sunlight.shadow.normalBias=.035;
sunlight.shadow.bias=-.00012;
scene.add(sunlight,sunlight.target);
const fill=new T.DirectionalLight(0xa2d8ff,.55);
fill.position.set(9,6,-11);
scene.add(fill);
const world=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshStandardMaterial({color:0x8bbec5,roughness:1}));
world.rotation.x=-Math.PI/2; world.position.y=-.83; world.receiveShadow=true; scene.add(world);

const marker=group(scene,'Map exploration marker');
const markerFloor=new T.Mesh(new T.RingGeometry(.28,.37,28),new T.MeshBasicMaterial({color:0xfff5c7,side:T.DoubleSide}));
markerFloor.rotation.x=-Math.PI/2;
markerFloor.position.y=.052;
marker.add(markerFloor);
const markerGem=new T.Mesh(new T.OctahedronGeometry(.28),new T.MeshStandardMaterial({color:0xffc451,emissive:0x623719}));
markerGem.scale.y=1.28;
marker.add(markerGem);

const camera=new T.PerspectiveCamera(42,1,.12,130);
const topCamera=new T.OrthographicCamera(-17,17,15,-15,.1,90);
topCamera.up.set(0,0,-1);
topCamera.position.set(0,31,1);
topCamera.lookAt(0,0,1);
const wideLook=new T.Vector3(0,1.95,1.1);
const look=new T.Vector3();
const wanted=new T.Vector3();
const camTarget=new T.Vector3();
const hitPoint=new T.Vector3();
const held=new Set();
let mode='exterior', yaw=-.37, drag=null, previewAge=0, last=performance.now(), toastUntil=0;
let viewportWidth=0, viewportHeight=0, nearest=null;
const modeButtons=[...document.querySelectorAll('[data-view]')];
const roomButtons=document.querySelector('#rooms');
const actionsButton=document.querySelector('#interact');
const crouchButton=document.querySelector('#crouch');
const labels=document.querySelector('#map-labels');
const labelElements=rooms.map(room=>{
  const item=document.createElement('button');
  item.type='button';
  item.textContent=room.name;
  item.addEventListener('click',()=>jump(room));
  labels.append(item);
  return item;
});

for(const room of rooms) {
  const item=document.createElement('button');
  item.type='button';
  item.textContent=room.name;
  item.addEventListener('click',()=>jump(room));
  roomButtons.append(item);
}

function setMode(value,snap=false) {
  if(mode==='exterior' && value==='walk') yaw=0;
  mode=value;
  canvas.dataset.view=value;
  modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===value)));
  labels.hidden=value!=='overview';
  marker.visible=value!=='exterior';
  if(snap) updateCamera(1);
}
function jump(room) {
  Object.assign(house.player,{x:room.x,z:room.z});
  house.crouched=false;
  setMode('walk',true);
  toast(room.name);
}
function toast(message) {
  status.textContent=message;
  toastUntil=performance.now()+2250;
}
function crouch() {
  if(mode!=='walk') setMode('walk',true);
  house.crouched=!house.crouched;
  if(!house.crouched && house.blocked(house.player.x,house.player.z)) {
    house.crouched=true;
    toast('Move clear before standing');
  } else toast(house.crouched?'Crouching · vents accessible':'Standing');
}
function interact() {
  if(mode!=='walk') return;
  if(!nearest) {toast('Move closer to a door or object');return;}
  if(nearest.name.endsWith('vent') && !house.crouched) {toast('Crouch to enter this vent');return;}
  toast(nearest.run());
}
function reset() {
  window.location.reload();
}

modeButtons.forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.view,true)));
document.querySelector('#reset').addEventListener('click',reset);
crouchButton.addEventListener('click',crouch);
actionsButton.addEventListener('click',interact);
const movementKeys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
window.addEventListener('keydown',e=>{
  if(e.altKey || e.ctrlKey || e.metaKey || e.target.tagName==='SUMMARY' && e.code==='Space') return;
  if(movementKeys.includes(e.code)) {
    e.preventDefault();
    if(mode==='exterior') setMode('walk',true);
    held.add(e.code);
  }
  if(e.repeat) return;
  if(e.code==='KeyE') interact();
  if(e.code==='KeyC') crouch();
  if(e.code==='KeyM') setMode(mode==='overview'?'walk':'overview',true);
  if(e.code==='Digit1') setMode('exterior',true);
  if(e.code==='Digit2') setMode('walk',true);
});
window.addEventListener('keyup',e=>held.delete(e.code));
window.addEventListener('blur',()=>{held.clear();drag=null;});
canvas.addEventListener('pointerdown',e=>{
  if(mode==='overview') return;
  drag={id:e.pointerId,x:e.clientX};
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
  if(drag?.id!==e.pointerId) return;
  yaw-=(e.clientX-drag.x)*.007;
  drag.x=e.clientX;
});
for(const event of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(event,()=>drag=null);
for(const control of document.querySelectorAll('[data-key]')) {
  const key=control.dataset.key;
  control.addEventListener('pointerdown',e=>{
    e.preventDefault();
    control.setPointerCapture(e.pointerId);
    if(mode!=='walk') setMode('walk',true);
    held.add(key);
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture']) control.addEventListener(event,()=>held.delete(key));
}

function walk(dt) {
  if(mode!=='walk') return;
  const {player}=house;
  const f=Number(held.has('KeyW')||held.has('ArrowUp'))-Number(held.has('KeyS')||held.has('ArrowDown'));
  const s=Number(held.has('KeyD')||held.has('ArrowRight'))-Number(held.has('KeyA')||held.has('ArrowLeft'));
  const length=Math.hypot(f,s)||1;
  const speed=(house.crouched?2.1:4.15)*dt/length;
  const dx=(s*Math.cos(yaw)-f*Math.sin(yaw))*speed;
  const dz=(-s*Math.sin(yaw)-f*Math.cos(yaw))*speed;
  const radius=house.crouched?.19:.29;
  if(!house.blocked(player.x+dx,player.z,radius)) player.x+=dx;
  if(!house.blocked(player.x,player.z+dz,radius)) player.z+=dz;
  marker.position.set(player.x,0,player.z);
  markerGem.position.y=(house.crouched?.42:.88)+Math.sin(previewAge*3)*.065;
  markerGem.rotation.y=previewAge*1.7;
  nearest=null;
  let best=Infinity;
  for(const item of house.actions) {
    item.position.getWorldPosition(hitPoint);
    const distance=Math.hypot(hitPoint.x-player.x,hitPoint.z-player.z);
    const reach=item.name.endsWith('door')||item.name==='Dining passage'?1.65:1.38;
    if(distance<reach && distance<best) {
      best=distance;
      nearest=item;
    }
  }
  if(house.carried) house.carried.position.set(player.x+.49*Math.cos(yaw),house.crouched?.43:1.06,player.z-.49*Math.sin(yaw));
}

function updateCamera(f) {
  const {player}=house;
  const inside=player.z<6.9 && player.z>-6.6 && player.x>-12 && player.x<10.45;
  house.roofs.visible=mode==='exterior'||(mode==='walk'&&!inside);
  for(const wall of house.front) wall.visible=mode!=='overview';
  if(mode==='exterior') {
    wanted.set(Math.sin(yaw)*29,11.6,Math.cos(yaw)*29+1);
    camTarget.copy(wideLook);
  } else {
    const distance=inside?6.05:7.25;
    wanted.set(player.x+Math.sin(yaw)*distance,inside?5.95:6.75,player.z+Math.cos(yaw)*distance);
    camTarget.set(player.x,inside?.31:.78,player.z);
    if(mode==='walk' && inside) {
      // Cut away the front facade when the camera looks through it.
      const rayX=wanted.x-player.x, rayZ=wanted.z-player.z;
      for(const wall of house.front) wall.visible=rayZ<=0 || player.z+rayZ<5.94;
    }
  }
  camera.position.lerp(wanted,f);
  look.lerp(camTarget,f);
  camera.lookAt(look);
}
function resize() {
  const w=canvas.clientWidth,h=canvas.clientHeight;
  if(viewportWidth===w&&viewportHeight===h) return;
  viewportWidth=w;viewportHeight=h;
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.fov=w/h<1?57:42;
  camera.updateProjectionMatrix();
  const extent=Math.max(15.4,17.6/(w/h));
  Object.assign(topCamera,{left:-extent*w/h,right:extent*w/h,top:extent,bottom:-extent});
  topCamera.updateProjectionMatrix();
}
function frame(now) {
  const dt=Math.min(.05,(now-last)/1000);
  last=now;previewAge+=dt;
  resize();
  walk(dt);
  for(const animate of house.animations) animate(dt);
  updateCamera(1-Math.exp(-dt*10));
  if(mode==='overview') for(let i=0;i<rooms.length;i++) {
    const {x,z}=rooms[i];
    hitPoint.set(x,0,z).project(topCamera);
    labelElements[i].style.left=(hitPoint.x*.5+.5)*100+'%';
    labelElements[i].style.top=(.5-hitPoint.y*.5)*100+'%';
  }
  if(now>toastUntil) {
    status.textContent=mode==='exterior'?'Drag to orbit the house':mode==='overview'?'Choose a room to explore':nearest?'E · '+nearest.name:'Explore the house';
  }
  actionsButton.disabled=mode!=='walk'||!nearest;
  crouchButton.setAttribute('aria-pressed',String(house.crouched));
  renderer.render(scene,mode==='overview'?topCamera:camera);
  requestAnimationFrame(frame);
}

setMode('exterior',true);
document.body.dataset.ready='true';
requestAnimationFrame(frame);
