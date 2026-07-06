import { useMemo, useState } from 'react';
import { useCompanyHealthIndexState } from '../../../../hooks/useCompanyHealthIndexState';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  MISSION_CONTROL_HEADER,
  MISSION_EXECUTIVE_BRIEF,
  MISSION_OVERVIEW,
} from '../../../../utils/adminStudioMissionControlDemo';
import {
  ExecutiveLobbyHero,
  HqExperienceStyles,
  resolveHeadquartersEnvironment,
  hqBody,
} from '../headquarters-experience';

function formatClock(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(): string {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/** Frontal Slayer Executive Lobby™ — The Mansion headquarters hero. */
export function FrontalSlayerExecutiveLobby() {
  const { workspace } = useWorkspace();
  const { profile: healthProfile } = useCompanyHealthIndexState();
  const env = resolveHeadquartersEnvironment(workspace.id);
  const header = MISSION_CONTROL_HEADER;
  const [expanded, setExpanded] = useState(false);

  const statusLabel = useMemo(() => {
    const health = healthProfile?.executiveHealthScore ?? header.workspaceHealth;
    return `MISSION ${header.missionStatus.replace('-', ' ').toUpperCase()} · EXECUTIVE HEALTH ${health}%`;
  }, [healthProfile, header]);

  return (
    <>
      <HqExperienceStyles />
      <ExecutiveLobbyHero
        organizationName={workspace.displayName}
        environmentName={env.environmentName}
        dateLabel={formatDate().toUpperCase()}
        clockLabel={formatClock()}
        statusLabel={statusLabel}
        greeting={MISSION_EXECUTIVE_BRIEF.greeting}
        overnight={MISSION_EXECUTIVE_BRIEF.yesterday[0]}
        opportunity={MISSION_EXECUTIVE_BRIEF.todayPriorities[0]}
        risk={header.missionStatus === 'critical' ? 'Mission requires immediate attention' : undefined}
        mission={MISSION_EXECUTIVE_BRIEF.todayFocus}
        topPriority={MISSION_OVERVIEW.title}
        accentHex={env.accentHex}
        metrics={[
          { label: 'PROGRESS', value: `${MISSION_OVERVIEW.progressPct}%` },
          { label: 'DAYS LEFT', value: String(MISSION_OVERVIEW.daysRemaining) },
          { label: 'READINESS', value: `${MISSION_OVERVIEW.readinessScore}%` },
          { label: 'PHASE', value: MISSION_OVERVIEW.phase.toUpperCase() },
        ]}
        onOpenBriefing={() => setExpanded((v) => !v)}
        briefingExpanded={expanded}
        briefingDetail={
          expanded ? (
            <div className="space-y-2">
              <p style={{ ...hqBody, fontSize: '7px' }}>{MISSION_EXECUTIVE_BRIEF.welcome}</p>
              <p style={{ ...hqBody, fontSize: '7px' }}>
                CURRENT MISSION · {MISSION_EXECUTIVE_BRIEF.currentMission}
              </p>
              {MISSION_EXECUTIVE_BRIEF.todayPriorities.map((line) => (
                <p key={line} style={{ ...hqBody, fontSize: '7px' }}>
                  · {line}
                </p>
              ))}
            </div>
          ) : null
        }
      />
    </>
  );
}
