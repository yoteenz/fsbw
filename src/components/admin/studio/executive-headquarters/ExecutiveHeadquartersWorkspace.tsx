import { useNavigate, useParams } from 'react-router-dom';
import type { ExecutiveHeadquartersReadyView, HqRoomId } from '../../../../studio-os-core/genesis';
import { HQ, hqActionBtn, hqBody, hqGrace, hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqGlassSurface, HqWingZone } from '../headquarters-experience/HqWingZone';
import { ExecutiveLobbyHero } from '../headquarters-experience/ExecutiveLobbyHero';
import { CrystalHealthGrid } from '../headquarters-experience/CrystalHealthGrid';
import { useExecutiveHeadquartersState } from '../../../../hooks/useExecutiveHeadquartersState';
import {
  ExecutiveHeadquartersScroll,
  ExecutiveHeadquartersShell,
} from './ExecutiveHeadquartersShell';

function formatClock(): string {
  return new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function ExecutiveHeadquartersWorkspace() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const navigate = useNavigate();
  const { view, navigationRooms, activeRoomId, enterRoom } =
    useExecutiveHeadquartersState(roomSlug);

  const activeRoom = view.rooms.rooms.find((r) => r.roomId === activeRoomId);

  const goToRoom = (roomId: HqRoomId) => {
    const path = enterRoom(roomId);
    navigate(path);
  };

  return (
    <ExecutiveHeadquartersShell
      companyName={view.company.companyDisplayName}
      roomTitle={activeRoom?.officialName ?? 'Executive Atrium™'}
      onExit={() => navigate('/admin/studio/genesis')}
    >
      <SpatialNavigation
        rooms={navigationRooms}
        activeRoomId={activeRoomId}
        onSelectRoom={goToRoom}
      />
      <ExecutiveHeadquartersScroll>
        <RoomContent view={view} activeRoomId={activeRoomId} onNavigateRoom={goToRoom} />
      </ExecutiveHeadquartersScroll>
      <OrbDockPanel orb={view.orb} onExpandBriefing={() => goToRoom('daily-briefing')} />
    </ExecutiveHeadquartersShell>
  );
}

