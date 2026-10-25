import csv, re, json, os, glob, subprocess, sys
A='/home/user/fsbw/FRONTAL_SLAYER_ACCOUNT_ADMIN_AUDIT/'; P='/home/user/fsbw/FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL/'
out=[]
def chk(name, ok, detail=''): out.append(('PASS' if ok else 'FAIL', name, detail))
# 1 every discovered page has a disposition
route_rows=list(csv.DictReader(open(P+'05_ROUTE_MIGRATION_AND_REDIRECT_PLAN.csv')))
covered=set()
for r in route_rows:
    for x in re.split(r',\s*', r['CURRENT ROUTE']): covered.add(x.strip())
    covered.add(r['CANONICAL ROUTE'].strip())
pm=list(csv.DictReader(open(P+'03_PAGE_RESPONSIBILITY_MATRIX.csv')))
for x in pm:
    for y in re.split(r',\s*', x['CURRENT ROUTE']): covered.add(y.strip())
missing=[]
for f in ['09_CUSTOMER_ACCOUNT_PAGE_COMPLETENESS_MATRIX.csv','10_ADMIN_PAGE_COMPLETENESS_MATRIX.csv']:
    for r in csv.DictReader(open(A+f)):
        rts=[t.strip() for t in re.split(r'[,;·]| and ', re.sub(r'\(\+[^)]*\)','',r['ROUTE'])) if t.strip().startswith('/')]
        if not rts: continue
        if not any(t in covered or t.split('?')[0] in covered or t.split('#')[0] in covered for t in rts): missing.append(r['PAGE_ID']+' '+r['ROUTE'])
chk('Every discovered page appears in a disposition matrix', not missing, '; '.join(missing))
# 2 every NEW page has a destination
new=[x for x in pm if x['MARKER']=='NEW']
chk('Every new/missing page has a canonical destination', all(x['CANONICAL ROUTE'] not in ('','—') for x in new), str(len(new))+' new pages')
# 3 broken workflows
t19=open(P+'19_RELEASE_READINESS_AND_E2E_TEST_MATRIX.md').read()
chk('All BW-01…BW-25 mapped to a workflow test', 'MISSING' not in t19.split('## 5.')[1])
# 4 CB plans
t11=open(P+'11_SECURITY_AND_MONEY_RISK_REGISTER.md').read()
chk('Every critical blocker CB-1…CB-9 has a risk plan', all(f'CB-{i} →' in t11 for i in range(1,10)))
# 5 every proposed page has responsibility
chk('Every page row has a responsibility', all(x['RESPONSIBILITY'].strip() for x in pm))
# 6 financial workflows authoritative record
wf=list(csv.DictReader(open(P+'04_CUSTOMER_ADMIN_WORKFLOW_MATRIX.csv')))
chk('Workflow matrix ≥30 rows × 12 required columns, all filled', len(wf)>=30 and all(all(r[c].strip() for c in ['ENTRY POINT','USER ACTION','API','AUTHORITATIVE RECORD','STRIPE / EXTERNAL','ADMIN VISIBILITY','ADMIN ACTION','CUSTOMER STATUS UPDATE','NOTIFICATION','AUDIT EVENT','FAILURE RECOVERY','VERIFICATION TEST']) for r in wf), f'{len(wf)} workflows')
money=[r for r in wf if r['AREA'] in ('Orders/payment','Membership','Rewards','Hair analysis','Consultations')]
chk('Every financial workflow names a server-side authoritative record', all(not re.search(r'localStorage|client', r['AUTHORITATIVE RECORD'], re.I) for r in money), f'{len(money)} financial workflows')
# 7 mirrors
chk('Every non-retired page has a mirror entry', all(x['MIRROR'].strip() for x in pm if x['MARKER'] not in ('RETIRED','CONSOLIDATED')))
# 8 legacy routes have dispositions
chk('Every route row has a disposition and regression test', all(r['DISPOSITION'] and r['REGRESSION TEST'] for r in route_rows), f'{len(route_rows)} route rows')
# 9 visual preservation explicit
chk('Every page has a visual preservation rule', all(x['VISUAL PRESERVATION'].strip() for x in pm))
# 10 unresolved decisions documented, none approved
man=json.load(open(P+'20_ARCHITECTURE_APPROVAL_MANIFEST.json'))
chk('Manifest: every decision founderSelection null and PENDING', all(d['founderSelection'] is None and d['status']=='PENDING' for d in man['decisions']) and man['approvalRecorded'] is False, f"{len(man['decisions'])} decisions")
# 11 cross-references resolve
ids={d['id'] for d in man['decisions']}
alltext=''.join(open(f).read() for f in glob.glob(P+'*.md')+glob.glob(P+'*.csv'))
bad=set()
for m in re.finditer(r'\b(?:decisions?|Decision)\s+([A-H]\d{1,2})\b', alltext):
    if m.group(1) not in ids: bad.add(m.group(1))
for pat,mx in [(r'\bR-(\d\d)\b',20),(r'\bW-(\d\d)\b',35),(r'\bU-(\d\d)\b',16),(r'\bK-(\d\d)\b',20),(r'\bENG-(\d\d)\b',10)]:
    for m in re.finditer(pat, alltext):
        if not 1<=int(m.group(1))<=mx: bad.add(m.group(0))
chk('Cross-references (decisions, R-, W-, U-, K-, ENG- ids) resolve', not bad, ', '.join(sorted(bad)))
# 12 SITE00 untouched, audit preserved
s=subprocess.run(['git','-C','/home/user/SITE00','status','--porcelain'],capture_output=True,text=True)
chk('SITE00 working tree clean', s.returncode==0 and s.stdout.strip()=='', s.stdout.strip()[:200] or s.stderr.strip()[:200])
a=subprocess.run(['git','-C','/home/user/fsbw','status','--porcelain','--','FRONTAL_SLAYER_ACCOUNT_ADMIN_AUDIT'],capture_output=True,text=True)
chk('Initial audit folder unmodified', a.stdout.strip()=='', a.stdout.strip()[:200])
o=subprocess.run(['git','-C','/home/user/fsbw','status','--porcelain'],capture_output=True,text=True).stdout.strip().splitlines()
chk('Only the architecture folder changed in fsbw', all('FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL' in l for l in o), '; '.join(o)[:300])
for st,n,d in out: print(f'{st} | {n} | {d}')
print('RESULT', 'ALL PASS' if all(s=='PASS' for s,_,_ in out) else 'FAILURES')
