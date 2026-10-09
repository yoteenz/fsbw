# Stage 01 rebuild

From the repository root:

```bash
XDG_CACHE_HOME="$PWD/src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-astra-v2-blockout/04_DOCUMENTATION/runtime-cache" \
/home/ubuntu/.tools/blender-5.2.2-linux-x64/blender -b -noaudio -t 12 \
  --python src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-astra-v2-blockout/01_SOURCE/build_astra_v2_blockout.py -- --revision 1
```

The entrypoint rebuilds geometry, saves the hero-selected Blender scene, writes measured camera/mesh reports, renders four perspective views, and invokes `compose_review.cjs` for the fifth 50% overlay, side-by-side, landmark overlay, and contact sheet. It requires Blender 5.2.2, Node, and the repository's `sharp` dependency. Camera/layout JSON and reference remain inside this package. No V1 dependency and no downloads.

`--no-render` rebuilds/saves the scene and metrics only. Default revision is 1. Do not rerun revision 0 over founder-review deliverables; original evidence is retained under `04_DOCUMENTATION/initial-pass/`.

`solve_camera.py` and `prepare_landmarks.py` are pre-geometry evidence helpers, not required for normal rebuild. Fixed configuration records the fitted camera and interpreted shell coordinates. `verify_blockout.py` independently reopens the saved blend and checks collections, perspective cameras, render dimensions, and evaluated mesh counts.

The explicit flush/exit at the end avoids a cloud-runtime PulseAudio shutdown hang after all output is complete. It does not terminate rendering early. All output paths are package-relative.
