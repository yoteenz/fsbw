import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { StatusStrip } from '../components/homepage/StatusStrip';
import { OriginCards } from '../components/homepage/OriginCards';
import { IdntyExpandedPanel } from '../components/homepage/IdntyExpandedPanel';
import { BldrExpandedPanel } from '../components/homepage/BldrExpandedPanel';
import { SITE00_ORIGIN_COPY } from '../config/status';
import { useSite00 } from '../state/Site00Context';

export default function OriginPage() {
  const { state, setHomeMode } = useSite00();

  return (
    <EnvironmentShell environmentId="ORIGIN_ENVIRONMENT">
      <Site00AppShell locationLabel={SITE00_ORIGIN_COPY.locationLabel} showStatusStrip statusStrip={<StatusStrip />}>
        <div
          className="site00-home-grid"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            padding: '24px 32px 120px',
            minHeight: 'calc(100dvh - 160px)',
            alignItems: 'flex-start',
          }}
        >
          <aside
            className="site00-home-hero"
            style={{ flex: '1 1 280px', maxWidth: 360, paddingTop: 24 }}
            aria-label="Origin messaging"
          >
            <p className="site00-label" style={{ marginBottom: 8 }}>
              {SITE00_ORIGIN_COPY.headlineLine1}
            </p>
            <h1 className="site00-heading-xl">{SITE00_ORIGIN_COPY.headlineLine2}</h1>
            <p className="site00-tagline" style={{ marginTop: 16, marginBottom: 24 }}>
              {SITE00_ORIGIN_COPY.tagline}
            </p>
            <p className="site00-body site00-body--technical" style={{ marginBottom: 4 }}>
              {SITE00_ORIGIN_COPY.description1}
            </p>
            <p className="site00-body site00-body--technical" style={{ marginBottom: 4 }}>
              {SITE00_ORIGIN_COPY.description2}
            </p>
            <p className="site00-body site00-body--technical" style={{ marginBottom: 32 }}>
              {SITE00_ORIGIN_COPY.description3}
            </p>
            <p className="site00-coordinate">
              {SITE00_ORIGIN_COPY.originPoint}
            </p>
          </aside>

          <section style={{ flex: '2 1 400px', minWidth: 0 }} aria-label="Entry selection">
            {state.homeMode === 'origin' && (
              <OriginCards
                onExpandIdnty={() => setHomeMode('idnty-expanded')}
                onExpandBldr={() => setHomeMode('bldr-expanded')}
              />
            )}
            {state.homeMode === 'idnty-expanded' && (
              <IdntyExpandedPanel onCollapse={() => setHomeMode('origin')} />
            )}
            {state.homeMode === 'bldr-expanded' && (
              <BldrExpandedPanel onCollapse={() => setHomeMode('origin')} />
            )}
          </section>
        </div>
      </Site00AppShell>
    </EnvironmentShell>
  );
}
