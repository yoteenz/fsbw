import type { CSSProperties } from 'react';
import { useExperienceLabProgram } from '../../../../hooks/useExperienceLabProgram';
import { useExperienceLabIndustryPack } from '../../../../hooks/useExperienceLabIndustryPack';
import { useCreativeStudioPreview } from '../../../../hooks/useCreativeStudioPreview';
import {
  resolveEnvironmentSceneProfile,
  type CreativePreviewConcept,
  type CreativeStudioPreviewResult,
} from '../../../../studio-os-core/creative-studio-preview';
import { resolveInternalPreviewBinding, type CanonicalMainDepartmentId } from '../../../../studio-os-core/canonical-studio-world';
import { useState } from 'react';
import { ExperienceLabProgramSelector } from './ExperienceLabProgramSelector';
import { CanonicalDepartmentTree } from './CanonicalDepartmentTree';
import { CanonicalDepartmentBatchPanel } from './CanonicalDepartmentBatchPanel';
import { CanonicalDepartmentQueuePanel } from './CanonicalDepartmentQueuePanel';
import { IndustryPackSelector } from './IndustryPackSelector';
import { IndustryPackDepartmentTree } from './IndustryPackDepartmentTree';
import { FounderModRegistryPanel } from './FounderModRegistryPanel';
import { CreativeStudioRenderPreview } from './CreativeStudioRenderPreview';
import { BlueprintAuthorExperienceLabGate } from './BlueprintAuthorExperienceLabGate';
import { useCanonicalDepartmentQueue } from '../../../../hooks/useCanonicalDepartmentQueue';

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

