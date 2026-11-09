import {scenariosIndex} from 'Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator';
import {ScenarioMetadata} from 'Leaf.lspkg/Scenarios/scenario/ScenarioMetadata';
import {CAUSEWAYCoreScenario} from './CAUSEWAYCoreScenario';
import {CAUSEWAYFlowScenario} from './CAUSEWAYFlowScenario';
import {CAUSEWAYBraceScenario} from './CAUSEWAYBraceScenario';
import {CAUSEWAYReachScenario} from './CAUSEWAYReachScenario';
import {CAUSEWAYDemoScenario} from './CAUSEWAYDemoScenario';
@component
export class CAUSEWAYLeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex:ScenarioMetadata[]=[
    {id:'causeway-native-core',typename:CAUSEWAYCoreScenario.getTypeName()},
    {id:'causeway-lesson-flow',typename:CAUSEWAYFlowScenario.getTypeName()},
    {id:'causeway-brace-snapping',typename:CAUSEWAYBraceScenario.getTypeName()},
    {id:'causeway-control-reach',typename:CAUSEWAYReachScenario.getTypeName()},
    {id:'causeway-three-investigation-demo',typename:CAUSEWAYDemoScenario.getTypeName()}
  ];
}
