import type {
  CanonPage,
  DesignDnaCanonStore,
  DesignDnaPrinciple,
  PageDesignReview,
} from '../../../../studio-os-core/design-dna-canon/types';
import { HEADQUARTERS_REVIEW_CRITERIA } from '../../../../studio-os-core/design-dna-canon/constants';
import { confidenceColor, dnaTheme, statusLabel } from './designDnaCanonTheme';
import { EIA, eiaGrace, eiaPanelLight } from '../executive-ia/executiveIaTheme';

type CanonPageCardProps = {
  page: CanonPage;
  selected: boolean;
  onSelect: () => void;
};

export function CanonPageCard({ page, selected, onSelect }: CanonPageCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left w-full transition-transform active:scale-[0.98]"
      style={{
        ...eiaPanelLight,
        padding: '12px 14px',
        border: selected ? `2px solid ${EIA.red}` : EIA.border,
        background: selected ? 'rgba(235,28,36,0.05)' : dnaTheme.marble,
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <p style={{ ...dnaTheme.label, color: selected ? EIA.red : EIA.black }}>{page.label}</p>
        <span
          style={{
            ...dnaTheme.caption,
            fontSize: '7px',
            color: dnaTheme.protected,
            border: `1px solid ${dnaTheme.protected}`,
            padding: '1px 4px',
          }}
        >
          {page.status.toUpperCase()}
        </span>
      </div>
      <p style={{ ...dnaTheme.caption, marginTop: 4 }}>{page.route}</p>
      <p style={{ ...eiaGrace, fontSize: '14px', marginTop: 6 }}>{page.dominantEmotion}</p>
      <p style={{ ...dnaTheme.caption, marginTop: 4, color: EIA.black }}>{page.roomMetaphor}</p>
    </button>
  );
}

type CanonPageDetailProps = {
  page: CanonPage;
};

export function CanonPageDetail({ page }: CanonPageDetailProps) {
  return (
    <div className="space-y-4">
      <div>
        <p style={dnaTheme.caption}>ROOM · {page.roomMetaphor}</p>
        <p style={{ ...eiaGrace, fontSize: '20px', marginTop: 4 }}>{page.dominantEmotion}</p>
      </div>
      <DetailList title="VISUAL RELATIONSHIPS" items={page.visualRelationships} />
      <DetailList title="VISUAL RHYTHM" items={page.rhythmNotes} />
      <DetailList title="INTERACTION PHILOSOPHY" items={page.interactionNotes} />
      <p
        style={{
          ...dnaTheme.caption,
          color: dnaTheme.protected,
          borderLeft: `3px solid ${dnaTheme.protected}`,
          paddingLeft: 8,
        }}
      >
        {page.protectedNote}
      </p>
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p style={{ ...dnaTheme.label, color: EIA.gray, marginBottom: 6 }}>{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} style={{ ...dnaTheme.caption, color: EIA.black }}>
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type PrincipleGridProps = {
  principles: DesignDnaPrinciple[];
  categoryFilter?: string;
};

export function PrincipleGrid({ principles, categoryFilter }: PrincipleGridProps) {
  const filtered = categoryFilter
    ? principles.filter((p) => p.category === categoryFilter)
    : principles;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {filtered.map((p) => (
        <div
          key={p.id}
          style={{ ...eiaPanelLight, padding: '12px 14px', background: dnaTheme.glass }}
        >
          <p style={{ ...dnaTheme.label, fontSize: '8px' }}>{p.title}</p>
          <p style={{ ...dnaTheme.caption, color: EIA.black, marginTop: 4 }}>{p.body}</p>
          <p style={{ ...eiaGrace, fontSize: '12px', marginTop: 6 }}>{p.whyItMatters}</p>
        </div>
      ))}
    </div>
  );
}

type DesignReviewPanelProps = {
  review: PageDesignReview;
  onMarkPassed?: () => void;
  onMarkRefinement?: () => void;
};

export function DesignReviewPanel({ review, onMarkPassed, onMarkRefinement }: DesignReviewPanelProps) {
  const color = confidenceColor(review.confidenceScore);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p style={{ ...dnaTheme.label }}>{review.pageLabel}</p>
          <p style={dnaTheme.caption}>{review.route}</p>
        </div>
        <div className="text-right">
          <p style={{ ...eiaGrace, fontSize: '28px', color }}>{review.confidenceScore}%</p>
          <p style={dnaTheme.caption}>CONFIDENCE</p>
          <p style={{ ...dnaTheme.label, fontSize: '7px', color, marginTop: 2 }}>
            {statusLabel(review.status)}
          </p>
        </div>
      </div>

      <div
        style={{
          ...eiaPanelLight,
          padding: '10px 12px',
          borderLeft: `3px solid ${color}`,
        }}
      >
        <p style={{ ...dnaTheme.label, fontSize: '8px' }}>FINAL TEST</p>
        <p style={{ ...dnaTheme.caption, color: EIA.black, marginTop: 4 }}>{review.finalTestAnswer}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {HEADQUARTERS_REVIEW_CRITERIA.map((c) => {
          const score = review.criteria[c.id];
          return (
            <div
              key={c.id}
              style={{ ...eiaPanelLight, padding: '8px 10px', background: 'rgba(255,255,255,0.5)' }}
            >
              <div className="flex justify-between gap-2">
                <p style={{ ...dnaTheme.label, fontSize: '7px' }}>{c.label}</p>
                <p style={{ ...eiaGrace, fontSize: '14px', color: confidenceColor(score.score) }}>
                  {score.score}
                </p>
              </div>
              <p style={{ ...dnaTheme.caption, fontSize: '7px', marginTop: 2 }}>{score.note}</p>
            </div>
          );
        })}
      </div>

      {review.isNewPage && review.status !== 'passed' ? (
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={onMarkRefinement}
            style={{
              ...dnaTheme.label,
              fontSize: '8px',
              padding: '6px 12px',
              border: `1px solid ${EIA.red}`,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            NEEDS REFINEMENT
          </button>
          <button
            type="button"
            onClick={onMarkPassed}
            style={{
              ...dnaTheme.label,
              fontSize: '8px',
              padding: '6px 12px',
              border: `1px solid ${dnaTheme.protected}`,
              background: 'rgba(5,150,105,0.08)',
              cursor: 'pointer',
            }}
          >
            MARK REVIEW COMPLETE
          </button>
        </div>
      ) : null}
    </div>
  );
}

type ReviewSelectorProps = {
  reviews: PageDesignReview[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ReviewSelector({ reviews, selectedId, onSelect }: ReviewSelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {reviews.map((r) => {
        const selected = r.id === selectedId;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className="text-left"
            style={{
              ...eiaPanelLight,
              padding: '10px 12px',
              border: selected ? `2px solid ${EIA.red}` : EIA.border,
              background: selected ? 'rgba(235,28,36,0.05)' : dnaTheme.marble,
              cursor: 'pointer',
            }}
          >
            <p style={{ ...dnaTheme.label, fontSize: '8px' }}>{r.pageLabel}</p>
            <p style={{ ...eiaGrace, fontSize: '16px', color: confidenceColor(r.confidenceScore) }}>
              {r.confidenceScore}%
            </p>
            <p style={{ ...dnaTheme.caption, fontSize: '7px' }}>{statusLabel(r.status)}</p>
          </button>
        );
      })}
    </div>
  );
}

type SpatialRoomGridProps = {
  pages: CanonPage[];
  onSelect: (id: CanonPage['id']) => void;
};

export function SpatialRoomGrid({ pages, onSelect }: SpatialRoomGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelect(page.id)}
          className="text-left transition-transform active:scale-[0.98]"
          style={{
            ...eiaPanelLight,
            padding: '14px',
            minHeight: 120,
            background: `linear-gradient(135deg, ${dnaTheme.marble} 0%, rgba(255,255,255,0.4) 100%)`,
            cursor: 'pointer',
          }}
        >
          <p style={{ ...eiaGrace, fontSize: '18px' }}>{page.label}</p>
          <p style={{ ...dnaTheme.caption, marginTop: 6 }}>{page.roomMetaphor}</p>
        </button>
      ))}
    </div>
  );
}

type PhilosophyBlockProps = {
  store: DesignDnaCanonStore;
};

export function PhilosophyBlock({ store }: PhilosophyBlockProps) {
  return (
    <div className="space-y-3">
      <DetailList title="CORE PHILOSOPHY" items={store.philosophy} />
      <DetailList title="CANON PROTECTION" items={store.canonProtection} />
      <DetailList title="VISUAL RELATIONSHIPS · NOT MEASUREMENTS" items={store.visualRelationshipPatterns} />
      <p style={{ ...eiaGrace, fontSize: '16px', textAlign: 'center', marginTop: 8 }}>{store.finalDesignTest}</p>
    </div>
  );
}

export function ConnectedSystemsStrip() {
  return (
    <p style={{ ...dnaTheme.caption, textAlign: 'center', marginTop: 16 }}>
      CONNECTED · CONTENT BRAIN · EXPERIENCE ARCHITECT · PHOTOGRAPHY CREATIVE DNA · PRODUCTION STUDIO ·
      CONCIERGE APPROVAL FLOW · KNOWLEDGE HUB
    </p>
  );
}
