"""Stage 01 standalone rebuild. Blender -b --python this_file.py -- [--revision 0|1] [--no-render]
Reads only V2 camera/layout JSON. Never opens V1. Composites: node 01_SOURCE/compose_review.cjs.
"""
import bpy, math, json, sys, argparse, time
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
P=Path(__file__).resolve().parents[1]
args=argparse.ArgumentParser();args.add_argument('--revision',type=int,default=0,choices=[0,1]);args.add_argument('--no-render',action='store_true');opt=args.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
C=json.loads((P/'04_DOCUMENTATION/camera-prebuild-solve.json').read_text());G=json.loads((P/'04_DOCUMENTATION/geometry-layout.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for col in list(bpy.data.collections):bpy.data.collections.remove(col)
root=bpy.data.collections.new('SITE00_BUILD_OBJECT_V2_BLOCKOUT');bpy.context.scene.collection.children.link(root)
cols={}
for n in ['MARBLE_PLINTH','PRIMARY_STRUCTURE','RED_PORTAL','GLASS_VOLUMES','FLOOR_PLATES','INTERIOR_OPENINGS','STRUCTURAL_SUPPORTS','CAMERAS','DIAGNOSTIC_MATERIALS']:
 cols[n]=bpy.data.collections.new(n);root.children.link(cols[n])
def move(obj,col):
 for c in list(obj.users_collection):c.objects.unlink(obj)
 cols[col].objects.link(obj);return obj
def mat(name,color,trans=0,rough=.5,clear=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;n=m.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Transmission Weight'].default_value=trans;p.inputs['IOR'].default_value=1.35
 if clear:
  t=n.new('ShaderNodeBsdfTransparent');mix=n.new('ShaderNodeMixShader');mix.inputs[0].default_value=clear;m.node_tree.links.new(p.outputs[0],mix.inputs[1]);m.node_tree.links.new(t.outputs[0],mix.inputs[2]);m.node_tree.links.new(mix.outputs[0],n.get('Material Output').inputs['Surface'])
 return m
white=mat('DIAG_White_Stone',(.79,.79,.77));frame=mat('DIAG_Frame_White',(.88,.9,.9),rough=.28);dark=mat('DIAG_Graphite_Edge',(.15,.18,.19),rough=.4);glass=mat('DIAG_Clear_Glass_Tint',(.76,.87,.89),trans=1,rough=.06,clear=.86);red=mat('DIAG_Crimson_Transmission',(.72,.004,.015),trans=.65,rough=.18,clear=.16);edgeRed=mat('DIAG_Crimson_Edges',(.52,.003,.01),rough=.25);ground=mat('DIAG_Studio_White',(.91,.91,.91))
def box(name,lo,hi,col,ma):
 bpy.ops.mesh.primitive_cube_add(size=1,location=tuple((a+b)/2 for a,b in zip(lo,hi)));o=bpy.context.object;o.name=name;o.dimensions=tuple(b-a for a,b in zip(lo,hi));bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma);move(o,col);return o
def rod(name,a,b,t,col,ma):
 a,b=Vector(a),Vector(b);bpy.ops.mesh.primitive_cube_add(size=1,location=(a+b)/2);o=bpy.context.object;o.name=name;o.dimensions=(t,t,(b-a).length);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma);move(o,col);return o
def shell(name,x0,x1,y0,y1,z0,z1):
 sub=bpy.data.collections.new('SHELL_'+name);cols['GLASS_VOLUMES'].children.link(sub)
 def assign(o):
  cols['GLASS_VOLUMES'].objects.unlink(o);sub.objects.link(o)
 t=.012
 for suffix,lo,hi in [('S',(x0,y0,z0),(x1,y0+t,z1)),('N',(x0,y1-t,z0),(x1,y1,z1)),('W',(x0,y0,z0),(x0+t,y1,z1)),('E',(x1-t,y0,z0),(x1,y1,z1)),('ROOF',(x0,y0,z1-t),(x1,y1,z1))]:assign(box(name+'_PANE_'+suffix,lo,hi,'GLASS_VOLUMES',glass))
 pts=[(x,y,z) for z in [z0,z1] for y in [y0,y1] for x in [x0,x1]]
 for k,(i,j) in enumerate([(0,1),(1,3),(3,2),(2,0),(4,5),(5,7),(7,6),(6,4),(0,4),(1,5),(2,6),(3,7)]):assign(rod(name+'_EDGE_'+str(k),pts[i],pts[j],.025,'GLASS_VOLUMES',dark if name=='CENTRAL' and k in [4,5,8,9,11] else frame))
 for x in [x0+(x1-x0)/3,x0+2*(x1-x0)/3]:assign(rod(name+'_MULLION',(x,y0,z0),(x,y0,z1),.016,'GLASS_VOLUMES',frame))
 for z in [2.35,3.85]:
  if z<z1-.25:
   for y in [y0,y1]:assign(rod(name+'_TRANSOM',(x0,y,z),(x1,y,z),.018,'GLASS_VOLUMES',frame))
# Plinth is intentionally untextured. Raised inset platform accounts for layered reference lip.
d=G['plinth_depth'];box('PLINTH_SOLID',(-7,-d/2,0),(7,d/2,.61),'MARBLE_PLINTH',white)
box('INSET_PLATFORM',(-5.6,-3.45,.61),(6.65,3.55,.75),'FLOOR_PLATES',frame)
a,b=G['fin_a'],G['fin_b'];finh=(a[2]+b[2])/2
box('LEFT_ISOLATED_FIN',(a[0],-3.47,.61),(b[0],-3.33,finh),'PRIMARY_STRUCTURE',white)
# Offset inner partition and hanging stone mezzanine block.
box('INNER_VERTICAL_PARTITION',(-2.4,.4,.75),(-2.22,2.2,4.65),'PRIMARY_STRUCTURE',white)
box('UPPER_PARTIAL_CORE',(.8,.5,3.7),(2.05,1.9,5.0),'PRIMARY_STRUCTURE',white)
for row in G['shells']:
 row=list(row)
 if row[0]=='LEFT_LOW':row[-1]=4.7
 if row[0]=='FRONT_GALLERY':row[1]=2.2;row[2]=4.1
 shell(*row)
# Portal: one broad blade, one intersecting perpendicular return, a shorter offset blade,
# and connecting lintels. Unequal dimensions; open circulation below the lintels.
a,b=G['red_a'],G['red_b'];rx0,rx1=a[0],b[0];rz=(a[2]+b[2])/2;rz0=.94
box('PORTAL_MAIN_BLADE',(rx0,-1.34,rz0),(rx1,-1.26,rz),'RED_PORTAL',red)
crossx=rx0+(rx1-rx0)*.45
box('PORTAL_CROSS_PLANE',(crossx-.045,-1.31,rz0),(crossx+.045,1.05,rz-.06),'RED_PORTAL',red)
box('PORTAL_OFFSET_INNER_BLADE',(rx0+.34,-.75,1.02),(rx1-.28,-.68,4.05),'RED_PORTAL',red)
box('PORTAL_INTERLOCK_LINTEL',(rx0+.34,-1.31,3.68),(crossx+.06,.7,3.8),'RED_PORTAL',red)
box('PORTAL_THRESHOLD',(rx0-.06,-1.45,.75),(rx1+.07,-.59,.94),'RED_PORTAL',red)
for x in [rx0,rx1]:rod('RED_BLADE_BOUNDARY',(x,-1.35,rz0),(x,-1.35,rz),.028,'RED_PORTAL',edgeRed)
rod('RED_BLADE_CROWN',(rx0,-1.35,rz),(rx1,-1.35,rz),.027,'RED_PORTAL',edgeRed)
rod('RED_INTERLOCK_CROWN',(crossx,-1.3,rz-.06),(crossx,1.05,rz-.06),.025,'RED_PORTAL',edgeRed)
for z in [2.1,3.6,4.7]:rod('RED_DEPTH_SEAM',(rx0,-1.36,z),(rx1,-1.36,z),.012,'RED_PORTAL',edgeRed)
# Four occupied levels incl. ground; open galleries preserve sight lines.
for i,z in enumerate([.83,2.35,3.85,5.22]):
 box('LEVEL_%d_REAR_GALLERY'%i,(-1.5,1.25,z),(4.0,2.88,z+.085),'FLOOR_PLATES',white)
 if i<3:box('LEVEL_%d_SIDE_GALLERY'%i,(-1.5,-1.45,z),(-.55,1.25,z+.085),'FLOOR_PLATES',white)
 if i in [1,2]:box('LEVEL_%d_RIGHT_LANDING'%i,(4.05,1.55,z),(6.48,3.5,z+.075),'FLOOR_PLATES',white)
# Arch constructed as a continuous extruded spandrel above a semicircular void.
def arch(name,cx,y,z,width=1.35,height=2.35,wallwidth=2.2):
 radius=width/2;spring=height-radius;top=height+.22;verts=[];faces=[]
 # mesh quads between curved soffit and straight head; side piers meet spandrel.
 for i in range(25):
  th=math.pi-i*math.pi/24;x=cx+radius*math.cos(th);bot=z+spring+radius*math.sin(th)
  verts.extend([(x,y,bot),(x,y,z+top),(x,y+.16,bot),(x,y+.16,z+top)])
 for i in range(24):
  j=i*4;k=j+4;faces.extend([(j,k,k+1,j+1),(j+2,j+3,k+3,k+2),(j,j+2,k+2,k),(j+1,k+1,k+3,j+3)])
 faces.extend([(0,1,3,2),(96,98,99,97)])
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);cols['INTERIOR_OPENINGS'].objects.link(o);o.data.materials.append(white)
 box(name+'_LEFT_PIER',(cx-wallwidth/2,y,z),(cx-radius,y+.16,z+top),'INTERIOR_OPENINGS',white)
 box(name+'_RIGHT_PIER',(cx+radius,y,z),(cx+wallwidth/2,y+.16,z+top),'INTERIOR_OPENINGS',white)
