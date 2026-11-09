/** LEAF 2.0.2 fixture correction: its zero ray limit breaks SIK's indirect drag clamp. No package changes. */
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
export class CAUSEWAYTestInteractor extends DefaultLeafInteractor {
  protected overrideSikProperties():void {
    super.overrideSikProperties();
    Object.defineProperty(this.sikInteractor,'maxRaycastDistance',{get:()=>500,configurable:true});
  }
}