function SpatialNavigation({
  rooms,
  activeRoomId,
  onSelectRoom,
}: {
  rooms: ReturnType<typeof useExecutiveHeadquartersState>['navigationRooms'];
  activeRoomId: HqRoomId;
  onSelectRoom: (id: HqRoomId) => void;
}) {
  return (
    <nav
      className="relative z-10 shrink-0 overflow-y-auto border-r border-white/60"
      style={{
        width: 200,
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(12px)',
      }}
      aria-label="Headquarters rooms"
    >
      <p style={{ ...hqLabel, padding: '12px 12px 8px', margin: 0 }}>ROOM MAP</p>
      <ul className="list-none m-0 p-0 pb-4">
        {rooms.map((room) => (
          <li key={room.roomId}>
            <button
              type="button"
              className="executive-hq-nav-item w-full text-left px-3 py-2 border-0"
              data-active={room.roomId === activeRoomId ? 'true' : 'false'}
              data-locked={room.locked ? 'true' : 'false'}
              disabled={room.locked}
              onClick={() => onSelectRoom(room.roomId as HqRoomId)}
              title={room.locked ? room.lockReason : room.purpose}
              style={{
                cursor: room.locked ? 'not-allowed' : 'pointer',
                opacity: room.locked ? 0.45 : 1,
                background: 'transparent',
              }}
            >
              <p style={{ ...hqLabel, fontSize: '5px', margin: 0, color: room.locked ? HQ.gray : HQ.red }}>
                {room.roomClass.replace('-', ' ').toUpperCase()}
              </p>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: HQ.black, margin: '2px 0 0' }}>
                {room.title}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function RoomContent({
  view,
  activeRoomId,
  onNavigateRoom,
}: {
  view: ExecutiveHeadquartersReadyView;
  activeRoomId: HqRoomId;
  onNavigateRoom: (id: HqRoomId) => void;
}) {
  if (activeRoomId === 'founder-office') {
    return <FounderOfficeRoom view={view} onNavigateRoom={onNavigateRoom} />;
  }
  if (activeRoomId === 'mission-control') {
    return <MissionControlRoom view={view} />;
  }
  if (activeRoomId === 'daily-briefing') {
    return <DailyBriefingRoom view={view} />;
  }
  if (activeRoomId === 'department-directory') {
    return <DepartmentDirectoryRoom view={view} onNavigateRoom={onNavigateRoom} />;
  }
  if (activeRoomId === 'command-center') {
    return <CommandCenterRoom view={view} />;
  }
  return <ExecutiveAtriumRoom view={view} onNavigateRoom={onNavigateRoom} />;
}

function ExecutiveAtriumRoom({
  view,
  onNavigateRoom,
}: {
  view: ExecutiveHeadquartersReadyView;
  onNavigateRoom: (id: HqRoomId) => void;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-0">
      <ExecutiveLobbyHero
        organizationName={view.company.companyDisplayName}
        environmentName="Executive Atrium™"
        dateLabel={formatDate()}
        clockLabel={formatClock()}
        statusLabel={view.company.atmosphereLabel}
        greeting={view.briefing.greeting}
        overnight={view.briefing.whatChanged}
        opportunity={view.priorities.find((p) => p.kind === 'opportunity-risk')?.title}
        risk={view.advisories.find((a) => a.kind === 'dependency')?.title}
        mission={view.missions.queue[0]?.title}
        topPriority={view.priorities[0]?.title}
        metrics={view.health.metrics.slice(0, 3).map((m) => ({ label: m.label, value: `${m.score}%` }))}
        onOpenBriefing={() => onNavigateRoom('daily-briefing')}
      />

      <HqWingZone wing="PRIORITY TRIO" title="Today's Priorities" subtitle="Three cards — not a dashboard grid">
        <div className="grid gap-3 sm:grid-cols-3">
          {view.priorities.map((p) => (
            <PriorityCard key={p.priorityId} priority={p} onOpen={() => onNavigateRoom(p.targetRoomId)} />
          ))}
        </div>
      </HqWingZone>

      <HqWingZone wing="COMPANY PULSE" title="Company Pulse™" subtitle={view.health.operationalPulse}>
        <HqGlassSurface>
          <CrystalHealthGrid
            metrics={view.health.metrics.map((m) => ({
              id: m.metricId,
              label: m.label,
              score: m.score,
              trend: m.trend,
            }))}
            overallScore={view.health.overallScore}
            overallLabel={view.health.overallLabel}
          />
        </HqGlassSurface>
      </HqWingZone>

      {view.recommendedAction ? (
        <HqWingZone wing="RECOMMENDED ACTION" title="Next Best Move">
          <RecommendedActionPanel action={view.recommendedAction} onOpen={() => onNavigateRoom(view.recommendedAction!.targetRoomId)} />
        </HqWingZone>
      ) : null}

      <HqWingZone wing="MISSION QUEUE" title="Mission Queue™">
        <MissionQueuePanel missions={view.missions} onOpenMission={(id) => onNavigateRoom(id)} />
      </HqWingZone>

      <HqWingZone wing="EXECUTIVE ADVISORIES" title="Executive Advisories™">
        <AdvisoriesPanel advisories={view.advisories} onOpen={(roomId) => roomId && onNavigateRoom(roomId)} />
      </HqWingZone>
    </div>
  );
}

function FounderOfficeRoom({
  view,
  onNavigateRoom,
}: {
  view: ExecutiveHeadquartersReadyView;
  onNavigateRoom: (id: HqRoomId) => void;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <HqWingZone wing="FOUNDER OFFICE™" title="Strategic Deep Work" subtitle="Protect focus · decisions · reflection">
        <HqGlassSurface>
          <p style={{ ...hqGrace, fontSize: '20px', margin: 0 }}>{view.company.founderDisplayName}'s Office</p>
          <p style={{ ...hqBody, marginTop: 12 }}>{view.company.currentFocus}</p>
          <p style={{ ...hqBody, marginTop: 12, color: HQ.gray }}>{view.orb.orientationLine}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" style={hqActionBtn} onClick={() => onNavigateRoom('mission-control')}>
              REVIEW MISSIONS
            </button>
            <button type="button" style={hqActionBtn} onClick={() => onNavigateRoom('command-center')}>
              COMMAND PATH
            </button>
          </div>
        </HqGlassSurface>
        <HqGlassSurface>
          <p style={{ ...hqLabel, margin: 0 }}>STRATEGIC PRIORITIES</p>
          <ul className="mt-3 space-y-2 list-none p-0 m-0">
            {view.priorities.map((p) => (
              <li key={p.priorityId} style={{ ...hqBody, fontSize: '9px' }}>
                · {p.title}
              </li>
            ))}
          </ul>
        </HqGlassSurface>
      </HqWingZone>
    </div>
  );
}

function MissionControlRoom({ view }: { view: ExecutiveHeadquartersReadyView }) {
  return (
    <div className="max-w-3xl mx-auto">
      <HqWingZone
        wing="MISSION CONTROL™"
        title="Operational Runway"
        subtitle={`${view.missions.activeCount} active · ${view.missions.blockedCount} blocked · ${view.missions.awaitingApprovalCount} awaiting approval`}
      >
        <MissionQueuePanel missions={view.missions} />
      </HqWingZone>
    </div>
  );
}

function DailyBriefingRoom({ view }: { view: ExecutiveHeadquartersReadyView }) {
  return (
    <div className="max-w-3xl mx-auto">
      <HqWingZone wing="DAILY BRIEFING™" title="Executive Clarity">
        <HqGlassSurface>
          <p style={{ ...hqBody, fontSize: '10px', lineHeight: 1.6 }}>{view.briefing.briefingParagraph}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <BriefingField label="What changed" value={view.briefing.whatChanged} />
            <BriefingField label="Requires attention" value={view.briefing.requiresAttention} />
            <BriefingField label="Can wait" value={view.briefing.canWait} />
            <BriefingField label="Active departments" value={view.briefing.activeDepartments.join(', ')} />
          </dl>
          <p style={{ ...hqLabel, marginTop: 16, fontSize: '5px' }}>
            SOURCE: {view.briefing.owningSystem} · {view.briefing.stale ? 'STALE' : 'CURRENT'}
          </p>
        </HqGlassSurface>
      </HqWingZone>
    </div>
  );
}

function DepartmentDirectoryRoom({
  view,
  onNavigateRoom,
}: {
  view: ExecutiveHeadquartersReadyView;
  onNavigateRoom: (id: HqRoomId) => void;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <HqWingZone wing="DEPARTMENT DIRECTORY™" title="Company Wings" subtitle="Every department becomes its own future headquarters">
        <div className="grid gap-3 sm:grid-cols-2">
          {view.rooms.departmentDirectory.map((dept) => (
            <HqGlassSurface key={dept.departmentId}>
              <p style={{ ...hqLabel, margin: 0 }}>{dept.maturityLevel.toUpperCase()}</p>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: '4px 0 0' }}>{dept.title}</p>
              <p style={{ ...hqBody, marginTop: 6 }}>{dept.purpose}</p>
              {!dept.locked ? (
                <button type="button" style={{ ...hqActionBtn, marginTop: 12 }} onClick={() => onNavigateRoom(dept.roomId)}>
                  ENTER WING
                </button>
              ) : (
                <p style={{ ...hqLabel, marginTop: 12, color: HQ.gray }}>LOCKED</p>
              )}
            </HqGlassSurface>
          ))}
        </div>
        <HqGlassSurface>
          <p style={{ ...hqLabel, margin: 0 }}>FUTURE ROOMS</p>
          <ul className="mt-2 space-y-1 list-none p-0 m-0">
            {view.rooms.rooms
              .filter((r) => r.locked)
              .map((r) => (
                <li key={r.roomId} style={{ ...hqBody, fontSize: '8px' }}>
                  · {r.officialName} — {r.lockReason}
                </li>
              ))}
          </ul>
        </HqGlassSurface>
      </HqWingZone>
    </div>
  );
}

function CommandCenterRoom({ view }: { view: ExecutiveHeadquartersReadyView }) {
  return (
    <div className="max-w-3xl mx-auto">
      <HqWingZone wing="COMMAND CENTER™" title="Guarded Action Path" subtitle="No material action without approval">
        <HqGlassSurface>
          <p style={{ ...hqBody }}>
            Command drafts route through Command Center™ and Permissions Engine™. Headquarters hosts the interface only.
          </p>
          {view.recommendedAction?.requiresApproval ? (
            <p style={{ ...hqLabel, marginTop: 12, color: HQ.red }}>APPROVAL REQUIRED FOR NEXT ACTION</p>
          ) : null}
          <p style={{ ...hqBody, marginTop: 12 }}>{view.recommendedAction?.action}</p>
          <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 8 }}>
            Confidence {Math.round((view.recommendedAction?.confidence ?? 0) * 100)}% ·{' '}
            {view.recommendedAction?.sourceSystems.join(', ')}
          </p>
        </HqGlassSurface>
      </HqWingZone>
    </div>
  );
}

