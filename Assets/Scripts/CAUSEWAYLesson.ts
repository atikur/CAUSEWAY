// Native adapter of src/core/lesson.ts. Engineering values remain SI.
import {ModelError} from './CAUSEWAYModel';
import type {Structure, Member, Solution} from './CAUSEWAYModel';
import {Experiment} from './CAUSEWAYExperiment';
import type {Frame} from './CAUSEWAYExperiment';
import {materialVolume} from './CAUSEWAYInvestigations';
import type {Investigation} from './CAUSEWAYInvestigations';
export type Phase='predict'|'play'|'inspect'|'repair'|'compare'|'complete';
export interface Feedback {kind:'information'|'success'|'retry';text:string;member:string|null}
/** Application controller shared by native presentation and automated checks. */
export class Lesson {
  readonly experiment:Experiment;
  private mission:Investigation;
  private currentPhase:Phase='predict';
  private playingBranch:'baseline'|'candidate'='baseline';
  private frameIndex=0;
  private selected:string|null=null;
  private feedbackData:Feedback={kind:'information',text:'Inspect the structure. Mark the member you expect to reach its limit first.',member:null};
  private paused=false;
  constructor(mission:Investigation){
    this.mission=JSON.parse(JSON.stringify(mission));
    this.experiment=new Experiment(mission.structure,mission.protocol);
  }
  get phase():Phase{return this.currentPhase;}
  get feedback():Feedback{return {...this.feedbackData};}
  get selection():string|null{return this.selected;}
  get remainingBudget():number{return this.mission.repairBudget-(materialVolume(this.experiment.structure)-materialVolume(this.mission.structure));}
  get progress():number{return this.frameIndex/(this.mission.protocol.length-1);}
  get isPaused():boolean{return this.paused;}
  private assertPhase(...phases:Phase[]):void{if(!phases.includes(this.currentPhase))throw new ModelError('Action is unavailable at this stage.');}
  select(id:string|null):void{
    if(id!==null&&!this.experiment.structure.members.some(m=>m.id===id))throw new ModelError('Unknown member.');
    this.selected=id;
  }
  predict():void{
    this.assertPhase('predict');if(!this.selected)throw new ModelError('Select a member first.');
    this.experiment.predict(this.selected);this.currentPhase='play';this.frameIndex=0;
    this.feedbackData={kind:'information',text:'Watch the load. The experiment freezes at the first modeled capacity limit.',member:null};
  }
  pause():void{this.assertPhase('play');this.paused=!this.paused;}
  advance():Frame{
    this.assertPhase('play');
    const r=this.playingBranch==='baseline'?this.experiment.baseline:this.experiment.candidate!;
    const limit=r.firstFailure??r.frames.length-1;
    if(!this.paused)this.frameIndex=Math.min(this.frameIndex+1,limit);
    const frame=this.experiment.seek(this.frameIndex,this.playingBranch);
    if(this.frameIndex===limit){
      this.currentPhase=this.playingBranch==='baseline'?'inspect':'compare';
      const worst=frame.result.members.reduce((a,b)=>a.utilization>b.utilization?a:b);
      this.feedbackData={kind:r.firstFailure===null?'success':'retry',
        text:r.firstFailure===null?'This design stayed within the modeled limits for the complete load case.':'The first modeled capacity limit was reached. Inspect the force path before changing the design.',member:worst.id};
    }
    return frame;
  }
  seek(index:number,branch:'baseline'|'candidate'=this.playingBranch):Frame{
    this.assertPhase('inspect','repair','compare','complete');
    const r=branch==='baseline'?this.experiment.baseline:this.experiment.candidate;
    if(!r)throw new ModelError('Run this design before comparing it.');
    if(index>(r.firstFailure??r.frames.length-1))throw new ModelError('The timeline ends at the first modeled limit.');
    const frame=this.experiment.seek(index,branch);this.frameIndex=index;return frame;
  }
  compare(index:number):{baseline:Frame;candidate:Frame}{
    this.assertPhase('compare','complete');
    const candidate=this.experiment.candidate;if(!candidate)throw new ModelError('Run the revised design first.');
    const baseline=this.experiment.baseline;
    const end=Math.min(baseline.firstFailure??baseline.frames.length-1,candidate.firstFailure??candidate.frames.length-1);
    if(!Number.isInteger(index)||index<0||index>end)throw new ModelError('Compare up to the first modeled limit shared by both designs.');
    return {baseline:this.experiment.seek(index),candidate:this.experiment.seek(index,'candidate')};
  }
  beginRepair():void{this.assertPhase('inspect','compare');this.currentPhase='repair';}
  edit(change:(s:Structure)=>void):void{
    this.assertPhase('repair');
    this.experiment.edit(s=>{
      change(s);
      if(materialVolume(s)-materialVolume(this.mission.structure)>this.mission.repairBudget+1e-12)
        throw new ModelError('This change exceeds the material budget.');
    });
  }
  changeSection(id:string,area:number):void{
    this.edit(s=>{const m=s.members.find(m=>m.id===id);if(!m)throw new ModelError('Unknown member.');m.area=area;});
  }
  addBrace(brace:Member):void{this.edit(s=>s.members.push({...brace}));}
  undo():boolean{this.assertPhase('repair');return this.experiment.undo();}
  testRepair():void{
    this.assertPhase('repair');this.experiment.run();this.playingBranch='candidate';this.currentPhase='play';this.frameIndex=0;this.paused=false;
  }
  complete():void{
    this.assertPhase('compare');
    if(this.experiment.candidate?.firstFailure!==null)throw new ModelError('The revised design has not completed the load case.');
    this.currentPhase='complete';this.feedbackData={kind:'success',text:this.mission.principle,member:this.selected};
  }
  reset():void{
    this.experiment.reset();this.currentPhase='predict';this.playingBranch='baseline';this.frameIndex=0;this.selected=null;this.paused=false;
    this.feedbackData={kind:'information',text:'Inspect the structure. Mark the member you expect to reach its limit first.',member:null};
  }
}
/** Explain exact numerical facts without delegating physics to a language model. */
export function explain(result:Solution,id:string):Feedback{
  const m=result.members.find(m=>m.id===id);if(!m)throw new ModelError('Unknown result member.');
  const action=m.force<0?'compression':'tension';
  return {kind:m.utilization>=1?'retry':'information',member:id,
    text:`${id}: ${(Math.abs(m.force)/1000).toFixed(2)} kN in ${action}; ${(Math.abs(m.stress)/1e6).toFixed(1)} MPa; ${(m.utilization*100).toFixed(0)}% of its declared ${action} limit.`};
}
