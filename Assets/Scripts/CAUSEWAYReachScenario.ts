/** Full-arm IK coverage for the spatial controls, with fail-fast diagnostics selected by the runner. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep,findSceneObjectByName} from 'Leaf.lspkg/Utils/common/Utils';
import {createIKInteractor} from 'Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar';
import {findInteractableByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {CAUSEWAYMain} from './CAUSEWAYMain';
@component
export class CAUSEWAYReachScenario extends Scenario {
  async run():Promise<void>{
    await sleep(500);
    const app=findSceneObjectByName('CAUSEWAY Controller').getComponent(CAUSEWAYMain.getTypeName()) as CAUSEWAYMain;
    const ik=createIKInteractor();
    await ik.ready;
    await sleep(250);
    await ik.trigger(findInteractableByName('Action Reset'));
    expect(app.getSnapshot().phase).toBe('predict');
    const before=app.getSnapshot().selection;
    await ik.trigger(findInteractableByName('Action Next member'));
    expect(app.getSnapshot().selection!==before).toBe(true);
    console.log('[CAUSEWAY] IK control routing: '+(ik.right.isIndirect(findInteractableByName('Action Next member'))?'far-field ray':'direct reach'));
  }
}
