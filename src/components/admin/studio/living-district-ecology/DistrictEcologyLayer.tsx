import type { DistrictThemeId } from '../../../../studio-os-core/architectural-navigation';
import type { LivingDistrictEcologySnapshot } from '../../../../studio-os-core/living-district-ecology';

type Props = {
  ecology: LivingDistrictEcologySnapshot;
  districtThemeId: DistrictThemeId;
  compact?: boolean;
};

/**
 * Living District Ecology™ — chain reactions, synergy flows, ecosystem balance.
 */
export function DistrictEcologyLayer({ ecology, districtThemeId, compact = false }: Props) {
  const district = ecology.districts[districtThemeId];
  const activeReaction = ecology.chainReactions[ecology.chainReactions.length - 1];
  const activeFlows = ecology.activeSynergyFlows.filter((f) => f.active).slice(0, 4);
  const spillover = district?.spilloverFrom ?? [];

  return (
    <div className="sw-ecology-layer" aria-label="District ecology">
      <div className="sw-ecology-layer__balance" role="status">
        World Health™ · {ecology.balanceLabel}
        <span className="sw-ecology-layer__balance-value">
          Ecosystem balance {ecology.ecosystemBalance}%
        </span>
      </div>

      {!compact && activeFlows.length > 0 ? (
        <div className="sw-ecology-layer__synergy" aria-label="Active synergy flows">
          {activeFlows.map((flow) => (
            <span key={`${flow.from}-${flow.to}`} className="sw-ecology-layer__synergy-flow is-active">
              {flow.from.replace(/-/g, ' ')} → {flow.to.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      ) : null}

      {!compact && spillover.length > 0 && !activeReaction ? (
        <div className="sw-ecology-layer__synergy" aria-label="Ecology spillover">
          {spillover.slice(0, 2).map((s) => (
            <span key={s.fromDistrict} className="sw-ecology-layer__synergy-flow is-active">
              ↑ {s.contribution}
            </span>
          ))}
        </div>
      ) : null}

      {!compact && activeReaction ? (
        <article className="sw-ecology-layer__chain" aria-label="Chain reaction">
          <p className="sw-ecology-layer__chain-label">Chain Reaction™</p>
          <p className="sw-ecology-layer__chain-trigger">{activeReaction.trigger}</p>
          <ul className="sw-ecology-layer__chain-list">
            {activeReaction.consequences.slice(0, 5).map((c) => (
              <li key={c.districtId + c.architecturalChange} className="sw-ecology-layer__chain-item">
                <span className="sw-ecology-layer__chain-district">
                  {c.districtId.replace(/-/g, ' ')}
                </span>
                {' — '}
                {c.architecturalChange}
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </div>
  );
}
