"""S0A/S0B-1 readiness validation (brief §17). Read-only checks over the package, the repos and git state."""
import csv, json, os, re, subprocess, glob

R = '/home/user/fsbw/FRONTAL_SLAYER_S0A_S0B1_READINESS/'
AUDIT = '/home/user/fsbw/FRONTAL_SLAYER_ACCOUNT_ADMIN_AUDIT/'
out = []
def chk(name, ok, detail=''):
    out.append(('PASS' if ok else 'FAIL', name, detail))

tri = list(csv.DictReader(open(R + '06_FOUNDER_DECISION_TRIAGE.csv')))
orig = [r for r in tri if r['ORIGIN'].startswith('V2')]
v2ids = [l.split("'")[1] for l in open('/home/user/fsbw/FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL/evidence/generator/decisions.cjs') if re.match(r"\s*add\(\{ id:'", l)]
chk('All 55 original decisions accounted for', len(v2ids) == 55 and sorted(v2ids) == sorted(r['DECISION ID'] for r in orig), f'{len(orig)} rows')

fd = set(re.findall(r'FD-[A-Z]\d+', open(AUDIT + '24_FOUNDER_DECISION_BOARD.md').read()))
carried = set()
for r in tri:
    carried |= set(re.findall(r'FD-[A-Z]\d+', r['PRIOR AUDIT IDS'] + ' ' + r['ORIGIN']))
known_aliases = {'FD-R5', 'FD-R13'}  # doc 24 aliases (= FD-C5, FD-C6), carried via those ids
missing = sorted(fd - carried - known_aliases)
chk('No founder decision disappears (every audit FD-* id carried)', not missing, ', '.join(missing))

cats = {r['DECISION ID']: r['CLASSIFICATION'][0] for r in tri}
man = json.load(open(R + '17_APPROVAL_MANIFEST_TEMPLATE.json'))
wave_founder = {i for w in man['waves'] for i in w['founderDecisions']}
chk('Engineering defaults separated from founder decisions', all(cats[i] == '1' for i in wave_founder) and not any(cats[r['DECISION ID']] == '2' and r['DECISION ID'] in wave_founder for r in tri))

est = [r for r in tri if r['CLASSIFICATION'].startswith('3')]
chk('Every ALREADY ESTABLISHED item cites evidence', all(re.search(r'MEMORY|\.md|\.tsx?|\.mdc|brief', r['HISTORICAL AUTHORITY (CITED)']) for r in est), f'{len(est)} items')

par = list(csv.DictReader(open(R + '05_EXPERIENCE_PARITY_MATRIX.csv')))
chk('Mobile and desktop/tablet presented separately for every capability', all(p['MOBILE PRESENTATION'] and p['DESKTOP/TABLET PRESENTATION'] and p['ADMIN PRESENTATION'] for p in par), f'{len(par)} capabilities')
chk('Every capability names one authoritative data owner', all(p['AUTHORITATIVE DATA OWNER (TARGET)'].strip() for p in par))

bad_shell = []
for f in glob.glob(R + '*.md'):
    for i, line in enumerate(open(f), 1):
        if 'AccountShell' in line and not re.search(r'[Ww]ithdrawn|superseded|Superseded|universal|No shared|no shared', line):
            bad_shell.append(f'{os.path.basename(f)}:{i}')
chk('No shared responsive customer shell proposed', not bad_shell, ', '.join(bad_shell))

s = subprocess.run(['git', '-C', '/home/user/SITE00', 'status', '--porcelain'], capture_output=True, text=True)
chk('SITE00 source untouched', s.returncode == 0 and not s.stdout.strip(), s.stdout[:200])

st = subprocess.run(['git', '-C', '/home/user/fsbw', 'status', '--porcelain'], capture_output=True, text=True).stdout.splitlines()
chk('Only the readiness folder changed in fsbw (no app, API, migration or payment code)', all('FRONTAL_SLAYER_S0A_S0B1_READINESS' in l for l in st), '; '.join(st)[:300])
chk('No candidate migration placed in supabase/migrations', not any('supabase/migrations' in l for l in st))

sqls = glob.glob(R + '10_CANDIDATE_MIGRATIONS/*.sql')
chk('Every candidate SQL is marked REVIEW ONLY', all('REVIEW ONLY' in open(f).read()[:400] for f in sqls), f'{len(sqls)} files')

secret = re.compile(r'eyJ[A-Za-z0-9_-]{10,}\.eyJ|\b(sk|rk)_(live|test)_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}|\bre_[A-Za-z0-9]{20,}|\bsk-[A-Za-z0-9_-]{20,}')
leaks = [f for f in glob.glob(R + '**/*', recursive=True) if os.path.isfile(f) and not f.endswith(('.zip', '.png')) and secret.search(open(f, errors='ignore').read())]
chk('No secret values in any deliverable', not leaks, ', '.join(leaks))

d13 = open(R + '13_STAGING_ENVIRONMENT_PROPOSAL.md').read()
chk('Staging requirements documented', all(k in d13 for k in ['Stripe', 'test mode', 'Synthetic', 'webhook', 'Promote', 'schema-only', 'SITE00']))

d09 = open(R + '09_DATABASE_CONTAINMENT_SPEC.md').read()
chk('Security containment has measurable criteria', all(f'| C{i} |' in d09 for i in range(1, 10)))

chk('Approval states truthful (manifest: no selection, only RECOMMENDED/BLOCKED)', man['approvalRecorded'] is False and all(d['founderSelection'] is None and d['state'] in ('RECOMMENDED', 'BLOCKED') for d in man['decisions']), f"{len(man['decisions'])} decisions")

d18 = open(R + '18_UNVERIFIED_DEPENDENCIES.md').read()
chk('Unresolved blockers reported', '## 3. Blockers' in d18 and 'U-01' in d18)

for st_, n, d in out:
    print(f'{st_} | {n} | {d}')
print('RESULT', 'ALL PASS' if all(x[0] == 'PASS' for x in out) else 'FAILURES')
print('PROCESS FACTS (not script-checkable): live DB calls this sprint = 9 execute_sql (all SELECT) + 1 list_migrations + 1 get_advisors; no apply_migration; no deployment; no merge; no PR.')
