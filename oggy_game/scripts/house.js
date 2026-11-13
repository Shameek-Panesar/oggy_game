import * as T from '../vendor/three.module.js';
import { C, action, box, group, solid } from './model.js';
import { wall, grille } from '../assets/walls/architecture.js';
import { buildExterior } from '../assets/exterior/garden.js';
import { buildRooms } from '../assets/interior/rooms.js';

export const spawn={x:0,z:9.45};
export const rooms=[
  {name:'Garden', x:0,z:9.45}, {name:'Entry hall',x:0,z:3.7}, {name:'Living room',x:3.6,z:3.15},
  {name:'Kitchen',x:3.85,z:-2.7}, {name:'Bedroom',x:-2.53,z:-2.1},
  {name:'Bathroom',x:-2.55,z:3.47}, {name:'Garage',x:-8,z:3}, {name:'Utility',x:-8,z:-3.3}
];
const opening=(kind,at,w,name)=>({kind,at,w,name});
const door=(at,name,w=1.62)=>opening('door',at,w,name);
const window=(at,w)=>opening('window',at,w);

export function buildHouse() {
  const root=new T.Group(); root.name='Cartoon House Map';
  const ctx={root, colliders:[], actions:[], animations:[], player:{...spawn}, crouched:false};
  ctx.blocked=(x,z,r=.28,skip=null)=>{
    if(x<-15.35 || x>15.35 || z<-12.2 || z>14.25) return true;
    return ctx.colliders.some(c=>{
      if(c===skip || !c.active()) return false;
      const dx=Math.max(0,Math.abs(x-c.x)-c.w/2),dz=Math.max(0,Math.abs(z-c.z)-c.d/2);
      return dx*dx+dz*dz<r*r;
    });
  };
  ctx.toggleCarry=(m,home)=>{
    if(ctx.carried) {
      ctx.carried.position.set(...ctx.carriedHome);
      if(ctx.carried===m) {ctx.carried=null;return;}
    }
    ctx.carried=m;ctx.carriedHome=home;
  };
  ctx.garden=group(root,'Exterior | Garden');
  ctx.shell=group(root,'Exterior | Walls and openings');
  ctx.roofs=group(root,'Exterior | Roofs and chimney');
  ctx.walls=group(root,'Interior | Modular partitions');
  ctx.rooms=group(root,'Interior | Floors and furniture');
  ctx.vents=group(root,'Systems | Ventilation');
  const outer=(name,a,b,c,gaps)=>wall(ctx,name,a,b,c,gaps,true);
  ctx.front=[
    outer('Garage facade',[-11.6,6],[-6.4,6],0xb2bbc8,[opening('garage',2.6,4,'Garage door')]),
    outer('Bathroom facade',[-6.4,6],[-1.5,6],0xe895dc,[window(2.15,1.68)]),
    outer('Entrance facade',[-1.5,6],[1.5,6],C.lime,[door(1.5,'Front door',1.84)]),
    outer('Living room facade',[1.5,6],[10,6],0xa1a8ed,[window(3.5,2.88),window(7.73,1.28)])
  ];
  outer('West wall',[-11.6,-6],[-11.6,6],0xa9b7c5,[window(2.4,1.65),window(7.2,1.7)]);
  outer('East wall',[10,6],[10,-6],0xa1a8ed,[window(2.0,2),window(9.15,2.08)]);
  outer('Kitchen back',[10,-6],[1.5,-6],0x6c94e9,[window(2.45,1.75)]);
  outer('Hall back',[1.5,-6],[-1.5,-6],C.lime,[]);
  outer('Bedroom back',[-1.5,-6],[-6.4,-6],0xdfa4d6,[window(1.4,1.66)]);
  outer('Utility back',[-6.4,-6],[-11.6,-6],0xacb7c6,[window(2.63,1.85)]);
  wall(ctx,'West hall partition',[-1.5,-6],[-1.5,6],C.lime,[door(3.93,'Bedroom door'),door(9.44,'Bathroom door')]);
  wall(ctx,'East hall partition',[1.5,-6],[1.5,6],C.lime,[door(3.5,'Kitchen door'),door(9.12,'Living room door',1.82)]);
  wall(ctx,'Living and kitchen partition',[1.5,0],[10,0],0x9699e9,[door(2.08,'Dining passage'),opening('vent',7.83,.68)]);
  wall(ctx,'Bedroom and bathroom partition',[-6.4,0],[-1.5,0],0xd394cc,[opening('vent',3.87,.68)]);
  wall(ctx,'West wing partition',[-6.4,-6],[-6.4,6],0xa7afc7,[door(2.0,'Bedroom utility door'),door(9.44,'Garage side door')]);
  wall(ctx,'Garage utility partition',[-11.6,-2.2],[-6.4,-2.2],0x9eabc2,[door(3.50,'Utility door')]);
  buildRooms(ctx);
  const bed=ctx.root.getObjectByName('Raised bed with hiding space');
  const bedCollider=ctx.colliders.find(c=>c.x===bed.position.x && c.z===bed.position.z);
  bedCollider.active=()=>!ctx.crouched;
  for(const u of [-.72,.72]) for(const v of [-1.1,1.1]) solid(ctx,bed.position.x+u,bed.position.z+v,.26,.26);
  solid(ctx,bed.position.x,bed.position.z-1.37,1.96,.23);
  buildExterior(ctx);
  const pairs=[
    [{name:'Living room vent',x:9.33,z:.23,a:0,exit:[9.25,.73]},{name:'Kitchen vent',x:9.33,z:-.23,a:Math.PI,exit:[9.25,-.78]}],
    [{name:'Bathroom vent',x:-2.53,z:.23,a:0,exit:[-2.53,.74]},{name:'Bedroom vent',x:-2.53,z:-.23,a:Math.PI,exit:[-2.53,-.76]}]
  ];
  ctx.ventPaths=[];
  for(const [a,b] of pairs) {
    ctx.ventPaths.push({from:a.name,to:b.name,fromPosition:[a.x,.27,a.z],toPosition:[b.x,.27,b.z]});
    for(const offset of [-.335,.335]) box(ctx.vents,'Duct side panel',a.x+offset,.31,0,.042,.43,.47,0x556a80,.012);
    for(const y of [.10,.52]) box(ctx.vents,'Duct horizontal panel',a.x,y,0,.71,.038,.47,0x556a80,.011);
    for(const [here,there] of [[a,b],[b,a]]) {
      const m=grille(ctx.vents,here.name,here.x,.33,here.z,here.a);
      action(ctx,here.name,m,()=>{
        ctx.player.x=there.exit[0];ctx.player.z=there.exit[1];ctx.crouched=true;
        return 'Through the duct · '+there.name;
      });
    }
  }
  grille(ctx.shell,'Exterior exhaust grille',10.16,2.8,-4.59,Math.PI/2);
  return ctx;
}
