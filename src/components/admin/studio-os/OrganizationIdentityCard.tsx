import { useMemo } from 'react';
import { useOrganizationContext } from '../../../studio-os-core/organization-context';
import { readFounderPilotModeStore, isFounderPilotModeActive } from '../../../studio-os-core/founder-pilot-mode';
import { readNdxbookMissionControlStore } from '../../../studio-os-core/ndxbook/mission-control/store';
import { getWorkspaceSnapshot } from '../../../studio-os-core/workspace-registry/store';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

const ORG_TAGLINES: Record<string, string> = {
  ndxbook: 'AI Media Operating Center',
  'frontal-slayer': 'Luxury Digital Headquarters',
  'vxd-inc': 'Visual Experience Division',
  'all-in-one-enterprise': 'Enterprise Operating Center',
};

function formatCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

type OrganizationIdentityCardProps = {
  /** When true, show portfolio switcher affordance on the card (Studio Administration only). */
  portfolioMode?: boolean;
  switcherOpen?: boolean;
  onToggleSwitcher?: () => void;
};

/** Organization passport — active org identity only (never inferred from defaults). */
export function OrganizationIdentityCard({
  portfolioMode = false,
  switcherOpen = false,
  onToggleSwitcher,
}: OrganizationIdentityCardProps) {
  const org = useOrganizationContext();
  const snapshot = useMemo(() => getWorkspaceSnapshot(org.organizationId), [org.organizationId]);

  const liveMetrics = useMemo(() => {
    if (org.moduleTenantId !== 'ndxbook') {
      return null;
    }
    if (isFounderPilotModeActive(org.organizationId)) {
      const pilot = readFounderPilotModeStore(org.organizationId);
      const mc = readNdxbookMissionControlStore();
      return {
        healthPct: pilot.pagesPublished > 0 ? Math.min(100, pilot.pagesPublished * 2) : 0,
        conciergesOnline: org.organizationConcierges.length,
        departments: mc.newsroomStages.length || 12,
        publishingToday: mc.briefing.pagesPublishingToday,
        revenueToday: mc.briefing.estimatedRevenueToday,
        missionActive: true,
        pilotMode: true,
      };
    }
    try {
      const store = readNdxbookMissionControlStore();
      if (!store.companyHealth.length) return null;
      const overall = store.companyHealth.find((m) => m.id === 'overall');
      return {
        healthPct: overall?.score ?? snapshot?.organizationalHealthPct ?? 78,
        conciergesOnline: org.organizationConcierges.length + 4,
        departments: store.newsroomStages.length + 1,
        publishingToday: store.briefing.pagesPublishingToday,
        revenueToday: store.briefing.estimatedRevenueToday,
        missionActive: true,
      };
    } catch {
      return null;
    }
  }, [org.moduleTenantId, org.organizationConcierges.length, snapshot?.organizationalHealthPct]);

  const healthPct = liveMetrics?.healthPct ?? snapshot?.organizationalHealthPct ?? 82;
  const tagline =
    ORG_TAGLINES[org.moduleTenantId] ??
    org.organizationSettings.industry?.replace(/-/g, ' ') ??
    org.organizationSettings.description.slice(0, 48);

  const accent = org.organizationBrand.colors.accent;

  return (
    <div
      className="w-full text-left studio-living-card studio-glass-depth px-3 py-3 rounded-sm mb-2"
      style={{
        border: `1.3px solid ${accent}44`,
        background: `linear-gradient(135deg, rgba(255,255,255,0.94) 0%, ${accent}0A 55%, rgba(255,255,255,0.88) 100%)`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 overflow-hidden border flex items-center justify-center rounded-sm"
          style={{ width: 36, height: 36, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          <img src={org.organizationBrand.logoSrc} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#808080', margin: 0, letterSpacing: '0.08em' }}>
            {portfolioMode ? 'CURRENT ORGANIZATION · PORTFOLIO' : 'CURRENT ORGANIZATION'}
          </p>
          <p
            style={{
              fontFamily: '"Covered By Your Grace", sans-serif',
              fontSize: '18px',
              color: org.organizationBrand.colors.primary,
              margin: '2px 0 0',
              lineHeight: 1.05,
            }}
          >
            {org.organizationName}
          </p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#555', margin: '4px 0 0', lineHeight: 1.4 }}>
            {tagline}
          </p>

          {liveMetrics?.missionActive ? (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: accent, margin: '6px 0 0', letterSpacing: '0.06em' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#16A34A',
                  marginRight: 4,
                  verticalAlign: 'middle',
                }}
              />
              {liveMetrics.pilotMode ? 'FOUNDER PILOT · DAY ONE' : 'HEADQUARTERS ACTIVE'}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3">
            <IdentityMetric label="HEALTH" value={`${healthPct}%`} accent={accent} />
            <IdentityMetric
              label="CONCIERGES ONLINE"
              value={String(liveMetrics?.conciergesOnline ?? org.organizationConcierges.length)}
            />
            {liveMetrics ? (
              <>
                <IdentityMetric label="DEPARTMENTS" value={String(liveMetrics.departments)} />
                <IdentityMetric label="PUBLISHING TODAY" value={String(liveMetrics.publishingToday)} accent={accent} />
                <IdentityMetric
                  label="REVENUE TODAY"
                  value={formatCurrency(liveMetrics.revenueToday)}
                  accent={accent}
                  className="col-span-2"
                />
              </>
            ) : snapshot ? (
              <IdentityMetric label="APPROVALS" value={String(snapshot.pendingApprovals)} className="col-span-2" />
            ) : null}
          </div>
        </div>

        {portfolioMode && onToggleSwitcher ? (
          <button
            type="button"
            onClick={onToggleSwitcher}
            aria-expanded={switcherOpen}
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '8px',
              color: '#808080',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            {switcherOpen ? '▲' : '▼'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function IdentityMetric({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: '#888', margin: 0, letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '8px',
          color: accent ?? '#1a1a1a',
          margin: '1px 0 0',
        }}
      >
        {value}
      </p>
    </div>
  );
}
