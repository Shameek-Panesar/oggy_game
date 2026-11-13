import { C, action, ball, box, group, link, solid, tube } from '../../scripts/model.js';
import { chair, drawer, frame, furnishing, lamp, sofa, table } from '../furniture/furniture.js';
import { crate, snack, trap } from '../props/interactive.js';

function floor(p,x,z,w,d,color) {
  box(p,'Room floor',x,-.057,z,w,.114,d,color);
}
function checkers(p,x,z,w,d,columns,rows,colors) {
  floor(p,x,z,w,d,colors[0]);
  for(let u=0;u<columns;u++) for(let v=0;v<rows;v++) {
    box(p,'Ceramic floor tile',x+(u+.5)*w/columns-w/2,.005,z+(v+.5)*d/rows-d/2,
      w/columns-.015,.019,d/rows-.015,colors[(u+v)%colors.length],.01);
  }
}
function planks(p,x,z,w,d) {
  floor(p,x,z,w,d,0xcb7348);
  for(let i=0;i<Math.round(w/.27);i++) {
    const count=Math.round(w/.27), step=w/count;
    box(p,'Warm floorboard',x+(i+.5)*step-w/2,.004,z,step-.012,.018,d-.02,[0xe69553,0xf2a762,0xdd864b][i%3]);
  }
}
function room(ctx,name) { return group(ctx.rooms,name); }

