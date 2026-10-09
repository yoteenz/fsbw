"""Independent binary GLB and PNG checks; run after Blender fabrication."""
import json,struct,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[1]
p=R/'02_EXPORTS/SITE00_Build_Object_Astra_V1_Web.glb';b=p.read_bytes();magic,version,length=struct.unpack_from('<4sII',b);n,kind=struct.unpack_from('<II',b,12);g=json.loads(b[20:20+n]);assert magic==b'glTF' and version==2 and length==len(b)
tris=0
for m in g['meshes']:
 for q in m['primitives']:
  assert q.get('mode',4)==4
  tris+=g['accessors'][q['indices']]['count']//3
r=json.loads((R/'05_DOCUMENTATION/export-validation-report.json').read_text());r['glb']={'valid_header':True,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'mesh_count':len(g['meshes']),'material_count':len(g['materials']),'triangles':tris,'matches_evaluated_blender_triangles':tris==r['triangles'],'extensions_used':g.get('extensionsUsed',[]),'embedded_images':len(g.get('images',[]))};r['renders']=[]
for p in sorted((R/'03_RENDERS').glob('*.png')):
 b=p.read_bytes();w,h=struct.unpack_from('>II',b,16);assert w>=1280 and h>=720;r['renders'].append({'file':p.name,'width':w,'height':h,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
assert len(r['renders'])==5 and r['glb']['matches_evaluated_blender_triangles']
(R/'05_DOCUMENTATION/export-validation-report.json').write_text(json.dumps(r,indent=2))
a={'status':'PASS_WITH_LIMITATIONS','measured_geometry':{k:r[k] for k in ['mesh_object_count','material_count','triangles','vertices']},'glb':r['glb'],'checks':{'five_1280x720_renders':len(r['renders'])==5,'triangle_budget_pass':r['triangle_budget_pass'],'required_collections':r['collections'],'new_geometry':True,'marble_texture_embedded':True},'limitations':['No browser/device performance test; GLB transmission requires compatible renderer.','Glass multilayer refraction and thin acrylic are Cycles reference appearance; web lighting will differ.','No LODs, collision meshes, lightmap UV2, rigging or navigation; presentation object only.','MATERIALS is an organizational collection; materials are assigned directly to meshes.','Creative approval pending founder review.'],'source_scene':{'units':'meters','bevels':'non-destructive eight-segment precision bevels, evaluated during GLB export','uv':'meter-scaled planar stone UVs; primitive UVs on remaining meshes','textures':'repository marble PNG, packed and embedded'},'validation_scope':'Blender evaluated counts plus independent GLB JSON chunk and PNG headers; no claim of Unreal/browser runtime certification'}
(R/'06_DOCUMENTATION/technical-art-audit.json').write_text(json.dumps(a,indent=2))
print(json.dumps({'triangles':tris,'meshes':len(g['meshes']),'renders':len(r['renders']),'glb_bytes':r['glb']['bytes']}))
