# Bounded iteration record

One Codex session. One structural revision.

1. Direct image inspection and SHA-256 confirmation before bpy.
2. Empty camera solve and prebuild landmark overlay inspected before geometry.
3. Initial scene built and all four camera views rendered; fifth 50% overlay composed. Hero showed right-wing protruding slab, overly wide rear tier, weak red cross-plane readability. Left inspection clipped the plinth at its lower edge. Initial evidence retained in `initial-pass/`.
4. Revision 1: lower right landings into their enclosure; shorten/lower rear upper shell; deepen central shell; narrow foreground gallery; lower right-wing roof; expose red cross-plane edges and raise portal threshold slightly. Inspection lenses widened to 38 mm. Ground gap closed. Diagnostic view transform changed to Standard for legible flat color; no marble/texturing work.
5. Regenerate all four camera renders and overlay from revision 1. No further structural revision permitted in this session.

Runtime note: first render invocation was interrupted after hero while investigating buffered output; remaining initial views were resumed from the saved identical scene. Blender's audio shutdown can hang after completion in this cloud runtime. Final entrypoint explicitly flushes and exits only after saved source, reports, renders and composition have completed.

## Diagnostic display correction (no structural change)

The revision-1 Standard-transform contact sheet clipped white surfaces severely in elevated/side views. Restored the original AgX diagnostic transform, saved the same revision-1 geometry, and re-rendered all four views plus overlay. This is a necessary review-visibility correction, not another structural revision or material polish pass. Final entrypoint uses the restored transform. Total Cycles renders: 12 (4 initial, 4 structural revision, 4 display correction).
