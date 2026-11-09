/** Owns three spatial interaction cues. No background bed or lesson state. */
const SELECT=requireAsset('../GeneratedSFX/CAUSEWAYSelect.wav') as AudioTrackAsset;
const LIMIT=requireAsset('../GeneratedSFX/CAUSEWAYLimit.wav') as AudioTrackAsset;
const SNAP=requireAsset('../GeneratedSFX/CAUSEWAYSnap.wav') as AudioTrackAsset;
@component
export class CAUSEWAYAudioController extends BaseScriptComponent {
  @input @hint('Cue volume; Sound control mutes all cues') @widget(new SliderWidget(0,1,0.05)) volume:number=0.35;
  muted=false;
  private cues:AudioComponent[]=[];
  initialize():void {
    for(const [i,track] of [SELECT,LIMIT,SNAP].entries()){
      const o=global.scene.createSceneObject('CAUSEWAY cue '+i);o.setParent(this.sceneObject);
      const c=o.createComponent('Component.AudioComponent') as AudioComponent;c.audioTrack=track;
      c.playbackMode=Audio.PlaybackMode.LowLatency;c.volume=this.volume;c.spatialAudio.enabled=true;this.cues.push(c);
    }
  }
  play(index:number,position?:vec3):void {
    if(this.muted||!this.cues[index])return;
    if(position)this.cues[index].getTransform().setWorldPosition(position);
    this.cues[index].play(1);
  }
}
