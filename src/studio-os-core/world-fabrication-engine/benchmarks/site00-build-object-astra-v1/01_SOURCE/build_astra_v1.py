"""New SITE 00 geometry. Blender 5.2 headless; -- --revision renders hero/elevated only."""
import bpy, math, json, time, sys, shutil
from pathlib import Path
from mathutils import Vector
START=time.time()
ROOT=Path(__file__).resolve().parents[1]
REV='--revision' in sys.argv
for d in ['01_SOURCE','02_EXPORTS','03_RENDERS','04_COMPARISONS','05_MATERIALS','05_DOCUMENTATION','06_DOCUMENTATION','07_FOUNDER_REVIEW']:(ROOT/d).mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
collections={}
for name in ['SITE00_BUILD_OBJECT','ARCHITECTURE','GLASS_VOLUMES','RED_PORTAL','INTERIOR_STRUCTURE','FLOOR_PLATES','MARBLE_PLINTH','METAL_DETAILS','LIGHTING','CAMERAS','MATERIALS']:
 c=bpy.data.collections.new(name); collections[name]=c
 if name=='SITE00_BUILD_OBJECT':sc.collection.children.link(c)
 else:collections['SITE00_BUILD_OBJECT'].children.link(c)
def move(o,c):
 for col in list(o.users_collection):col.objects.unlink(o)
 collections[c].objects.link(o)
def mat(name,col,rough=.25,metal=0,trans=0,ior=1.45):
 m=bpy.data.materials.new(name);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;p.inputs['Transmission Weight'].default_value=trans;p.inputs['IOR'].default_value=ior
 return m
white=mat('Porcelain | neutral white',(0.82,.84,.85),.24)
glass=mat('Low iron architectural glass',(.975,.993,1),.045,trans=1,ior=1.46)
red=mat('Scarlet optical acrylic',(1,.045,.065),.025,trans=1,ior=1.46)
metal=mat('Brushed platinum',(.28,.32,.34),.23,.85)
redmetal=mat('Anodized crimson edge',(.5,.006,.012),.19,.65)
silhouette=mat('Scale figures | graphite',(.085,.095,.105),.5)
marble=mat('White veined marble',(.9,.9,.9),.24)
texpath=ROOT/'05_MATERIALS/white-marble-veins.png'
if not texpath.exists():shutil.copy('/workspace/public/assets/marble-half.png',texpath)
import numpy as np
sourcepath=ROOT/'05_MATERIALS/marble-source.png'
if not sourcepath.exists():shutil.copy(texpath,sourcepath)
im=bpy.data.images.load(str(sourcepath))
pixels=np.empty(len(im.pixels),dtype=np.float32);im.pixels.foreach_get(pixels)
pixels=pixels.reshape((-1,4));pixels[:,:3]=np.power(pixels[:,:3],2.4)
im.pixels.foreach_set(pixels.ravel());im.filepath_raw=str(texpath);im.file_format='PNG';im.save();im.pack()
n=marble.node_tree.nodes.new('ShaderNodeTexImage');n.image=im
marble.node_tree.links.new(n.outputs['Color'],marble.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
def box(name,loc,dim,material,col='INTERIOR_STRUCTURE',bevel=.012):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);move(o,col);o.data.materials.append(material)
 # Meter-scaled planar UVs keep veins continuous and unstretched on each stone face.
 if material==marble:
  uv=o.data.uv_layers.active
  for poly in o.data.polygons:
   axis=max(range(3),key=lambda a:abs(poly.normal[a]));a,b=[i for i in range(3) if i!=axis]
   for li in poly.loop_indices:
    v=o.data.vertices[o.data.loops[li].vertex_index].co+o.location
    uv.data[li].uv=(v[a]/2.0+.13,v[b]/2.0+.27)
 if bevel:
  mod=o.modifiers.new('Precision polished edge','BEVEL');mod.width=min(bevel,min(dim)*.3);mod.segments=8
  mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return o
def beam(name,a,b,r=.015,material=metal,col='METAL_DETAILS'):
 a,b=Vector(a),Vector(b);o=box(name,(a+b)/2,(r,r,(b-a).length),material,col,r*.22);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
