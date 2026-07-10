import type { CSSProperties } from 'react';
import {
  CREATIVE_PREVIEW_COMPANY_IDS,
  CREATIVE_PREVIEW_COMPANY_LABELS,
  CREATIVE_PREVIEW_READ_ONLY,
  type CreativePreviewCompanyId,
  type CreativePreviewConcept,
  type CreativeStudioPreviewResult,
} from '../../../../studio-os-core/creative-studio-preview';
import { useCreativeStudioPreview } from '../../../../hooks/useCreativeStudioPreview';
import { CreativePreviewEnvironment } from './CreativePreviewEnvironment';

const sectionStyle: CSSProperties = {
  padding: '0 16px 20px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  color: '#111',
};

const btnStyle: CSSProperties = {
  padding: '8px 12px',
  margin: '4px 4px 4px 0',
  border: '1px solid #333',
  background: '#fff',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '11px',
};

/** Mode 2 — Creative Intelligence Validation (preview compiler, scorecard, concepts). */
export function CreativeIntelligencePanel() {
  const {
    companyId,
    conceptId,
    compareMode,
    preview,
    activeConcept,
    bundle,
    selectCompany,
    setConceptId,
    setCompareMode,
    recompile,
  } = useCreativeStudioPreview('studio-os');

  return (
    <div data-xelab-mode="creative-intelligence" style={{ background: '#fafafa', minHeight: '60vh' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
          CREATIVE STUDIO PREVIEW COMPILER™
        </p>
        <h1 style={{ margin: '4px 0 8px', fontSize: '16px' }}>Creative Intelligence Validation</h1>
        <p style={{ margin: 0, color: '#555', fontSize: '11px' }}>
          READ-ONLY preview · {CREATIVE_PREVIEW_READ_ONLY ? 'no production writes' : 'WRITE ENABLED'} · validates
          Creative Direction Studio reasoning before asset generation
        </p>
        <div style={{ marginTop: 12 }}>
          <button type="button" style={btnStyle} onClick={recompile}>
            Recompile previews
          </button>
          <button
            type="button"
            style={{ ...btnStyle, fontWeight: compareMode ? 800 : 400 }}
            onClick={() => setCompareMode(!compareMode)}
          >
            {compareMode ? 'Single company view' : 'Compare all companies'}
          </button>
        </div>
      </header>

      {compareMode ? (
        <CompareAllCompanies bundle={bundle} />
      ) : (
        <>
          <CompanySwitcher companyId={companyId} onSelect={selectCompany} />
          <ConceptSwitcher
            concepts={preview.concepts}
            activeId={conceptId}
            onSelect={setConceptId}
          />
          <PreviewFlow preview={preview} concept={activeConcept} />
        </>
      )}
    </div>
  );
}

function CompanySwitcher({
  companyId,
  onSelect,
}: {
  companyId: CreativePreviewCompanyId;
  onSelect: (id: CreativePreviewCompanyId) => void;
}) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionHeading}>1. Brand</h2>
      <div>
        {CREATIVE_PREVIEW_COMPANY_IDS.map((id: CreativePreviewCompanyId) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            style={{
              ...btnStyle,
              fontWeight: companyId === id ? 800 : 400,
              borderColor: companyId === id ? '#eb1c24' : '#333',
            }}
          >
            {CREATIVE_PREVIEW_COMPANY_LABELS[id]}
          </button>
        ))}
      </div>
    </section>
  );
}

