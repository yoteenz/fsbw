"""Apply the S0B-1 approval-state correction to the board V3 template -> V3.1.
Usage: python3 patch_board.py <board_v3_template.html> <out.html>"""
import sys
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:90])
    s = s.replace(old, new)

# CSS: pending state + disabled record button + recommendation line
rep(".state.DEFERRED { color: var(--dsk); background: var(--dsk-wash); border-color: transparent; }",
    ".state.PENDING { color: var(--muted); border-color: var(--line); } .recnote { color: var(--muted); } .dact button[disabled] { opacity: .45; cursor: not-allowed; }\n.state.DEFERRED { color: var(--dsk); background: var(--dsk-wash); border-color: transparent; }")

rep("Board V3 · founder triage and security readiness · three experience authorities",
    "Board V3.1 · approval-state correction · three experience authorities")

rep("Same shape as <code>17_APPROVAL_MANIFEST_TEMPLATE.json</code>. A founder selection appears only when the artifact owner has recorded it in the decision store. Unrecorded selections go under <code>selectedNotRecorded</code> and carry no authority.",
    "Manifest v4. Each decision separates six fields: <code>recommendation</code>, <code>selectedOption</code>, <code>recordedFounderDecision</code>, <code>executionAuthorization</code>, <code>implementationStatus</code> and <code>verificationStatus</code>. Only <code>recordedFounderDecision</code> (saved by the artifact owner and read back from the decision store) is an approval. A recommendation or an on-screen selection never is.")

# state model
rep("""  function stateOf(d) {
    const r = records[d.id];
    if (r && STATUS_TO_STATE[r.status]) return STATUS_TO_STATE[r.status];
    if (selected[d.id]) return 'SELECTED — NOT RECORDED';
    return d.state; // RECOMMENDED or BLOCKED
  }
  const stateClass = s => s.startsWith('FOUNDER APPROVED') ? 'APPROVED' : s.startsWith('FOUNDER REJECTED') ? 'REJECTED' : s.startsWith('SELECTED') ? 'SELECTED' : s.split(' ')[0];""",
"""  // Default control state is PENDING DECISION. A recommendation or an on-screen selection is never an approval:
  // FOUNDER APPROVED / REJECTED / DEFERRED come only from records read back from the decision store.
  const PENDING = 'PENDING DECISION';
  const pick = {}; // per-card working state (selection + outcome) before recording
  const liveSel = d => (pick[d.id] && pick[d.id].selection) || selected[d.id] || null;
  function stateOf(d) {
    const r = records[d.id];
    if (r && STATUS_TO_STATE[r.status]) return STATUS_TO_STATE[r.status];
    if (liveSel(d)) return 'SELECTED — NOT RECORDED';
    return d.state === 'BLOCKED' ? PENDING + ' · BLOCKED' : PENDING;
  }
  const stateClass = s => s.startsWith('FOUNDER APPROVED') ? 'APPROVED' : s.startsWith('FOUNDER REJECTED') ? 'REJECTED' : s.startsWith('SELECTED') ? 'SELECTED' : s.includes('BLOCKED') ? 'BLOCKED' : s.startsWith('PENDING') ? 'PENDING' : s.split(' ')[0];""")

rep("""    if (mode === 'owner') { b.className = 'banner ok'; b.textContent = 'You are the artifact owner. RECORD saves the decision to this board\\'s decision store with your account and the time, and only then shows FOUNDER APPROVED, REJECTED or DEFERRED. Approving one wave approves nothing else. To authorize implementation, export the manifest and commit it.'; }""",
    """    if (mode === 'owner') { b.className = 'banner ok'; b.textContent = 'You are the artifact owner. Every decision starts as PENDING DECISION. Choosing an option shows SELECTED — NOT RECORDED. Nothing is approved until you choose an outcome, press Record decision, and the decision store confirms the record; only then does the card show FOUNDER APPROVED, FOUNDER REJECTED or DEFERRED. A recommendation is never an approval. Approving one wave approves nothing else.'; }""")