base=.65
# Floating shadow reveal and low rectangular monolithic stone foundation.
box('Recessed underside', (0,0,.07),(12.65,7.75,.14),metal,'MARBLE_PLINTH')
box('Continuous marble foundation',(0,0,.37),(13,8.1,.60),marble,'MARBLE_PLINTH',.022)
box('Polished upper lip',(0,0,.685),(12.88,7.98,.045),white,'MARBLE_PLINTH')
# Staggered glazed pavilions: separate panes, open lower passages, clear roof caps.
def pavilion(name,cx,cy,w,d,h,heavy=False):
 z0=.74; top=z0+h; thick=.025
 for side,y in [('front',cy-d/2),('back',cy+d/2)]:
  for j in range(3):
   x=cx-w/2+w*(j+.5)/3
   box(f'{name} {side} pane {j}',(x,y,z0+h/2),(w/3-.016,thick,h),glass,'GLASS_VOLUMES',.005)
  for j in range(4):beam(f'{name} {side} mullion {j}',(cx-w/2+j*w/3,y,z0),(cx-w/2+j*w/3,y,top),.022 if heavy else .009)
 for side,x in [('left',cx-w/2),('right',cx+w/2)]:
  box(f'{name} {side} glass',(x,cy,z0+h/2),(thick,d-.03,h),glass,'GLASS_VOLUMES',.005)
 for z in [z0,top]:
  for y in [cy-d/2,cy+d/2]:beam(name+' perimeter',(cx-w/2,y,z),(cx+w/2,y,z),.045 if heavy and z==top else .015)
  for x in [cx-w/2,cx+w/2]:beam(name+' return',(x,cy-d/2,z),(x,cy+d/2,z),.026 if heavy else .012)
 box(name+' roof',(cx,cy,top),(w,d,.022),glass,'GLASS_VOLUMES',.005)
pavilion('West low gallery',-4.55,-.5,2.4,5.2,3.65)
pavilion('Central atrium',-.8,.65,5.25,5.4,6.15,True)
pavilion('East stepped gallery',4.4,.2,2.65,5.5,3.65)
pavilion('Rear lantern',1.75,2,3.8,2.85,7.2)
pavilion('Entry vestibule',-.75,-2.55,2.5,1.35,3.15)
# Thin stone fins rather than solid masses.
for i,(x,y,h,d) in enumerate([(-4.12,-.65,5.6,2.2),(-2.8,1.6,4.8,2.2),(-.75,2,5.55,2.55),(3.55,1.25,4.1,1.7)]):
 box('Veined vertical fin %02d'%i,(x,y,base+h/2),(.16,d,h),marble,'ARCHITECTURE',.012)
# Broken/interleaved interior plates preserve sight lines through the atrium.
for level,z in enumerate([2.55,4.35,6.15]):
 for j,(x,y,w,d) in enumerate([(-2.05,1.4,3.0,2.8),(1.7,2.15,3.1,1.3),(3.8,.7,2.4,2.6)]):
  if level==2 and j==2:continue
  box(f'Mezzanine {level} wing {j}',(x,y,z),(w,d,.085),white,'FLOOR_PLATES')
  box(f'Glass balustrade {level} wing {j}',(x,y-d/2,z+.39),(w,.018,.72),glass,'GLASS_VOLUMES',.003)
  beam('Balustrade cap',(x-w/2,y-d/2,z+.76),(x+w/2,y-d/2,z+.76),.015)
for x in [-3.0,-1.6,.0,3.25,4.85]:
 for y in [.8,2.65]:
  box('Slender interior column',(x,y,3.05),(.055,.055,4.65),white)
for x,y,w,h in [(-2.1,.8,1.3,2.2),(.35,1.6,1.65,3.7),(4.1,1.3,1.2,2.6)]:
 box('Floating interior partition',(x,y,base+h/2),(w,.06,h),white)
# Repeated suspended stair treads, two offset flights.
for flight in range(2):
 for i in range(13):
  box('Cantilever stair %d %02d'%(flight,i),(-2.2+flight*1.4,.1+i*.18,.86+flight*1.8+i*.138),(1.08,.23,.055),white,'FLOOR_PLATES',.008)
