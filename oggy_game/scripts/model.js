import * as T from '../vendor/three.module.js';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { colors } from '../assets/materials/palette.js';

export const C = colors;
const materials = new Map();
const geometries = new Map();
export function group(parent, name, x = 0, y = 0, z = 0) {
  const part = new T.Group();
  part.name = name;
  part.position.set(x,y,z);
  parent.add(part);
  return part;
}
function mesh(parent, name, key, geometry, color, x, y, z) {
  if (!geometries.has(key)) geometries.set(key, geometry());
  if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, roughness: .79 }));
  const part = new T.Mesh(geometries.get(key), materials.get(color));
  part.name = name;
  part.position.set(x,y,z);
  part.castShadow = true;
  part.receiveShadow = true;
  parent.add(part);
  return part;
}
export function box(p,n,x,y,z,w,h,d,c,r=0) {
  return mesh(p,n,'b'+[w,h,d,r],()=>r ? new RoundedBoxGeometry(w,h,d,2,r) : new T.BoxGeometry(w,h,d),c,x,y,z);
}
export function ball(p,n,x,y,z,w,h,d,c) {
  const m=mesh(p,n,'sphere',()=>new T.SphereGeometry(1,16,10),c,x,y,z);
  m.scale.set(w,h,d);
  return m;
}
export function tube(p,n,x,y,z,r1,r2,h,c,sides=16) {
  return mesh(p,n,'c'+[r1,r2,h,sides],()=>new T.CylinderGeometry(r1,r2,h,sides),c,x,y,z);
}
export function link(p,n,a,b,r,c) {
  const start=new T.Vector3(...a), end=new T.Vector3(...b), delta=end.clone().sub(start);
  const mid=start.clone().addScaledVector(delta,.5);
  const m=tube(p,n,...mid.toArray(),r,r,delta.length(),c);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  return m;
}
export function polygon(p,n,points,depth,c,x=0,y=0,z=0) {
  return mesh(p,n,n+JSON.stringify([points,depth]),()=>{
    const shape=new T.Shape();
    points.forEach(([u,v],i)=>i ? shape.lineTo(u,v) : shape.moveTo(u,v));
    shape.closePath();
    return new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false});
  },c,x,y,z);
}
export function solid(ctx,x,z,w,d,active=()=>true) {
  ctx.colliders.push({x,z,w,d,active});
}
export function action(ctx,name,object,run,position=object) {
  ctx.actions.push({name,object,position,run});
}
