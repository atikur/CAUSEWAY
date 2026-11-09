/** Native numerical regression and lesson invariants, run by LEAF in the actual Lens runtime. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {solve} from './CAUSEWAYSolver';
import {Structure} from './CAUSEWAYModel';
import {Lesson} from './CAUSEWAYLesson';
import {investigations} from './CAUSEWAYInvestigations';
@component
export class CAUSEWAYCoreScenario extends Scenario {
  async run():Promise<void>{
    const bar:Structure={id:'bar',joints:[{id:'a',position:[0,0,0],fixed:[true,true,true]},{id:'b',position:[2,0,0],fixed:[false,true,true]}],members:[{id:'ab',a:'a',b:'b',area:0.0001,young:200e9,tensileLimit:200e6,compressiveLimit:100e6}]};
    const r=solve(bar,[{joint:'b',force:[10000,0,0]}]);
    expect(Math.abs(r.displacement.b[0]-0.001)<1e-10).toBe(true);
    expect(Math.abs(r.members[0].stress-100e6)<1).toBe(true);
    expect(Math.abs(r.reactions.a[0]+10000)<1e-6).toBe(true);
    for(const mission of investigations()){
      const lesson=new Lesson(mission),baseline=lesson.experiment.baseline;
      const last=baseline.frames[baseline.frames.length-1];
      const worst=last.result.members.reduce((a,b)=>a.utilization>b.utilization?a:b).id;
      expect(baseline.firstFailure!==null).toBe(true);
      lesson.select(worst);lesson.predict();
      for(let i=0;i<40&&String(lesson.phase)==='play';i++)lesson.advance();
      expect(lesson.phase).toBe('inspect');lesson.beginRepair();
      const budget=lesson.remainingBudget;let rejected=false;
      try{lesson.changeSection(worst,100);}catch(e){rejected=true;}
      expect(rejected).toBe(true);expect(lesson.remainingBudget).toBe(budget);
      const m=lesson.experiment.structure.members.find(m=>m.id===worst);
      lesson.changeSection(worst,m.area*20);expect(lesson.remainingBudget<budget).toBe(true);
      lesson.testRepair();for(let i=0;i<40&&String(lesson.phase)==='play';i++)lesson.advance();
      expect(lesson.experiment.candidate.firstFailure).toBe(null);
      const pair=lesson.compare(baseline.firstFailure);
      expect(JSON.stringify(pair.baseline.loads)).toBe(JSON.stringify(pair.candidate.loads));
      expect(pair.baseline.time).toBe(pair.candidate.time);
      expect(JSON.stringify(lesson.experiment.baseline)).toBe(JSON.stringify(baseline));
      lesson.complete();expect(lesson.phase).toBe('complete');
    }
    console.log('[CAUSEWAY] LEAF native core: analytical bar and all three controlled repairs passed.');
  }
}
