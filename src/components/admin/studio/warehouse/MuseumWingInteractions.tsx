import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { SceneStackHotspotBounds } from '../../../../studio-os-core/scene-stack';
import type { MuseumExhibit } from '../../../../studio-os-core/studio-museum';
import { LEGACY_WALL_KIND_META } from '../../../../studio-os-core/studio-museum';
import type { useAdminStudioMuseum } from '../../../../hooks/useAdminStudioMuseumState';

type MuseumState = ReturnType<typeof useAdminStudioMuseum>;

type Props = {
  museum: MuseumState;
  hotspots: Record<string, SceneStackHotspotBounds | undefined>;
};

function hotspotStyle(bounds: SceneStackHotspotBounds): CSSProperties {
  return {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  };
}

function ExhibitInstallation({
  exhibit,
  selected,
  visited,
  favorite,
  onSelect,
}: {
  exhibit: MuseumExhibit;
  selected: boolean;
  visited: boolean;
  favorite: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`wh-museum__installation${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
      title={exhibit.title}
    >
      <div className="wh-museum__installation-plate" style={{ background: exhibit.heroGradient }} aria-hidden />
      <p className="wh-museum__installation-title">
        {exhibit.title}
        {favorite ? ' ★' : ''}
        {!visited ? ' · NEW' : ''}
      </p>
      <p className="wh-museum__installation-sub">{exhibit.launchDate}</p>
    </button>
  );
}

/**
 * Museum Wing™ — immersive legacy district inside Studio Warehouse™ campus.
 * Exhibits are physical installations along a walkable Legacy Hall™, not webpage cards.
 */
export function MuseumWingInteractions({ museum, hotspots }: Props) {
  const exhibit = museum.selectedExhibit;

  useEffect(() => {
    if (!museum.replayPlaying || !exhibit?.replaySteps.length) return;
    const step = exhibit.replaySteps[museum.replayStepIndex];
    if (!step) return;
    const timer = window.setTimeout(() => museum.advanceReplay(), step.durationSec * 120);
    return () => window.clearTimeout(timer);
  }, [exhibit, museum.advanceReplay, museum.replayPlaying, museum.replayStepIndex]);

  const legacyHallBounds = hotspots.legacyHall ?? { left: '4%', top: '38%', width: '92%', height: '48%' };
  const historianBounds = hotspots.historian ?? { left: '6%', top: '8%', width: '88%', height: '26%' };
  const exhibitBounds = hotspots.exhibit ?? { left: '8%', top: '12%', width: '84%', height: '72%' };

  return (
    <>
      <div className="wh-world__hotspot wh-world__hotspot--ghost" style={hotspotStyle(legacyHallBounds)}>
        <div className="wh-museum__legacy-hall" aria-label="Legacy Hall™">
          {museum.exhibits.map((ex) => (
            <ExhibitInstallation
              key={ex.id}
              exhibit={ex}
              selected={museum.selectedExhibitId === ex.id}
              visited={museum.isVisited(ex.id)}
              favorite={museum.isFavorite(ex.id)}
              onSelect={() => museum.selectExhibit(ex.id)}
            />
          ))}
          <div className="wh-museum__legacy-wall" aria-label="Legacy Wall™">
            {museum.legacyWall.map((item) => {
              const meta = LEGACY_WALL_KIND_META[item.kind] ?? { icon: item.icon, frameClass: '' };
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`wh-museum__legacy-frame ${meta.frameClass}`}
                  onClick={() => item.exhibitId && museum.selectExhibit(item.exhibitId)}
                >
                  <span aria-hidden>{meta.icon}</span>
                  <span className="wh-museum__legacy-frame-title">{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="wh-world__hotspot" style={hotspotStyle(historianBounds)}>
        <div className="wh-world__glass-embed wh-museum__historian">
          <p className="wh-world__label">Memory Sphere™ · Company Historian</p>
          <div className="wh-museum__orb-glow" aria-hidden />
          <p className="wh-museum__historian-quote">{museum.historianQuote}</p>
          <p className="wh-world__hint">
            {museum.snapshot.totalExhibits} exhibits · ${(museum.snapshot.totalRevenueImpactUsd / 1_000_000).toFixed(1)}M preserved impact
          </p>
        </div>
      </div>

      {exhibit ? (
        <div className="wh-world__hotspot" style={hotspotStyle(exhibitBounds)}>
          <div className="wh-world__glass-embed wh-museum__exhibit-room">
            <p className="wh-world__label">{exhibit.title}</p>
            <p className="wh-world__hint">{exhibit.subtitle} · {exhibit.launchDate}</p>

            <div className="wh-museum__hologram">
              <div className="wh-museum__hologram-plate" style={{ background: exhibit.heroGradient }} aria-hidden />
              <p className="wh-museum__hologram-caption">{exhibit.heroEnvironment}</p>
            </div>

            <div className="wh-museum__rooms">
              {exhibit.rooms.map((room) => (
                <span key={room} className="wh-museum__room-chip">
                  {room}
                </span>
              ))}
            </div>

            {exhibit.timeline.length > 0 ? (
              <div className="wh-museum__timeline">
                <p className="wh-world__label">Time Machine™</p>
                <input
                  type="range"
                  className="wh-museum__timeline-scrub"
                  min={0}
                  max={Math.max(0, exhibit.timeline.length - 1)}
                  value={museum.timelineIndex}
                  onChange={(e) => museum.scrubTimeline(Number(e.target.value))}
                  aria-label="Exhibit timeline"
                />
                {museum.activeTimelineNode ? (
                  <p className="wh-world__hint">
                    {museum.activeTimelineNode.era} · {museum.activeTimelineNode.label} — {museum.activeTimelineNode.summary}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="wh-museum__recipe">
              <p className="wh-world__label">Scene Recipe™</p>
              {exhibit.sceneRecipe.slice(0, 5).map((line) => (
                <p key={line.role} className="wh-museum__recipe-line">
                  {line.role}: {line.assetName} {line.version}
                </p>
              ))}
            </div>

            {exhibit.founderNotes.length > 0 ? (
              <div className="wh-museum__notes">
                <p className="wh-world__label">Founder Notes™</p>
                {exhibit.founderNotes.slice(0, 2).map((note) => (
                  <p key={note} className="wh-museum__note-line">
                    "{note}"
                  </p>
                ))}
              </div>
            ) : null}

            {exhibit.marketplace ? (
              <p className="wh-world__hint">
                Marketplace — {exhibit.marketplace.companiesUsing} companies · ${exhibit.marketplace.revenueUsd.toLocaleString()} revenue
              </p>
            ) : null}

            <div className="wh-world__btn-row">
              <button type="button" className="wh-world__btn" onClick={() => museum.toggleFavorite(exhibit.id)}>
                {museum.isFavorite(exhibit.id) ? 'Unfavorite' : 'Favorite Exhibit'}
              </button>
              <button type="button" className="wh-world__btn" onClick={museum.startReplay}>
                {museum.replayPlaying ? 'Replaying…' : 'Immersive Replay™'}
              </button>
              <button type="button" className="wh-world__btn" onClick={() => museum.setHistorianContext('marketplace')}>
                Historian Story
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
