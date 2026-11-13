import { C, action, box, group, solid, tube, ball, link } from '../../scripts/model.js';

export function snack(ctx,p,x,y,z) {
  const m=group(p,'Plate of biscuits',x,y,z);
  tube(m,'Ceramic plate',0,0,0,.29,.22,.058,C.ivory);
  for(const [u,v] of [[0,0],[-.13,.1],[.125,.09],[.1,-.13],[-.12,-.12]]) {
    tube(m,'Biscuit',u,.047,v,.081,.077,.05,0xd78b51,10);
    for(const i of [-1,1]) ball(m,'Chocolate chip',u+i*.024,.073,v+i*.022,.015,.009,.015,0x6f3c46);
  }
  action(ctx,'Biscuit plate',m,()=>{
    ctx.toggleCarry(m,[x,y,z]);
    return ctx.carried===m?'Picked up':'Set down';
  });
}

export function crate(ctx,p,x,z) {
  const m=group(p,'Pushable storage crate',x,0,z);
  box(m,'Rounded crate',0,.34,0,.70,.68,.69,0xd99058,.072);
  for(const side of [-1,1]) for(const v of [-.23,0,.23]) box(m,'Crate timber slat',0,.33+v,side*.344,.64,.052,.045,0x9c5b51,.014);
  const collider={x,z,w:.70,d:.69,active:()=>true};
  ctx.colliders.push(collider);
  action(ctx,'Storage crate',m,()=>{
    const dx=m.position.x-ctx.player.x, dz=m.position.z-ctx.player.z, length=Math.hypot(dx,dz)||1;
    const nx=m.position.x+dx*.65/length,nz=m.position.z+dz*.65/length;
    if(ctx.blocked(nx,nz,.39,collider)) return 'Crate is blocked';
    collider.x=nx; collider.z=nz;
    m.position.x=nx; m.position.z=nz;
    return 'Pushed';
  });
}

export function trap(ctx,p,x,z) {
  const m=group(p,'Cartoon spring trap',x,0,z);
  box(m,'Wooden trap platform',0,.07,0,.69,.14,.94,0xca8466,.05);
  const spring=group(m,'Spring arm',0,.12,-.20);
  link(spring,'Spring arm bar',[-.24,0,0],[.24,0,0],.035,0x8996ad);
  for(const s of [-1,1]) link(spring,'Spring arm side',[s*.24,0,0],[s*.24,0,.55],.027,0x8996ad);
  box(m,'Cheese bait',.02,.16,.27,.22,.15,.19,0xffcf54,.037);
  action(ctx,'Spring trap',m,()=>{
    spring.userData.armed=!spring.userData.armed;
    return spring.userData.armed?'Trap armed':'Trap released';
  });
  ctx.animations.push(dt=>{
    spring.rotation.x+=((spring.userData.armed?-.92:0)-spring.rotation.x)*Math.min(1,dt*18);
  });
}