rep("""  const pick = {};
  function card(d) {
    const r = records[d.id], st = stateOf(d);
    const w = pick[d.id] || (pick[d.id] = { selection: r ? r.selection : (selected[d.id] || null), status: r ? r.status : 'APPROVED', note: r ? r.note || '' : '' });""",
"""  function refreshCard(d) {
    const st = stateOf(d), b = document.querySelector('#dec-' + d.id + ' .dhead .state');
    if (b) { b.textContent = st; b.className = 'state ' + stateClass(st); }
    const w = pick[d.id], btn = document.getElementById('rb-' + d.id);
    if (btn) btn.disabled = !(w && w.selection && w.status);
    renderOverview(); renderSprints();
  }
  function card(d) {
    const r = records[d.id], st = stateOf(d);
    const w = pick[d.id] || (pick[d.id] = { selection: r ? r.selection : (selected[d.id] || null), status: r ? r.status : '', note: r ? r.note || '' : '' });""")

rep("""      el('div', { class: 'small' }, el('span', { class: 'label', text: 'Proposed disposition  ' }), d.disposition),""",
    """      el('div', { class: 'small' }, el('span', { class: 'label', text: 'Proposed disposition  ' }), d.disposition),
      el('div', { class: 'small recnote' }, el('span', { class: 'label', text: 'Recommendation  ' }), d.originalRec ? 'Option ' + d.originalRec + ' — a recommendation, not an approval' : 'None'),""")

rep("""onchange: () => { w.selection = o.key; if (mode !== 'owner') { selected[d.id] = o.key; ls.set('fs-arch-v3-selected', selected); renderAll(); } } }),""",
    """onchange: () => { w.selection = o.key; if (mode !== 'owner') { selected[d.id] = o.key; ls.set('fs-arch-v3-selected', selected); } refreshCard(d); } }),""")

rep("""        el('select', { id: 'st-' + d.id, 'aria-label': 'Decision', onchange: e => { w.status = e.target.value; } }, ['APPROVED', 'REJECTED', 'DEFERRED'].map(s => el('option', { value: s, selected: w.status === s, text: STATUS_TO_STATE[s] }))),""",
    """        el('select', { id: 'st-' + d.id, 'aria-label': 'Outcome', onchange: e => { w.status = e.target.value; refreshCard(d); } }, [el('option', { value: '', selected: !w.status, text: '— Choose outcome —' })].concat([['APPROVED', 'Approve'], ['REJECTED', 'Reject'], ['DEFERRED', 'Defer']].map(([v, t]) => el('option', { value: v, selected: w.status === v, text: t })))),""")

rep("""        el('button', { class: 'primary', onclick: e => record(d, w, e.currentTarget) }, 'Record'),""",
    """        el('button', { class: 'primary', id: 'rb-' + d.id, disabled: !(w.selection && w.status), onclick: e => record(d, w, e.currentTarget) }, r ? 'Record change' : 'Record decision'),""")

rep("""    if (!w.selection) { m.textContent = 'Choose an option first.'; return; }""",
    """    if (!w.selection || !w.status) { m.textContent = 'Choose an option and an outcome first.'; return; }""")
rep("recommendation: d.originalRec || null, boardVersion: 3 });", "recommendation: d.originalRec || null, boardVersion: '3.1' });")

# security panel note
rep("""'Not executed. Live state re-verified read-only on 2026-10-25: 17 SECURITY DEFINER functions executable by anon; 8 legacy customer write policies; the pack check accepts 1, 3 and 6.'""",
    """'Not executed in production or staging. Rehearsed on an isolated local replica on 2026-10-26: after M1A + M2 + M3, 31 of 31 attack tests were blocked and 19 of 20 authorized workflows passed (the one failure, U-21, predates the migrations); rollback restored the exact prior catalog. Staging rehearsal is BLOCKED until A1a, H2 and H3 are recorded. A local PASS does not mean production is fixed. Live state (read-only, 2026-10-26): 17 SECURITY DEFINER functions executable by anon; 8 legacy customer write policies; the pack check accepts 1, 3 and 6.'""")

