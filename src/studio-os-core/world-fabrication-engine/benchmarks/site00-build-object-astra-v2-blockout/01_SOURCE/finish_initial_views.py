import bpy
from pathlib import Path
P=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(P/'01_SOURCE/SITE00_Build_Object_Astra_V2_Blockout.blend'))
s=bpy.context.scene
for n in ['02_LEFT_THREE_QUARTER','03_RIGHT_THREE_QUARTER','04_ELEVATED_INSPECTION']:
 print('RENDERING',n,flush=True);s.camera=bpy.data.objects[n];s.render.filepath=str(P/'02_RENDERS'/f'{n}.png');bpy.ops.render.render(write_still=True)
print('INITIAL_VIEWS_DONE',flush=True)
