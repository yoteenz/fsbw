import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import type { OperatorProductionContext } from '../../../studio-os-core/partner-onboarding/types';

type StudioWorldOrgContextBarProps = {
  context: OperatorProductionContext | null;
  loading?: boolean;
};

function formatBudget(ctx: OperatorProductionContext): string {
  if (!ctx.budget) return '—';
  const avail = ctx.budget.available;
  const hard = ctx.budget.hardLimit;
  if (avail != null && hard != null) {
    return `$${avail.toFixed(2)} / $${hard.toFixed(2)} ${ctx.budget.currency}`;
  }
  return `$${ctx.budget.actual.toFixed(2)} used · $${ctx.budget.reserved.toFixed(2)} reserved`;
}

/**
 * Server-authoritative production context strip — billing owner visible before production.
 */
export function StudioWorldOrgContextBar({ context, loading }: StudioWorldOrgContextBarProps) {
  if (loading && !context) {
    return (
      <div
        className="mb-2 px-2 py-1.5 rounded-sm border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
      >
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', margin: 0, color: '#888' }}>
          Loading Studio World operator context…
        </p>
      </div>
    );
  }

  if (!context) return null;

  return (
    <div
      className="mb-2 px-2 py-1.5 rounded-sm border"
      style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.92)' }}
      data-studio-world-context-bar
    >
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <ContextChip label="ACTIVE ORG" value={context.activeOrganizationName} />
        <ContextChip label="BILLING OWNER" value={context.billingOwnerSlug} accent />
        {context.clientName ? <ContextChip label="CLIENT" value={context.clientName} /> : null}
        {context.projectName ? <ContextChip label="PROJECT" value={context.projectName} /> : null}
        {context.campaignId ? <ContextChip label="CAMPAIGN" value={context.campaignId} /> : null}
        <ContextChip label="PLATFORM" value={context.platformAccess} />
        <ContextChip label="COMPUTE" value={context.productionCompute} />
        <ContextChip label="BUDGET" value={formatBudget(context)} />
        {context.foundingPartner ? <ContextChip label="TIER" value="FOUNDING PARTNER" accent /> : null}
      </div>
    </div>
  );
}

function ContextChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', lineHeight: 1.4 }}>
      <span style={{ color: '#888' }}>{label}: </span>
      <span style={{ color: accent ? ADMIN_STUDIO_THEME.accent : '#000', fontWeight: 515 }}>{value}</span>
    </span>
  );
}