# Vivid tall portal: two lateral blades, back glazing and split entry leaves.
px,py,pw,pd,ph=1.8,-1.75,2.35,2.45,7.9
for x in [px-pw/2,px+pw/2]:box('Portal thick acrylic blade',(x,py,base+ph/2),(.065,pd,ph),red,'RED_PORTAL',.012)
box('Portal rear light plane',(px,py+pd/2,base+ph/2),(pw,.05,ph),red,'RED_PORTAL',.01)
# Clear central slot reads as a threshold, with luminous red upper transom.
box('Portal upper transom',(px,py-pd/2,base+5.15),(pw,.05,5.5),red,'RED_PORTAL',.009)
for x in [px-pw*.37,px+pw*.37]:box('Portal entry sidelight',(x,py-pd/2,base+1.2),(.60,.05,2.4),red,'RED_PORTAL',.009)
for x in [px-pw/2,px+pw/2]:
 for y in [py-pd/2,py+pd/2]:beam('Portal scarlet perimeter',(x,y,base),(x,y,base+ph),.029,redmetal,'RED_PORTAL')
for z in [base+.13,base+2.4,base+4.3,base+6.1,base+ph]:
 beam('Portal front seam',(px-pw/2,py-pd/2,z),(px+pw/2,py-pd/2,z),.014,redmetal,'RED_PORTAL')
 for x in [px-pw/2,px+pw/2]:beam('Portal return seam',(x,py-pd/2,z),(x,py+pd/2,z),.015,redmetal,'RED_PORTAL')
box('Portal raised sill',(px,py,base+.075),(pw+.22,pd+.12,.07),glass,'RED_PORTAL')
for x in [px-.24,px+.24]:beam('Portal vertical pull',(x,py-pd/2-.08,1.15),(x,py-pd/2-.08,2.65),.028,metal)
# Fine pane attachment buttons give the glazing an engineered scale.
for x in [-5.73,-3.37,-3.42,1.82,3.08,5.72]:
 for z in [1.0,2.4,3.9]:
  for y in [-3.1,2.1]:
   bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.024,location=(x,y,z));o=bpy.context.object;o.name='Glass standoff';o.data.materials.append(metal);move(o,'METAL_DETAILS')
# Minimal scale figures; deliberately anonymous architectural entourage.
def ellipsoid(name,loc,scale):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(silhouette);move(o,'INTERIOR_STRUCTURE')
 for p in o.data.polygons:p.use_smooth=True
for x,y,s in [(-.85,-2,.78),(-2.5,-.45,.72),(3.65,.1,.74)]:
 z=.75;ellipsoid('Human head',(x,y,z+s*1.5),(.105*s,.095*s,.135*s));ellipsoid('Human torso',(x,y,z+s*1.1),(.17*s,.10*s,.29*s))
 for side in [-1,1]:
  ellipsoid('Human leg',(x+side*.075*s,y,z+s*.43),(.061*s,.066*s,.44*s));ellipsoid('Human arm',(x+side*.19*s,y,z+s*.99),(.045*s,.052*s,.27*s))
# Non-export studio stage.
floor=box('Studio cyclorama',(0,0,-.055),(200,200,.05),mat('Studio neutral white',(.88,.88,.88),.32),'LIGHTING',0)
sc.world=bpy.data.worlds.new('White studio environment');sc.world.use_nodes=True;sc.world.node_tree.nodes['Background'].inputs[0].default_value=(.92,.95,1,1);sc.world.node_tree.nodes['Background'].inputs[1].default_value=.7
for name,loc,power,size in [('Key softbox',(-5,-7,14),2300,8),('Rim softbox',(3,6,12),3000,7),('Front fill',(8,-6,8),1800,6)]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);collections['LIGHTING'].objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,3))-o.location).to_track_quat('-Z','Y').to_euler()
cams=[('01_HERO_REFERENCE_MATCH',(13,-21,7.4),(0,0,3.9),19.8),('02_FRONT_THREE_QUARTER',(-12,-23,10),(0,0,3.8),20),('03_SIDE_INSPECTION',(23,-6,9),(0,0,3.8),19.5),('04_ELEVATED_INSPECTION',(13,-18,19),(0,0,3.6),25),('05_ARCHITECTURAL_DETAIL',(9,-14,8),(1,-1.1,4),11)]
for name,pos,target,scale in cams:
 data=bpy.data.cameras.new(name);data.type='ORTHO';data.ortho_scale=scale;o=bpy.data.objects.new(name,data);collections['CAMERAS'].objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();data.lens=50
