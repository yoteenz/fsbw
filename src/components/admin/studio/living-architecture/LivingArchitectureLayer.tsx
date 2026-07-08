import type { DistrictThemeId } from '../../../../studio-os-core/architectural-navigation';
import type { LivingArchitectureSnapshot } from '../../../../studio-os-core/living-architecture';

type Props = {
  snapshot: LivingArchitectureSnapshot;
  districtThemeId: DistrictThemeId;
  showMonument?: boolean;
};

/**
 * Living Architecture™ — ambient campus growth overlays.
 * Architecture becomes information — no dashboards required.
 */
export function LivingArchitectureLayer({
  snapshot,
  districtThemeId,
  showMonument = true,
}: Props) {
  const district = snapshot.districts[districtThemeId];
  const latest = district?.latestMilestone;
  const hasConstruction = snapshot.activeConstruction > 0;

  return (
    <div className="sw-living-layer" aria-hidden={!latest && !hasConstruction}>
      {snapshot.skylineSummary ? (
        <p className="sw-living-layer__skyline">{snapshot.skylineSummary}</p>
      ) : null}

      {hasConstruction ? (
        <div className="sw-living-layer__construction" role="status">
          <span className="sw-living-layer__construction-dot" aria-hidden />
          Campus expansion in progress — {snapshot.activeConstruction} active
        </div>
      ) : null}

      {showMonument && latest ? (
        <article className="sw-living-layer__monument" aria-label="Architectural milestone">
          <p className="sw-living-layer__monument-label">
            Architectural Milestone™ · {district.tierLabel}
          </p>
          <p className="sw-living-layer__monument-title">{latest.title}</p>
          <p className="sw-living-layer__monument-cause">{latest.architecturalChange}</p>
        </article>
      ) : null}
    </div>
  );
}
