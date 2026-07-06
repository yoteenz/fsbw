import type {
  DesignGenomeEntry,
  DesignGenomeStore,
  DesignGenomeVersion,
  PendingPromotion,
  PreBuildReview,
  DesignMemoryMatch,
} from '../../../../studio-os-core/design-genome/types';
import { PROMOTION_LEVELS } from '../../../../studio-os-core/design-genome/constants';
import { genomeTheme, recommendationColor } from './designGenomeTheme';
import { EIA, eiaGrace, eiaPanelLight } from '../executive-ia/executiveIaTheme';

type EntryCardProps = {
  entry: DesignGenomeEntry;
  selected: boolean;
  onSelect: () => void;
};

export function GenomeEntryCard({ entry, selected, onSelect }: EntryCardProps) {
  const current = entry.versions.find((v) => v.status === 'current');
  const versionCount = entry.versions.length;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left w-full"
      style={{
        ...eiaPanelLight,
        padding: '12px 14px',
        border: selected ? `2px solid ${EIA.red}` : EIA.border,
        background: selected ? 'rgba(235,28,36,0.05)' : 'rgba(255,255,255,0.72)',
        cursor: 'pointer',
      }}
    >
      <div className="flex justify-between gap-2">
        <p style={{ ...genomeTheme.label, color: selected ? EIA.red : EIA.black }}>{entry.title}</p>
        <span style={{ ...genomeTheme.caption, fontSize: '7px' }}>v{current?.versionNumber ?? 1}</span>
      </div>
      <p style={{ ...genomeTheme.caption, marginTop: 4 }}>
        {entry.level.replace(/-/g, ' ').toUpperCase()} · {entry.scope.replace(/-/g, ' ').toUpperCase()}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {entry.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            style={{
              ...genomeTheme.caption,
              fontSize: '6px',
              border: `1px solid ${EIA.gray}`,
              padding: '1px 4px',
            }}
          >
            {tag.toUpperCase()}
          </span>
        ))}
      </div>
      {versionCount > 1 ? (
        <p style={{ ...genomeTheme.caption, marginTop: 4 }}>{versionCount} VERSIONS · LINEAGE {entry.referencedBy.length}</p>
      ) : null}
    </button>
  );
}

type EntryDetailProps = {
  entry: DesignGenomeEntry;
  current: DesignGenomeVersion;
};