arch('ARCH_CENTRAL',1.5,-1.1,.84,width=1.18,height=1.98,wallwidth=1.78)
arch('ARCH_IN_DEPTH',.0,.8,.84,width=1.15,height=2.0,wallwidth=1.7)
arch('ARCH_LEFT',-2.9,-.45,.75,width=.92,height=1.85,wallwidth=1.5)
for x,y,h in [(-1.45,-1.4,5.2),(-1.45,2.8,5.2),(3.6,2.8,5.2),(4.2,3.35,3.75),(6.4,3.35,3.2)]:box('GALLERY_SUPPORT',(x-.055,y-.055,.75),(x+.055,y+.055,h),'STRUCTURAL_SUPPORTS',frame)
# No people meshes. All geometry is purpose-built in this script.
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=24;s.cycles.use_denoising=True;s.cycles.max_bounces=10;s.cycles.transmission_bounces=8;s.cycles.transparent_max_bounces=24;s.render.resolution_x=1672;s.render.resolution_y=941;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.film_transparent=False
s.world.color=(.8,.8,.8);s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.88,.88,.88,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.8
s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast'
box('STUDIO_GROUND',(-200,-200,-.08),(200,200,-.04),'DIAGNOSTIC_MATERIALS',ground)
for name,loc,power,size in [('KEY',(-3,-8,14),2100,10),('FILL',(8,-2,11),1300,8),('REAR',(0,7,12),1800,8)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,2))-o.location).to_track_quat('-Z','Y').to_euler();move(o,'DIAGNOSTIC_MATERIALS')
def camera(name,loc,target,lens=45):
 bpy.ops.object.camera_add(location=loc);o=bpy.context.object;o.name=name;o.data.type='PERSP';o.data.lens=lens;o.data.clip_end=500;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();move(o,'CAMERAS');return o
