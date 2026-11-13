import { C, ball, box, group, link, polygon, solid, tube } from '../../scripts/model.js';

function roof(ctx,name,x,z,w,d,base,rise) {
  const p=group(ctx.roofs,name,x,base,z);
  box(p,'Ivory eaves',0,-.1,0,w+.27,.21,d+.24,C.ivory,.07);
  box(p,'Cornice shadow',0,-.24,0,w+.05,.14,d+.08,C.shade,.035);
  polygon(p,'Roof gable',[[-w/2,0],[w/2,0],[0,rise]],d,0x835bd1,0,0,-d/2);
  const slope=Math.hypot(w/2,rise), tilt=Math.atan2(rise,w/2);
  const tileColors=[0x7350ba,0x7d57c8,0x885fd2,0x956ce0,0x8059ca];
  for(const side of [-1,1]) {
    const plane=group(p,'Tile slope',side*w/4,rise/2,0);
    plane.rotation.z=-side*tilt;
    const rows=Math.ceil(slope/.49), cols=Math.ceil(d/.62);
    for(let row=0;row<rows;row++) for(let col=0;col<cols;col++) {
      box(plane,'Scalloped roof tile',(row+.5)*slope/rows-slope/2,.033,(col+.5)*d/cols-d/2,
        slope/rows+.035,.082,d/cols-.013,tileColors[(row*3+col*7+(row+col)%3)%5],.036);
    }
  }
  link(p,'Rounded ridge cap',[0,rise+.01,-d/2],[0,rise+.01,d/2],.11,0xa27ee7);
}

function awning(p,x,z,w) {
  const colors=[0xef795d,0xffba62,0xffe177,0x88d79a,0x85bde8,0xa787db,0xf493a5];
  for(let i=0;i<Math.ceil(w/.27);i++) {
    const u=x-w/2+(i+.5)*.27, color=colors[i%colors.length];
    const cloth=box(p,'Striped canvas',u,2.63,z+.44,.27,.085,.99,color,.036);
    cloth.rotation.x=.42;
    ball(p,'Scalloped valance',u,2.40,z+.88,.135,.10,.064,color);
  }
}

