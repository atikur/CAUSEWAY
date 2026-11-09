/** Owns lesson progression and coordinates passive views. All engineering calculations stay in the adapted core. */
import {Lesson,explain} from './CAUSEWAYLesson';
import {investigations,Investigation} from './CAUSEWAYInvestigations';
import {Frame,Recording} from './CAUSEWAYExperiment';
import {CAUSEWAYTrussView} from './CAUSEWAYTrussView';
import {CAUSEWAYHUDUI} from './CAUSEWAYHUDUI';
import {CAUSEWAYControlsUI} from './CAUSEWAYControlsUI';
import {CAUSEWAYBraceController} from './CAUSEWAYBraceController';
import {CAUSEWAYAudioController} from './CAUSEWAYAudioController';
@component
export class CAUSEWAYMain extends BaseScriptComponent {
  @ui.label('CAUSEWAY – Predict / test / inspect / repair')
  @ui.group_start('References')
  @input @hint('Parametric spatial truss') view:CAUSEWAYTrussView;
  @input @hint('Investigation readout') hud:CAUSEWAYHUDUI;
  @input @hint('UIKit experiment controls') controls:CAUSEWAYControlsUI;
  @input @hint('Two snap-based brace handles') brace:CAUSEWAYBraceController;
  @input @hint('Spatial audio cue controller') audio:CAUSEWAYAudioController;
  @ui.group_end
  @ui.group_start('Settings')
  @input @hint('Playback seconds between identical prescribed load steps') @widget(new SliderWidget(0.1,0.7,0.05)) stepSeconds:number=0.2;
  @input @hint('Selected-member section-area multiplier per repair') @widget(new SliderWidget(2,20,1)) sectionMultiplier:number=20;
  @input @hint('Area in square meters of an added brace') @widget(new SliderWidget(0.00002,0.0002,0.00002)) braceArea:number=0.00008;
  @ui.group_end
  private lessons:Investigation[];
  private lesson:Lesson;
  private missionIndex=0;
  private baseline:Recording;
  private candidate:Recording|null=null;
  private frame:Frame;
  private index=0;
  private branch:'baseline'|'candidate'='baseline';
  private forces=true;
  private message='';
  private accumulated=0;
  private started=false;
  private braceId=0;
  private frameSamples:number[]=[];
  private generationMs=0;
  private viewKey='';
  onAwake():void {
    this.createEvent('OnStartEvent').bind(()=>{
      if(!this.view||!this.hud||!this.controls||!this.brace||!this.audio)return;
      this.view.initialize();this.brace.initialize();this.audio.initialize();
      this.view.onSelect.add(id=>this.selectMember(id));
      this.controls.onAction.add(action=>this.dispatch(action));
      this.brace.onSnap.add(note=>{this.message=note;this.audio.play(2);this.render();});
      this.lessons=investigations();this.loadMission(0);this.started=true;
      console.log('[CAUSEWAY] Ready. First-load recording CPU '+this.generationMs+' ms.');
    });
    this.createEvent('UpdateEvent').bind(()=>{
      if(!this.started)return;
      if(this.frameSamples.length<600&&getDeltaTime()>0)this.frameSamples.push(getDeltaTime()*1000);
      if(this.lesson.phase!=='play'||this.lesson.isPaused)return;
      this.accumulated+=getDeltaTime();if(this.accumulated<this.stepSeconds)return;this.accumulated-=this.stepSeconds;
      this.frame=this.lesson.advance();this.index=Math.round(this.lesson.progress*(this.baseline.frames.length-1));
      if(['inspect','compare'].includes(this.lesson.phase)){
        this.audio.play(1);this.message=this.lesson.feedback.text;
        if(String(this.lesson.phase)==='compare'){
          this.message='';
          this.seek(this.comparisonEnd());
        }
      }
      this.render();
    });
  }
  private loadMission(index:number):void {
    const start=Date.now();this.missionIndex=index;this.lesson=new Lesson(this.lessons[index]);this.generationMs=Date.now()-start;
    this.baseline=this.lesson.experiment.baseline;this.candidate=null;this.index=0;this.branch='baseline';
    this.forces=index!==2;this.frame=this.baseline.frames[0];this.message='';this.accumulated=0;
    this.brace.hide();this.view.setTargets(true);this.view.setStructure(this.lesson.experiment.structure);this.render();
  }
  selectMember(id:string):void {
    try{this.lesson.select(id);this.message='';this.audio.play(0,this.view.worldJoint(this.lesson.experiment.structure.members.find(m=>m.id===id).a));this.render();}
    catch(e){this.message=String(e);this.render();}
  }
  dispatch(action:string):void {
    if(!this.lesson)return;this.message='';
    try {
      switch(action){
        case 'primary':this.primary();break;
        case 'select':{
          const members=this.displayedStructure().members;
          const i=members.findIndex(m=>m.id===this.lesson.selection);this.lesson.select(members[(i+1)%members.length].id);break;
        }
        case 'reset':this.loadMission(this.missionIndex);break;
        case 'strengthen':{
          const id=this.lesson.selection;if(!id)throw new Error('Select a member to reinforce.');
          const m=this.lesson.experiment.structure.members.find(m=>m.id===id);
          this.lesson.changeSection(id,m.area*this.sectionMultiplier);this.afterEdit();this.message='Section increased. Test the same loading to see whether it helps.';break;
        }
        case 'brace':this.editBrace();break;
        case 'undo':
          if(this.lesson.undo()){this.afterEdit();this.message='Last valid edit undone.';}
          else this.message='There are no repairs to undo.';
          break;
        case 'back':this.seek(this.index-1);break;
        case 'step':this.seek(this.index+1);break;
        case 'branch':{
          if(!this.candidate)throw new Error('Test a repair before comparing.');
          this.branch=this.branch==='baseline'?'candidate':'baseline';
          this.clearMissingSelection();this.seek(this.index);break;
        }
        case 'rotate':this.brace.hide();this.view.setTargets(true);this.view.rotate(30);break;
        case 'forces':this.forces=!this.forces;break;
        case 'sound':this.audio.muted=!this.audio.muted;break;
      }
      if(action!=='sound')this.audio.play(0);this.render();
    } catch(e) {this.message=String(e).replace(/^Error: /,'');this.render();}
  }
  private primary():void {
    switch(this.lesson.phase){
      case 'predict':this.lesson.predict();this.branch='baseline';break;
      case 'play':this.lesson.pause();break;
      case 'inspect':case 'compare':
        if(this.lesson.phase==='compare'&&this.candidate?.firstFailure===null){this.lesson.complete();break;}
        this.lesson.beginRepair();this.afterEdit();break;
      case 'repair':{
        this.brace.hide();this.view.setTargets(true);const start=Date.now();this.lesson.testRepair();this.generationMs=Date.now()-start;
        this.candidate=this.lesson.experiment.candidate;this.branch='candidate';this.frame=this.candidate.frames[0];this.index=0;this.accumulated=0;break;
      }
      case 'complete':if(this.missionIndex<2)this.loadMission(this.missionIndex+1);else this.loadMission(0);break;
    }
  }
  private afterEdit():void {
    this.brace.hide();this.view.setTargets(true);this.candidate=null;this.index=0;this.branch='baseline';this.frame=this.baseline.frames[0];
    this.clearMissingSelection();
    this.view.setStructure(this.lesson.experiment.structure);
  }
  private editBrace():void {
    if(this.lesson.phase!=='repair')throw new Error('Enter repair mode first.');
    if(!this.brace.isActive){this.view.setFrame(null,this.lesson.selection,this.lesson.experiment.prediction,false);this.view.setTargets(false);this.brace.show();this.message='Drag both colored endpoints onto joints. Release to snap, then press Add brace again.';return;}
    const pair=this.brace.pair;if(!pair)throw new Error('Snap both endpoints to joints before adding the brace.');
    const sample=this.lesson.experiment.structure.members[0];
    this.lesson.addBrace({...sample,id:'repair-'+(++this.braceId),a:pair[0],b:pair[1],area:this.braceArea});
    this.afterEdit();this.audio.play(2);this.message='Brace added within the material budget. Test the repair.';
  }
  private displayedStructure() {
    if(this.lesson.phase==='repair')return this.lesson.experiment.structure;
    return this.branch==='candidate'&&this.candidate?this.candidate.structure:this.baseline.structure;
  }
  private clearMissingSelection():void {
    const selection=this.lesson.selection;
    if(selection&&!this.displayedStructure().members.some(member=>member.id===selection))this.lesson.select(null);
  }
  private comparisonEnd():number {
    const baselineEnd=this.baseline.firstFailure??this.baseline.frames.length-1;
    const candidate=this.candidate;
    return candidate?Math.min(baselineEnd,candidate.firstFailure??candidate.frames.length-1):baselineEnd;
  }
  private seek(index:number):void {
    const r=this.branch==='baseline'?this.baseline:this.candidate;if(!r)throw new Error('Test this design first.');
    const phase=this.lesson.phase;
    const limit=phase==='compare'||phase==='complete'?this.comparisonEnd():r.firstFailure??r.frames.length-1;
    this.index=Math.max(0,Math.min(limit,index));this.frame=this.lesson.seek(this.index,this.branch);
  }
  private render():void {
    if(!this.lesson)return;
    const phase=this.lesson.phase,selection=this.lesson.selection,mission=this.lessons[this.missionIndex];
    let status=phase.toUpperCase()+' · '+mission.title;
    const structure=this.displayedStructure();
    const key=structure.id+structure.members.map(m=>m.id+':'+m.area).join('|');
    if(key!==this.viewKey){this.view.setStructure(structure);this.viewKey=key;}
    // Member topology changes only on edits; color/displacement refresh is a single mesh draw.
    this.view.setFrame(phase==='repair'?null:this.frame,selection,this.lesson.experiment.prediction,this.forces);
    const result=selection&&phase!=='repair'&&this.frame.result.members.some(m=>m.id===selection)?explain(this.frame.result,selection).text:'';
    let detail=this.message||((phase==='predict'?mission.prompt:this.lesson.feedback.text)+'\n'+result);
    if(phase==='play'&&!this.message)detail=(this.branch==='candidate'?'Revised design · replaying the identical prescribed loads.':'Baseline · watching for the first modeled capacity limit.')+'\n'+result;
    if(phase==='inspect')detail='First limit: '+this.lesson.feedback.member+'\nYour prediction: '+this.lesson.experiment.prediction+(this.lesson.feedback.member===this.lesson.experiment.prediction?' (matched)':' (different)')+'\n'+(result||'Select a member to inspect force, stress and utilization.');
    if(phase==='repair')detail=this.message||'Select a member and change its section, or snap a brace between two joints. Undo and Reset recover safely.';
    if((phase==='compare'||phase==='complete')&&this.candidate){
      const same=this.lesson.compare(this.index);
      const utilization=(frame:Frame)=>(frame.result.maxUtilization*100).toFixed(0)+'%';
      if(phase==='compare'){
        const failure=this.candidate.firstFailure;
        status=failure===null
          ?'COMPARE · Full load case completed'
          :'COMPARE · Repair limit at '+this.candidate.frames[failure].time.toFixed(1)+' s';
      }
      detail=(this.message?this.message+'\n':'')+
        'Equal load at '+same.baseline.time.toFixed(1)+' s: baseline '+utilization(same.baseline)+
        ' / repair '+utilization(same.candidate)+'.\n'+result;
    }
    if(phase==='complete')detail=mission.principle+'\n'+detail;
    const budget=(this.lesson.remainingBudget*1e6).toFixed(0);
    const footer=(selection??'No member selected')+' | '+this.branch+' '+this.frame.time.toFixed(1)+' s\nBudget '+budget+' cm³ | elastic motion x'+this.view.displacementGain+'\nAxial model: bending, buckling and collapse excluded.';
    this.hud.setData('CAUSEWAY  '+(this.missionIndex+1)+'/3',status,detail,footer);
    const primary={predict:'Predict + run',play:this.lesson.isPaused?'Resume':'Pause',inspect:'Repair',repair:'Test repair',compare:this.candidate?.firstFailure===null?'Explain + finish':'Repair again',complete:this.missionIndex<2?'Next challenge':'Restart lesson'}[phase];
    const enabled=['primary','select','reset','rotate','forces','sound'];
    if(phase==='repair')enabled.push('strengthen','brace','undo');
    if(['inspect','compare','complete'].includes(phase))enabled.push('back','step');
    if(['compare','complete'].includes(phase))enabled.push('branch');
    this.controls.setState(primary,enabled,this.audio.muted,this.sectionMultiplier,phase);
  }
  getSnapshot():{phase:string;selection:string;mission:number;budget:number;frame:number;branch:string;firstFailure:number|null;candidateFailure:number|null;message:string;recordingMs:number;frameMsMedian:number;frameMsP95:number} {
    const sorted=this.frameSamples.slice().sort((a,b)=>a-b);
    return {phase:this.lesson.phase,selection:this.lesson.selection,mission:this.missionIndex,budget:this.lesson.remainingBudget,frame:this.index,branch:this.branch,
      firstFailure:this.baseline.firstFailure,candidateFailure:this.candidate?.firstFailure??null,message:this.message,recordingMs:this.generationMs,
      frameMsMedian:sorted[Math.floor(sorted.length*0.5)]??0,frameMsP95:sorted[Math.floor(sorted.length*0.95)]??0};
  }
}
