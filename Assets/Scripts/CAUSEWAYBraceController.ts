/** Owns two SIK drag handles. Snaps to model joints; Main commits validated SI braces. */
import {Interactable} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import {InteractableManipulation} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation';
import Event from 'SpectaclesInteractionKit.lspkg/Utils/Event';
import {CAUSEWAYTrussView} from './CAUSEWAYTrussView';
import {makeBuilder,cylinder} from './CAUSEWAYGeometry';
@component
export class CAUSEWAYBraceController extends BaseScriptComponent {
  @ui.label('CAUSEWAY – Brace endpoints')
  @input @hint('Truss view used to find snap positions') view:CAUSEWAYTrussView;
  @input @hint('Vertex-color material for visible brace handles') material:Material;
  @input @hint('Snap radius in display centimeters') @widget(new SliderWidget(1,6,0.5)) snapCm:number=3;
  readonly onSnap=new Event<string>();
  private handles:SceneObject[]=[];
  private endpoints:(string|null)[]=[null,null];
  private active=false;
  initialize():void {
    for(let i=0;i<2;i++){
      const o=global.scene.createSceneObject('Brace endpoint '+(i+1));o.setParent(this.sceneObject);
      const b=makeBuilder(),c=i===0?new vec4(1,0.9,0.2,1):new vec4(0.9,0.3,1,1);
      cylinder(b,new vec3(0,-0.75,0),new vec3(0,0.75,0),0.8,c,12);b.updateMesh();
      const visual=o.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;visual.mesh=b.getMesh();visual.mainMaterial=this.material;
      const shape=Shape.createSphereShape();shape.radius=1.7;
      const col=o.createComponent('Physics.ColliderComponent') as ColliderComponent;col.shape=shape;
      o.createComponent(Interactable.getTypeName());
      const m=o.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;m.setCanRotate(false);m.setCanScale(false);
      m.onManipulationStart.add(()=>{this.endpoints[i]=null;});
      m.onManipulationEnd.add(()=>this.snap(i));o.enabled=false;this.handles.push(o);
    }
  }
  show():void {
    this.active=true;this.endpoints=[null,null];
    this.handles.forEach((o,i)=>{o.enabled=true;o.getTransform().setWorldPosition(this.view.worldJoint(i===0?'j-0-1-1':'j-2-1-1').add(new vec3(0,2,3)));});
  }
  hide():void {this.active=false;this.handles.forEach(o=>o.enabled=false);}
  get isActive():boolean{return this.active;}
  get pair():[string,string]|null {return this.endpoints[0]&&this.endpoints[1]?[this.endpoints[0],this.endpoints[1]]:null;}
  private snap(i:number):void {
    const h=this.handles[i],nearest=this.view.nearestJoint(h.getTransform().getWorldPosition());
    if(nearest.distance>this.snapCm){this.endpoints[i]=null;this.onSnap.invoke('Move the handle closer to a joint and release.');return;}
    this.endpoints[i]=nearest.id;h.getTransform().setWorldPosition(nearest.position);
    this.onSnap.invoke('Endpoint '+(i+1)+' snapped to '+nearest.id+'.');
  }
}
