/** Passive status, numerical inspection and comparison view. No lesson decisions. */
import {panel,text} from './CAUSEWAYLayoutUI';
@component
export class CAUSEWAYHUDUI extends BaseScriptComponent {
  @ui.label('CAUSEWAY – Investigation readout')
  @input @hint('Width of the readout in centimeters') @widget(new SliderWidget(40,50,1)) widthCm:number=46;
  @input @hint('Typography scale for accessibility') @widget(new SliderWidget(1,1.4,0.05)) textScale:number=1;
  @input('vec4','{0.9,0.97,1,1}') @hint('Readout text color') @widget(new ColorWidget()) textColor:vec4;
  private title:Text;private status:Text;private detail:Text;private footer:Text;
  onAwake():void {this.createEvent('OnStartEvent').bind(()=>{
    const col=panel(this.sceneObject,this.widthCm,12);
    col.onInitialized.add(()=>{col.rowGap=0.2;});
    this.title=text(col,this.widthCm-3,1,'CAUSEWAY','Subheadline',this.textScale,this.textColor);
    this.status=text(col,this.widthCm-3,1.2,'Select a member.','Caption',this.textScale,this.textColor);
    this.detail=text(col,this.widthCm-3,4.8,'','Body',this.textScale,this.textColor);
    this.footer=text(col,this.widthCm-3,2.2,'','Caption',this.textScale,this.textColor);
  });}
  setData(title:string,status:string,detail:string,footer:string):void {
    if(!this.title)return;this.title.text=title;this.status.text=status;this.detail.text=detail;this.footer.text=footer;
  }
}
