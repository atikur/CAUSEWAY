---
status: approved
prepared: 2026-10-31
approved: 2026-10-31
planning_stage: post-prototype review
planning_method: delegated agent-led review
published_interview_followed: false
---

# Design brief: CAUSEWAY

Prepared after the initial native prototype using Devpost's `plan-lens` references and template. The entrant delegated the drafting to the coding agent and approved the answers and brief on October 31, 2026. The approved choices marked **(default)** originated with the agent.

The design sections record the October 31 prototype and proposed changes at review time. The compact panels and More view shipped after approval. The [process record](process-record.md) documents the sequence and the final Preview checks. The last two sections reproduce the skill template's build and review instructions.

## The one spatial moment

A learner stands before a small virtual bridge in their room **(default)**, changes viewpoint to inspect its connections, and predicts the member that will reach its calculated capacity first. When loading freezes, they inspect the result, make a budgeted repair, and compare the original and repaired designs under identical loading.

## Why it belongs on glasses

- Uses: draws in the world. The bridge has a stable position in the room; the learner can inspect its spatial connections from their own viewpoint.
- Why it is better than the phone or laptop version: the intended benefit **(default)** is following connections and load paths around a model occupying the learner's space. Standard pinch and drag inputs let them act directly on that model. This benefit needs human evaluation; the experience does not claim camera recognition or proven educational superiority.
- Intended audience: introductory STEM learners **(default)** who are exploring load paths and controlled experiments.

## Product or overlay

- Type: product; the virtual bridge and experiment are the experience.
- What the real version would sense: nothing beyond ordinary head and hand tracking. It does not recognize or assess real structures.
- Stand-in for the preview: none needed. Use the simulated room with the same virtual truss and ordinary SIK interactions.

## Where things live

- Where the user is looking during the main task: at the bridge and the selected connection, with the current step and action immediately nearby.
- Bridge: anchored in the room at the initial scene origin, approximately 110 cm in front of the starting viewpoint, center 2 cm below initial eye height **(default, implemented)**. The undeformed displayed model is approximately 42 × 10.5 × 10.5 cm; the rotated presentation envelope is estimated at 44 × 17 × 26 cm. The current authored rotation is 12° about X and −18° about Y **(default)**. The learner can rotate it in 30° increments **(default, implemented)**.
- Readout: proposed compact 46 × 12 cm panel centered 17 cm above the same origin at 110 cm depth **(default)**. Show short phase guidance and the selected result directly above the bridge. The prototype used a 46 × 20 cm panel centered 24 cm above the origin.
- Controls: proposed 46 × 12 cm panel centered 18 cm below the origin at 110 cm depth **(default)**. Show relevant actions in at most two rows, with secondary controls in a separate view **(default)**. The prototype used a 46 × 21 cm, four-row panel centered 26 cm below the origin.
- The proposed panels span approximately 47 cm vertically together. Measure actual rendered bounds and inspect the target view after implementation; panel dimensions alone do not prove comfort or readability.
- The room placement does not snap to a real table or persist between sessions. Keep the space around the model clear for inspection.

## Hands and input

- Select: aim at a member and pinch. Next member cycles selection as an alternative to targeting thin members.
- Predict/run: pinch the primary button to commit the selected prediction and start identical baseline loading. Pause/resume is available during playback.
- Inspect: select a member after freezing to inspect force, stress and utilization; use Earlier/Later for 0.2-second timeline steps **(default)**.
- Strengthen: select a member and press Section x20 **(default)** to increase its section while spending available material. The budget is enforced.
- Brace: press Add brace, drag the first handle onto a joint, release, then drag and release the second handle onto another joint. Each handle snaps within 3 display cm **(default)**. Press Add brace again to commit. This is sequential one-hand input. The brace area is 0.00008 m² **(default)** and must fit the remaining material budget.
- Recover and compare: Undo restores the previous valid edit; Reset restarts the current investigation. Compare switches between original and repaired recordings at a shared valid time with identical applied loads.
- Secondary controls: Rotate, force-color toggle, timeline navigation and sound mute stay available in the proposed secondary view **(default)**.
- Buttons use large targets; selected members highlight. Next member provides an alternative to thin-member targeting. Clear hover feedback for spatial selection is a proposed usability goal **(default)** and needs verification.
- Voice (if any) and the button that does the same job: none; every required action uses a standard Preview interaction.

