import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import {
  IDNTY_BRAND_STATES,
  IDNTY_INVESTMENT_TIERS,
  IDNTY_STATE_COPY,
} from '../config/identity';
import { StateCard, InvestmentColumn, WorkflowSummary } from '../components/workflow/WorkflowCards';
import { identityComplexityIcon } from '../components/icons/GeometricIcon';
import { useSite00 } from '../state/Site00Context';
import { ArchitecturalPanel } from '../components/panels/ArchitecturalPanel';

const COMPLEXITY_MAP = [0, 1, 2, 3] as const;

export default function IdntyStatePage() {
  const { state, selectIdentityState } = useSite00();

  return (
    <EnvironmentShell environmentId="WORKFLOW_ENVIRONMENT">
      <Site00AppShell locationLabel={IDNTY_STATE_COPY.locationLabel}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
          <header style={{ textAlign: 'center', marginBottom: 32 }}>
            <p className="site00-label-red" style={{ marginBottom: 8 }}>
              {IDNTY_STATE_COPY.headline}
            </p>
            <p className="site00-body site00-state-page__subhead" style={{ maxWidth: 560, margin: '0 auto' }}>
              {IDNTY_STATE_COPY.subhead}
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
            aria-label="Brand states"
          >
            {IDNTY_BRAND_STATES.map((brandState) => (
              <StateCard
                key={brandState.id}
                state={brandState}
                selected={state.selectedIdentityStateId === brandState.id}
                onSelect={selectIdentityState}
              />
            ))}
          </div>

          <ArchitecturalPanel variant="workflow">
            <div style={{ padding: '24px 20px' }}>
              <p className="site00-label-red">{IDNTY_STATE_COPY.investmentHeading}</p>
              <p className="site00-label" style={{ marginBottom: 20 }}>
                {IDNTY_STATE_COPY.investmentSubhead}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
                {IDNTY_INVESTMENT_TIERS.map((tier, idx) => (
                  <InvestmentColumn
                    key={tier.id}
                    label={tier.label}
                    priceLabel={tier.priceLabel}
                    items={tier.services}
                    iconVariant={identityComplexityIcon(COMPLEXITY_MAP[idx] ?? 0)}
                  />
                ))}
              </div>
            </div>
          </ArchitecturalPanel>

          <WorkflowSummary text={IDNTY_STATE_COPY.footer} />
        </div>
      </Site00AppShell>
    </EnvironmentShell>
  );
}
