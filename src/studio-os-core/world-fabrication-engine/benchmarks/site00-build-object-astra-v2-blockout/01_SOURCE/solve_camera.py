"""Pre-geometry perspective landmark solve; no meshes created."""
import bpy, math, json
import numpy as np
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
P=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.resolution_x=1672;s.render.resolution_y=941;s.render.resolution_percentage=100
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='HERO_LANDMARK_SOLVE';cam.data.type='PERSP';cam.data.lens=48;cam.data.sensor_width=36;s.camera=cam
# Four perspective imaging parameters and rectangular footprint depth. Level lens.
def setup(v):
 a,d,z,sx,sy,dep,lens=v
 cam.data.lens=lens
 cam.location=(d*math.sin(a),-d*math.cos(a),z);cam.rotation_euler=(Vector((0,0,z))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.shift_x=sx;cam.data.shift_y=sy
 bpy.context.view_layer.update()
 return [(-7,-dep/2,0),(7,-dep/2,0),(7,dep/2,0)]
def project(pt):
 q=world_to_camera_view(s,cam,Vector(pt));return np.array([q.x*1672,(1-q.y)*941])
truth=np.array([[180,794],[889,822],[1490,797]])
def residual(v):
 pts=setup(v);r=(np.array([project(p) for p in pts])-truth).flatten()
 # Mild regularization fixes otherwise ambiguous single-image camera solution.
 h=941/2+v[4]*1672;cx=836-v[3]*1672;f=v[6]/36*1672
 vx=cx-f/math.tan(v[0]);vy=cx+f*math.tan(v[0])
 return np.r_[r,(190+(vx-818)*(-113/249)-h)*.5,(324+(vx-367)*(-56/111)-h)*.3,(183+(vy-820)*(112/390)-h)*.5]
v=np.array([.93,25.,1.,0.,.15,13.,35.]); damping=1.
for it in range(100):
 r=residual(v);J=np.column_stack([(residual(v+np.eye(7)[j]*.001)-r)/.001 for j in range(7)])
 step=np.linalg.solve(J.T@J+np.eye(7)*damping,-J.T@r);nv=v+step
 if np.linalg.norm(residual(nv))<np.linalg.norm(r):v=nv;damping=max(.001,damping*.7)
 else:damping*=3
pts=setup(v)
for name,pt in zip(['plinth_left','plinth_corner','plinth_right'],pts):
 bpy.ops.object.empty_add(location=pt);bpy.context.object.name=name
out={'type':'PERSP','focal_length_mm':cam.data.lens,'sensor_width_mm':36,'location':list(cam.location),'rotation_euler':list(cam.rotation_euler),'target':[0,0,float(v[2])],'shift_x':float(v[3]),'shift_y':float(v[4]),'plinth_width':14,'plinth_depth':float(v[5]),'base_landmarks':[{'world':p,'reference':t.tolist(),'projected':project(p).tolist()} for p,t in zip(pts,truth)],'notes':['Level perspective with vertical shift; focal length is not uniquely identifiable.','Lens and azimuth jointly fitted to receding roof edges and plinth corners.']}
(P/'04_DOCUMENTATION/camera-prebuild-solve.json').write_text(json.dumps(out,indent=2))
print(json.dumps(out,indent=2))

import os,sys
sys.stdout.flush();sys.stderr.flush();os._exit(0)
