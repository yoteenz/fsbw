import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { BLDR_BUILD_CLASSES, BLDR_INVESTMENT_TIERS, BLDR_STATE_COPY } from '../config/builder';
import { BuildClassCard, InvestmentColumn, WorkflowSummary } from '../components/workflow/WorkflowCards';
import { useSite00 } from '../state/Site00Context';
import { ArchitecturalPanel } from '../components/panels/ArchitecturalPanel';

export default function BldrStatePage() {
  const { state, selectBuildClass } = useSite00();

  return (
    <EnvironmentShell environmentId="WORKFLOW_ENVIRONMENT">
      <Site00AppShell locationLabel={BLDR_STATE_COPY.locationLabel}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
          <header style={{ textAlign: 'center', marginBottom: 32 }}>
            <p className="site00-label-red" style={{ marginBottom: 8 }}>
              {BLDR_STATE_COPY.headline}
            </p>
            <p className="site00-body" style={{ maxWidth: 560, margin: '0 auto' }}>
              {BLDR_STATE_COPY.subhead}
            </p>
            <p className="site00-label" style={{ marginTop: 8 }}>
              {BLDR_STATE_COPY.helper}
            </p>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 40,
            }}
            role="list"
            aria-label="Build classes"
          >
            {BLDR_BUILD_CLASSES.map((buildClass) => (
              <BuildClassCard
                key={buildClass.id}
                buildClassId={buildClass.id}
                code={buildClass.code}
                title={buildClass.title}
                subtitle={buildClass.subtitle}
                description={buildClass.description}
                icon={buildClass.icon}
                cta={buildClass.cta}
                selected={state.selectedBuildClassId === buildClass.id}
                onSelect={() => selectBuildClass(buildClass.id)}
              />
            ))}
          </div>

          <ArchitecturalPanel variant="workflow">
            <div style={{ padding: '24px 20px' }}>
              <p className="site00-label-red">{BLDR_STATE_COPY.investmentHeading}</p>
              <p className="site00-label" style={{ marginBottom: 20 }}>
                {BLDR_STATE_COPY.investmentSubhead}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
                {BLDR_INVESTMENT_TIERS.map((tier) => (
                  <InvestmentColumn
                    key={tier.id}
                    label={tier.label}
                    priceLabel={tier.priceLabel}
                    items={tier.keywords}
                  />
                ))}
              </div>
            </div>
          </ArchitecturalPanel>

          <WorkflowSummary text={BLDR_STATE_COPY.footer} />
        </div>
      </Site00AppShell>
    </EnvironmentShell>
  );
}
