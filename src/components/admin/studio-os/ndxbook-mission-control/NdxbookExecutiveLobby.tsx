import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NdxbookMissionControlStore } from '../../../../studio-os-core/ndxbook/mission-control/types';
import { FOUNDER_DISPLAY_NAME } from '../../../../studio-os-core/command-dock/constants';
import { buildChiefConciergeBrief } from '../../../../studio-os-core/studio-immersion/engine';
import { useOrganizationContext } from '../../../../studio-os-core/organization-context';
import { readFounderPilotModeStore } from '../../../../studio-os-core/founder-pilot-mode';
import { useLivingHeadquartersState } from '../../../../hooks/useLivingHeadquartersState';
import { formatNumber, formatCurrency } from './ndxbookMissionControlTheme';
import {
  ExecutiveCollectionGallery,
  ExecutiveLobbyHero,
  HqExperienceStyles,
  resolveHeadquartersEnvironment,
  hqBody,
} from '../../studio/headquarters-experience';

type Props = {
  store: NdxbookMissionControlStore;
  formatDate: () => string;
  formatClock: () => string;
};

/** NDXBOOK Executive Lobby™ — replaces dark Today's Briefing card. */
export function NdxbookExecutiveLobby({ store, formatDate, formatClock }: Props) {
  const org = useOrganizationContext();
  const env = resolveHeadquartersEnvironment(org.organizationId);
  const [expanded, setExpanded] = useState(false);
  const b = store.briefing;
  const pilot = readFounderPilotModeStore(org.organizationId);
  const overallHealth = store.companyHealth.find((m) => m.id === 'overall')?.score;

  const living = useLivingHeadquartersState({
    organizationId: org.organizationId,
    pagesPublished: pilot.pagesPublished,
    knowledgeAssets: pilot.knowledgeAssets,
    healthScore: overallHealth,
  });

  const brief = useMemo(
    () =>
      buildChiefConciergeBrief('/admin/studio/ndxbook/mission-control', {
        moduleTenantId: org.moduleTenantId,
        organizationName: org.organizationName,
        founderName: FOUNDER_DISPLAY_NAME,
      }),
    [org.moduleTenantId, org.organizationName]
  );

  return (
    <>
      <HqExperienceStyles />
      <ExecutiveLobbyHero
        organizationName={org.organizationName.toUpperCase()}
        environmentName={env.environmentName}
        dateLabel={formatDate().toUpperCase()}
        clockLabel={formatClock()}
        statusLabel={`HEADQUARTERS ACTIVE · ${b.pagesPublishingToday} PUBLISHING TODAY`}
        greeting={brief.greeting}
        overnight={b.studioRecommendation}
        opportunity={b.topOpportunity}
        risk={b.topRisk}
        mission={b.nextSuggestedAction}
        topPriority={brief.lines[0]}
        accentHex={env.accentHex}
        celebrationMessage={living.celebrationMessage}
        livingMemory={living.livingMemory}
        collectionSlot={
          living.executiveCollection.length > 0 ? (
            <ExecutiveCollectionGallery artifacts={living.executiveCollection} accentHex={env.accentHex} />
          ) : null
        }
        metrics={[
          { label: 'IN PRODUCTION', value: String(b.pagesInProduction) },
          { label: 'APPROVALS', value: String(b.pendingApprovals) },
          { label: 'EST. REACH', value: formatNumber(b.estimatedReachToday) },
          { label: 'EST. REVENUE', value: formatCurrency(b.estimatedRevenueToday) },
        ]}
        onOpenBriefing={() => setExpanded((v) => !v)}
        briefingExpanded={expanded}
        briefingDetail={
          expanded ? (
            <div className="space-y-2">
              {brief.lines.map((line) => (
                <p key={line} style={{ ...hqBody, fontSize: '7px', margin: 0 }}>
                  · {line}
                </p>
              ))}
              {brief.cta ? (
                <Link
                  to={brief.cta.route}
                  style={{
                    display: 'inline-block',
                    marginTop: 8,
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '7px',
                    color: env.accentHex,
                    textDecoration: 'none',
                  }}
                >
                  {brief.cta.label} →
                </Link>
              ) : null}
            </div>
          ) : null
        }
      />
    </>
  );
}
