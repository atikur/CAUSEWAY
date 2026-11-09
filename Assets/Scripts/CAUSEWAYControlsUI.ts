/** Two contextual UIKit rows; secondary actions occupy the same spatial panel. */
import Event from 'SpectaclesInteractionKit.lspkg/Utils/Event';
import {ElementContent} from 'SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent';
import {Button} from 'SpectaclesUIKit.lspkg/Scripts/Components/Button/Button';
import {panel,flex,child,obj,buttonContent} from './CAUSEWAYLayoutUI';
const PLAY=requireAsset('../Icons/play_arrow.png') as Texture;
const RESET=requireAsset('../Icons/replay.png') as Texture;
const BUILD=requireAsset('../Icons/build.png') as Texture;
@component
export class CAUSEWAYControlsUI extends BaseScriptComponent {
  @ui.label('CAUSEWAY – Contextual experiment controls')
  @input @hint('Panel width in centimeters') @widget(new SliderWidget(42,50,1)) widthCm:number=46;
  readonly onAction=new Event<string>();
  private controls:{id:string;button:Button;content:ElementContent;object:SceneObject}[]=[];
  private slots:SceneObject[]=[];
  private enabledActions:string[]=[];
  private phase='';
  private secondary=false;
  onAwake():void {this.createEvent('OnStartEvent').bind(()=>{
    const col=panel(this.sceneObject,this.widthCm,12),width=(this.widthCm-4.2)/3;
    for(let row=0;row<2;row++){
      const host=child(col,this.widthCm-3,4.2,'Action row '+row),r=flex(host,this.widthCm-3,4.2,true,0.6);
      for(let cell=0;cell<3;cell++)this.slots.push(child(r,width,4.2,'Action slot '+(row*3+cell)));
    }
    const actions:[string,string,Texture?][]=[
      ['primary','Predict + run',PLAY],['select','Next member'],['more','More'],
      ['reset','Reset',RESET],['strengthen','Section x20',BUILD],['brace','Add brace'],['undo','Undo'],
      ['back','Earlier'],['step','Later'],['branch','Compare'],['rotate','Rotate 30°'],
      ['forces','Force colors'],['sound','Sound on']
    ];
    for(const [id,label,icon] of actions){
      const object=obj(this.slots[0],'Action '+label,0.05);
      const b=buttonContent(object,width,label,()=>{
        if(id==='more'){this.secondary=!this.secondary;this.showPage();return;}
        if(id==='reset')this.secondary=false;
        this.onAction.invoke(id);
      },icon??null);
      this.controls.push({id,...b,object});object.enabled=false;
    }
  });}
  setState(primary:string,enabled:string[],muted:boolean,multiplier:number,phase:string):void {
    if(phase!==this.phase){this.phase=phase;this.secondary=false;}
    this.enabledActions=enabled;
    for(const c of this.controls){
      if(c.id==='primary')c.content.text=primary;
      if(c.id==='sound')c.content.text=muted?'Sound off':'Sound on';
      if(c.id==='strengthen')c.content.text='Section x'+multiplier;
    }
    this.showPage();
  }
  private showPage():void {
    if(this.slots.length!==6)return;
    let ids=this.secondary?['more','rotate','sound','reset','forces','select']:
      ['primary','select','more',...(this.phase==='repair'?['strengthen','brace','undo']:
        this.phase==='compare'||this.phase==='complete'?['branch','back','step']:
        this.phase==='inspect'?['back','step','forces']:['rotate','forces','reset'])];
    ids=ids.filter(id=>id==='more'||this.enabledActions.includes(id));
    for(const c of this.controls){
      const slot=ids.indexOf(c.id),visible=slot>=0;
      c.object.enabled=false;c.button.enabled=visible;c.button.opacity=1;
      if(visible){
        c.object.setParent(this.slots[slot]);c.object.getTransform().setLocalPosition(new vec3(0,0,0.05));
        c.object.enabled=true;
      }
      if(c.id==='more')c.content.text=this.secondary?'Main actions':'More';
    }
  }
}
