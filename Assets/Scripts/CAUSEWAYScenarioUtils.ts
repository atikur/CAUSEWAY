/** State-based LEAF waits tolerate Preview frame-rate changes without hiding stalled playback. */
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {CAUSEWAYMain} from './CAUSEWAYMain';
export async function waitForPhase(app:CAUSEWAYMain,phase:string,timeoutMs=20000):Promise<void>{
  const end=Date.now()+timeoutMs;
  while(app.getSnapshot().phase!==phase){
    if(Date.now()>end)throw new Error('Expected '+phase+'; current state '+JSON.stringify(app.getSnapshot()));
    await sleep(50);
  }
}