## When things show

- Bridge: visible throughout the current investigation; selection and prediction markers connect the learner's choice to the model.
- Guidance: show the current step, then replace it with the next relevant instruction. The proposed compact readout does not keep long instructions visible at every phase **(default)**.
- Force feedback: cyan for tension, orange for compression, and red for a capacity limit **(default)**. Numerical values and text provide information in addition to color. On the transfer investigation, force colors start hidden until requested.
- Inspection: show the selected member's force, stress and utilization after freezing, and comparison results after testing a valid repair.
- Brace handles: show only while editing a brace; hide after committing or leaving the edit.
- Controls: proposed presentation hides inactive actions and reveals only the current task and requested secondary controls **(default)**. The prototype kept inactive buttons visible at reduced opacity.
- Audio: short selection, limit and snap cues, with mute available. No background music **(default)**.
- If something needs attention out of view: no directional indicator is implemented. Keep the core task together in the forward workspace; normal state changes use the existing audio cues. A walkthrough must check whether additional guidance is needed **(default)**.

## Done criteria

Each one can be checked in Lens Studio's preview.

1. Select a member, commit the prediction, and run the baseline. Playback stops at the first prescribed load step meeting a declared member capacity, with prediction feedback and a numerical explanation.
2. Apply a section repair within budget, Undo it to restore the previous budget, then retest a valid repair. Switching Compare at the same recorded time shows identical applied loads for baseline and candidate within their shared valid range.
3. Drag both brace endpoints sequentially onto joints, commit a valid budgeted brace, and Undo it to restore the previous design and budget.
4. Complete the prediction, inspection, repair and controlled comparison sequence across all three investigations. The transfer investigation begins with force colors hidden.
5. Activate Next member and Reset through SIK in Interactive Preview; the member selection changes and Reset restores the current investigation.

## Out of scope

- Real-bridge inspection, safety assessment, or engineering certification.
- Bending, buckling, fatigue, fracture or nonlinear collapse. The solver is a small-displacement, linear-elastic, pin-jointed axial model with declared educational capacities.
- Post-limit collapse animation presented as a physical simulation. Playback ends at the first prescribed step meeting capacity; comparison uses only the shared valid range.
- Camera recognition, real-surface detection, real-world navigation, AI services, voice input, multiplayer, and persistence between sessions.
- Simultaneous two-hand gestures or custom hand poses.
- Proven learning improvement or proven hardware comfort based solely on automated tests.

## Risks identified at the October 31 review

- The prototype's readout and controls spanned approximately 70.5 cm vertically. The proposed compact layout needed inspection for text fit and visibility from the initial viewpoint.
- The prototype kept inactive buttons visible. The review proposed contextual hiding and the secondary control view.
- Small members and overlapping connections can make direct selection difficult. Next member is the current alternative; test readability and discoverability with a person.
- Elastic displacement is magnified ×30 **(default, labeled in the current build)**. Engineering dimensions and loads remain SI; display centimeters and magnified motion must not change calculations.
- The native verification record available during planning showed TypeScript compilation and five passing LEAF scenarios. Long-term comfort, physical hand tracking, device audio and performance, accessibility, and learning benefit require separate evaluation.
- Human room-scale inspection and the proposed compact presentation are not covered by the five automated scenarios. Do a manual walkthrough after any layout revision.
- At review time the core scenario verified rollback of an unaffordable section edit. The native brace scenario covered the valid snap and Undo flow. A later controller harness also checked duplicate brace rejection and retry.

## Native verification available at the October 31 review

| Done criterion | Existing scenario | Recorded result |
| --- | --- | --- |
| 1 | `causeway-lesson-flow` | Passed |
| 2 | `causeway-lesson-flow`, `causeway-native-core` | Passed |
| 3 | `causeway-brace-snapping` | Valid snap, insert and Undo flow passed |
| 4 | `causeway-three-investigation-demo` | Passed |
| 5 | `causeway-control-reach` | Passed through the full-arm IK fixture; human reach/comfort remains unproven |

See the [native verification record](../Assets/Documentation/CAUSEWAYNativeBuildStatus.json) and [approved planning answers](planning-answers.md). The compact layout and secondary control view were implemented and verified after approval. The [process record](process-record.md) documents final verification.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
