---
status: approved
prepared: 2026-10-31
approved: 2026-10-31
---

# CAUSEWAY planning answers

The entrant approved these agent-drafted answers and the design brief on October 31, 2026, including the proposed choices marked **(default)**. The delegated `plan-lens` review followed the initial native prototype and informed the compact layout. Implementation and verification notes below describe what shipped after that review.

## Contest requirements checked

The formal rules require a new SPECS Lens, planning with the Devpost Learn skill pack, construction through CLAD, Lens Studio and Lens Studio MCP, and consistent Preview operation. Submission needs a public code repository, feature description, and working demo publicly visible on YouTube. Devpost asks entrants to keep the demo under three minutes. The submission period ends November 9, 2026 at 5 p.m. Eastern. Disclose incorporated pre-existing work outside the standard development tools permitted by the rules. [Official rules](https://learn-specs.devpost.com/rules)

Publishing planning documents is explicitly optional in the formal rules, although the overview recommends including `devpost/`. Including this folder is useful. The judging criteria equally weight design, technical implementation, innovation/idea, and presentation. [Rules](https://learn-specs.devpost.com/rules), [overview](https://learn-specs.devpost.com/)

SPECS hardware is not required: the contest accepts a Lens Studio Preview demonstration. Hardware testing remains useful for comfort and tracking claims. [Resources](https://learn-specs.devpost.com/resources)

## 1 What would you like to make

CAUSEWAY is a spatial learning experience about how forces travel through a bridge. It is intended for introductory STEM learners **(default)**. A learner predicts which member will reach its declared axial capacity first, applies a controlled load, inspects the result, and repairs the structure within a material budget. Replaying the same load makes the effect of the change visible. Three investigations let the learner apply the strategy to different loading directions.

## 2 What is the best spatial moment

I am standing in front of a small virtual bridge placed in the room **(default)**. I can change my viewpoint to inspect its connections, select a member, and commit my prediction. Loading freezes at the calculated limit. I can inspect the stressed member, make a repair, and compare the two designs at the same load. The main moment is seeing how one connection or section change alters the load path.

The intended advantage of glasses is examining a model that occupies the learner's space from their own viewpoint. The project does not depend on camera recognition. This spatial advantage still needs a human walkthrough; automated tests do not establish that it teaches better than a laptop.

## 3 Is it a product or an overlay

The virtual bridge is the product. It does not identify, assess, or attach to a real bridge. No recognition stand-in is needed. The ordinary Preview room and a world-placed virtual truss are sufficient. Automatic placement on a real table, persistent anchors, and structural assessment of real buildings are outside this version.

## 4 Where does everything sit

Keep the bridge in the room, around 110 cm in front of the starting viewpoint **(default, already implemented)**. Its undeformed displayed dimensions are about 42 × 10.5 × 10.5 cm before rotation; the current planning estimate after presentation rotation is about 44 × 17 × 26 cm. Display scale is separate from the engineering model's SI dimensions.

The implemented compact layout **(default)** keeps a 46 × 12 cm readout above the model and a 46 × 12 cm panel of relevant actions below it. At the same 110 cm depth, their centers are +17 cm and −18 cm relative to the initial eye-height origin. The bridge center remains −2 cm. The authored panels span about 47 cm vertically and were visually checked in Preview.

The build reviewed during planning used larger panels spanning approximately 70.5 cm vertically. The world-placed compact layout was implemented afterward. The project uses a fixed placement in Preview.

## 5 How do hands act on it

Use standard SIK interactions: pinch a member to select it, pinch large buttons to predict/run or advance, and drag brace endpoints onto joints. Place the two endpoints sequentially with one hand, then press Add brace to commit. It is not a simultaneous two-hand gesture.

Next member offers a button alternative to selecting thin members. Section x20 spends material to strengthen a member. Undo and Reset support recovery. The compact panel shows relevant actions for the current phase, including timeline steps and Compare during comparison. More exposes secondary controls such as Rotate and sound mute **(default, implemented)**.

## 6 When should content appear

Keep the bridge visible throughout the investigation. Show prediction guidance first, numerical inspection after freezing, brace handles only during brace editing, and comparison information after a valid repair. Start the transfer investigation with force colors hidden so the learner predicts before requesting the cue.

The compact readout shows the current step and selected-member result **(default)**. Inactive buttons are hidden, and the More view reuses the same panel for secondary controls **(default)**.

Selection, limit, and snap cues provide audio feedback; sound can be muted. No directional off-screen arrow is implemented. The primary task should remain together in front of the learner rather than depend on alerts behind them.

## 7 How will we know it works

1. Select a member, commit a prediction, and see playback freeze at the first calculated limit with prediction feedback.
2. Strengthen a member within budget, Undo the edit, then retest and switch between baseline and repair at identical recorded time and applied loads.
3. Drag both brace endpoints sequentially onto joints, commit a valid brace, see budget change, and Undo it.
4. Complete all three investigations, including the transfer challenge where force colors start hidden.
5. Activate Next member and Reset through the Preview's SIK interaction path.

These criteria map to five LEAF scenarios that passed in Preview after the compact layout was implemented. The [native verification record](../Assets/Documentation/CAUSEWAYNativeBuildStatus.json) records the runs and visual checks.

## 8 People and consent

The learning flow does not record, identify, or follow other people. It needs no camera recognition, microphone input, cloud service, shared session, or remembered user history. The exported demonstration is a recording of the simulated Preview.

## Short project description

CAUSEWAY turns a bridge into a spatial experiment. Predict the member that will reach its calculated capacity first, freeze and inspect the load path, then repair the design with limited material. Compare the original and repaired bridge under identical loading and apply what you learned across three investigations. The experience uses an educational axial-truss model and does not simulate buckling or structural collapse.

## Delivery status

- The entrant approved the prepared answers and brief. The [process record](process-record.md) documents the delegated review and subsequent compact layout changes.
- The compact build compiled, passed five LEAF scenarios and was inspected in Preview. Human learning, accessibility, and comfort over time remain unverified. See the [native verification record](../Assets/Documentation/CAUSEWAYNativeBuildStatus.json).

See the approved [design brief](design-brief.md) for the build target and the unchanged official after-build instructions.
