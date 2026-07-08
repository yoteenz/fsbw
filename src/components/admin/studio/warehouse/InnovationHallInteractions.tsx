import type { SceneStackHotspotBounds } from '../../../../studio-os-core/scene-stack';

type Props = {
  hotspots: Record<string, SceneStackHotspotBounds | undefined>;
  onContinueToExpansion: () => void;
};

const INNOVATION_STORIES = [
  {
    id: 'inv-01',
    title: 'Scene Stack™ Campus Model',
    subtitle: 'One continuous headquarters — districts instead of pages',
    status: 'LIVE',
  },
  {
    id: 'inv-02',
    title: 'Living Legacy Wing',
    subtitle: 'Golden Builds™ auto-archive into walkable exhibits',
    status: 'ACTIVE',
  },
  {
    id: 'inv-03',
    title: 'Adaptive Orb Personalities',
    subtitle: 'Production assistant · Historian · Inventor — same Orb, new voice',
    status: 'PROTOTYPE',
  },
  {
    id: 'inv-04',
    title: 'Expansion Bay Generator',
    subtitle: 'Future districts manifest as company maturity unlocks',
    status: 'QUEUED',
  },
];

/**
 * Hall of Innovation™ — storyteller and inventor wing inside the warehouse campus.
 */
export function InnovationHallInteractions({ onContinueToExpansion }: Props) {
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
        </div>
      </div>

      <div className="wh-wing-panel__frame">
        <div className="wh-wing-panel__scroll">
          <div className="wh-innovation__bay">
            {INNOVATION_STORIES.map((story) => (
              <div key={story.id} className="wh-innovation__pod">
                <div className="wh-innovation__pod-glow" aria-hidden />
                <p className="wh-innovation__pod-title">{story.title}</p>
                <p className="wh-innovation__pod-sub">{story.subtitle}</p>
                <span className="wh-innovation__pod-status">{story.status}</span>
              </div>
            ))}
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

/**
 * Future Expansion Wings™ — architectural placeholder for campus growth.
 */
export function FutureExpansionInteractions() {
  return (
    <div className="wh-wing-panel">
      <div className="wh-wing-panel__frame">
        <div className="wh-wing-panel__scroll wh-expansion__bays">
          <p className="wh-world__label">Future Expansion Wings™ · Prototype Vault™</p>
          <p className="wh-world__hint">
            Empty luxury bays await — Research Institute™, AI Laboratory™, Patent Vault™, Talent Archive™, Motion Studio™, Audio Conservatory™.
          </p>
          <p className="wh-expansion__manifest">
            The campus is alive. It grows as your company grows. No loading screens. No separate applications.
          </p>
          <div className="wh-expansion__frames" aria-hidden>
            <span className="wh-expansion__frame" />
            <span className="wh-expansion__frame" />
            <span className="wh-expansion__frame wh-expansion__frame--ghost" />
          </div>
        </div>
      </div>
    </div>
  );
}
