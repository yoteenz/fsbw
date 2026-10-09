"""Read-back verification, separate from generator; not a creative approval."""
import bpy,json,struct,hashlib
from pathlib import Path
P=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(P/'01_SOURCE/SITE00_Build_Object_Astra_V2_Blockout.blend'))
s=bpy.context.scene
required=['SITE00_BUILD_OBJECT_V2_BLOCKOUT','MARBLE_PLINTH','PRIMARY_STRUCTURE','RED_PORTAL','GLASS_VOLUMES','FLOOR_PLATES','INTERIOR_OPENINGS','STRUCTURAL_SUPPORTS','CAMERAS','DIAGNOSTIC_MATERIALS']
checks={'required_collections':all(n in bpy.data.collections for n in required),'hero_perspective':bpy.data.objects['01_REFERENCE_CAMERA_BLOCKOUT'].data.type=='PERSP','four_perspective_cameras':len([o for o in s.objects if o.type=='CAMERA' and o.data.type=='PERSP'])==4,'five_distinct_glass_shells':len(bpy.data.collections['GLASS_VOLUMES'].children)==5,'three_arch_voids':all(n in bpy.data.objects for n in ['ARCH_CENTRAL','ARCH_IN_DEPTH','ARCH_LEFT']),'no_human_meshes':not any(o.type=='MESH' and any(k in o.name.lower() for k in ['human','person','ellipsoid']) for o in s.objects),'scene_approval_pending':s.get('approval')=='PENDING','one_revision':s.get('structural_revision')==1}
files={}
for n in ['01_REFERENCE_CAMERA_BLOCKOUT','02_LEFT_THREE_QUARTER','03_RIGHT_THREE_QUARTER','04_ELEVATED_INSPECTION','05_REFERENCE_OVERLAY']:
 f=P/'02_RENDERS'/f'{n}.png';b=f.read_bytes();size=struct.unpack('>II',b[16:24]);files[n]={'size':list(size),'sha256':hashlib.sha256(b).hexdigest()};checks[n+'_size']=size==(1672,941)
meshes=[o for o in s.objects if o.type=='MESH'];dg=bpy.context.evaluated_depsgraph_get();tri=0
for o in meshes:
 eo=o.evaluated_get(dg);me=eo.to_mesh();me.calc_loop_triangles();tri+=len(me.loop_triangles);eo.to_mesh_clear()
report={'checks':checks,'all_pass':all(checks.values()),'measured_mesh_objects':len(meshes),'evaluated_triangles':tri,'render_files':files,'scope':'File and scene validation only. Does not approve reference fidelity.'}
(P/'04_DOCUMENTATION/verification-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2),flush=True)
assert all(checks.values())

# Blender audio shutdown hangs in this cloud runtime; all files are already closed.
import os, sys
sys.stdout.flush();sys.stderr.flush();os._exit(0)
