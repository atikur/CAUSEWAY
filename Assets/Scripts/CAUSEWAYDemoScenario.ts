/** Repeatable real-Preview walkthrough of all three investigations, paced for a short recording. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep,findSceneObjectByName} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractableByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {CAUSEWAYMain} from './CAUSEWAYMain';
import {waitForPhase} from './CAUSEWAYScenarioUtils';
@component
export class CAUSEWAYDemoScenario extends Scenario {
  async run():Promise<void>{
    await sleep(700);
    const app=findSceneObjectByName('CAUSEWAY Controller').getComponent(CAUSEWAYMain.getTypeName()) as CAUSEWAYMain;
    const input=new DefaultLeafInteractor();
    const press=async(name:string)=>{await input.trigger(findInteractableByName(name));await sleep(250);};
    await press('Action Reset');await sleep(1500);
    for(const [mission,weak] of ['lateral-1-1','side-1-1','side-1-0'].entries()){
      expect(app.getSnapshot().mission).toBe(mission);
      await press('Member '+weak);await sleep(1500);
      await press('Action Predict + run');await waitForPhase(app,'inspect');
      await press('Member '+weak);if(mission===2)await press('Action Force colors');await sleep(2200);
      await press('Action Predict + run');await sleep(1000);await press('Action Section x20');await sleep(1000);
      await press('Action Predict + run');await waitForPhase(app,'compare');
      expect(app.getSnapshot().candidateFailure).toBe(null);
      await sleep(1200);await press('Action Compare');await sleep(1800);
      await press('Action Predict + run');expect(app.getSnapshot().phase).toBe('complete');
      console.log('[CAUSEWAY] Demo investigation '+(mission+1)+' '+JSON.stringify(app.getSnapshot()));
      await sleep(1600);if(mission<2)await press('Action Predict + run');
    }
    console.log('[CAUSEWAY] All three native investigations completed with identical-load comparisons.');
  }
}
