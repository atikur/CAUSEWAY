# CAUSEWAY planning and build record

## Planning method

The initial native prototype was built with CLAD, Lens Studio, and Lens Studio MCP. It adapted CAUSEWAY's own standalone TypeScript truss solver for the Lens.

On October 31, 2026, after the initial native prototype, the entrant used Devpost's `plan-lens` design references, Preview guidance, and template for a delegated review. The agent drafted the [planning answers](planning-answers.md) and [design brief](design-brief.md) using the accepted learning flow and the prototype. The entrant approved both, including choices marked as proposed defaults. The review identified the layout changes described below. [Official plan-lens skill](https://github.com/challengepost/learn-specs/blob/main/skills/plan-lens/SKILL.md)

Devpost requires skill pack planning and a build through CLAD, Lens Studio, and Lens Studio MCP. Its published workflow describes a learner interview followed by a build from the resulting brief. CAUSEWAY used the delegated review described above. The formal rules make publishing the planning documents optional. [Contest overview](https://learn-specs.devpost.com/) · [Official rules](https://learn-specs.devpost.com/rules)

## Build continuation

- Implemented a 46 × 12 cm readout and a 46 × 12 cm controls panel with two rows of contextual actions and a More view. The panel disables and hides inactive actions.
- Applied through VirtualScene: readout center moved to +17 cm and controls center to −18 cm, keeping the bridge at −2 cm and the root at 110 cm in front of the initial viewpoint. The authored panel envelope is approximately 47 cm high.
- Native TypeScript compilation succeeded. The lesson-flow scenario now also exercises the secondary controls and Reset back to the main actions.
- On November 9, 2026, the compact build was reopened, compiled, visually inspected, and saved in Lens Studio 5.23.2. All five LEAF scenarios passed in SPECS 27 Interactive Preview. The brace and reach scenarios were rerun after a Preview reset because the shared run left Reset hidden in the completed lesson.
- The native Preview recording shows the compact panels and completion of all three investigations. The 92-second submission cut uses that footage, captured before the final comparison changes. The local export includes an English caption track, locally synthesized cues, and OpenAI Cedar narration.
- The submission refinement keeps both designs within the same load range after the learner finishes an investigation, and member selection follows the design currently in view. The lesson-flow scenario checks that the last comparable step holds after completion.
- The final review made the repair outcome persistent in the comparison heading. A repair that reaches capacity at 5.0 seconds can be compared with a baseline that stopped at 4.8 seconds, with both times visible. A controller harness using the real solver and stubbed views checked this case, duplicate brace rejection and retry, Undo, member selection, and the completed timeline. The refined build also compiled and passed all five native LEAF scenarios again. See the [build status](../Assets/Documentation/CAUSEWAYNativeBuildStatus.json) for the verification record.

## Demo

The published 92-second demo opens with a camera orbit recorded in Interactive Preview and shows section repairs across all three investigations. The second investigation pairs a heavier downward load with a different weakened member. Each repair is compared with its own baseline at the same applied load. [YouTube demo](https://youtu.be/nYQhKyssYoo) · [Devpost project](https://devpost.com/software/causeway-zfx1cp)

SPECS hardware is not required for the contest's Preview demonstration. Hardware comfort, tracking and device performance claims remain unproven. [Contest resources](https://learn-specs.devpost.com/resources)
