import type { SceneStackHotspotBounds } from '../../../../studio-os-core/scene-stack';
import type { LivingArchitectureSnapshot } from '../../../../studio-os-core/living-architecture';
import { museumGalleryCount, prototypeVaultBayCount } from '../../../../studio-os-core/living-architecture';

type Props = {
  hotspots: Record<string, SceneStackHotspotBounds | undefined>;
  onContinueToExpansion: () => void;
  livingArchitecture?: LivingArchitectureSnapshot | null;
};

const INNOVATION_STORIES = [
  {
    id: 'inv-01',
    title: 'Scene Stack™ Campus Model',
    subtitle: 'One continuous headquarters — districts instead of pages',
    status: 'LIVE',
    unlockTier: 0,
  },
  {
    id: 'inv-02',
    title: 'Living Legacy Wing',
    subtitle: 'Golden Builds™ auto-archive into walkable exhibits',
    status: 'ACTIVE',
    unlockTier: 1,
  },
  {
    id: 'inv-03',
    title: 'Adaptive Orb Personalities',
    subtitle: 'Production assistant · Historian · Inventor — same Orb, new voice',
    status: 'PROTOTYPE',
    unlockTier: 1,
  },
  {
    id: 'inv-04',
    title: 'Expansion Bay Generator',
    subtitle: 'Future districts manifest as company maturity unlocks',
    status: 'QUEUED',
    unlockTier: 2,
  },
];

/**
 * Hall of Innovation™ — storyteller and inventor wing inside the warehouse campus.
 */
export function InnovationHallInteractions({
  onContinueToExpansion,
  livingArchitecture,
}: Props) {
  const innovationTier = livingArchitecture?.districts['innovation-district']?.tier ?? 0;

  return (
    <div className="wh-wing-panel">
      <div className="wh-wing-panel__frame wh-wing-panel__frame--compact">
        <div className="wh-wing-panel__scroll wh-innovation__storyteller">
          <p className="wh-world__label">Innovation Storyteller™</p>
          <p className="wh-world__hint">
            The inventor wing narrates what your company is becoming — not what it already archived.
          </p>
          <p className="wh-innovation__quote">
            "Every masterpiece in the Museum Wing™ began as an experiment someone was brave enough to stack."
          </p>
          {livingArchitecture?.districts['innovation-district']?.latestMilestone ? (
            <p className="wh-world__hint" style={{ marginTop: 8, color: '#8ba4c4' }}>
              {livingArchitecture.districts['innovation-district'].latestMilestone!.architecturalChange}
            </p>
          ) : null}
        </div>
      </div>

      <div className="wh-wing-panel__frame">
        <div className="wh-wing-panel__scroll">
          <div className="wh-innovation__bay">
            {INNOVATION_STORIES.map((story) => {
              const unlocked = innovationTier >= story.unlockTier;
              return (
                <div
                  key={story.id}
                  className={`wh-innovation__pod${unlocked ? ' is-unlocked' : ''}`}
                >
                  <div className="wh-innovation__pod-glow" aria-hidden />
                  <p className="wh-innovation__pod-title">{story.title}</p>
                  <p className="wh-innovation__pod-sub">{story.subtitle}</p>
                  <span className="wh-innovation__pod-status">
                    {unlocked ? story.status : 'AWAITING MILESTONE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="wh-wing-panel__frame wh-wing-panel__frame--compact">
        <button type="button" className="wh-world__enter-btn" onClick={onContinueToExpansion}>
          Continue to Company Genome Vault™ →
        </button>
      </div>
    </div>
  );
}

type ExpansionProps = {
  livingArchitecture?: LivingArchitectureSnapshot | null;
};

/**
 * Future Expansion Wings™ — architectural bays that commission as progress is earned.
 */
export function FutureExpansionInteractions({ livingArchitecture }: ExpansionProps) {
  const bayCount = livingArchitecture ? prototypeVaultBayCount(livingArchitecture) : 3;
  const warehouseTier = livingArchitecture?.districts.warehouse?.tier ?? 0;
  const tierClass = warehouseTier > 0 ? ` is-tier-${warehouseTier}` : '';

  const bayLabels = [
    'Research Institute™',
    'AI Laboratory™',
    'Patent Vault™',
    'Talent Archive™',
    'Motion Studio™',
    'Audio Conservatory™',
  ];

  return (
    <div className="wh-wing-panel">
      <div className="wh-wing-panel__frame">
        <div className="wh-wing-panel__scroll wh-expansion__bays">
          <p className="wh-world__label">Future Expansion Wings™ · Prototype Vault™</p>
          <p className="wh-world__hint">
            {bayCount} of {bayLabels.length} production bays commissioned — earned through asset production and reuse.
          </p>
          <p className="wh-expansion__manifest">
            The campus is alive. It grows as your company grows. No loading screens. No separate applications.
          </p>
          <div className={`wh-expansion__frames${tierClass}`} aria-label="Expansion bays">
            {bayLabels.map((label, i) => (
              <span
                key={label}
                className={`wh-expansion__frame${
                  i < bayCount ? ' wh-expansion__frame--commissioned' : ' wh-expansion__frame--ghost'
                }`}
                title={label}
              />
            ))}
          </div>
          {livingArchitecture?.districts.warehouse?.latestMilestone ? (
            <p className="wh-world__hint" style={{ marginTop: 10, color: '#c9a962' }}>
              {livingArchitecture.districts.warehouse.latestMilestone.architecturalChange}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Museum gallery count derived from living architecture tier */
export function livingMuseumGalleryCount(livingArchitecture?: LivingArchitectureSnapshot | null): number {
  return livingArchitecture ? museumGalleryCount(livingArchitecture) : 2;
}
