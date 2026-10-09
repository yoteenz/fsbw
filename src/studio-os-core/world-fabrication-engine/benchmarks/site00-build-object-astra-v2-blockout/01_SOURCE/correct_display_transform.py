import bpy, subprocess, os, sys
from pathlib import Path
P=Path(__file__).resolve().parents[1]
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.open_mainfile(filepath=str(P/'01_SOURCE/SITE00_Build_Object_Astra_V2_Blockout.blend'))
s=bpy.context.scene;s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast'
s.camera=bpy.data.objects['01_REFERENCE_CAMERA_BLOCKOUT']
bpy.ops.wm.save_as_mainfile(filepath=str(P/'01_SOURCE/SITE00_Build_Object_Astra_V2_Blockout.blend'))
for n in ['01_REFERENCE_CAMERA_BLOCKOUT','02_LEFT_THREE_QUARTER','03_RIGHT_THREE_QUARTER','04_ELEVATED_INSPECTION']:
 s.camera=bpy.data.objects[n];s.render.filepath=str(P/'02_RENDERS'/f'{n}.png');print('DISPLAY_CORRECTION',n,flush=True);bpy.ops.render.render(write_still=True)
subprocess.run(['node',str(P/'01_SOURCE/compose_review.cjs')],check=True,cwd=str(P))
print('DISPLAY_CORRECTION_COMPLETE_NO_GEOMETRY_CHANGE',flush=True)
sys.stdout.flush();sys.stderr.flush();os._exit(0)
