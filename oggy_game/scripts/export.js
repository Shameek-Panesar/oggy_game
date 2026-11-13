import { writeFileSync } from 'node:fs';
import { GLTFExporter } from '../vendor/GLTFExporter.js';
import { buildHouse, rooms, spawn } from './house.js';

globalThis.FileReader=class {
  async readAsArrayBuffer(blob) {
    this.result=await blob.arrayBuffer();
    this.onloadend?.();
  }
};
const house=buildHouse();
const data=await new GLTFExporter().parseAsync(house.root,{binary:true,trs:true});
writeFileSync(new URL('../house-map.glb',import.meta.url),Buffer.from(data));
const {actions,colliders,ventPaths}=house;
const position=house.root.position.clone();
writeFileSync(new URL('../house-layout.json',import.meta.url),JSON.stringify({
  units:'meters', up:'+Y', spawn, rooms, ventPaths,
  colliders:colliders.map(({x,z,w,d})=>({x,z,w,d})),
  interactions:actions.map(({name,object,position:target})=>({
    name,node:object.name,position:target.getWorldPosition(position).toArray()
  }))
},null,2)+'\n');
