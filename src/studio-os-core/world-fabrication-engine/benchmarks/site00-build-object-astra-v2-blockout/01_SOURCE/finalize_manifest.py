from pathlib import Path
import json,hashlib,struct,datetime
P=Path(__file__).resolve().parents[1]
files=['01_SOURCE/SITE00_Build_Object_Astra_V2_Blockout.blend','01_SOURCE/build_astra_v2_blockout.py']
files += ['02_RENDERS/'+n+'.png' for n in ['01_REFERENCE_CAMERA_BLOCKOUT','02_LEFT_THREE_QUARTER','03_RIGHT_THREE_QUARTER','04_ELEVATED_INSPECTION','05_REFERENCE_OVERLAY']]
files += ['03_COMPARISONS/blockout-vs-reference-hero.png','03_COMPARISONS/landmark-overlay-hero.png','04_DOCUMENTATION/image-inspection-evidence.md','04_DOCUMENTATION/camera-match-report.json','04_DOCUMENTATION/structural-fidelity-report.md','04_DOCUMENTATION/usage-report.json','05_FOUNDER_REVIEW/review-contact-sheet.md','05_FOUNDER_REVIEW/approval-status.json']
items=[]
for name in files:
 p=P/name;b=p.read_bytes();assert len(b)>0;row={'path':name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if p.suffix=='.png':
  assert b[:8]==b'\x89PNG\r\n\x1a\n';row['dimensions']=list(struct.unpack('>II',b[16:24]))
 items.append(row)
assert hashlib.sha256((P/'03_COMPARISONS/approved-reference.jpg').read_bytes()).hexdigest()=='50590912003833aeff8a1851dcbd5a1342d7aa8e47c4603a4eea3e932726582b'
assert json.loads((P/'05_FOUNDER_REVIEW/approval-status.json').read_text())['status']=='PENDING'
assert json.loads((P/'04_DOCUMENTATION/verification-report.json').read_text())['all_pass']
(P/'04_DOCUMENTATION/deliverable-manifest.json').write_text(json.dumps({'created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'all_required_files_present':True,'reference_hash_verified':True,'required_file_count':len(items),'structural_revision':1,'approval':'PENDING','files':items},indent=2))
print('DELIVERABLE_AUDIT_PASS',len(items),'required files')