sc.render.engine='CYCLES';sc.cycles.samples=32;sc.cycles.use_denoising=True;sc.cycles.max_bounces=16;sc.cycles.transmission_bounces=12;sc.cycles.transparent_max_bounces=16
sc.render.resolution_x=1280;sc.render.resolution_y=720;sc.render.resolution_percentage=100;sc.render.image_settings.file_format='PNG';sc.render.threads_mode='FIXED';sc.render.threads=4
sc.view_settings.exposure=0.85;sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast';sc.camera=bpy.data.objects[cams[0][0]]
# Export only architecture; evaluated bevels and UV-mapped packed marble travel to GLB.
bpy.ops.object.select_all(action='DESELECT')
assets=[o for o in sc.objects if o.type=='MESH' and o!=floor]
for o in assets:o.select_set(True)
bpy.context.view_layer.objects.active=assets[0]
bpy.ops.export_scene.gltf(filepath=str(ROOT/'02_EXPORTS/SITE00_Build_Object_Astra_V1_Web.glb'),export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT')
def dump(rel,data):(ROOT/rel).write_text(json.dumps(data,indent=2))
deps=bpy.context.evaluated_depsgraph_get();tris=verts=0;per=[]
for o in assets:
 ev=o.evaluated_get(deps);me=ev.to_mesh();me.calc_loop_triangles();t=len(me.loop_triangles);v=len(me.vertices);tris+=t;verts+=v;per.append({'name':o.name,'triangles':t,'vertices':v});ev.to_mesh_clear()
used={m for o in assets for m in o.data.materials}
dump('05_DOCUMENTATION/export-validation-report.json',{'blender_version':bpy.app.version_string,'source':'evaluated Blender meshes, render stage excluded','mesh_object_count':len(assets),'material_count':len(used),'triangles':tris,'vertices':verts,'triangle_target':[50000,250000],'triangle_budget_pass':50000<=tris<=250000,'collections':list(collections),'objects':per})
dump('05_DOCUMENTATION/camera-manifest.json',{'resolution':[1280,720],'cameras':[{'name':n,'location':p,'target':t,'projection':'ORTHOGRAPHIC','ortho_scale':s,'render':'03_RENDERS/'+n+'.png'} for n,p,t,s in cams]})
dump('05_MATERIALS/material-manifest.json',{'materials':[{'name':m.name,'base_color':list(m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value),'roughness':m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value,'transmission':m.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value,'ior':m.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value} for m in sorted(used,key=lambda m:m.name)],'marble_texture':{'file':'white-marble-veins.png','source':'repository public/assets/marble-half.png','packed_in_blend':True,'embedded_in_glb':True}})
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'01_SOURCE/SITE00_Build_Object_Astra_V1.blend'))
render_times={}
for name,_,_,_ in ([cams[0],cams[3]] if REV else cams):
 t=time.time();sc.camera=bpy.data.objects[name];sc.render.filepath=str(ROOT/'03_RENDERS'/f'{name}.png');bpy.ops.render.render(write_still=True);render_times[name]=round(time.time()-t,2)
dump('05_DOCUMENTATION/wfe-astra-fabrication-report.json',{'status':'FABRICATED_AWAITING_FOUNDER_REVIEW','new_geometry':True,'v2_blend_opened':False,'build_passes':1,'revision':REV,'revision_note':'One targeted material/lighting and hero/elevated camera revision; front/side/detail retained from initial pass as requested','wall_time_seconds':round(time.time()-START,2),'render_wall_seconds':render_times,'tokens':None,'cost_usd':None,'budget_usd':10,'cost_note':'Session billing unavailable; no additional agents, paid generation APIs or Codex sessions invoked. Local Blender CPU only.','engine':'Cycles CPU','samples':32})
print('FABRICATION_RENDER_COMPLETE',tris,flush=True)
