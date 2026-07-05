import type { OrganizationalPresenceActivity, ScreenMoment } from '../../../../studio-os-core/studio-immersion/types';
import type { OrganizationalMoment } from '../../../../studio-os-core/living-headquarters-presence/types';
import { stateLabel } from '../../../../studio-os-core/studio-immersion/engine';
import { livingStatusLabel } from '../../../../studio-os-core/living-headquarters-presence/engine';
import type { ConciergeLivingStatus } from '../../../../studio-os-core/living-headquarters-presence/types';
import { presenceDotClass, SI_VISUAL } from './studioImmersionTheme';

type Props = {
  primary: OrganizationalPresenceActivity;
  feed?: OrganizationalPresenceActivity[];
  screenMoment?: ScreenMoment | null;
  organizationalMoments?: OrganizationalMoment[];
  livingStatus?: ConciergeLivingStatus;
  morningArrival?: { headline: string; items: string[] } | null;
  onDismissMoment?: (id: string) => void;
};

/** Rotating organizational activity — headquarters already working. */
export function StudioOrganizationalPresenceStrip({
  primary,
  feed,
  screenMoment,
  organizationalMoments,
  livingStatus,
  morningArrival,
  onDismissMoment,
}: Props) {
  return (
    <div className="mb-2 space-y-1">
      {morningArrival ? (
        <div className="studio-moment-strip px-2 py-1.5 rounded-sm studio-activity-entry">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: SI_VISUAL.champagne, margin: 0 }}>
            MORNING ARRIVAL
          </p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#333', margin: '2px 0 0' }}>
            {morningArrival.headline}
          </p>
          {morningArrival.items.slice(0, 3).map((item) => (
            <p key={item} style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#666', margin: '2px 0 0' }}>
              · {item}
            </p>
          ))}
        </div>
      ) : null}

      {screenMoment ? (
        <div className="studio-moment-strip px-2 py-1.5 rounded-sm studio-activity-entry">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: SI_VISUAL.champagne, margin: 0 }}>
            ORGANIZATIONAL MOMENT
          </p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#333', margin: '2px 0 0' }}>
            {screenMoment.message}
          </p>
        </div>
      ) : null}

      <div
        className="studio-glass-depth px-2 py-1.5 rounded-sm studio-activity-entry"
        style={{ border: '1px solid rgba(0,0,0,0.06)', background: SI_VISUAL.glass }}
      >
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '5px', color: '#999', margin: '0 0 4px' }}>
          ORGANIZATIONAL PRESENCE · LIVE
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#000', margin: 0 }}>
          <span className={presenceDotClass(primary.state)} />
          <span style={{ fontFamily: '"Futura PT Medium"', color: SI_VISUAL.champagne }}>{primary.concierge}</span>
          {' · '}
          {primary.activity}
          {primary.progressPct != null ? ` · ${primary.progressPct}%` : ''}
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#808080', margin: '3px 0 0' }}>
          {primary.location} · {livingStatus ? livingStatusLabel(livingStatus) : stateLabel(primary.state)}
        </p>
      </div>

      {organizationalMoments && organizationalMoments.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {organizationalMoments.map((moment) => (
            <button
              key={moment.id}
              type="button"
              onClick={() => onDismissMoment?.(moment.id)}
              className="studio-activity-entry px-2 py-0.5 rounded-sm text-left"
              style={{
                border: '1px solid rgba(0,0,0,0.05)',
                background: 'rgba(255,255,255,0.55)',
                cursor: onDismissMoment ? 'pointer' : 'default',
              }}
              title="Quiet organizational moment"
            >
              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: '#666' }}>
                {moment.message}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {feed && feed.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'thin' }}>
          {feed.slice(1, 4).map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="studio-activity-entry flex-shrink-0 min-w-[140px] px-2 py-1 rounded-sm"
              style={{
                border: '1px solid rgba(0,0,0,0.05)',
                background: 'rgba(255,255,255,0.65)',
                animationDelay: `${idx * 0.08}s`,
              }}
            >
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#333', margin: 0 }}>
                <span className={presenceDotClass(item.state)} />
                {item.concierge}
              </p>
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: '#888', margin: '2px 0 0' }}>
                {item.activity}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
