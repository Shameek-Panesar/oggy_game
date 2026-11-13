import { C, action, ball, box, group, solid, tube } from '../../scripts/model.js';

export function furnishing(ctx,parent,name,x,z,w,d) {
  const p=group(parent,name,x,0,z);
  if(w && d) solid(ctx,x,z,w,d);
  return p;
}
export function table(ctx,p,name,x,z,w,d,h,color) {
  const m=furnishing(ctx,p,name,x,z,w,d);
  box(m,'Rounded tabletop',0,h,0,w,.16,d,color,.07);
  for(const u of [-1,1]) for(const v of [-1,1]) tube(m,'Tapered leg',u*w*.36,h/2,v*d*.35,.078,.104,h,0xa55f67,10);
  return m;
}
export function chair(ctx,p,x,z,angle=0) {
  const m=table(ctx,p,'Dining chair',x,z,.61,.62,.53,0xffbc68);
  m.rotation.y=angle;
  box(m,'Rounded chair back',0,.91,.27,.56,.67,.13,0xffbc68,.06);
}
export function drawer(ctx,parent,name,x,y,z,w,h,d,color,kind='slide') {
  const motion=group(parent,name,x,y,z);
  const panel=group(motion,'Moving panel',kind==='hinge'?w/2:0,0,0);
  if(kind==='hinge') motion.position.x-=w/2;
  box(panel,'Rounded cabinet front',0,0,0,w,h,d,color,.055);
  box(panel,'Ivory handle',kind==='hinge'?w*.27:0,0,d/2+.056,Math.min(.24,w*.38),.045,.08,C.ivory,.02);
  ctx.animations.push(dt=>{
    const f=Math.min(1,dt*10);
    if(kind==='hinge') motion.rotation.y+=((motion.userData.open?-1.2:0)-motion.rotation.y)*f;
    else motion.position.z+=((motion.userData.open?z+.39:z)-motion.position.z)*f;
  });
  action(ctx,name,panel,()=>{motion.userData.open=!motion.userData.open;return motion.userData.open?'Opened':'Closed';});
  return panel;
}
export function lamp(p,x,y,z,color) {
  tube(p,'Lamp base',x,y+.05,z,.19,.22,.1,C.ink);
  tube(p,'Lamp stem',x,y+.27,z,.034,.042,.47,0xf7c26b);
  tube(p,'Cartoon lampshade',x,y+.51,z,.14,.32,.35,color);
}
export function frame(p,name,x,y,z,w,h,angle=0,variant=0) {
  const m=group(p,name,x,y,z);
  m.rotation.y=angle;
  box(m,'Beveled picture frame',0,0,0,w,h,.10,0xedb666,.06);
  box(m,'Illustration background',0,0,.056,w-.15,h-.15,.025,[0x5377a6,0xe68690,0x6bbb8d][variant%3],.022);
  ball(m,'Illustrated sun',w*.19,h*.19,.076,w*.09,w*.09,.017,0xffd36a);
  for(const i of [-1,1]) ball(m,'Illustrated hill',i*w*.16,-h*.17,.078,w*.21,h*.145,.015,i===1?0x744a91:0x99c6a1);
}
export function sofa(ctx,p) {
  const m=furnishing(ctx,p,'Curved cranberry sofa',7.05,3.63,3.61,1.36);
  box(m,'Upholstered sofa base',0,.42,0,3.60,.57,1.34,0xc23172,.22);
  box(m,'Curved back cushion',0,1.04,.5,3.46,.99,.48,0xdc4586,.23);
  for(const i of [-1,0,1]) box(m,'Seat cushion',i*.91,.74,-.11,.87,.30,.9,0xf162a3,.12);
  for(const i of [-1,1]) {
    ball(m,'Rolled armrest',i*1.59,.78,-.02,.26,.34,.71,0xd53a7a);
    box(m,'Throw cushion',i*1.04,1.08,.21,.54,.54,.22,i<0?0xffc970:0x7cdbd2,.105).rotation.z=i*.2;
  }
  for(const x of [-1.31,1.31]) for(const z of [-.44,.44]) tube(m,'Sofa feet',x,.14,z,.1,.12,.27,0x713f61,10);
}
