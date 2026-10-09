"""WFE bounded Blender benchmark — validates present assets; writes return package (does not modify source blend)."""
import bpy
import bmesh
import struct
import json
import hashlib
import math
import os
import sys
import shutil
from datetime import datetime, timezone

ROOT = os.environ.get("WFE_PACKAGE_ROOT")
OUT = os.environ.get("WFE_RETURN_ROOT")
if not ROOT or not OUT:
    print("WFE_PACKAGE_ROOT and WFE_RETURN_ROOT required", file=sys.stderr)
    sys.exit(2)

SRC = os.path.join(ROOT, "01_SOURCE")
EXP = os.path.join(ROOT, "02_EXPORTS")
DOC = os.path.join(ROOT, "05_DOCUMENTATION")
os.makedirs(OUT, exist_ok=True)
for sub in ("01_SOURCE", "02_EXPORTS", "05_DOCUMENTATION", "logs"):
    os.makedirs(os.path.join(OUT, sub), exist_ok=True)

manifest = json.load(open(os.path.join(DOC, "module-manifest.json")))
expected = {m["name"] for m in manifest["modules"]}
log = {
    "runner": "wfe_blender_benchmark_runner",
    "startedAt": datetime.now(timezone.utc).isoformat(),
    "blenderVersion": bpy.app.version_string,
    "packageRoot": ROOT,
    "returnRoot": OUT,
    "formats": {},
    "checks": {},
    "missingExports": [],
    "limitations": [],
}


def geometry():
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    issues = []
    pts = []
    triangles = 0
    signatures = {}
    duplicates = []
    for o in meshes:
        if o.name not in expected:
            continue
        ev = o.evaluated_get(bpy.context.evaluated_depsgraph_get())
        mesh = ev.to_mesh()
        mesh.calc_loop_triangles()
        triangles += len(mesh.loop_triangles)
        bm = bmesh.new()
        bm.from_mesh(mesh)
        bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-6)
        badedges = sum(not e.is_manifold for e in bm.edges)
        degenerate = sum(f.calc_area() < 1e-11 for f in bm.faces)
        vol = bm.calc_volume(signed=True)
        if badedges or degenerate or vol <= 0:
            issues.append(
                {
                    "object": o.name,
                    "nonManifoldEdges": badedges,
                    "degenerateFaces": degenerate,
                    "signedVolume": vol,
                }
            )
        bm.free()
        ev.to_mesh_clear()
        coordinates = [o.matrix_world @ v.co for v in o.data.vertices]
        pts.extend(coordinates)
        sig = hashlib.sha256(
            str(sorted(tuple(round(v, 6) for v in p) for p in coordinates)).encode()
        ).hexdigest()
        if sig in signatures:
            duplicates.append([signatures[sig], o.name])
        signatures[sig] = o.name
    names = {o.name for o in meshes if o.name in expected}
    bounds = (
        [list(min(p[i] for p in pts) for i in range(3)), list(max(p[i] for p in pts) for i in range(3))]
        if pts
        else [[0, 0, 0], [0, 0, 0]]
    )
    return {
        "meshObjectCount": len(names),
        "expectedMeshObjectCount": len(expected),
        "triangles": triangles,
        "bounds": bounds,
        "geometryIssues": issues,
        "exactDuplicateMeshes": duplicates,
        "missingNames": sorted(expected - names),
        "allExpectedNamesPresent": names == expected,
    }


blend = os.path.join(SRC, "SITE00_Build_Object_V2.blend")
bpy.ops.wm.open_mainfile(filepath=blend)
log["master"] = geometry()
log["checks"]["masterOpens"] = True
log["checks"]["masterMaterialsPresent"] = all(
    bpy.data.materials.get(n)
    for n in [
        "CLEAR_ARCHITECTURAL_GLASS",
        "RED_TRANSLUCENT_ACRYLIC",
        "WHITE_MARBLE",
        "LIGHT_STONE",
        "DARK_STONE",
        "REFLECTIVE_METAL",
    ]
)
log["checks"]["requiredCamerasPresent"] = all(
    bpy.data.objects.get(n)
    for n in [
        "CAM_REFERENCE_MATCH",
        "CAM_HERO",
        "CAM_FRONT",
        "CAM_REAR",
        "CAM_LEFT",
        "CAM_RIGHT",
        "CAM_ELEVATED",
    ]
)

# Test re-export (execution proof) — new file only
test_export = os.path.join(OUT, "02_EXPORTS", "SITE00_Build_Object_V2_ExecutionTest_Web.glb")
bpy.ops.object.select_all(action="DESELECT")
for o in bpy.context.scene.objects:
    if o.type == "MESH" and o.name in expected:
        o.select_set(True)
bpy.ops.export_scene.gltf(filepath=test_export, export_format="GLB", use_selection=True)
log["executionTestExport"] = {
    "path": test_export,
    "bytes": os.path.getsize(test_export),
    "sha256": hashlib.sha256(open(test_export, "rb").read()).hexdigest(),
}

web_path = os.path.join(EXP, "SITE00_Build_Object_V2_Web.glb")
if os.path.isfile(web_path):
    data = open(web_path, "rb").read()
    magic, version, size = struct.unpack_from("<4sII", data)
    assert magic == b"glTF" and version == 2
    jlen, jkind = struct.unpack_from("<II", data, 12)
    g = json.loads(data[20 : 20 + jlen])
    log["formats"]["SITE00_Build_Object_V2_Web.glb"] = {
        "fileBytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "nodeCount": len(g.get("nodes", [])),
        "meshCount": len(g.get("meshes", [])),
    }
else:
    log["missingExports"].append("SITE00_Build_Object_V2_Web.glb")

for optional in ["SITE00_Build_Object_V2_High.glb", "SITE00_Build_Object_V2_DCC.fbx"]:
    if not os.path.isfile(os.path.join(EXP, optional)):
        log["missingExports"].append(optional)

failures = []
if log["master"]["geometryIssues"] or log["master"]["missingNames"]:
    failures.append("master")
log["failedGeometryTargets"] = failures
log["status"] = "PASS" if not failures and log["checks"]["masterOpens"] else "FAIL"
log["finishedAt"] = datetime.now(timezone.utc).isoformat()

report_path = os.path.join(OUT, "05_DOCUMENTATION", "wfe-blender-execution-report.json")
with open(report_path, "w") as f:
    json.dump(log, f, indent=2)

shutil.copy2(os.path.join(DOC, "module-manifest.json"), os.path.join(OUT, "05_DOCUMENTATION", "module-manifest.json"))
shutil.copy2(os.path.join(DOC, "material-manifest.json"), os.path.join(OUT, "05_DOCUMENTATION", "material-manifest.json"))

print(json.dumps({"status": log["status"], "report": report_path, "testExport": log["executionTestExport"]}, indent=2))
sys.exit(0 if log["status"] == "PASS" else 1)
