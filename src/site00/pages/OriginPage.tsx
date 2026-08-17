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
  const environmentId =
    state.homeMode === 'idnty-expanded' || state.homeMode === 'bldr-expanded'
      ? 'WORKFLOW_ENVIRONMENT'
      : 'ORIGIN_ENVIRONMENT';

  return (
    <EnvironmentShell environmentId={environmentId}>
      <Site00AppShell locationLabel={SITE00_ORIGIN_COPY.locationLabel} showStatusStrip statusStrip={<StatusStrip />}>
        <div className="site00-home-stage">
          <aside className="site00-home-hero" aria-label="Origin messaging">
            <p className="site00-label site00-home-hero__eyebrow">{SITE00_ORIGIN_COPY.headlineLine1}</p>
            <h1 className="site00-heading-xl">{SITE00_ORIGIN_COPY.headlineLine2}</h1>
            <p className="site00-tagline site00-home-hero__tagline">{SITE00_ORIGIN_COPY.tagline}</p>
            <p className="site00-body site00-body--technical site00-home-hero__line">{SITE00_ORIGIN_COPY.description1}</p>
            <p className="site00-body site00-body--technical site00-home-hero__line">{SITE00_ORIGIN_COPY.description2}</p>
            <p className="site00-body site00-body--technical site00-home-hero__line">{SITE00_ORIGIN_COPY.description3}</p>
            <p className="site00-coordinate site00-home-hero__coordinate">{SITE00_ORIGIN_COPY.originPoint}</p>
          </aside>

          <section className="site00-home-cards" aria-label="Entry selection">
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