export function buildExterior(ctx) {
  const { garden, shell, roofs }=ctx;
  box(garden,'Rounded lawn island',0,-.34,1,32,.51,28,0x77c661,.25);
  box(garden,'Lower lawn edge',0,-.59,1,31.5,.34,27.5,0x5da64e,.16);
  box(garden,'Front path',0,-.082,9.75,3.35,.14,5.7,0xf6a778,.07);
  box(garden,'Garage driveway',-9,-.08,9.7,4.68,.14,5.4,0xf1b28b,.065);
  for(let i=0;i<3;i++) box(garden,'Wide porch step',0,.02+i*.057,7.15-i*.24,3.38,.10,1.05,C.ivory,.04);
  for(const side of [-1,1]) {
    const x=side*1.52;
    tube(shell,'Porch column',x,1.57,6.44,.135,.165,2.85,C.ivory);
    box(shell,'Column base',x,.19,6.44,.44,.17,.44,C.shade,.055);
    box(shell,'Column capital',x,2.95,6.44,.46,.16,.47,C.ivory,.045);
    const lamp=group(shell,'Porch lantern',side*1.19,1.95,6.21);
    box(lamp,'Amber lantern glass',0,0,0,.17,.30,.18,0xffce65,.045);
    tube(lamp,'Lantern top',0,.18,0,.055,.145,.12,C.ink,8);
    tube(lamp,'Lantern base',0,-.17,0,.13,.065,.10,C.ink,8);
  }
  box(shell,'Portico entablature',0,3.05,6.38,3.68,.22,.90,C.ivory,.06);
  polygon(shell,'Porch pediment',[[-1.82,0],[1.82,0],[0,.77]],.40,C.ivory,0,3.16,6.33);
  polygon(shell,'Pediment inset',[[-1.27,0],[1.27,0],[0,.49]],.025,C.shade,0,3.24,6.735);
  for(const [x,w] of [[-4.25,2.46],[5.0,3.45],[9.3,2.63]]) awning(shell,x,6.12,w);
  roof(ctx,'Main purple roof',1.5,0,17.25,12.85,3.88,2.06);
  roof(ctx,'Garage purple roof',-9,0,5.68,12.75,3.84,.83);
  const dormer=group(roofs,'Front dormer',.05,4.13,5.10);
  box(dormer,'Dormer wall',0,1.02,0,4.35,2.03,2.44,C.butter,.10);
  box(dormer,'Dormer window frame',0,.94,1.24,3.24,1.11,.16,C.teal,.08);
  for(const x of [-1.02,0,1.02]) box(dormer,'Dormer glazing',x,.96,1.34,.92,.88,.06,C.glass,.03);
  box(dormer,'Dormer sill',0,.36,1.32,3.5,.16,.34,C.ivory,.045);
  const shade=group(dormer,'Dormer awning',0,-1.10,0);
  awning(shade,-.02,1.23,3.32);
  roof(ctx,'Dormer purple roof',.05,5.10,4.88,2.92,6.20,.81);
  const pipe=0x6b8b94;
  link(roofs,'Bent chimney lower pipe',[-.9,6.4,4.6],[-.9,7.31,4.6],.13,pipe);
  link(roofs,'Chimney elbow',[-.9,7.31,4.6],[-.55,7.55,4.6],.13,pipe);
  link(roofs,'Chimney stack',[-.55,7.55,4.6],[-.55,7.97,4.6],.13,pipe);
  tube(roofs,'Chimney rain cap',-.55,8.02,4.6,.04,.27,.20,pipe,12);
  link(shell,'External drainpipe',[9.82,.25,5.7],[9.82,3.56,5.7],.082,pipe);
  link(shell,'Downspout outlet',[9.82,.25,5.7],[10.34,.14,5.7],.082,pipe);

  for(const [x,z,scale] of [[-13.25,1.7,1],[12.9,1.0,1.1],[12.35,-5.4,.83]]) {
    const tree=group(garden,'Garden tree',x,0,z);
    tree.scale.setScalar(scale);
    tube(tree,'Tapered trunk',0,1.42,0,.18,.34,2.94,0xad7051);
    link(tree,'Branch',[0,1.35,0],[.84,2.55,.10],.14,0xad7051);
    for(const [u,y,v,s,c] of [[0,3.35,0,1.45,0x68b958],[-.87,2.8,.13,1.03,0x7ec755],[.8,2.95,.35,1.04,0x8bd261],[.27,3.85,-.30,.99,0xa2d875]]) ball(tree,'Leaf canopy',u,y,v,s,s*.87,s,c);
    solid(ctx,x,z,.68,.68);
  }
  for(const [x,z] of [[-4.7,7.65],[4.65,7.5],[8.85,7.67],[-13,7.4],[12,5.8]]) {
    ball(garden,'Raised flower bed',x,.01,z,1.46,.16,.63,0xb07959);
    for(let i=0;i<9;i++) {
      const u=x+(i-4)*.28,v=z+Math.sin(i*2.6)*.28,h=.29+(i%3)*.075;
      link(garden,'Flower stem',[u,0,v],[u,h,v],.027,0x388c4d);
      for(let j=0;j<5;j++) {
        const theta=j*Math.PI*2/5;
        ball(garden,'Flower petal',u+Math.cos(theta)*.083,h,v+Math.sin(theta)*.083,.062,.045,.062,[C.pink,0xffd759,0xfff4d2,0xe77c9e][i%4]);
      }
      ball(garden,'Golden flower center',u,h+.025,v,.043,.04,.043,0xe89439);
    }
  }
  for(const [x,z] of [[-6.5,6.77],[6.6,6.73],[11.1,-1.4],[-12.6,-3.8]]) {
    for(let i=-1;i<=1;i++) ball(garden,'Round shrub',x+i*.43,.31,z,.53,.49+(.1*(1-Math.abs(i))),.51,[0x3fae6b,0x64c36d,0x4db968][i+1]);
    solid(ctx,x,z,1.65,.94);
  }
  const post=group(garden,'Garden mailbox',2.56,0,10.02);
  box(post,'Mailbox post',0,.53,0,.16,1.08,.17,C.ivory,.033);
  box(post,'Rounded mailbox',0,1.15,0,.65,.44,.49,C.teal,.18);
  box(post,'Mail slot',0,1.18,.24,.31,.059,.035,C.ink,.022);
  box(post,'Raised flag',.34,1.38,.02,.06,.37,.073,0xf45d62,.02);
  box(post,'Flag pennant',.35,1.54,-.075,.08,.15,.24,0xf45d62,.026);
  solid(ctx,2.56,10.02,.35,.35);
}