export function buildRooms(ctx) {
  const hall=room(ctx,'Lime entry hall');
  planks(hall,0,0,3,12);
  frame(hall,'Hall picture',-1.32,2.15,3.28,.79,.83,Math.PI/2,2);
  frame(hall,'Hall picture',1.32,2.17,-3.0,.73,.76,-Math.PI/2,1);
  frame(hall,'Hall picture',-.70,2.1,-5.82,1.05,.83,0,0);
  box(hall,'Hall display shelf',-1.18,1.47,3.38,.39,.10,1.09,C.teal,.036);
  ball(hall,'Small ceramic vase',-1.13,1.65,3.43,.12,.16,.13,C.pink);

  const living=room(ctx,'Living room and TV');
  floor(living,5.75,3,8.5,6,0x7762d2);
  const rug=tube(living,'Oval violet rug',6.94,.027,2.08,1,1,.038,0x9f75df,48);
  rug.scale.set(2.37,1,1.48);
  sofa(ctx,living);
  table(ctx,living,'Oval coffee table',7.03,2.13,1.67,.86,.54,0xffb779);
  snack(ctx,living,7.03,.648,2.13);
  const tv=furnishing(ctx,living,'Television and console',7.3,.56,2.14,.69);
  box(tv,'Rounded TV console',0,.36,0,2.14,.58,.63,0xb97880,.08);
  drawer(ctx,tv,'TV console drawer',-.49,.35,.34,.85,.33,.095,0xe49d94);
  box(tv,'TV stand',0,.74,0,.50,.17,.33,C.ink,.05);
  box(tv,'Purple CRT television',0,1.21,0,1.47,.93,.52,C.ink,.16);
  const screen=box(tv,'Curved screen',-.1,1.22,.26,1.11,.65,.09,0x476692,.10);
  for(const y of [1.17,1.31]) ball(tv,'TV dial',.58,y,.27,.035,.041,.038,0xf8c886);
  action(ctx,'Television',screen,()=>{
    const on=!screen.userData.on;screen.userData.on=on;
    if(!screen.userData.ownMaterial){screen.material=screen.material.clone();screen.userData.ownMaterial=true;}
    screen.material.color.setHex(on?0x66e5cd:0x476692);
    screen.material.emissive.setHex(on?0x237c8a:0);
    return on?'TV on':'TV off';
  });
  frame(living,'Gold landscape painting',7.27,2.6,.173,1.34,1.00,0,0);
  frame(living,'Small landscape painting',9.81,2.25,3.16,.66,.74,-Math.PI/2,2);
  const clock=tube(living,'Wall clock',3.65,2.5,.184,.38,.38,.11,0xf6ba62);
  clock.rotation.x=Math.PI/2;
  const dial=tube(living,'Clock face',3.65,2.5,.248,.31,.31,.039,C.ivory);
  dial.rotation.x=Math.PI/2;
  link(living,'Minute hand',[3.65,2.5,.277],[3.65,2.72,.277],.017,C.ink);
  link(living,'Hour hand',[3.65,2.5,.277],[3.8,2.46,.277],.021,C.ink);
  table(ctx,living,'Side table',9.37,3.69,.62,.66,.62,0xfab377);
  lamp(living,9.37,.70,3.69,0xffce68);
  trap(ctx,living,9.23,1.5);
  const wallTints=[0x8a91df,0x9299e7];
  for(let i=0;i<20;i++) {
    const x=1.73+(i%10)*.83,y=2.38+Math.floor(i/10)*.39;
    if(x>3.0 && x<4.35 || x>6.4 && x<8.0) continue;
    ball(living,'Wallpaper scallop',x,y,.153,.22,.058,.028,wallTints[i%2]);
  }

  const kitchen=room(ctx,'Checkerboard kitchen');
  checkers(kitchen,5.75,-3,8.5,6,12,9,[0x292842,0xfff1dd]);
  const fridge=furnishing(ctx,kitchen,'Bubblegum refrigerator',2.58,-5.22,1.16,1.1);
  box(fridge,'Pink refrigerator case',0,1.34,0,1.16,2.68,1.02,0xf390bb,.16);
  drawer(ctx,fridge,'Refrigerator door',0,.88,.54,1.02,1.62,.17,0xffa9cc,'hinge');
  drawer(ctx,fridge,'Freezer door',0,2.17,.54,1.02,.81,.17,0xffa9cc,'hinge');
  for(const x of [4.03,5.15,7.5,8.62]) {
    const unit=furnishing(ctx,kitchen,'Blue base cabinet',x,-5.27,1.09,.96);
    box(unit,'Blue cabinet carcass',0,.56,0,1.1,1.12,.96,0x3466cd,.035);
    box(unit,'Ivory countertop',0,1.15,0,1.13,.135,1.04,0xe9d9f7,.048);
    drawer(ctx,unit,'Kitchen drawer',0,.92,.505,1.02,.27,.08,0x5288ed);
    drawer(ctx,unit,'Kitchen cupboard',0,.45,.505,1.02,.60,.08,0x5488ec,'hinge');
    box(unit,'Upper blue cabinet',0,2.63,-.18,1.08,.84,.55,0x3865c7,.05);
    drawer(ctx,unit,'Wall cupboard',0,2.63,.12,1.02,.76,.08,0x5b90ff,'hinge');
  }
  const sink=group(kitchen,'Sink and faucet',7.48,1.226,-5.27);
  box(sink,'Sink rim',0,.01,0,.76,.048,.62,0xa4bddb,.09);
  box(sink,'Inset sink basin',0,.04,0,.65,.025,.50,0x56789c,.075);
  link(sink,'Faucet stem',[0,0,-.23],[0,.32,-.23],.043,0xd3e2eb);
  link(sink,'Faucet spout',[0,.32,-.23],[0,.32,-.04],.043,0xd3e2eb);
  const stove=furnishing(ctx,kitchen,'Cherry stove and oven',6.34,-5.26,1.14,1);
  box(stove,'Red stove body',0,.55,0,1.12,1.1,1.04,0xd64757,.07);
  box(stove,'Dark cooktop',0,1.13,0,1.10,.075,1,0x322f46,.04);
  for(const x of [-.29,.29]) for(const z of [-.26,.26]) tube(stove,'Cooktop burner',x,1.18,z,.155,.157,.034,0x777088);
  const oven=drawer(ctx,stove,'Oven door',0,.49,.55,.90,.55,.10,0xba3552,'hinge');
  box(oven,'Oven window',0,0,.06,.64,.29,.03,0x3b354d,.04);
  for(let i=0;i<4;i++) ball(stove,'Stove knob',(i-1.5)*.22,.95,.54,.05,.05,.051,0xe2a994);
  box(stove,'Chimney duct',0,2.91,-.23,.44,.99,.45,0x52647c,.07);
  box(stove,'Flared extractor hood',0,2.48,-.02,1.20,.30,.75,0x647c9b,.10);
  table(ctx,kitchen,'Dining table',6.85,-2.20,1.65,1.06,.89,0xffca71);
  chair(ctx,kitchen,6.85,-1.28);
  chair(ctx,kitchen,7.96,-2.20,Math.PI/2);
  chair(ctx,kitchen,5.72,-2.20,-Math.PI/2);
  snack(ctx,kitchen,7.00,.998,-2.12);
  for(let i=0;i<4;i++) ball(kitchen,'Countertop fruit',8.4+i*.10,1.28,-5.2,.095,.091,.093,[0xff6257,0xffb94d,0xc5d954][i%3]);
  trap(ctx,kitchen,8.73,-3.60);

  const bedroom=room(ctx,'Bedroom');
  planks(bedroom,-3.95,-3,4.9,6);
  const bed=furnishing(ctx,bedroom,'Raised bed with hiding space',-4.61,-3.67,1.93,2.97);
  box(bed,'Purple upholstered headboard',0,.95,-1.37,1.96,1.33,.22,0x9860bf,.13);
  box(bed,'High bed frame',0,.65,0,1.89,.23,2.78,0xae6a84,.08);
  box(bed,'Soft mattress',0,.86,0,1.87,.30,2.70,C.white,.14);
  box(bed,'Mint quilt',0,1.00,.42,1.93,.20,1.88,0x68cfc1,.095);
  for(const i of [-1,1]) {
    box(bed,'Rounded pillow',i*.44,1.06,-.86,.73,.25,.49,0xffb4cd,.09);
    for(const j of [-1,1]) tube(bed,'Raised bed leg',i*.72,.27,j*1.10,.105,.14,.53,0xa65f85);
  }
  for(const v of [-.14,.25,.64,1.03]) box(bed,'Quilt stripe',0,1.107,v,1.76,.02,.095,0x94e4d3,.01);
  const night=table(ctx,bedroom,'Bedside table',-2.91,-4.96,.65,.71,.65,0xd791aa);
  drawer(ctx,night,'Bedside drawer',0,.49,.35,.55,.24,.08,0xde99b8);
  lamp(bedroom,-2.91,.75,-4.96,0xf5c883);
  const wardrobe=furnishing(ctx,bedroom,'Rounded wardrobe',-5.63,-.82,1.19,.94);
  box(wardrobe,'Wardrobe shell',0,1.15,0,1.19,2.30,.94,0xa773ae,.12);
  drawer(ctx,wardrobe,'Wardrobe door',0,1.20,.49,1.03,1.99,.12,0xce8cc2,'hinge');
  frame(bedroom,'Bedroom print',-3.9,2.42,-5.82,1.00,.73,0,2);

  const bath=room(ctx,'Pink tile bathroom');
  checkers(bath,-3.95,3,4.9,6,8,9,[0xeaaaef,0xc9eccd,0xb7b1e2,0xf181d6]);
  const tub=furnishing(ctx,bath,'Lavender bathtub',-5.32,1.36,1.44,2.12);
  box(tub,'Bathtub shell',0,.37,0,1.43,.67,2.12,0xb18cde,.24);
  box(tub,'Ivory rolled bath rim',0,.68,0,1.46,.19,2.14,C.ivory,.09);
  box(tub,'Bath interior',0,.785,0,1.14,.04,1.81,0x8edbdd,.019);
  link(tub,'Shower riser',[-.47,.72,-.77],[-.47,2.43,-.77],.042,0xcbd5ee);
  link(tub,'Shower arm',[-.47,2.43,-.77],[.04,2.43,-.77],.042,0xcbd5ee);
  tube(tub,'Shower head',.045,2.37,-.77,.09,.19,.12,0xb3bbd9);
  const toilet=furnishing(ctx,bath,'Indigo toilet',-5.33,4.65,1.0,1.26);
  box(toilet,'Toilet cistern',0,.88,.38,.72,.78,.34,0x7152af,.095);
  ball(toilet,'Toilet pedestal',0,.30,-.16,.27,.31,.31,0x7456b8);
  ball(toilet,'Oval porcelain bowl',0,.57,-.16,.36,.23,.47,0x8d65c7);
  ball(toilet,'Dark bowl interior',0,.741,-.18,.25,.052,.34,0x423471);
  ball(toilet,'Toilet water',0,.781,-.18,.20,.017,.28,0x59c9cf);
  const basin=furnishing(ctx,bath,'Washbasin vanity',-3.7,5.37,1.31,.77);
  basin.rotation.y=Math.PI;
  box(basin,'Pink vanity cabinet',0,.46,0,1.25,.92,.72,0xd877bd,.09);
  drawer(ctx,basin,'Bathroom cabinet',0,.48,.395,1.11,.65,.09,0xe395d0,'hinge');
  box(basin,'Porcelain washbasin',0,.98,0,1.32,.20,.77,C.ivory,.08);
  ball(basin,'Inset wash bowl',0,1.084,0,.43,.020,.24,0x95d5dc);
  link(basin,'Sink tap',[0,1.08,-.24],[0,1.33,-.24],.043,0xb9c6e5);
  link(basin,'Sink spout',[0,1.33,-.24],[0,1.33,-.1],.043,0xb9c6e5);
  ball(basin,'Mirror frame',0,1.96,-.40,.48,.65,.065,0xe5b7e6);
  ball(basin,'Oval mirror',0,1.96,-.34,.41,.57,.035,0xa6dce7);
  link(bath,'Towel rack',[-6.2,1.41,2.82],[-6.2,1.41,3.58],.044,0xd9b9e4);
  box(bath,'Folded towel',-6.17,1.23,3.2,.105,.48,.47,0xffc66f,.035);
  for(let u=0;u<8;u++) for(let v=0;v<5;v++) {
    box(bath,'Pink tile wall',-6.228,.28+v*.45,.35+u*.65,.04,.435,.637,(u+v)%3===0?0xe88ad6:0xd979cb,.012);
  }

  const garage=room(ctx,'Garage and utility storage');
  floor(garage,-9,1.9,5.2,8.2,0xa9b2c4);
  floor(garage,-9,-4.1,5.2,3.8,0x8e9caf);
  const bench=table(ctx,garage,'Utility workbench',-10.46,-4.8,1.54,.82,.84,0xd58f64);
  drawer(ctx,bench,'Workbench drawer',0,.69,.41,1.35,.25,.09,0xe9a878);
  for(let i=0;i<4;i++) {
    const item=box(garage,'Paint tin',-11.05+i*.38,.99,-4.8,.25,.20,.25,[C.teal,C.pink,C.blue,C.lime][i],.045);
    item.rotation.y=i*.29;
  }
  box(garage,'Parking strip',-8.5,.015,2.1,.085,.026,4.8,0xffdf89,.012);
  crate(ctx,garage,-9.5,1.5);
  crate(ctx,garage,-8.25,-4.24);
}
