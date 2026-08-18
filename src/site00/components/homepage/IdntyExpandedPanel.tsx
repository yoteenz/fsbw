import { useNavigate } from 'react-router-dom';
import { IDNTY_HOMEPAGE_EXPANDED, IDNTY_FRAMEWORK_PILLARS } from '../../config/identity';
import { SITE00_ROUTES } from '../../config/routes';
import { ArchitecturalPanel } from '../panels/ArchitecturalPanel';
import { SectionRule } from '../panels/SectionRule';
import { OriginPanelIcon } from './OriginPanelIcon';
import { GeometricIcon } from '../icons/GeometricIcon';
import { ArrowAction } from '../icons/ArrowAction';

type IdntyExpandedPanelProps = {
  onCollapse: () => void;
};

export function IdntyExpandedPanel({ onCollapse }: IdntyExpandedPanelProps) {
  const navigate = useNavigate();
  const copy = IDNTY_HOMEPAGE_EXPANDED;

  return (
    <div className="site00-panel-enter" style={{ padding: '0 24px 100px', maxWidth: 720, margin: '0 auto' }}>
      <ArchitecturalPanel>
        <div style={{ padding: '32px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span
              className="site00-label-red site00-origin-panel__number"
              style={{ color: 'var(--site00-origin-card-number-color, var(--site-red))' }}
            >
              {copy.number}
            </span>
            <h2 className="site00-heading-lg" style={{ margin: '8px 0 4px' }}>
              {copy.title}
            </h2>
            <p className="site00-label">{copy.subtitle}</p>
          </div>
          <OriginPanelIcon panel="idnty" size="lg" />
        </div>

        <div style={{ margin: '24px 0' }}>
          <SectionRule />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div>
            <p className="site00-label-red" style={{ marginBottom: 8 }}>
              OVERVIEW
            </p>
            <p className="site00-body">{copy.overview}</p>
          </div>
          <div>
            <p className="site00-label-red" style={{ marginBottom: 8 }}>
              WHAT WE DEFINE
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {copy.defineItems.map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                    fontSize: 11,
                    letterSpacing: '0.06em',
                  }}
                >
                  <span style={{ color: 'var(--site-red)' }}>+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="site00-label-red" style={{ marginBottom: 16 }}>
          THE IDENTITY FRAMEWORK
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {IDNTY_FRAMEWORK_PILLARS.map((pillar) => (
            <div key={pillar.id} style={{ textAlign: 'center' }}>
              <GeometricIcon variant={pillar.icon} size="sm" />
              <p className="site00-micro" style={{ margin: '8px 0 4px' }}>
                {pillar.title}
              </p>
              <p className="site00-body" style={{ fontSize: 10 }}>
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ArrowAction
            label={copy.cta}
            variant="red"
            onClick={() => navigate(SITE00_ROUTES.idntyState)}
          />
          <button type="button" className="site00-btn-ghost" onClick={onCollapse}>
            BACK
          </button>
        </div>
        </div>
      </ArchitecturalPanel>
    </div>
  );
}
