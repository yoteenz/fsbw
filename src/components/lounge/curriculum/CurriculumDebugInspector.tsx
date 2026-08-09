import { useMemo, useState } from 'react';
import type { CurriculumBibleEntry, CurriculumStatus, EducationPillar } from '../../../content/education/types';
import {
  getAllCurriculumBibleEntries,
  getCurriculumBibleEntriesByPillar,
  validateCurriculumRegistry,
  curriculumRefLabel,
} from '../../../content/education/curriculum/registry';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';

type FilterState = {
  pillar: EducationPillar | 'all';
  status: CurriculumStatus | 'all';
  contentType: CurriculumBibleEntry['contentType'] | 'all';
};

export function CurriculumDebugInspector() {
  if (!import.meta.env.DEV) return null;

  const [filter, setFilter] = useState<FilterState>({
    pillar: 'all',
    status: 'all',
    contentType: 'all',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const issues = useMemo(() => validateCurriculumRegistry(), []);
  const entries = useMemo(() => {
    let list = getAllCurriculumBibleEntries();
    if (filter.pillar !== 'all') list = getCurriculumBibleEntriesByPillar(filter.pillar);
    if (filter.status !== 'all') list = list.filter((e) => e.status === filter.status);
    if (filter.contentType !== 'all') list = list.filter((e) => e.contentType === filter.contentType);
    return list;
  }, [filter]);

  const selected = entries.find((e) => e.id === selectedId) ?? entries[0] ?? null;

  return (
    <details
      style={{
        marginTop: loungeTvGlassCqw(1, 2.5, 5),
        padding: loungeTvGlassCqw(1, 2.5, 5),
        background: 'rgba(40,20,80,0.14)',
        border: '1px dashed rgba(140,100,220,0.55)',
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
        color: LOUNGE_TV_TEXT_GRAY,
        textTransform: 'none',
      }}
    >
      <summary style={{ cursor: 'pointer', letterSpacing: '0.04em', color: LOUNGE_TV_TEXT_WHITE }}>
        CURRICULUM BIBLE DEBUG ({entries.length} entries · {issues.length} issues)
      </summary>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        <FilterSelect
          label="Pillar"
          value={filter.pillar}
          options={['all', 'lace', 'color', 'style', 'care']}
          onChange={(v) => setFilter((f) => ({ ...f, pillar: v as FilterState['pillar'] }))}
        />
        <FilterSelect
          label="Status"
          value={filter.status}
          options={['all', 'planned', 'in-development', 'production', 'published']}
          onChange={(v) => setFilter((f) => ({ ...f, status: v as FilterState['status'] }))}
        />
        <FilterSelect
          label="Type"
          value={filter.contentType}
          options={['all', 'psa-today', 'slay-tip', 'care', 'care-route']}
          onChange={(v) =>
            setFilter((f) => ({ ...f, contentType: v as FilterState['contentType'] }))
          }
        />
      </div>

      {issues.length > 0 ? (
        <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', color: '#ffb4a2' }}>
          {JSON.stringify(issues, null, 2)}
        </pre>
      ) : (
        <p style={{ margin: '10px 0 0', color: '#8fd4a0' }}>Anti-overlap validation: no issues.</p>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        <select
          value={selected?.id ?? ''}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ flex: '1 1 200px', minWidth: 200 }}
        >
          {entries.map((e) => (
            <option key={e.id} value={e.id}>
              {e.curriculumCode} · {e.title} ({e.status})
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(formatEntryForDebug(selected), null, 2)}
        </pre>
      ) : null}
    </details>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.85em' }}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatEntryForDebug(entry: CurriculumBibleEntry) {
  return {
    curriculumCode: entry.curriculumCode,
    id: entry.id,
    title: entry.title,
    pillar: entry.pillar,
    contentType: entry.contentType,
    role: entry.role,
    lifecyclePhase: entry.lifecyclePhase,
    status: entry.status,
    linkedContentId: entry.linkedContentId ?? null,
    primaryLearningObjective: entry.primaryLearningObjective,
    ownsConcepts: entry.ownsConcepts,
    referencesConcepts: entry.referencesConcepts ?? [],
    excludesConcepts: entry.excludesConcepts ?? [],
    prerequisites: (entry.prerequisiteContentIds ?? []).map((id) => ({
      id,
      label: curriculumRefLabel(id),
    })),
    recommendedNext: (entry.recommendedNextIds ?? []).map((id) => ({
      id,
      label: curriculumRefLabel(id),
    })),
    diagnosticRoutes: (entry.diagnosticRouteIds ?? []).map((id) => ({
      id,
      label: curriculumRefLabel(id),
    })),
    companionSlayTips: entry.companionSlayTipIds ?? [],
    companionSlayTipConceptSlots: entry.companionSlayTipConceptSlots ?? [],
    relatedCare: (entry.relatedCareIds ?? []).map((id) => ({
      id,
      label: curriculumRefLabel(id),
    })),
    classKitRequirements: entry.classKitRequirements ?? [],
    cameraAResponsibility: entry.cameraAResponsibility ?? [],
    cameraBDemonstration: entry.cameraBDemonstration ?? [],
    cameraBVisualRequirements: entry.cameraBVisualRequirements ?? [],
    criticalSuccessInformation: entry.criticalSuccessInformation ?? [],
    antiOverlapNotes: entry.antiOverlapNotes ?? [],
    editorialNotes: entry.editorialNotes ?? [],
  };
}