export function GenomeEntryDetail({ entry, current }: EntryDetailProps) {
  return (
    <div className="space-y-4">
      <div>
        <p style={genomeTheme.caption}>FOUNDER · "{current.founderPhrase}"</p>
        <p style={{ ...eiaGrace, fontSize: '18px', marginTop: 6 }}>{current.reasoning.summary}</p>
      </div>

      <DetailBlock title="APPROVED BECAUSE" items={current.reasoning.approvedBecause} />
      <DetailBlock title="INFORMATION HIERARCHY" items={current.analysis.informationHierarchy} />
      <DetailBlock title="VISUAL RHYTHM" items={current.analysis.visualRhythm} />
      <DetailBlock title="INTERACTION STYLE" items={current.analysis.interactionStyle} />
      <DetailBlock title="LUXURY CHARACTERISTICS" items={current.analysis.luxuryCharacteristics} />

      <div>
        <p style={{ ...genomeTheme.label, color: EIA.gray, marginBottom: 6 }}>AUTO-CAPTURED STRUCTURE</p>
        <p style={{ ...genomeTheme.caption, color: EIA.black }}>{current.capture.structureSummary}</p>
        <p style={{ ...genomeTheme.caption, marginTop: 4 }}>{current.capture.componentPath}</p>
        <p style={{ ...genomeTheme.caption, marginTop: 2 }}>{current.capture.route}</p>
      </div>

      {entry.references.length > 0 || entry.referencedBy.length > 0 ? (
        <div>
          <p style={{ ...genomeTheme.label, color: EIA.gray, marginBottom: 6 }}>LINEAGE</p>
          {entry.references.length > 0 ? (
            <p style={genomeTheme.caption}>References · {entry.references.join(', ')}</p>
          ) : null}
          {entry.referencedBy.length > 0 ? (
            <p style={{ ...genomeTheme.caption, marginTop: 2 }}>
              Referenced by · {entry.referencedBy.join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}

      {entry.versions.length > 1 ? (
        <div>
          <p style={{ ...genomeTheme.label, color: EIA.gray, marginBottom: 6 }}>VERSION HISTORY</p>
          {entry.versions.map((v) => (
            <p key={v.versionNumber} style={{ ...genomeTheme.caption, color: EIA.black }}>
              v{v.versionNumber} · {v.status.toUpperCase()} · {new Date(v.promotedAt).toLocaleDateString()}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DetailBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p style={{ ...genomeTheme.label, color: EIA.gray, marginBottom: 6 }}>{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} style={{ ...genomeTheme.caption, color: EIA.black }}>
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type PromotionQueueProps = {
  promotions: PendingPromotion[];
  onCapture: (id: string) => void;
};

export function PromotionQueuePanel({ promotions, onCapture }: PromotionQueueProps) {
  const pending = promotions.filter((p) => p.status === 'pending-capture');
  if (pending.length === 0) {
    return <p style={genomeTheme.caption}>No pending promotions — founder approvals appear here automatically.</p>;
  }
  return (
    <div className="space-y-2">
      {pending.map((p) => (
        <div key={p.id} style={{ ...eiaPanelLight, padding: '10px 12px' }}>
          <p style={{ ...genomeTheme.label, fontSize: '8px' }}>{p.pageLabel}</p>
          <p style={{ ...eiaGrace, fontSize: '14px', marginTop: 4 }}>"{p.founderPhrase}"</p>
          <p style={{ ...genomeTheme.caption, marginTop: 4 }}>
            {p.detectedLevel.replace(/-/g, ' ').toUpperCase()} · {p.route}
          </p>
          <button
            type="button"
            onClick={() => onCapture(p.id)}
            style={{
              ...genomeTheme.label,
              fontSize: '7px',
              marginTop: 8,
              padding: '4px 10px',
              border: `1px solid ${genomeTheme.inherit}`,
              background: 'rgba(5,150,105,0.08)',
              cursor: 'pointer',
            }}
          >
            AUTO-CAPTURE & PROMOTE
          </button>
        </div>
      ))}
    </div>
  );
}

type MemorySearchProps = {
  query: string;
  onQueryChange: (q: string) => void;
  matches: DesignMemoryMatch[];
  onRunPreBuild: () => void;
};

export function DesignMemorySearchPanel({
  query,
  onQueryChange,
  matches,
  onRunPreBuild,
}: MemorySearchProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search similar pages · sections · workflows · interactions…"
        className="w-full px-3 py-2 text-[8px] font-futura uppercase"
        style={{ border: EIA.border, background: 'rgba(255,255,255,0.8)' }}
      />
      <button
        type="button"
        onClick={onRunPreBuild}
        style={{
          ...genomeTheme.label,
          fontSize: '8px',
          padding: '6px 12px',
          border: `1px solid ${EIA.red}`,
          background: 'rgba(235,28,36,0.06)',
          cursor: 'pointer',
        }}
      >
        RUN PRE-BUILD REVIEW
      </button>
      {matches.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {matches.map((m) => (
            <div key={m.entryId} style={{ ...eiaPanelLight, padding: '8px 10px' }}>
              <div className="flex justify-between">
                <p style={{ ...genomeTheme.label, fontSize: '7px' }}>{m.title}</p>
                <p style={{ ...eiaGrace, fontSize: '14px', color: recommendationColor(m.recommendation) }}>
                  {m.relevanceScore}%
                </p>
              </div>
              <p style={{ ...genomeTheme.caption, fontSize: '7px', marginTop: 2 }}>{m.matchReason}</p>
              <p
                style={{
                  ...genomeTheme.label,
                  fontSize: '7px',
                  marginTop: 4,
                  color: recommendationColor(m.recommendation),
                }}
              >
                {m.recommendation.replace(/-/g, ' ').toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      ) : query.trim() ? (
        <p style={genomeTheme.caption}>No matching approved patterns — create new for founder approval.</p>
      ) : null}
    </div>
  );
}

type PreBuildReviewPanelProps = {
  review: PreBuildReview;
};

export function PreBuildReviewPanel({ review }: PreBuildReviewPanelProps) {
  return (
    <div className="space-y-3">
      <p style={{ ...genomeTheme.label }}>{review.problem}</p>
      <p style={{ ...eiaGrace, fontSize: '22px', color: recommendationColor(review.recommendation) }}>
        {review.recommendation.replace(/-/g, ' ').toUpperCase()}
      </p>
      <p style={{ ...genomeTheme.caption, color: EIA.black }}>{review.reasoning}</p>
      {review.matches.map((m) => (
        <p key={m.entryId} style={{ ...genomeTheme.caption, fontSize: '7px' }}>
          · {m.title} · {m.relevanceScore}% · {m.recommendation.toUpperCase()}
        </p>
      ))}
    </div>
  );
}

export function FounderPromotionDemo({ onPromote }: { onPromote: (phrase: string, route: string, label: string) => void }) {
  const demos = [
    { phrase: 'Keep this Hero.', route: '/admin/clients', label: 'CLIENT PROFILE' },
    { phrase: 'Promote this timeline.', route: '/admin/studio/executive-timeline', label: 'EXECUTIVE TIMELINE' },
    { phrase: "Don't reuse this.", route: '/admin/pending', label: 'LEGACY PENDING VIEW' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {demos.map((d) => (
        <button
          key={d.phrase}
          type="button"
          onClick={() => onPromote(d.phrase, d.route, d.label)}
          style={{
            ...genomeTheme.label,
            fontSize: '7px',
            padding: '4px 8px',
            border: EIA.border,
            background: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
          }}
        >
          "{d.phrase}"
        </button>
      ))}
    </div>
  );
}

export function PromotionLevelsReference() {
  return (
    <p style={{ ...genomeTheme.caption, lineHeight: 1.6 }}>
      {PROMOTION_LEVELS.map((l) => l.label).join(' · ')}
    </p>
  );
}

export function PhilosophyBlock({ store }: { store: DesignGenomeStore }) {
  return (
    <div className="space-y-2">
      {store.philosophy.map((line) => (
        <p key={line} style={{ ...genomeTheme.caption, color: EIA.black }}>
          · {line}
        </p>
      ))}
      <p style={{ ...eiaGrace, fontSize: '14px', textAlign: 'center', marginTop: 8 }}>{store.preBuildQuestion}</p>
    </div>
  );
}

export function ConnectedSystemsStrip() {
  return (
    <p style={{ ...genomeTheme.caption, textAlign: 'center', marginTop: 16 }}>
      CONNECTED · DESIGN DNA & CANON · EXPERIENCE ARCHITECT · COMPANY GENOME · KNOWLEDGE HUB · STUDIO INTELLIGENCE
    </p>
  );
}