# sprints: tick only for recorded approvals
rep("""text: id + (records[id] ? ' ✓' : '')""", """text: id + (records[id] && records[id].status === 'APPROVED' ? ' ✓' : '')""")

# manifest v4
old_start = s.index("  function buildManifest() {")
old_end = s.index("  function renderExport()")
s = s[:old_start] + """  const IMPL = {
    A1a: 'M1A, M2, M3 PREPARED; REHEARSED on an isolated local replica (2026-10-26). Staging NOT PROVISIONED.',
    A1b: 'NOT APPLIED to production.',
    H2: 'Staging configuration PREPARED; NOT PROVISIONED.',
    H3: 'Shared-database impact review done for M1A, M2, M3 (no SITE00 or JURNL dependency found).'
  };
  const VERIF = {
    A1a: 'LOCAL REPLICA: 31/31 attack tests blocked; 19/20 authorized workflows pass (REG-18 = pre-existing U-21); rollback exact. STAGING: BLOCKED. PRODUCTION: UNVERIFIED.',
    A1b: 'UNVERIFIED (requires the staging evidence pack).',
    H2: 'UNVERIFIED (no staging exists).',
    H3: 'UNVERIFIED (SITE00 owner smoke not run).'
  };
  const approved = id => !!(records[id] && records[id].status === 'APPROVED');
  function execAuth(d) {
    const r = records[d.id];
    if (!r) return 'NOT AUTHORIZED — no recorded founder decision';
    if (r.status !== 'APPROVED') return 'NOT AUTHORIZED — recorded as ' + STATUS_TO_STATE[r.status];
    if (d.id === 'A1a') return approved('H2') && approved('H3') ? 'AUTHORIZED — staging rehearsal only; production requires A1b' : 'NOT YET AUTHORIZED — H2 and H3 must also be recorded as approved';
    if (d.id === 'A1b') return approved('A1a') ? 'CONDITIONAL — valid only with the attached staging evidence pack' : 'NOT AUTHORIZED — requires A1a recorded as approved and staging evidence';
    return 'AUTHORIZED BY RECORD — this decision only; implementation still follows its sprint gates';
  }
  function buildManifest() {
    const recorded = Object.keys(records).filter(k => itemById[k]);
    return { templateVersion: '4.0', exportedAt: new Date().toISOString(), exportedFrom: 'Architecture board V3.1', status: recorded.length ? 'PARTIALLY RECORDED' : 'NO FOUNDER DECISION RECORDED', approvalRecorded: recorded.length > 0, recordedCount: recorded.length,
      legend: {
        recommendation: 'Engineering recommendation. Never an approval.',
        selectedOption: 'Option chosen on screen. Not an approval unless recordedFounderDecision is set.',
        recordedFounderDecision: 'Decision saved by the artifact owner in the board decision store and read back. The only approval source.',
        executionAuthorization: 'What the recorded decisions permit now, including dependencies (A1b needs A1a plus staging evidence).',
        implementationStatus: 'Engineering progress. Independent of approval.',
        verificationStatus: 'Test evidence by environment. A local or staging PASS does not mean production is fixed.'
      },
      counts: A.counts,
      decisions: items.map(d => { const r = records[d.id], sel = r ? r.selection : liveSel(d); return { id: d.id, subject: d.subject, classification: CATSHORT[d.cat], wave: d.wave,
        recommendation: d.originalRec || null,
        selectedOption: sel ? { option: sel, source: r ? 'recorded' : 'on screen — not recorded' } : null,
        recordedFounderDecision: r ? { outcome: STATUS_TO_STATE[r.status], option: r.selection, note: r.note || '', decidedBy: r.decidedBy || null, decidedAt: r.decidedAt } : null,
        state: stateOf(d),
        executionAuthorization: execAuth(d),
        implementationStatus: IMPL[d.id] || 'NOT STARTED',
        verificationStatus: VERIF[d.id] || 'UNVERIFIED' }; }) };
  }
""" + s[old_end:]
open(out, 'w', encoding='utf8').write(s)
print('patched OK')
