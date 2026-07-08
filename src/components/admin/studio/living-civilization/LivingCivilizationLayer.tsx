import type { DistrictThemeId } from '../../../../studio-os-core/architectural-navigation';
import { civilizationLayerForDistrict } from '../../../../studio-os-core/living-civilization';
import type { LivingCivilizationSnapshot } from '../../../../studio-os-core/living-civilization';

type Props = {
  civilization: LivingCivilizationSnapshot;
  districtThemeId: DistrictThemeId;
  compact?: boolean;
};

/**
 * Living Civilization™ — self-balancing civilization pulse overlay.
 */
export function LivingCivilizationLayer({
  civilization,
  districtThemeId,
  compact = false,
}: Props) {
  const activeLayerId = civilizationLayerForDistrict(districtThemeId);
  const activeLayer = activeLayerId ? civilization.layers[activeLayerId] : null;
  const topEconomies = Object.values(civilization.economies)
    .sort((a, b) => b.capital - a.capital)
    .slice(0, 3);
  const activeConsequence = civilization.consequences[civilization.consequences.length - 1];
  const primaryCulture = civilization.culture[0];

  return (
    <div className="sw-civilization-layer" aria-label="Living Civilization">
      <div className="sw-civilization-layer__pulse" role="status">
        <p className="sw-civilization-layer__stage">{civilization.stageLabel}</p>
        <p className="sw-civilization-layer__health">
          {civilization.health.label} · {civilization.health.overall}%
          {activeLayer ? ` · ${activeLayer.label} ${activeLayer.vitality}%` : ''}
        </p>
        <p className="sw-civilization-layer__founder">{civilization.founderExperienceLine}</p>
      </div>

      {!compact ? (
        <div className="sw-civilization-layer__economies" aria-label="Civilization economies">
          <p className="sw-civilization-layer__economy-title">Civilization Economies™</p>
          {topEconomies.map((eco) => (
            <div key={eco.id} className="sw-civilization-layer__economy-row">
              <span>{eco.label.replace(' Economy™', '')}</span>
              <span
                className={`sw-civilization-layer__economy-capital${
                  eco.trend === 'growing' ? ' is-growing' : eco.trend === 'contracting' ? ' is-contracting' : ''
                }`}
              >
                {eco.capital}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {!compact && primaryCulture ? (
        <p className="sw-civilization-layer__culture" aria-label="Cultural evolution">
          {primaryCulture.label}: {primaryCulture.expression}
        </p>
      ) : null}

      {!compact && activeConsequence ? (
        <article className="sw-civilization-layer__consequence" aria-label="Civilization consequence">
          <p className="sw-civilization-layer__consequence-order">
            {activeConsequence.order === 3 ? 'Third-Order Consequence™' : 'Second-Order Consequence™'}
          </p>
          <p className="sw-civilization-layer__consequence-trigger">{activeConsequence.trigger}</p>
          <p className="sw-civilization-layer__consequence-ripple">{activeConsequence.ripple}</p>
        </article>
      ) : null}
    </div>
  );
}
