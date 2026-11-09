/** End-to-end production SIK controls, predicted failure, budget recovery and identical loading. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep,findSceneObjectByName} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractableByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {CAUSEWAYMain} from './CAUSEWAYMain';
import {waitForPhase} from './CAUSEWAYScenarioUtils';
@component
export class CAUSEWAYFlowScenario extends Scenario {
  async run():Promise<void>{
    await sleep(500);
    const app=findSceneObjectByName('CAUSEWAY Controller').getComponent(CAUSEWAYMain.getTypeName()) as CAUSEWAYMain;
    const input=new DefaultLeafInteractor();
    const press=async(name:string)=>{await input.trigger(findInteractableByName(name));await sleep(180);};
    await press('Action Reset');expect(app.getSnapshot().phase).toBe('predict');
    // Secondary controls remain reachable, and Reset returns to the main actions.
    await press('Action More');await press('Action Sound on');await press('Action Sound on');
    await press('Action Reset');expect(app.getSnapshot().phase).toBe('predict');
    await press('Member lateral-1-1');expect(app.getSnapshot().selection).toBe('lateral-1-1');
    await press('Action Predict + run');await waitForPhase(app,'inspect');expect(app.getSnapshot().phase).toBe('inspect');
    const failedAt=app.getSnapshot().frame;expect(failedAt).toBe(app.getSnapshot().firstFailure);
    await press('Action Predict + run');expect(app.getSnapshot().phase).toBe('repair');
    const budget=app.getSnapshot().budget;
    await press('Action Section x20');expect(app.getSnapshot().budget<budget).toBe(true);
    await press('Action Undo');expect(app.getSnapshot().budget).toBe(budget);
    await press('Action Section x20');await press('Action Predict + run');
    await waitForPhase(app,'compare');expect(app.getSnapshot().phase).toBe('compare');expect(app.getSnapshot().candidateFailure).toBe(null);
    const time=app.getSnapshot().frame;await press('Action Compare');expect(app.getSnapshot().frame).toBe(time);
    await press('Action Predict + run');expect(app.getSnapshot().phase).toBe('complete');
    await press('Action Compare');expect(app.getSnapshot().branch).toBe('candidate');
    await press('Action Later');expect(app.getSnapshot().frame).toBe(time);
    await press('Action Earlier');expect(app.getSnapshot().frame).toBe(time-1);
    await press('Action Later');expect(app.getSnapshot().frame).toBe(time);
    console.log('[CAUSEWAY] Preview metrics '+JSON.stringify(app.getSnapshot()));
  }
}
