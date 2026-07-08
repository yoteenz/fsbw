import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudioWorldConstitution } from '../../../../hooks/useStudioWorldConstitution';
import {
  CONSTITUTION_SCORE_LABELS,
  type ConstitutionLaw,
} from '../../../../studio-os-core/studio-world-constitution';
import { CONSTITUTION_HALL_STYLES } from './constitutionHallTheme';

const SCORE_KEYS = [
  'architecture',
  'missionAlignment',
  'worldContinuity',
  'reuse',
  'creativeAlignment',
  'scalability',
  'maintainability',
  'immersion',
  'experience',
] as const;

/**
 * Constitution Hall™ — monumental governance chamber in Command Center™.
 * Not settings. Not documentation. Permanent constitutional law.
 */
export function ConstitutionHallRoom() {
  const navigate = useNavigate();
  const { laws, lastResult, reviewing, keeperLines, reviewProposal } = useStudioWorldConstitution();
  const [activeLaw, setActiveLaw] = useState<ConstitutionLaw>(laws[0]!);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const scores = lastResult?.scores;
  const overall = scores?.overallCompliance ?? null;
  const approved = lastResult?.approved;

  const keeperTicker = useMemo(
    () => keeperLines.map((l) => l.message).join(' · '),
    [keeperLines]
  );

  const handleReview = () => {
    if (!name.trim() || !description.trim()) return;
    void reviewProposal({
      name: name.trim(),
      description: description.trim(),
      pageFirstHint:
        description.toLowerCase().includes('page') ||
        description.toLowerCase().includes('dashboard') ||
        description.toLowerCase().includes('settings'),
    });
  };

  return (
    <>
      <style>{CONSTITUTION_HALL_STYLES}</style>
      <div className="const-hall" role="application" aria-label="Constitution Hall">
        <div className="const-hall__marble-pillars" aria-hidden />

        <header className="const-hall__hud">
          <button
            type="button"
            className="const-hall__back"
            onClick={() => navigate('/admin/studio/overview')}
            aria-label="Return to Executive Atrium"
          >
            ←
          </button>
          <div className="const-hall__title-block">
            <p className="const-hall__eyebrow">COMMAND CENTER™</p>
            <p className="const-hall__title">Constitution Hall™</p>
          </div>
          <span className="const-hall__keeper-badge">ORB · KEEPER</span>
        </header>

        <aside className="const-hall__laws" aria-label="Foundational Laws">
          {laws.map((law) => (
            <button
              key={law.id}
              type="button"
              className={`const-hall__law${activeLaw.id === law.id ? ' is-active' : ''}`}
              onClick={() => setActiveLaw(law)}
            >
              <span className="const-hall__law-num">LAW #{law.number}</span>
              <span className="const-hall__law-title">{law.title}</span>
            </button>
          ))}
        </aside>

        <p className="const-hall__law-detail" aria-live="polite">
          {activeLaw.summary} — {activeLaw.enforcement}
        </p>

        <div className="const-hall__monument">
          <div className="const-hall__compliance-ring">
            <span
              className={`const-hall__compliance-val${approved === false ? ' is-fail' : ''}`}
            >
              {overall ?? '—'}
            </span>
            <span className="const-hall__compliance-label">CONSTITUTION COMPLIANCE™</span>
          </div>
          <p className="const-hall__status">
            {lastResult
              ? lastResult.approved
                ? `APPROVED · ${lastResult.proposalName.toUpperCase()}`
                : `REDESIGN REQUIRED · ${lastResult.violatedLaws.length} LAW FLAGS`
              : 'SUBMIT A PROPOSAL FOR CONSTITUTION REVIEW™'}
          </p>
        </div>

        <aside className="const-hall__scores" aria-label="Constitution Scores">
          {SCORE_KEYS.map((key) => {
            const val = scores?.[key] ?? 0;
            return (
              <div key={key}>
                <div className="const-hall__score-row">
                  <span>{CONSTITUTION_SCORE_LABELS[key]}</span>
                  <span>{scores ? val : '—'}</span>
                </div>
                <div className="const-hall__score-bar">
                  <div
                    className={`const-hall__score-fill${val < 45 ? ' is-low' : ''}`}
                    style={{ width: scores ? `${Math.min(100, val)}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </aside>

        <footer className="const-hall__dock">
          <div className="const-hall__form">
            <input
              className="const-hall__input"
              placeholder="Proposed feature name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Feature name"
            />
            <textarea
              className="const-hall__textarea"
              placeholder="Describe the feature — destination, physical form, workflow"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Feature description"
            />
            <button
              type="button"
              className="const-hall__review-btn"
              onClick={handleReview}
              disabled={reviewing || !name.trim() || !description.trim()}
            >
              {reviewing ? 'REVIEWING…' : 'RUN CONSTITUTION REVIEW™'}
            </button>
            <p className="const-hall__keeper-ticker" aria-live="polite">
              {keeperTicker}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