/** Experience Lab admin — Program A (canonical departments) + Program B (Industry Packs). */
export function CreativeIntelligencePanel() {
  const { program, selectProgram, isStudioWorldProgram, isIndustryPacksProgram } = useExperienceLabProgram();
  const [selectedCanonicalId, setSelectedCanonicalId] = useState<CanonicalMainDepartmentId | null>('experience-lab');
  const canonicalQueue = useCanonicalDepartmentQueue();

  const {
    packOptionId,
    packOptions,
    packOption,
    industryPack,
    headquartersPlan,
    companyHqOrganizationId,
    selectPackOption,
  } = useExperienceLabIndustryPack('hair-brand');

  const previewBinding = resolveInternalPreviewBinding(packOptionId);

  const {
    conceptId,
    blindMode,
    blindTestResult,
    preview,
    activeConcept,
    setConceptId,
    toggleBlindMode,
    recordBlindTest,
    recompile,
  } = useCreativeStudioPreview(previewBinding);

  return (
    <div data-xelab-mode="creative-intelligence" style={{ background: '#fafafa', minHeight: '60vh' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
          STUDIO WORLD ADMIN — EXPERIENCE LAB™
        </p>
        <h1 style={{ margin: '4px 0 8px', fontSize: '16px' }}>Canonical Department & Industry Pack Generator</h1>
        <p style={{ margin: 0, color: '#555', fontSize: '11px' }}>
          Program A: Studio World infrastructure · Program B: Industry Headquarters Packs. Founders never enter Experience Lab.
        </p>
        <div style={{ marginTop: 12 }}>
          <button type="button" style={btnStyle} onClick={recompile} disabled>
            Recompile previews (after approval)
          </button>
          {isIndustryPacksProgram ? (
            <button
              type="button"
              style={{ ...btnStyle, fontWeight: blindMode ? 800 : 400, borderColor: blindMode ? '#2563eb' : '#333' }}
              onClick={toggleBlindMode}
            >
              {blindMode ? 'Exit blind test' : 'Blind industry test'}
            </button>
          ) : null}
        </div>
      </header>

      <ExperienceLabProgramSelector program={program} onSelect={selectProgram} />

      {isStudioWorldProgram ? (
        <>
          <CanonicalDepartmentTree
            selectedDepartmentId={selectedCanonicalId}
            onSelect={setSelectedCanonicalId}
            renderStatusByDepartment={canonicalQueue.renderStatusByDepartment()}
          />
          <CanonicalDepartmentBatchPanel
            selectedDepartmentId={selectedCanonicalId}
            onQueue={canonicalQueue.submitBatch}
            submitting={canonicalQueue.submitting}
            submitError={canonicalQueue.error}
          />
          <CanonicalDepartmentQueuePanel
            queue={canonicalQueue.queue}
            loading={canonicalQueue.loading}
            error={canonicalQueue.error}
            onRefresh={() => void canonicalQueue.refresh()}
          />
        </>
      ) : null}

      {isIndustryPacksProgram ? (
        <>
          <section style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>
              Industry Pack departments belong to founder headquarters templates — not canonical Studio World infrastructure.
            </p>
          </section>
          <IndustryPackSelector packOptionId={packOptionId} options={packOptions} onSelect={selectPackOption} />
          {industryPack && headquartersPlan?.ok ? (
            <IndustryPackDepartmentTree pack={industryPack} plan={headquartersPlan.plan} />
          ) : null}
          {packOptionId === 'hair-brand' || packOptionId === 'hair-salon' ? <FounderModRegistryPanel /> : null}
          {blindMode ? (
            <BlindValidationBanner
              result={blindTestResult}
              onRecord={recordBlindTest}
              industryTarget={packOption?.displayName ?? resolveEnvironmentSceneProfile(previewBinding, conceptId).industryTarget}
            />
          ) : null}
          <>
            <ConceptSwitcher concepts={preview.concepts} activeId={conceptId} onSelect={setConceptId} blindMode={blindMode} />
            <PreviewFlow
              preview={preview}
              concept={activeConcept}
              conceptId={conceptId}
              blindMode={blindMode}
              packOptionId={packOptionId}
              industryPackId={packOption?.industryPackId ?? 'official-hair-brand'}
              companyHqOrganizationId={companyHqOrganizationId}
            />
          </>
        </>
      ) : null}
    </div>
  );
}

function BlindValidationBanner({
  result,
  onRecord,
  industryTarget,
}: {
  result: 'pass' | 'fail' | null;
  onRecord: (r: 'pass' | 'fail') => void;
  industryTarget: string;
}) {
  return (
    <section style={{ ...sectionStyle, background: '#eff6ff', borderBottom: '1px solid #bfdbfe', paddingTop: 16 }}>
      <h2 style={{ ...sectionHeading, color: '#1e40af' }}>Blind pass / fail test</h2>
      <p style={{ margin: '0 0 12px', lineHeight: 1.6, color: '#1e3a5f' }}>
        All branding hidden. Show the preview to someone unfamiliar with the project. Can they identify the industry
        within 5 seconds?
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" style={{ ...btnStyle, borderColor: '#16a34a' }} onClick={() => onRecord('pass')}>
          PASS — industry recognized
        </button>
        <button type="button" style={{ ...btnStyle, borderColor: '#dc2626' }} onClick={() => onRecord('fail')}>
          FAIL — industry unclear
        </button>
      </div>
      {result === 'pass' ? (
        <p style={{ margin: '12px 0 0', padding: 10, background: '#ecfdf5', borderRadius: 8, color: '#166534' }}>
          PASS recorded — environmental intelligence validated. Expected industry: {industryTarget}
        </p>
      ) : null}
      {result === 'fail' ? (
        <p style={{ margin: '12px 0 0', padding: 10, background: '#fef2f2', borderRadius: 8, color: '#991b1b' }}>
          FAIL recorded — environment did not communicate identity. Revisit architecture, materials, and circulation.
          Expected: {industryTarget}
        </p>
      ) : null}
    </section>
  );
}

function ConceptSwitcher({
  concepts,
  activeId,
  onSelect,
  blindMode,
}: {
  concepts: CreativePreviewConcept[];
  activeId: 'a' | 'b' | 'c';
  onSelect: (id: 'a' | 'b' | 'c') => void;
  blindMode: boolean;
}) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionHeading}>{blindMode ? 'Preview variant' : '2. Preview A / B / C'}</h2>
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
            <strong>{blindMode ? `Preview ${c.conceptId.toUpperCase()}` : c.label}</strong>
            {!blindMode ? (
              <span style={{ display: 'block', fontSize: '10px', color: '#666', marginTop: 4 }}>
                {c.tier.toUpperCase()} · {c.confidencePct}% confidence
              </span>
            ) : (
              <span style={{ display: 'block', fontSize: '10px', color: '#666', marginTop: 4 }}>
                {c.confidencePct}% confidence
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function PreviewFlow({
  preview,
  concept,
  conceptId,
  blindMode,
  packOptionId,
  industryPackId,
  companyHqOrganizationId,
}: {
  preview: CreativeStudioPreviewResult;
  concept: CreativePreviewConcept;
  conceptId: 'a' | 'b' | 'c';
  blindMode: boolean;
  packOptionId: import('../../../../studio-os-core/canonical-studio-world').ExperienceLabIndustryPackOptionId;
  industryPackId: string;
  companyHqOrganizationId: string;
}) {
  const spec = concept.specification;
  const sceneProfile = resolveEnvironmentSceneProfile(preview.companyId, conceptId);

  return (
    <>
      <section style={sectionStyle}>
        <h2 style={sectionHeading}>{blindMode ? 'Environment — no branding' : '3. HQ Founder Render planning'}</h2>
        <BlueprintAuthorExperienceLabGate
          packOptionId={packOptionId}
          industryPackId={industryPackId}
          companyHqOrganizationId={companyHqOrganizationId}
          conceptId={conceptId}
          defaultIntent={`${concept.label} — ${sceneProfile.industryTarget} headquarters from Industry Pack`}
        >
          <CreativeStudioRenderPreview
            companyId={preview.companyId}
            conceptId={conceptId}
            blindMode={blindMode}
          />
        </BlueprintAuthorExperienceLabGate>
        {!blindMode ? (
          <EnvironmentIntelligenceSummary profile={sceneProfile} spec={spec} />
        ) : null}
        {!blindMode ? (
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}>Full specification (secondary)</summary>
            <SpecGrid spec={spec} />
          </details>
        ) : null}
      </section>

      {!blindMode ? (
        <>
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
      ) : null}
    </>
  );
}

function EnvironmentIntelligenceSummary({
  profile,
  spec,
}: {
  profile: ReturnType<typeof resolveEnvironmentSceneProfile>;
  spec: CreativeStudioPreviewResult['concepts'][0]['specification'];
}) {
  const rows: [string, string][] = [
    ['Atmosphere', profile.atmosphere],
    ['Circulation', profile.circulation],
    ['Implied workflow', profile.impliedWorkflow],
    ['Emotional tone', profile.emotionalTone],
    ['Spatial hierarchy', spec.spatialHierarchy],
    ['Environmental storytelling', spec.environmentalStorytelling],
  ];

  return (
    <dl style={{ margin: '12px 0 0', display: 'grid', gap: 8 }}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>{label}</dt>
          <dd style={{ margin: '2px 0 0', lineHeight: 1.5 }}>{value}</dd>
        </div>
      ))}
      <div>
        <dt style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>Architectural keywords</dt>
        <dd style={{ margin: '4px 0 0', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {profile.architecturalKeywords.map((kw) => (
            <span key={kw} style={{ fontSize: '10px', padding: '2px 8px', background: '#f3f4f6', borderRadius: 99 }}>
              {kw}
            </span>
          ))}
        </dd>
      </div>
    </dl>
  );
}

function SpecGrid({ spec }: { spec: CreativeStudioPreviewResult['concepts'][0]['specification'] }) {
  const rows: [string, string | string[]][] = [
    ['Design philosophy', spec.designPhilosophy],
    ['Interior architecture', spec.interiorArchitecture],
    ['Material system', spec.materialSystem],
    ['Lighting language', spec.lightingLanguage],
    ['Spatial organization', spec.spatialOrganization],
    ['Furniture language', spec.furnitureLanguage],
    ['Department relationships', spec.departmentRelationships],
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
