// Native adapter of src/core/experiment.ts. Engineering values remain SI.
import { clone, ModelError } from './CAUSEWAYModel';
import type { Structure, Load, Solution } from './CAUSEWAYModel';
import { solve } from './CAUSEWAYSolver';
export interface LoadStep { time: number; loads: Load[] }
export interface Frame { time: number; loads: Load[]; result: Solution }
export interface Recording { structure: Structure; protocol: LoadStep[]; frames: Frame[]; firstFailure: number | null }
/** Records all prescribed steps; post-capacity states are elastic extrapolations, not collapse predictions. */
export function record(structure: Structure, protocol: LoadStep[]): Recording {
  if(!protocol.length || protocol.length>1000 || protocol.some((s,i) => !Number.isFinite(s.time) || s.time<0 || (i>0 && s.time<=protocol[i-1].time)))
    throw new ModelError('Load steps require strictly increasing finite times.');
  const frames=protocol.map(s => ({time:s.time,loads:clone(s.loads),result:solve(structure,s.loads)}));
  const first=frames.findIndex(f => f.result.maxUtilization>=1);
  return {structure:clone(structure),protocol:clone(protocol),frames,firstFailure:first<0?null:first};
}
export class Experiment {
  private original: Structure;
  private working: Structure;
  private undoStack: Structure[]=[];
  private baselineData: Recording;
  private candidateData: Recording | null=null;
  private protocol: LoadStep[];
  private cursor=0;
  private predicted:string|null=null;
  constructor(structure:Structure, protocol:LoadStep[]) {
    this.original=clone(structure); this.working=clone(structure); this.protocol=clone(protocol);
    this.baselineData=record(structure,protocol);
  }
  get baseline():Recording {return clone(this.baselineData);}
  get candidate():Recording|null {return this.candidateData?clone(this.candidateData):null;}
  get structure():Structure {return clone(this.working);}
  get prediction():string|null {return this.predicted;}
  predict(member:string):void {
    if(!this.working.members.some(m => m.id===member)) throw new ModelError('Unknown member.');
    this.predicted=member;
  }
  edit(change:(s:Structure)=>void):void {
    const next=clone(this.working);change(next);
    // Transactional: invalid/unstable edits leave the current design and history intact.
    solve(next, this.protocol[0].loads);
    this.undoStack.push(this.working);this.working=next;this.candidateData=null;
  }
  undo():boolean {
    const previous=this.undoStack.pop();if(!previous)return false;
    this.working=previous;this.candidateData=null;return true;
  }
  run():Recording {this.candidateData=record(this.working,this.protocol);return clone(this.candidateData);}
  seek(index:number, branch:'baseline'|'candidate'='baseline'):Frame {
    const r=branch==='baseline'?this.baselineData:this.candidateData;
    if(!r || !Number.isInteger(index) || index<0 || index>=r.frames.length) throw new ModelError('Invalid timeline position.');
    this.cursor=index;return clone(r.frames[index]);
  }
  reset():void {this.working=clone(this.original);this.undoStack=[];this.candidateData=null;this.cursor=0;this.predicted=null;}
}