function PriorityCard({
  priority,
  onOpen,
}: {
  priority: ExecutiveHeadquartersReadyView['priorities'][0];
  onOpen: () => void;
}) {
  return (
    <HqGlassSurface>
      <p style={{ ...hqLabel, margin: 0 }}>{priority.kind.replace('-', ' ').toUpperCase()}</p>
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', margin: '6px 0 0' }}>{priority.title}</p>
      <p style={{ ...hqBody, fontSize: '7px', marginTop: 6 }}>{priority.detail}</p>
      <button type="button" style={{ ...hqActionBtn, marginTop: 10 }} onClick={onOpen}>
        CONTINUE
      </button>
    </HqGlassSurface>
  );
}

function RecommendedActionPanel({
  action,
  onOpen,
}: {
  action: NonNullable<ExecutiveHeadquartersReadyView['recommendedAction']>;
  onOpen: () => void;
}) {
  return (
    <HqGlassSurface>
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: 0 }}>{action.action}</p>
      <p style={{ ...hqBody, marginTop: 8 }}>{action.reason}</p>
      <p style={{ ...hqLabel, marginTop: 8 }}>
        {Math.round(action.confidence * 100)}% CONFIDENCE · {action.sourceSystems.join(' · ')}
      </p>
      <button type="button" style={{ ...hqActionBtn, marginTop: 12 }} onClick={onOpen}>
        OPEN ROOM
      </button>
    </HqGlassSurface>
  );
}

