/** Owns the data-driven mesh, member hit targets and highlighted selection. SI enters only through displayPoint. */
import {Interactable} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import Event from 'SpectaclesInteractionKit.lspkg/Utils/Event';
import {Structure,Solution} from './CAUSEWAYModel';
import {Frame} from './CAUSEWAYExperiment';
import {cylinder,makeBuilder} from './CAUSEWAYGeometry';
@component
export class CAUSEWAYTrussView extends BaseScriptComponent {
  @ui.label('CAUSEWAY – Spatial truss')
  @input @hint('Vertex-color material for batched parametric geometry') material:Material;
  @input @hint('Centimeters of display per engineering meter; does not change solver dimensions') @widget(new SliderWidget(5,14,0.5)) displayCmPerMeter:number=10.5;
  @input @hint('Visible elastic displacement magnification, explicitly labeled in the HUD') @widget(new SliderWidget(0,100,1)) displacementGain:number=30;
  @input @hint('Member selection hit width in centimeters') @widget(new SliderWidget(0.4,2,0.1)) hitWidth:number=0.8;
  @input @hint('Show member collider debug shapes') debugColliders:boolean=false;
  @input('vec4','{0.12,0.82,1,1}') @hint('Tension color') @widget(new ColorWidget()) tensionColor:vec4;
  @input('vec4','{1,0.43,0.15,1}') @hint('Compression color') @widget(new ColorWidget()) compressionColor:vec4;
  @input('vec4','{1,0.87,0.14,1}') @hint('Selected member color') @widget(new ColorWidget()) selectionColor:vec4;
  readonly onSelect=new Event<string>();
  private builder:MeshBuilder;
  private content:SceneObject;
  private visual:RenderMeshVisual;
  private model:Structure;
  private targets:SceneObject[]=[];
  private solution:Solution|null=null;
  private frame:Frame|null=null;
  private selected:string|null=null;
  private prediction:string|null=null;
  private showForces=true;
  private showTargets=true;
  initialize():void {
    this.builder=makeBuilder();this.content=global.scene.createSceneObject('CAUSEWAY Dynamic Mesh');this.content.setParent(this.sceneObject);
    this.visual=this.content.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;
    this.visual.mesh=this.builder.getMesh();this.visual.mainMaterial=this.material;
  }
  setStructure(model:Structure):void {
    this.model=model;
    this.targets.forEach(o=>o.destroy());this.targets=[];
    for(const m of model.members){
      const a=this.point(m.a),b=this.point(m.b),obj=global.scene.createSceneObject('Member '+m.id);obj.setParent(this.sceneObject);
      const tr=obj.getTransform();tr.setLocalPosition(a.add(b).uniformScale(0.5));
      tr.setLocalRotation(quat.rotationFromTo(new vec3(0,1,0),b.sub(a).normalize()));
      const shape=Shape.createBoxShape();shape.size=new vec3(this.hitWidth,a.distance(b),this.hitWidth);
      const collider=obj.createComponent('Physics.ColliderComponent') as ColliderComponent;collider.shape=shape;collider.debugDrawEnabled=this.debugColliders;
      const hit=obj.createComponent(Interactable.getTypeName()) as Interactable;
      hit.onTriggerEnd.add(()=>this.onSelect.invoke(m.id));
      obj.enabled=this.showTargets;this.targets.push(obj);
    }
    this.draw();
  }
  setFrame(frame:Frame|null,selected:string|null,prediction:string|null,forces:boolean):void {
    this.frame=frame;this.solution=frame?.result??null;this.selected=selected;this.prediction=prediction;this.showForces=forces;this.draw();
  }
  setTargets(enabled:boolean):void {this.showTargets=enabled;this.targets.forEach(o=>o.enabled=enabled);}
  point(id:string):vec3 {
    const p=this.model.joints.find(j=>j.id===id).position;
    return new vec3((p[0]-2)*this.displayCmPerMeter,(p[1]-0.5)*this.displayCmPerMeter,p[2]*this.displayCmPerMeter);
  }
  worldJoint(id:string):vec3 {return this.sceneObject.getTransform().getWorldTransform().multiplyPoint(this.point(id));}
  nearestJoint(world:vec3):{id:string;distance:number;position:vec3} {
    const candidates=this.model.joints.map(j=>({id:j.id,position:this.worldJoint(j.id),distance:this.worldJoint(j.id).distance(world)}));
    return candidates.reduce((a,b)=>a.distance<b.distance?a:b);
  }
  rotate(delta:number):void {
    const t=this.sceneObject.getTransform();t.setLocalRotation(quat.angleAxis(delta*Math.PI/180,new vec3(0,1,0)).multiply(t.getLocalRotation()));
  }
  private draw():void {
    if(!this.model||!this.builder)return;
    if(this.builder.getIndicesCount()>0)this.builder.eraseIndices(0,this.builder.getIndicesCount());
    if(this.builder.getVerticesCount()>0)this.builder.eraseVertices(0,this.builder.getVerticesCount());
    const displaced=(id:string)=>{
      const p=this.point(id),d=this.solution?.displacement[id];
      return d?p.add(new vec3(d[0],d[1],d[2]).uniformScale(this.displayCmPerMeter*this.displacementGain)):p;
    };
    for(const [i,m] of this.model.members.entries()){
      const result=this.solution?.members.find(r=>r.id===m.id);
      let color=new vec4(0.52,0.67,0.74,1);
      if(result&&this.showForces&&Math.abs(result.force)>0.01)color=result.utilization>=1?new vec4(1,0.14,0.2,1):result.force<0?this.compressionColor:this.tensionColor;
      if(m.id===this.selected)color=this.selectionColor;
      const a=displaced(m.a),b=displaced(m.b);
      if(this.targets[i]){const t=this.targets[i].getTransform();t.setLocalPosition(a.add(b).uniformScale(0.5));t.setLocalRotation(quat.rotationFromTo(new vec3(0,1,0),b.sub(a).normalize()));}
      cylinder(this.builder,a,b,m.id===this.selected?0.22:Math.max(0.065,Math.sqrt(m.area/0.0004)*0.13),color);
      if(m.id===this.prediction){
        const mid=a.add(b).uniformScale(0.5);cylinder(this.builder,mid.add(new vec3(0,-0.5,0)),mid.add(new vec3(0,0.5,0)),0.4,new vec4(1,1,1,1));
      }
    }
    for(const j of this.model.joints){
      const p=displaced(j.id),fixed=j.fixed.some(v=>v);
      cylinder(this.builder,p.add(new vec3(0,-0.22,0)),p.add(new vec3(0,0.22,0)),fixed?0.4:0.22,fixed?new vec4(0.7,0.87,0.9,1):new vec4(0.27,0.4,0.48,1));
    }
    if(this.frame&&this.showForces)for(const l of this.frame.loads){
      const f=new vec3(l.force[0],l.force[1],l.force[2]);if(f.length<1)continue;
      const end=displaced(l.joint),dir=f.normalize(),start=end.sub(dir.uniformScale(6));
      cylinder(this.builder,start,end,0.17,new vec4(0.85,1,0.3,1));
      const perpendicular=dir.cross(new vec3(1,0,0)).normalize();
      for(const s of [-1,1])cylinder(this.builder,end,end.sub(dir.uniformScale(1.4)).add(perpendicular.uniformScale(s*0.65)),0.15,new vec4(0.85,1,0.3,1));
    }
    this.builder.updateMesh();
  }
}