hero=camera('01_REFERENCE_CAMERA_BLOCKOUT',C['location'],C['target'],C['focal_length_mm']);hero.rotation_euler=C['rotation_euler'];hero.data.shift_x=C['shift_x'];hero.data.shift_y=C['shift_y']
cameras=[hero,camera('02_LEFT_THREE_QUARTER',(-16,-17,9),(0,0,2.5),45),camera('03_RIGHT_THREE_QUARTER',(18,14,8),(0,0,2.5),45),camera('04_ELEVATED_INSPECTION',(15,-17,18),(0,0,2.1),43)]
s.camera=hero;bpy.context.view_layer.update()
# Measured final world landmarks, NOT just free-fit prebuild anchors.
marks=[('red_peak',[rx1,-1.35,rz],[1067,77]),('red_left',[rx0,-1.35,rz],[818,190]),('fin_peak',[G['fin_b'][0],-3.4,finh],[478,268]),('fin_left',[G['fin_a'][0],-3.4,finh],[367,324]),('central_left',[G['main_a'][0],-1.6,G['shells'][0][-1]],[520,319]),('central_peak',[G['main_b'][0],-1.6,G['shells'][0][-1]],[820,183]),('right_wing',[6.6,3.75,3.35],[1456,476])]
res=[]
for name,pt,ref in marks:
 q=world_to_camera_view(s,hero,Vector(pt));uv=[q.x*1672,(1-q.y)*941];res.append({'name':name,'world':pt,'reference_px':ref,'projected_px':uv,'error_px':math.dist(uv,ref)})
