import json,math,numpy as np
from pathlib import Path
P=Path(__file__).resolve().parents[1];c=json.loads((P/'04_DOCUMENTATION/camera-prebuild-solve.json').read_text());o=np.array(c['location']);a=c['rotation_euler'][2];f=c['focal_length_mm']/36*1672
right=np.array([math.cos(a),math.sin(a),0]);fw=np.array([-math.sin(a),math.cos(a),0])
def hit(px,py,axis,val):
 u=(px-836+c['shift_x']*1672)/f;v=(470.5-py+c['shift_y']*1672)/f;r=right*u+np.array([0,0,v])+fw;return (o+r*(val-o[axis])/r[axis]).tolist()
def project(p):
 d=np.array(p)-o;depth=d@fw;return [836-c['shift_x']*1672+f*(d@right)/depth,470.5+c['shift_y']*1672-f*d[2]/depth]
redA=hit(818,190,1,-1.3);redB=hit(1067,77,1,-1.3);finA=hit(367,324,1,-3.4);finB=hit(478,268,1,-3.4)
mainA=hit(520,319,1,-1.6);mainB=hit(820,183,1,-1.6)
layout={'red_a':redA,'red_b':redB,'fin_a':finA,'fin_b':finB,'main_a':mainA,'main_b':mainB,'plinth_depth':c['plinth_depth']}
# The five shells vary in footprint and height. Planes share coherent world axes.
layout['shells']=[['CENTRAL',mainA[0],mainB[0],-1.6,3.0,.72,(mainA[2]+mainB[2])/2],['LEFT_LOW',-5.5,-2.8,-3.4,-.7,.58,3.9],['REAR_HIGH',3.7,redB[0],-1.3,2.45,.72,redB[2]],['RIGHT_WING',4.0,6.6,1.5,3.75,.6,3.35],['FRONT_GALLERY',.6,3.7,-3.0,-1.6,.74,3.55]]
landmarks=[]
for name,pt,ref in [('portal_left',redA,[818,190]),('portal_peak',redB,[1067,77]),('fin_left',finA,[367,324]),('fin_peak',finB,[478,268]),('main_left',mainA,[520,319]),('main_peak',mainB,[820,183])]:landmarks.append({'name':name,'world':pt,'reference':ref,'projected':project(pt)})
for b in c['base_landmarks']:landmarks.append({'name':'plinth','world':b['world'],'reference':b['reference'],'projected':project(b['world'])})
layout['landmarks']=landmarks
(P/'04_DOCUMENTATION/geometry-layout.json').write_text(json.dumps(layout,indent=2))
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941">']
for name,x0,x1,y0,y1,z0,z1 in layout['shells']:
 pts=[(x,y,z) for z in [z0,z1] for y in [y0,y1] for x in [x0,x1]]
 for i,j in [(0,1),(1,3),(3,2),(2,0),(4,5),(5,7),(7,6),(6,4),(0,4),(1,5),(2,6),(3,7)]:
  aa,bb=project(pts[i]),project(pts[j]);svg.append(f'<path d="M{aa[0]},{aa[1]} L{bb[0]},{bb[1]}" stroke="#00a6c7" stroke-width="2" opacity=".65"/>')
for l in landmarks:
 x,y=l['projected'];svg.append(f'<circle cx="{x}" cy="{y}" r="6" fill="none" stroke="#ec9600" stroke-width="3"/>')
svg.append('<rect x="30" y="24" width="630" height="48" fill="white"/><text x="44" y="56" font-family="sans-serif" font-size="24">PRE-BUILD • PERSPECTIVE LANDMARKS / NO MESHES</text></svg>')
(P/'03_COMPARISONS/prebuild-landmarks.svg').write_text(''.join(svg))
print(json.dumps(layout,indent=2))
