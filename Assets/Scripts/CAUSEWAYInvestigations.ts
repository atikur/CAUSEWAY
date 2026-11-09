// Native adapter of src/core/investigations.ts. Engineering values remain SI.
import type { Structure } from './CAUSEWAYModel';
import type { LoadStep } from './CAUSEWAYExperiment';
export interface Investigation {
  id:string; title:string; prompt:string; principle:string;
  structure:Structure; protocol:LoadStep[]; repairBudget:number;
}
/** Fully triangulated space truss. Coordinates are engineering meters. */
export function spaceBridge(panels=4):Structure {
  const structure:Structure={id:'space-bridge',joints:[],members:[]};
  const name=(i:number,y:number,z:number)=>`j-${i}-${y}-${z}`;
  for(let i=0;i<=panels;i++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)
    structure.joints.push({id:name(i,y,z),position:[i,y,z-0.5],fixed:[i===0,i===0||(i===panels&&y===0),i===0]});
  const add=(id:string,a:string,b:string)=>structure.members.push({id,a,b,area:0.0004,young:200e9,tensileLimit:200e6,compressiveLimit:100e6});
  for(let i=0;i<=panels;i++){
    const corners=[name(i,0,0),name(i,0,1),name(i,1,0),name(i,1,1)];
    for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)add(`cross-${i}-${a}-${b}`,corners[a],corners[b]);
  }
  for(let i=0;i<panels;i++){
    for(let y=0;y<2;y++)for(let z=0;z<2;z++)add(`chord-${i}-${y}-${z}`,name(i,y,z),name(i+1,y,z));
    for(let z=0;z<2;z++)add(`side-${i}-${z}`,name(i,0,z),name(i+1,1,z));
    for(let y=0;y<2;y++)add(`lateral-${i}-${y}`,name(i,y,0),name(i+1,y,1));
    add(`interior-${i}`,name(i,0,0),name(i+1,1,1));
  }
  return structure;
}
function make(id:string,title:string,prompt:string,principle:string,weak:string,force:[number,number,number]):Investigation {
  const structure=spaceBridge();structure.id=id;
  const member=structure.members.find(m=>m.id===weak)!;member.area=0.000008;
  const protocol:LoadStep[]=Array.from({length:31},(_,i)=>({time:i/5,loads:[{joint:'j-2-1-1',force:force.map(f=>f*i/30) as [number,number,number]}]}));
  return {id,title,prompt,principle,structure,protocol,repairBudget:0.0006};
}
export function investigations():Investigation[] {
  return [
    make('sideways','The hidden load path','A sideways load crosses the deck. Inspect the far-side bracing before predicting the first limit.','Bracing carries lateral loads through three dimensions.','lateral-1-1',[0,-15600,26000]),
    make('payload','The heavy crossing','The same bridge carries a heavier delivery. Find the member that needs the material.','Section area changes stress; material placed elsewhere may not help.','side-1-1',[0,-30000,3000]),
    make('transfer','The unfamiliar crossing','Apply what you learned to a different load direction. Explanatory force arrows start hidden.','A successful intervention depends on the load path, not a memorized member.','side-1-0',[0,-70000,-25000])
  ];
}
export function strengthen(model:Structure,id:string,multiplier=10):void {
  const member=model.members.find(m=>m.id===id);if(!member)throw new Error('Unknown member');
  if(!Number.isFinite(multiplier)||multiplier<=1||multiplier>100)throw new Error('Invalid section multiplier');
  member.area*=multiplier;
}
export function materialVolume(model:Structure):number {
  return model.members.reduce((sum,m)=>{
    const a=model.joints.find(j=>j.id===m.a)!,b=model.joints.find(j=>j.id===m.b)!;
    return sum+m.area*Math.hypot(...a.position.map((x,i)=>x-b.position[i]));
  },0);
}