function ConceptSwitcher({
  concepts,
  activeId,
  onSelect,
}: {
  concepts: CreativePreviewConcept[];
  activeId: 'a' | 'b' | 'c';
  onSelect: (id: 'a' | 'b' | 'c') => void;
}) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionHeading}>2. Creative Studio Preview — concepts</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {concepts.map((c) => (
          <button
            key={c.conceptId}
            type="button"
            onClick={() => onSelect(c.conceptId)}
            style={{
              ...btnStyle,
              flex: '1 1 180px',
              textAlign: 'left',
              borderColor: activeId === c.conceptId ? '#2563eb' : '#333',
              background: activeId === c.conceptId ? '#eff6ff' : '#fff',
            }}
          >
            <strong>{c.label}</strong>
            <span style={{ display: 'block', fontSize: '10px', color: '#666', marginTop: 4 }}>
              {c.tier.toUpperCase()} · {c.confidencePct}% confidence
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PreviewFlow({
  preview,
  concept,
}: {
  preview: CreativeStudioPreviewResult;
  concept: CreativePreviewConcept;
}) {
  const spec = concept.specification;

  return (
    <>
      <section style={sectionStyle}>
        <h2 style={sectionHeading}>3. Environment proposal</h2>
        <CreativePreviewEnvironment
          companyId={preview.companyId}
          archetype={preview.architectureArchetype}
          specification={spec}
        />
        <SpecGrid spec={spec} />
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>4. Reasoning</h2>
        <ConceptReasoning concept={concept} />
        <ol style={{ margin: '12px 0 0', paddingLeft: 20, color: '#374151' }}>
          {preview.reasoningChain.map((step: string, i: number) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>5. Validation — Creative Intelligence Scorecard</h2>
        <ScorecardTable scorecard={preview.scorecard} concept={concept} />
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Validation evidence</h2>
        <EvidenceBlock title="Governing inputs used" items={preview.governingInputs.map((g) => `${g.source} · ${g.field}: ${g.value.slice(0, 120)}${g.value.length > 120 ? '…' : ''}`)} />
        <EvidenceBlock title="DNA inheritance" items={preview.dnaInheritance} />
        <EvidenceBlock title="Rules applied" items={preview.rulesApplied} />
        <EvidenceBlock title="Constraints respected" items={preview.constraintsRespected} />
        <p style={{ marginTop: 12, padding: 12, background: '#ecfdf5', borderRadius: 8, color: '#166534' }}>
          {preview.validationSummary}
        </p>
      </section>
    </>
  );
}

function CompareAllCompanies({ bundle }: { bundle: ReturnType<typeof useCreativeStudioPreview>['bundle'] }) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionHeading}>Side-by-side — company identity without logos</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {CREATIVE_PREVIEW_COMPANY_IDS.map((id) => {
          const p = bundle.companies[id];
          const concept = p.concepts[0]!;
          return (
            <div key={id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', background: '#fff', borderBottom: '1px solid #eee' }}>
                <strong>{p.companyLabel}</strong>
                <span style={{ display: 'block', fontSize: '10px', color: '#666' }}>
                  {p.scorecard.overallConfidencePct}% overall · {p.architectureArchetype}
                </span>
              </div>
              <div style={{ padding: 12 }}>
                <CreativePreviewEnvironment
                  companyId={id}
                  archetype={p.architectureArchetype}
                  specification={concept.specification}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SpecGrid({ spec }: { spec: CreativeStudioPreviewResult['concepts'][0]['specification'] }) {
  const rows: [string, string | string[]][] = [
    ['Design philosophy', spec.designPhilosophy],
    ['Interior architecture', spec.interiorArchitecture],
    ['Material system', spec.materialSystem],
    ['Lighting language', spec.lightingLanguage],
    ['Spatial organization', spec.spatialOrganization],
    ['Interaction philosophy', spec.interactionPhilosophy],
    ['Motion behavior', spec.motionBehavior],
    ['Environmental mood', spec.environmentalMood],
    ['Workflow structure', spec.workflowStructure],
    ['Signature experiences', spec.signatureExperiences],
  ];

  return (
    <dl style={{ margin: '12px 0 0', display: 'grid', gap: 8 }}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>{label}</dt>
          <dd style={{ margin: '2px 0 0', lineHeight: 1.5 }}>
            {Array.isArray(value) ? value.join(' · ') : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ConceptReasoning({ concept }: { concept: CreativePreviewConcept }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
      <p>
        <strong>Why it exists:</strong> {concept.whyExists}
      </p>
      <p>
        <strong>Traits produced:</strong> {concept.traitsProduced.join(' · ')}
      </p>
      <p>
        <strong>Strengths:</strong> {concept.strengths.join(' · ')}
      </p>
      <p style={{ marginBottom: 0 }}>
        <strong>Weaknesses:</strong> {concept.weaknesses.join(' · ')}
      </p>
    </div>
  );
}

function ScorecardTable({
  scorecard,
  concept,
}: {
  scorecard: CreativeStudioPreviewResult['scorecard'];
  concept: CreativePreviewConcept;
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Score</th>
            <th style={thStyle}>Evidence</th>
          </tr>
        </thead>
        <tbody>
          {scorecard.scores.map((s: (typeof scorecard.scores)[number]) => (
            <tr key={s.category} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{s.label}</td>
              <td style={{ ...tdStyle, fontWeight: 700 }}>{s.scorePct}%</td>
              <td style={tdStyle}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {s.evidence.map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 12 }}>
        <strong>Overall ({concept.label}):</strong> {scorecard.overallConfidencePct}% — {scorecard.summary}
      </p>
    </div>
  );
}

function EvidenceBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <details style={{ marginBottom: 8 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{title}</summary>
      <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: '#374151' }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            {item}
          </li>
        ))}
      </ul>
    </details>
  );
}

const sectionHeading: CSSProperties = {
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 8px',
  color: '#374151',
};

const thStyle: CSSProperties = { textAlign: 'left', padding: '8px 10px' };
const tdStyle: CSSProperties = { padding: '8px 10px', verticalAlign: 'top' };
