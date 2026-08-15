import { useState } from 'react';
import type { RoadmapItem } from '../roadmap/roadmapTypes';
import { ROADMAP_CATEGORY_LABELS, ROADMAP_STATUS_LABELS } from '../roadmap/roadmapTypes';

const statusClass: Record<RoadmapItem['status'], string> = {
  completed: 'aio-badge--complete',
  in_progress: 'aio-badge--progress',
  recommended: 'aio-badge--needed',
  needs_review: 'aio-badge--alert',
  not_sure: 'aio-badge--alert',
  optional: 'aio-badge--optional',
  not_applicable: 'aio-badge--needed',
};

export function RoadmapItemCard({ item }: { item: RoadmapItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="aio-roadmap-item">
      <div className="aio-roadmap-item__header">
        <div>
          <h3 className="aio-roadmap-item__title">{item.title}</h3>
          {item.acronym && item.acronymExplanation && (
            <p className="aio-roadmap-item__acronym">
              <strong>{item.acronym}:</strong> {item.acronymExplanation}
            </p>
          )}
          <p className="aio-roadmap-item__desc">{item.description}</p>
        </div>
        <span className={`aio-badge ${statusClass[item.status]}`}>{ROADMAP_STATUS_LABELS[item.status]}</span>
      </div>
      <button
        type="button"
        className="aio-roadmap-item__why"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        Why am I seeing this? {expanded ? '▲' : '▼'}
      </button>
      {expanded && <p className="aio-roadmap-item__reason">{item.reason}</p>}
    </article>
  );
}

export function RoadmapProgressBars({
  complianceProgress,
  businessServicesProgress,
}: {
  complianceProgress: number;
  businessServicesProgress: number;
}) {
  return (
    <div className="aio-roadmap-progress-bars">
      <div className="aio-roadmap-progress-bar">
        <div className="aio-roadmap-progress-bar__header">
          <span>Setup / Compliance Progress</span>
          <span>{complianceProgress}%</span>
        </div>
        <div className="aio-roadmap-progress-bar__track" role="progressbar" aria-valuenow={complianceProgress} aria-valuemin={0} aria-valuemax={100}>
          <div className="aio-roadmap-progress-bar__fill" style={{ width: `${complianceProgress}%` }} />
        </div>
        <p className="aio-roadmap-progress-bar__note">Optional services like factoring do not affect this score.</p>
      </div>
      <div className="aio-roadmap-progress-bar">
        <div className="aio-roadmap-progress-bar__header">
          <span>Business Services</span>
          <span>{businessServicesProgress}%</span>
        </div>
        <div className="aio-roadmap-progress-bar__track" role="progressbar" aria-valuenow={businessServicesProgress} aria-valuemin={0} aria-valuemax={100}>
          <div className="aio-roadmap-progress-bar__fill aio-roadmap-progress-bar__fill--services" style={{ width: `${businessServicesProgress}%` }} />
        </div>
      </div>
    </div>
  );
}

export function RoadmapCategoryGroup({ category, items }: { category: string; items: RoadmapItem[] }) {
  if (items.length === 0) return null;
  const label = ROADMAP_CATEGORY_LABELS[items[0].category as keyof typeof ROADMAP_CATEGORY_LABELS] ?? category;

  return (
    <section className="aio-roadmap-category">
      <h2 className="aio-roadmap-category__title">{label.toUpperCase()}</h2>
      <div className="aio-roadmap-category__items">
        {items.map((item) => (
          <RoadmapItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
