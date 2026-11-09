/** Exercises real SIK manipulation, two joint snaps, transactional brace insertion and undo. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep,findSceneObjectByName} from 'Leaf.lspkg/Utils/common/Utils';
import {CAUSEWAYTestInteractor} from './CAUSEWAYTestInteractor';
import {findInteractableByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {CAUSEWAYMain} from './CAUSEWAYMain';
import {CAUSEWAYBraceController} from './CAUSEWAYBraceController';
import {waitForPhase} from './CAUSEWAYScenarioUtils';
@component
export class CAUSEWAYBraceScenario extends Scenario {
  async run():Promise<void>{
    await sleep(500);
    const app=findSceneObjectByName('CAUSEWAY Controller').getComponent(CAUSEWAYMain.getTypeName()) as CAUSEWAYMain;
    const brace=findSceneObjectByName('CAUSEWAY Brace Tools').getComponent(CAUSEWAYBraceController.getTypeName()) as CAUSEWAYBraceController;
    const input=new CAUSEWAYTestInteractor();
    const press=async(name:string)=>{await input.trigger(findInteractableByName(name));await sleep(180);};
    await press('Action Reset');await press('Member lateral-1-1');await press('Action Predict + run');await waitForPhase(app,'inspect');
    await press('Action Predict + run');expect(app.getSnapshot().phase).toBe('repair');
    const budget=app.getSnapshot().budget;
    await press('Action Add brace');expect(brace.isActive).toBe(true);
    for(const name of ['Brace endpoint 1','Brace endpoint 2']){
      await input.drag(findInteractableByName(name),new vec3(0,-0.04,-0.06),500);await sleep(200);
    }
    expect(brace.pair!==null).toBe(true);
    expect(brace.pair[0]).toBe('j-0-1-1');expect(brace.pair[1]).toBe('j-2-1-1');
    await press('Action Add brace');expect(brace.isActive).toBe(false);expect(app.getSnapshot().budget<budget).toBe(true);
    await press('Action Undo');expect(app.getSnapshot().budget).toBe(budget);
    console.log('[CAUSEWAY] LEAF brace handles snapped, inserted within budget and undone.');
  }
}
