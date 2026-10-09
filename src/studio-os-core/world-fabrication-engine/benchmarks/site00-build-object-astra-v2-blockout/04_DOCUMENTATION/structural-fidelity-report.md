# Structural fidelity — Stage 01 / revision 1

**Outcome: PARTIAL reference fidelity; founder approval PENDING.** This is a real editable Blender blockout, not a finished material render and not a self-approved match.

## Observed result against the reference

| Aspect | Result | Remaining difference |
|---|---|---|
| Hero camera | PERSP, 34.160 mm, level with lens shift; plinth footprint framed close to reference | Focal length is an inferred solution, not recovered metadata; camera height and world scale are underdetermined |
| Red silhouette | Peak and left upper edge within ~5 px of marked reference anchors | Portal still reads flatter and more uniformly red than reference; physical interlock alone does not establish visual equivalence |
| Red structure | Broad 0.08 m blade, perpendicular 0.09 m cross-plane, unequal shorter inner blade, interlock lintel and raised threshold | Main blade obscures the cross-plane more than in reference; depth and internal void pattern remain simplified |
| Left fin | Broad isolated white fin in correct image position, top anchors within ~2 px | Rear footprint and actual height are interpretations; apparent lower height is partly perspective, not a verified real-world ratio |
| Glass hierarchy | Five separate framed shells, differing footprints and heights; high rear tier, central volume, low left wing, right wing and front gallery | Rear roof corner ~22.5 px from target; central-right roof corner ~18.9 px away; some pane boundaries remain displaced |
| Floor structure | Four major gallery elevations including ground; offset slab strips, two lower right landings | Interior is sparser than reference and has no detailed structural engineering or vertical circulation |
| Openings | Three true arched voids made from piers and curved spandrels; central arch visible through hero glazing | Layering and repeated arch depth do not fully reproduce reference |
| Plinth | Solid white slab with inset raised platform; three bottom corners within ~3–6 px | Top-edge thickness/profile differs from reference; platform occlusion is an interpretation |
| Diagnostic appearance | White / red / lightly tinted transparent materials only | Final AgX transform restores white-face readability; glass/white structure remains low contrast, and red is less crimson and layered than the reference. Not material approval |
| People | Zero human meshes or ellipsoids | Reference human scale figures intentionally omitted |

## Measured evidence, not success criteria

- Mesh objects: **157**, including one studio ground object.
- Mesh vertices: **1532**; triangulated mesh faces: **2436**.
- Material datablocks: **9** (includes Blender startup leftovers); seven diagnostic materials are assigned.
- Five shell collections; four perspective cameras; 10 floor/platform mesh objects; three arched opening assemblies.
- Selected 14-landmark RMS: **10.40 px** at 1672 × 941. Several landmarks were fitted directly. This is **not** a dense silhouette metric or independent validation of architectural fidelity.

## Iteration and inspection

Direct image inspection preceded bpy. Camera/empty landmark check preceded geometry. All four initial cameras and initial overlay were reviewed in the contact sheet. One structural revision corrected right-wing protruding slabs, narrowed/lowered the rear tier, deepened the central enclosure, adjusted the foreground gallery and portal threshold, and added cross-plane edge cues. Secondary lenses were widened to avoid initial plinth cropping. All final views are regenerated from that single revision scene; no mixed initial/final review images. A subsequent diagnostic-only render correction restored AgX after Standard clipped white geometry; it made no geometry or material changes.

V1 pavilion code and V1 blend were not used. Rear geometry is inferred from one reference image. The object remains an architectural study, not a navigable building, engineered structure, optimized game asset, or final presentation asset. Founder review must decide whether massing is sufficient to authorize another stage. No Stage 02 work is included.
