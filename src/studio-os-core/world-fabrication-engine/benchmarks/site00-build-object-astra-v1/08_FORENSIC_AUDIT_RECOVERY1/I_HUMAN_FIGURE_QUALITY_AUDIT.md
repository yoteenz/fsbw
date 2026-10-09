# I — Human figure quality audit

## Source evidence

`01_SOURCE/build_astra_v1.py` lines 119–126:

```python
# Minimal scale figures; deliberately anonymous architectural entourage.
def ellipsoid(name,loc,scale):
 bpy.ops.mesh.primitive_uv_sphere_add(...)
 ...
for x,y,s in [(-.85,-2,.78),(-2.5,-.45,.72),(3.65,.1,.74)]:
 ellipsoid('Human head',...)
 ellipsoid('Human torso',...)
 ellipsoid('Human leg',...)
 ellipsoid('Human arm',...)
```

Material: `Scale figures | graphite` — flat gray **Principled BSDF**, roughness 0.5.

## Classification

| Question | Finding |
|----------|---------|
| Asset type | **Procedural placeholder mannequins** (UV sphere ellipsoids) |
| Faces / hair / clothing | **Absent** |
| Photorealistic humans | **No** |
| Licensed character assets | **No** |
| 2D billboards | **No** |

## Gap vs reference

Reference figures read as **stylized but human** silhouettes inside glass. Astra V1 figures read as **diagrammatic gray blobs** — adequate for **scale only**, not founder expectation of “actual people.”

**HUMAN_ASSETS assessment:** **PLACEHOLDER ONLY — CONFIRMED** by source code comment and mesh construction.

**Do not** claim realistic human fabrication.
