# CAUSEWAY

Change one connection. Change the outcome.

CAUSEWAY is a spatial bridge experiment for introductory STEM learners. Walk around a virtual truss, predict which member will reach its calculated capacity, and inspect the forces when playback freezes at that limit. Use a limited material budget to strengthen a member or add a brace, and compare both designs at the same load step. Three investigations ask learners to apply the same method to different loads.

[Watch the 92-second demo](https://youtu.be/nYQhKyssYoo) · [Devpost project](https://devpost.com/software/causeway-zfx1cp)

## Run in Lens Studio

1. Clone or download the repository and keep `CAUSEWAY.esproj`, `Assets/`, and `Packages/` together. Open `CAUSEWAY.esproj` in Lens Studio 5.23.2, the version used for verification.
2. Select SPECS 27 and Interactive Preview. Use WASD to move, right-drag to look, and click to simulate a pinch. Select a bridge member or use **Next member**, then press **Predict + run**. The full lesson runs in Preview without a SPECS device.
3. When playback freezes, select the member named under **First limit** to inspect its values, then choose **Repair**. Use **Section x20** on the selected member, or press **Add brace**, drag and release each handle onto a joint, and press **Add brace** again to commit.
4. Press **Test repair**. The comparison heading reports whether the repair completed the load case or reached its capacity limit at a particular time. Use **Earlier**, **Later**, and **Compare** to inspect both designs at the same load step. Choose **Repair again** if the repair reaches a limit or **Explain + finish** after a successful repair. Then choose **Next challenge**, or **Restart lesson** after the third investigation. Use **More** for secondary controls, including **Reset** to restart the current investigation.

To reproduce the first demo comparison, select `lateral-1-1` in investigation 1, run the baseline, apply **Section x20** to that member, then press **Test repair**. At the same 4.8 s load step, the comparison shows peak capacity utilization of 104% for the baseline and 47% for the repair.

For automated checks, open **Window → LEAF**. If the panel is missing, install LeafPlugin from the Lens Studio Asset Library, enable it under **Settings → Plugin Manager**, and restart Lens Studio. Reset from the Preview toolbar before each scenario so it starts at the opening phase. The optional `causeway-control-reach` scenario uses network access to download a Snap avatar. The learner flow uses the bundled assets. The [native build record](Assets/Documentation/CAUSEWAYNativeBuildStatus.json) lists the scenarios and results.

## Model and scope

The educational solver uses a linear elastic, pin-jointed axial truss model with small displacement and declared member capacities. The Lens stops at the first calculated capacity limit. The model excludes buckling, bending, fracture, fatigue, and nonlinear collapse. Display scale and the magnified elastic motion are separate from the engineering values.

## Project record and credits

The initial Lens was built with CLAD and Lens Studio MCP and adapted CAUSEWAY's standalone TypeScript truss solver. The entrant then approved a delegated design review using Devpost's `plan-lens` references and template. The review led to smaller panels and contextual controls. The [approved design brief](devpost/design-brief.md) and [process record](devpost/process-record.md) document that chronology.

The project uses the SPECS Base Template, Spectacles Interaction Kit, Spectacles UIKit, and LEAF. These dependencies retain their respective terms. The icons are Google Material Symbols imported through Icon Selector and covered by the included [Apache 2.0 license](licenses/Material-Symbols-Apache-2.0.txt). CLAD supplied the vertex color shader and synthesized the sound cues locally. The bridge mesh and lesson logic are CAUSEWAY project work.
