import { C, action, box, group, solid, ball } from '../../scripts/model.js';

export function wall(ctx,name,a,b,finish,openings=[],exterior=false) {
  const [x,z]=a, width=Math.hypot(b[0]-x,b[1]-z);
  const angle=-Math.atan2(b[1]-z,b[0]-x);
  const p=group(exterior ? ctx.shell : ctx.walls,name,x,0,z);
  p.rotation.y=angle;
  const world=(u,v)=>[x+u*Math.cos(angle)+v*Math.sin(angle),z-u*Math.sin(angle)+v*Math.cos(angle)];
  function part(start,end,low,high,block) {
    if(end-start<.01 || high-low<.01) return;
    const mid=(start+end)/2, w=end-start, h=high-low, y=(high+low)/2;
    box(p,'Wall masonry',mid,y,0,w,h,.29,exterior?C.butter:finish);
    if(exterior) box(p,'Interior plaster',mid,y,-.153,w,h,.028,finish);
    if(low===0) {
      box(p,'Skirting',mid,.12,-.18,w,.22,.06,exterior?C.teal:0x755284,.015);
      box(p,'Opposite skirting',mid,.12,.18,w,.22,.06,exterior?C.shade:0x755284,.015);
      if(finish===C.lime && high>.85) {
        for(const side of [-1,1]) {
          if(exterior && side===1) continue;
          box(p,'Hall wainscot',mid,.48,side*.17,w,.78,.048,C.teal);
          box(p,'Hall chair rail',mid,.88,side*.195,w,.075,.07,C.aqua,.01);
        }
      }
    }
    if(block) {
      const [cx,cz]=world(mid,0), alongX=Math.abs(Math.cos(angle))>.5;
      solid(ctx,cx,cz,alongX?w:.29,alongX?.29:w);
    }
  }
  let end=0;
  for(const opening of [...openings,{at:width,w:0,kind:'end'}]) {
    const start=opening.at-opening.w/2, stop=opening.at+opening.w/2;
    part(end,start,0,3.6,true);
    if(opening.kind==='end') break;
    if(opening.kind==='vent') {
      part(start,stop,0,.10,false);
      part(start,stop,.52,3.6,false);
      const [cx,cz]=world(opening.at,0);
      solid(ctx,cx,cz,opening.w,.29);
      end=stop;
      continue;
    }
    const isWindow=opening.kind==='window', garage=opening.kind==='garage';
    const low=isWindow?1.15:0, high=isWindow?2.68:garage?2.92:2.52;
    if(isWindow) part(start,stop,0,low,true);
    part(start,stop,high,3.6,false);
    const tint=exterior?C.ivory:0x9569ce;
    for(const side of [-1,1]) box(p,'Door or window jamb',opening.at+side*opening.w/2,(high+low)/2,0,.18,high-low+.19,.46,tint,.035);
    box(p,'Lintel',opening.at,high,0,opening.w+.17,.19,.48,tint,.03);
    if(isWindow) {
      box(p,'Turquoise window frame',opening.at,(high+low)/2,0,opening.w,high-low,.22,C.teal,.07);
      for(let i=0;i<3;i++) box(p,'Blue window glass',start+(i+.5)*opening.w/3,(high+low)/2,0,opening.w/3-.085,high-low-.21,.235,C.glass,.04);
      box(p,'Window mullion',opening.at,1.81,.13,opening.w,.085,.055,C.aqua,.01);
      box(p,'Window sill',opening.at,low,.014,opening.w+.37,.16,.57,C.ivory,.045);
      for(const side of [-1,1]) for(let fold=0;fold<3;fold++) {
        const curtain=ball(p,'Curtain fold',opening.at+side*(opening.w*.39-fold*.10),1.97,-.19,.10,.65-fold*.035,.09,0xffab84);
        curtain.rotation.z=side*.13;
      }
    } else {
      const hinge=group(p,opening.name+' pivot',start+.05,0,0);
      const panel=group(hinge,opening.name+' panel',opening.w/2-.05,0,0);
      const target=group(p,opening.name+' interaction point',opening.at,1.15,0);
      const doorColor=exterior?C.teal:0x7756aa;
      box(panel,opening.name,0,high/2,0,opening.w-.16,high-.1,.14,doorColor,.075);
      if(garage) {
        for(let i=1;i<6;i++) box(panel,'Garage rib',0,i*.44,.087,opening.w-.27,.047,.035,C.aqua,.013);
        for(const i of [-1,0,1]) box(panel,'Garage diamond',i*.64,1.53,.115,.34,.34,.045,C.aqua,.045).rotation.z=Math.PI/4;
      } else {
        for(const y of [.67,1.72]) box(panel,'Raised door panel',0,y,0,opening.w-.41,.63,.168,exterior?0x25b6b9:0x9168cb,.052);
        for(const side of [-1,1]) ball(panel,'Brass door knob',opening.w*.36,1.16,side*.105,.065,.065,.064,0xffca59);
      }
      const [cx,cz]=world(opening.at,0), alongX=Math.abs(Math.cos(angle))>.5;
      solid(ctx,cx,cz,alongX?opening.w:.25,alongX?.25:opening.w,()=>!hinge.userData.open);
      ctx.animations.push(dt=>{
        if(garage) {
          const dest=hinge.userData.open?3.03:0;
          hinge.position.y+=(dest-hinge.position.y)*Math.min(1,dt*9);
        } else {
          const dest=hinge.userData.open?1.43:0;
          hinge.rotation.y+=(dest-hinge.rotation.y)*Math.min(1,dt*12);
        }
      });
      action(ctx,opening.name,panel,()=>{hinge.userData.open=!hinge.userData.open;return hinge.userData.open?'Opened':'Closed';},target);
    }
    end=stop;
  }
  return p;
}

export function grille(parent,name,x,y,z,angle=0) {
  const p=group(parent,name,x,y,z);
  p.rotation.y=angle;
  box(p,'Vent flange',0,0,0,.84,.53,.12,0x64788c,.09);
  box(p,'Recessed opening',0,0,.066,.69,.39,.04,0x233247,.08);
  for(let i=-2;i<=2;i++) box(p,'Vent louver',0,i*.072,.099,.61,.035,.06,0xa0b4bb,.011);
  return p;
}
