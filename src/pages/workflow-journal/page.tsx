import { useEffect, useMemo, useRef, useState } from 'react';
import { AIO_JOURNAL_BRAND, createOperatingAuthorityDraft } from '../../studio-os-core/workflow-journal/aio/profile';
import { journalStatusLabel } from '../../studio-os-core/workflow-journal/lifecycle';
import { deviceSaveReceipt, readDeviceDraft, writeDeviceDraft, type SaveReceipt } from '../../studio-os-core/workflow-journal/persistence';
import { sourceById } from '../../studio-os-core/workflow-journal/research/sources';
import {
  activeSteps,
  addPrivateNote,
  confirmPrivateNote,
  confirmProposedWording,
  confirmStep,
  expertConfirmJournal,
  extractStepsFromFile,
  markNotApplicable,
  ownerApproveJournal,
  proposeDifferentWording,
  structureNarrative,
} from '../../studio-os-core/workflow-journal/review-engine';
import type { CaptureMode, ExpertiseVisibility, JournalDocument } from '../../studio-os-core/workflow-journal/types';
import './workflow-journal.css';

type Scene = 'welcome' | 'review' | 'different' | 'private' | 'map' | 'confirm' | 'owner' | 'saved';

const brand = AIO_JOURNAL_BRAND;

export default function WorkflowJournalPage() {
  const [doc, setDoc] = useState<JournalDocument>(() => createOperatingAuthorityDraft());
  const [scene, setScene] = useState<Scene>('welcome');
  const [mode, setMode] = useState<CaptureMode>('quick_review');
  const [index, setIndex] = useState(0);
  const [differentText, setDifferentText] = useState('');
  const [privateText, setPrivateText] = useState('');
  const [visibility, setVisibility] = useState<ExpertiseVisibility>('owner_only');
  const [tellText, setTellText] = useState('');
  const [fileNote, setFileNote] = useState('');
  const [receipt, setReceipt] = useState<SaveReceipt | null>(null);
  const mutationRef = useRef(1);

  useEffect(() => {
    const existing = readDeviceDraft(window.sessionStorage);
    if (existing?.workflowId === 'operating-authority-application') {
      setDoc(existing);
      const open = activeSteps(existing).findIndex(
        (item) => item.disposition === 'unreviewed' || (item.disposition === 'different' && !item.confirmedWording),
      );
      setIndex(open < 0 ? 0 : open);
      setScene(open < 0 ? 'map' : 'review');
      setReceipt(deviceSaveReceipt(existing.updatedAt));
    }
  }, []);

  const steps = activeSteps(doc);
  const step = steps[Math.min(index, Math.max(steps.length - 1, 0))];
  const sources = useMemo(() => (step ? step.sourceIds.map(sourceById).filter(Boolean) : []), [step]);

  function nextId(): string {
    const id = `ui-${mutationRef.current}`;
    mutationRef.current += 1;
    return id;
  }

  function commit(next: JournalDocument, advance?: Scene) {
    setDoc(next);
    const saved = writeDeviceDraft(window.sessionStorage, next);
    setReceipt(saved);
    if (advance) setScene(advance);
  }

  function finishReview() {
    if (index < steps.length - 1) {
      setIndex(index + 1);
      setScene('review');
      return;
    }
    setScene('private');
  }

  return (
    <main className="wj">
      <div className={`wj-shell ${scene !== 'welcome' ? 'with-context' : ''}`}>
        <header className="wj-top">
          <div className="wj-mark">{brand.organizationName} · Studio Institute</div>
          <div className="wj-save">{receipt?.label ?? 'Not saved yet. A refresh on this device can restore a draft.'}</div>
        </header>

        {scene !== 'welcome' && (
          <aside className="wj-context">
            <div className="wj-kicker">Operating authority</div>
            <strong>Prepared process</strong>
            {steps.map((item, itemIndex) => (
              <button key={item.id} className={`wj-chip ${itemIndex === index ? 'on' : ''}`} type="button" onClick={() => { setIndex(itemIndex); setScene('review'); }}>
                {itemIndex + 1}. {item.title}
              </button>
            ))}
            <p className="wj-muted">{journalStatusLabel(doc.lifecycle)} · {doc.persistence === 'device' ? 'Device draft' : doc.persistence}</p>
          </aside>
        )}

        <section className="wj-stage">
          {scene === 'welcome' && (
            <>
              <div className="wj-kicker">Private invitation</div>
              <h1>{brand.invitation}</h1>
              <p>{brand.support}</p>
              <div className="wj-card">
                <strong>Permitting & Authorities</strong>
                <p>Operating authority application. Eight prepared steps. Nothing here is an approved company procedure yet.</p>
              </div>
              <div className="wj-modes">
                {([
                  ['quick_review', 'Quick review'],
                  ['just_tell_me', 'Just tell me'],
                  ['start_with_a_file', 'Start with a file'],
                ] as const).map(([id, label]) => (
                  <button key={id} type="button" className={`wj-chip ${mode === id ? 'on' : ''}`} onClick={() => setMode(id)}>{label}</button>
                ))}
              </div>
              {mode === 'just_tell_me' && (
                <>
                  <p className="wj-muted">Type, or use your phone keyboard’s microphone. This journal does not record audio.</p>
                  <textarea value={tellText} onChange={(event) => setTellText(event.target.value)} placeholder="Describe the process in your own words." />
                </>
              )}
              {mode === 'start_with_a_file' && (
                <>
                  <p className="wj-muted">Text and Markdown checklists only. PDF, Word, and photos are not read in this pilot.</p>
                  <input
                    type="file"
                    accept=".txt,.md,.text,text/plain"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const extracted = extractStepsFromFile(file.name, await file.text());
                      if (!extracted.ok) {
                        setFileNote(extracted.reason);
                        return;
                      }
                      setFileNote(`${extracted.steps.length} proposed steps. They are not approved.`);
                      setTellText(extracted.steps.map((item) => item.wording).join('\n'));
                    }}
                  />
                  {fileNote && <p className="wj-muted">{fileNote}</p>}
                </>
              )}
              <div className="wj-actions">
                <button
                  className="wj-btn gold"
                  type="button"
                  onClick={() => {
                    if (mode !== 'quick_review' && tellText.trim()) {
                      const proposed = mode === 'start_with_a_file'
                        ? extractStepsFromFile('notes.txt', tellText)
                        : { ok: true as const, steps: structureNarrative(tellText) };
                      if (proposed.ok) {
                        const next = { ...doc, steps: doc.steps.map((item) => ({ ...item })) };
                        proposed.steps.forEach((item, itemIndex) => {
                          next.steps.push({
                            id: `spoken-${itemIndex}`,
                            order: 100 + itemIndex,
                            title: item.title,
                            researchedWording: '',
                            proposedWording: item.wording,
                            confirmedWording: null,
                            expertResponse: item.wording,
                            kind: 'action',
                            disposition: 'different',
                            layer: 'company',
                            visibility: 'company_standard',
                            requirementClass: 'organization_specific',
                            sourceIds: [],
                            approvalRequired: false,
                            neverAutomate: false,
                            guidanceMayHaveChanged: false,
                          });
                        });
                        commit(next, 'review');
                        return;
                      }
                    }
                    setScene('review');
                  }}
                >
                  Review the prepared process
                </button>
              </div>
            </>
          )}

          {scene === 'review' && step && (
            <>
              <div className="wj-kicker">Step {index + 1} of {steps.length}</div>
              <h1>{step.title}</h1>
              <p>{step.proposedWording ?? step.researchedWording}</p>
              {step.guidanceMayHaveChanged && <div className="wj-flag">Industry guidance may have changed. Review this step.</div>}
              {step.neverAutomate && <div className="wj-flag">Human approval. Do not automate.</div>}
              <details className="wj-sources">
                <summary>Sources</summary>
                {sources.map((source) => source && (
                  <p key={source.id}><a href={source.url}>{source.publisher} — {source.title}</a> · checked {source.dateChecked} · {source.verification}</p>
                ))}
              </details>
              <div className="wj-actions">
                <button className="wj-btn gold" type="button" onClick={() => { commit(confirmStep(doc, step.id, nextId())); finishReview(); }}>That’s right</button>
                <button className="wj-btn" type="button" onClick={() => { setDifferentText(step.expertResponse ?? ''); setScene('different'); }}>I do it differently</button>
                <button className="wj-btn" type="button" onClick={() => { commit(markNotApplicable(doc, step.id, nextId())); finishReview(); }}>Not applicable</button>
              </div>
            </>
          )}

          {scene === 'different' && step && (
            <>
              <div className="wj-kicker">I do it differently</div>
              <h1>What do you check first?</h1>
              <p className="wj-muted">The researched step stays attached. Your words are a proposal until you confirm them.</p>
              <textarea value={differentText} onChange={(event) => setDifferentText(event.target.value)} />
              <div className="wj-actions inline">
                <button
                  className="wj-btn gold"
                  type="button"
                  disabled={!differentText.trim()}
                  onClick={() => commit(proposeDifferentWording(doc, step.id, differentText, nextId()), 'different')}
                >
                  Propose this wording
                </button>
                <button
                  className="wj-btn dark"
                  type="button"
                  disabled={!step.proposedWording}
                  onClick={() => { commit(confirmProposedWording(doc, step.id, nextId())); finishReview(); }}
                >
                  Yes, that wording is correct
                </button>
              </div>
              {step.proposedWording && <div className="wj-card"><strong>Proposed, not approved</strong><p>{step.proposedWording}</p></div>}
            </>
          )}

          {scene === 'private' && (
            <>
              <div className="wj-kicker">Private expertise</div>
              <h1>Anything you check that prevents a delay?</h1>
              <p className="wj-muted">Optional. This is not published, and it is not permission to train an AI worker.</p>
              <textarea value={privateText} onChange={(event) => setPrivateText(event.target.value)} placeholder="Leave this blank if there is nothing to add." />
              <div className="wj-modes">
                {([
                  ['company_standard', 'Company standard'],
                  ['team_only', 'Team only'],
                  ['owner_only', 'Owner only'],
                  ['restricted_expert', 'Restricted'],
                ] as const).map(([id, label]) => (
                  <button key={id} type="button" className={`wj-chip ${visibility === id ? 'on' : ''}`} onClick={() => setVisibility(id)}>{label}</button>
                ))}
              </div>
              <div className="wj-actions">
                <button
                  className="wj-btn gold"
                  type="button"
                  onClick={() => {
                    if (!privateText.trim()) {
                      commit(doc, 'map');
                      return;
                    }
                    const addId = nextId();
                    const noted = addPrivateNote(doc, privateText, visibility, addId);
                    commit(confirmPrivateNote(noted, `note-${addId}`, nextId()), 'map');
                  }}
                >
                  Continue to the process map
                </button>
              </div>
            </>
          )}

          {scene === 'map' && (
            <>
              <div className="wj-kicker">Proposed map</div>
              <h1>This is a draft, not a live workflow.</h1>
              <div className="wj-map">
                {doc.map.nodes.map((node) => (
                  <div key={node.id} className="wj-node">
                    <strong>{node.engineNodeType}</strong>
                    <p>{node.label}</p>
                  </div>
                ))}
              </div>
              <p className="wj-muted">Status: {doc.map.status}. Executable: no.</p>
              <div className="wj-actions">
                <button className="wj-btn gold" type="button" onClick={() => setScene('confirm')}>Review confirmation</button>
              </div>
            </>
          )}

          {scene === 'confirm' && (
            <>
              <div className="wj-kicker">Expert confirmation</div>
              <h1>Confirm the draft you just reviewed.</h1>
              <p className="wj-muted">{steps.filter((item) => item.disposition === 'confirmed').length} steps confirmed. Unconfirmed wording stays a proposal.</p>
              <div className="wj-actions">
                <button className="wj-btn gold" type="button" onClick={() => commit(expertConfirmJournal(doc, nextId()), 'owner')}>I confirm this draft</button>
              </div>
            </>
          )}

          {scene === 'owner' && (
            <>
              <div className="wj-kicker">Owner review</div>
              <h1>Approve it as company knowledge?</h1>
              <p>Approval does not turn on an AI worker and does not run a filing.</p>
              <div className="wj-card"><strong>{journalStatusLabel(doc.lifecycle)}</strong><p>Worker use granted: {doc.workerUseGranted ? 'yes' : 'no'}.</p></div>
              <div className="wj-actions">
                <button
                  className="wj-btn gold"
                  type="button"
                  disabled={doc.lifecycle !== 'expert_confirmed'}
                  onClick={() => commit(ownerApproveJournal(doc, nextId()), 'saved')}
                >
                  Owner approves
                </button>
                <button className="wj-btn" type="button" onClick={() => { setIndex(0); setScene('review'); }}>Send back for correction</button>
              </div>
            </>
          )}

          {scene === 'saved' && (
            <>
              <div className="wj-kicker">Saved draft</div>
              <h1>{journalStatusLabel(doc.lifecycle)}</h1>
              <p>{receipt?.label}</p>
              <p className="wj-muted">Close this page and reopen it on this device to resume. Another computer will not see this draft.</p>
              <div className="wj-actions">
                <button className="wj-btn" type="button" onClick={() => setScene('review')}>Resume the review</button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
