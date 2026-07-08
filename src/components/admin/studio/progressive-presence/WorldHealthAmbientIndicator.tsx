import type { LivingDistrictEcologySnapshot } from '../../../../studio-os-core/living-district-ecology';
import type { LivingCivilizationSnapshot } from '../../../../studio-os-core/living-civilization';
import { useStudioWorldExperience } from '../global-experience';

type Props = {
  ecology?: LivingDistrictEcologySnapshot | null;
  civilization?: LivingCivilizationSnapshot | null;
  className?: string;
};

function topHealthMetric(ecology: LivingDistrictEcologySnapshot) {
  return [...ecology.worldHealth].sort((a, b) => b.value - a.value)[0];
}

/**
 * World Health™ — Level 1 ambient indicator (Global Experience System™).
 * Tap to expand Level 2–3 detail; collapse returns to environment.
 */
export function WorldHealthAmbientIndicator({ ecology, civilization, className = '' }: Props) {
  const { presence } = useStudioWorldExperience();

  if (!ecology) return null;
  if (!presence.isVisible('world-health-ambient')) return null;

  const expanded = presence.state.expandedElements.has('world-health-expanded');
  const metric = topHealthMetric(ecology);
  const activeLayerId = civilization
    ? Object.entries(civilization.layers).find(([, layer]) => layer.vitality > 0)?.[1]
    : null;

  return (
    <div className={`sw-world-health-ambient${expanded ? ' is-expanded' : ''}${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="sw-world-health-ambient__trigger"
        onClick={() => presence.toggle('world-health-expanded', 2)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse World Health' : 'Expand World Health'}
        title="World Health™"
      >
        <span className="sw-world-health-ambient__dot" aria-hidden />
        <span className="sw-world-health-ambient__label">World Health™</span>
        <span className="sw-world-health-ambient__value">{metric?.value ?? ecology.ecosystemBalance}%</span>
      </button>

      {expanded && presence.isVisible('world-health-expanded') ? (
        <div className="sw-world-health-ambient__panel" role="region" aria-label="World Health detail">
          <p className="sw-world-health-ambient__balance">{ecology.balanceLabel}</p>
          {ecology.worldHealth.slice(0, 4).map((m) => (
            <div key={m.id} className="sw-world-health-ambient__row">
              <span>{m.label.replace('™', '')}</span>
              <div className="sw-world-health-ambient__bar" aria-hidden>
                <div
                  className={`sw-world-health-ambient__fill${m.trend === 'rising' ? ' is-rising' : m.trend === 'stagnant' ? ' is-stagnant' : ''}`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
            </div>
          ))}
          {activeLayerId && presence.isVisible('civilization-ambient-pulse') ? (
            <p className="sw-world-health-ambient__civilization">
              {activeLayerId.label} · {activeLayerId.vitality}% · {activeLayerId.trend}
            </p>
          ) : null}
          <button
            type="button"
            className="sw-world-health-ambient__collapse"
            onClick={() => presence.collapse('world-health-expanded')}
          >
            Return to environment
          </button>
        </div>
      ) : null}
    </div>
  );
}