function MissionQueuePanel({
  missions,
  onOpenMission,
}: {
  missions: ExecutiveHeadquartersReadyView['missions'];
  onOpenMission?: (roomId: HqRoomId) => void;
}) {
  return (
    <div className="space-y-2">
      {missions.queue.map((m) => (
        <HqGlassSurface key={m.missionId}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p style={{ ...hqLabel, margin: 0 }}>{m.status.replace('-', ' ').toUpperCase()}</p>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', margin: '4px 0 0' }}>{m.title}</p>
              <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 4 }}>{m.departmentLabel}</p>
              {m.blockerNote ? (
                <p style={{ ...hqBody, fontSize: '7px', color: HQ.red, marginTop: 4 }}>{m.blockerNote}</p>
              ) : null}
            </div>
            {onOpenMission ? (
              <button type="button" style={hqActionBtn} onClick={() => onOpenMission(m.targetRoomId)}>
                OPEN
              </button>
            ) : null}
          </div>
        </HqGlassSurface>
      ))}
    </div>
  );
}

function AdvisoriesPanel({
  advisories,
  onOpen,
}: {
  advisories: ExecutiveHeadquartersReadyView['advisories'];
  onOpen: (roomId?: HqRoomId) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {advisories.map((a) => (
        <HqGlassSurface key={a.advisoryId}>
          <p style={{ ...hqLabel, margin: 0, color: a.severity === 'high' ? HQ.red : HQ.gray }}>
            {a.kind.toUpperCase()} · {a.severity}
          </p>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', margin: '4px 0 0' }}>{a.title}</p>
          <p style={{ ...hqBody, fontSize: '7px', marginTop: 4 }}>{a.detail}</p>
          {a.targetRoomId ? (
            <button type="button" style={{ ...hqActionBtn, marginTop: 8 }} onClick={() => onOpen(a.targetRoomId)}>
              VIEW ROOM
            </button>
          ) : null}
        </HqGlassSurface>
      ))}
    </div>
  );
}

function BriefingField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ ...hqLabel, margin: 0 }}>{label.toUpperCase()}</dt>
      <dd style={{ ...hqBody, fontSize: '8px', margin: '4px 0 0' }}>{value}</dd>
    </div>
  );
}

function OrbDockPanel({
  orb,
  onExpandBriefing,
}: {
  orb: ExecutiveHeadquartersReadyView['orb'];
  onExpandBriefing: () => void;
}) {
  return (
    <aside
      className="absolute bottom-4 right-4 z-30 max-w-xs"
      style={{ ...hqGlassPanel, padding: 14 }}
      aria-label="Orb Dock"
    >
      <p style={{ ...hqLabel, color: HQ.red, margin: 0 }}>ORB DOCK™ · {orb.mode.toUpperCase()}</p>
      <p style={{ ...hqBody, fontSize: '8px', marginTop: 8 }}>{orb.presenceLine}</p>
      <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 6 }}>{orb.orientationLine}</p>
      {orb.expandable ? (
        <button type="button" style={{ ...hqActionBtn, marginTop: 10 }} onClick={onExpandBriefing}>
          FULL BRIEFING
        </button>
      ) : null}
    </aside>
  );
}