meshes=[o for o in s.objects if o.type=='MESH'];tri=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes)
report={'stage':'01_BLOCKOUT','revision':opt.revision,'projection':'PERSP','focal_length_mm':hero.data.lens,'sensor_width_mm':hero.data.sensor_width,'location':list(hero.location),'target':C['target'],'shift_x':hero.data.shift_x,'shift_y':hero.data.shift_y,'resolution':[1672,941],'landmarks':res,'landmark_rms_px':math.sqrt(sum(r['error_px']**2 for r in res)/len(res)),'status':'PARTIAL_CAMERA_FIT_NOT_APPROVED','residual_notes':['Lens solved from receding roof axes, not assumed from metadata.','Near-level lens shift retains vertical architectural edges.','Plinth/portal/fin anchors prioritized. Rear shell and secondary tiers interpreted from a single image.','Camera-plan framing 88–92% was replaced by observed ~78% plinth image width.']}
(P/'04_DOCUMENTATION/camera-match-report.json').write_text(json.dumps(report,indent=2))
(P/'04_DOCUMENTATION/mesh-measurements.json').write_text(json.dumps({'revision':opt.revision,'mesh_objects':len(meshes),'triangles':tri,'vertices':sum(len(o.data.vertices) for o in meshes),'materials':len(bpy.data.materials),'glass_shells':5,'human_meshes':0,'by_collection':{n:len([o for o in col.all_objects if o.type=='MESH']) for n,col in cols.items()}},indent=2))
s['stage']='01_BLOCKOUT';s['approval']='PENDING';s['structural_revision']=opt.revision
bpy.ops.wm.save_as_mainfile(filepath=str(P/'01_SOURCE/SITE00_Build_Object_Astra_V2_Blockout.blend'))
if not opt.no_render:
 for cam in cameras:
  s.camera=cam;s.render.filepath=str(P/'02_RENDERS'/f'{cam.name}.png');bpy.ops.render.render(write_still=True)
 s.camera=hero
print('BLOCKOUT_BUILD_FINISHED',len(meshes),tri,flush=True)
