import type { CSSProperties } from 'react';
import type { SceneStackHotspotBounds } from '../../../../studio-os-core/scene-stack';

type Props = {
  hotspots: Record<string, SceneStackHotspotBounds | undefined>;
  onContinueToExpansion: () => void;
};

function hotspotStyle(bounds: SceneStackHotspotBounds): CSSProperties {
  return {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  };
}

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
export function InnovationHallInteractions({ hotspots, onContinueToExpansion }: Props) {
  const storytellerBounds = hotspots.storyteller ?? { left: '10%', top: '10%', width: '80%', height: '24%' };
  const prototypesBounds = hotspots.prototypes ?? { left: '6%', top: '40%', width: '88%', height: '44%' };

  return (
    <>
      <div className="wh-world__hotspot" style={hotspotStyle(storytellerBounds)}>
        <div className="wh-world__glass-embed wh-innovation__storyteller">
          <p className="wh-world__label">Innovation Storyteller™</p>
          <p className="wh-world__hint">
            The inventor wing narrates what your company is becoming — not what it already archived.
          </p>
          <p className="wh-innovation__quote">
            "Every masterpiece in the Museum Wing™ began as an experiment someone was brave enough to stack."
          </p>
        </div>
      </div>

      <div className="wh-world__hotspot wh-world__hotspot--ghost" style={hotspotStyle(prototypesBounds)}>
        <div className="wh-innovation__bay">
          {INNOVATION_STORIES.map((story, i) => (
            <div key={story.id} className="wh-innovation__pod" style={{ left: `${8 + i * 22}%` }}>
              <div className="wh-innovation__pod-glow" aria-hidden />
              <p className="wh-innovation__pod-title">{story.title}</p>
              <p className="wh-innovation__pod-sub">{story.subtitle}</p>
              <span className="wh-innovation__pod-status">{story.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wh-world__hotspot" style={{ left: '20%', top: '86%', width: '60%', height: '8%' }}>
        <button type="button" className="wh-world__enter-btn" onClick={onContinueToExpansion}>
          Continue to Company Genome Vault™ →
        </button>
      </div>
    </>
  );
}

/**
 * Future Expansion Wings™ — architectural placeholder for campus growth.
 */
export function FutureExpansionInteractions({
  hotspots,
}: {
  hotspots: Record<string, SceneStackHotspotBounds | undefined>;
}) {
  const baysBounds = hotspots.bays ?? { left: '8%', top: '36%', width: '84%', height: '48%' };

  return (
    <div className="wh-world__hotspot" style={hotspotStyle(baysBounds)}>
      <div className="wh-world__glass-embed wh-expansion__bays">
        <p className="wh-world__label">Future Expansion Wings™</p>
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
  );
}
