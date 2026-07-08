import { useMemo, useState } from 'react';
import { useCareerWorldCatalog, useCareerWorldState } from '../../../../hooks/useCareerWorldState';
import type { CareerWorldBlueprint, CareerWorldId } from '../../../../studio-os-core/career-worlds/types';
import type {
  CareerNpcProfile,
  CareerSkillRecord,
} from '../../../../studio-os-core/career-worlds/core/schemas';
import type { CareerHubScheduleItem } from '../../../../studio-os-core/career-worlds/career-hub/builder';

function HubPanel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm ${className}`}
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
        {title}
      </h3>
      {children}
    </section>
  );
}

function HubList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (!items.length) {
    return <p className="text-sm text-white/40">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="text-sm text-white/80">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Career Hub™ — persistent professional life dashboard (replaces course dashboard).
 * Profession-agnostic; every Career World plugs into the same view model.
 */
export function CareerHubWorkspace() {
  const worlds = useCareerWorldCatalog();
  const [worldId, setWorldId] = useState<CareerWorldId>(worlds[0]?.id ?? 'marketing-world');
  const { hub, save, refresh } = useCareerWorldState(worldId);

  const npcSummary = useMemo(() => {
    if (!save) return [];
    return save.npcs.slice(0, 4).map((npc: CareerNpcProfile) => `${npc.name} (${npc.role}) · trust ${npc.trust}`);
  }, [save]);

  if (!hub || !save) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/60">
        Initializing Career World…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80">Career Hub™</p>
            <h1 className="mt-1 text-3xl font-semibold">{hub.worldName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">{hub.coreQuestion}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs uppercase tracking-wider text-white/40">World</label>
            <select
              value={worldId}
              onChange={(event) => setWorldId(event.target.value as CareerWorldId)}
              className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white"
            >
              {worlds.map((world: CareerWorldBlueprint) => (
                <option key={world.id} value={world.id}>
                  {world.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/20"
            >
              Sync world
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-white/40">Role</span>
            <p className="font-medium">{hub.currentRole}</p>
          </div>
          <div>
            <span className="text-white/40">Phase</span>
            <p className="font-medium capitalize">{hub.currentPhase.replace(/-/g, ' ')}</p>
          </div>
          <div>
            <span className="text-white/40">Simulated time</span>
            <p className="font-medium">{hub.simulatedTimeLabel}</p>
          </div>
          <div>
            <span className="text-white/40">Reputation</span>
            <p className="font-medium">
              {hub.reputationScore} · {hub.reputationTier}
            </p>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
            style={{ width: `${Math.round(hub.promotionProgress * 100)}%` }}
          />
        </div>
        <p className="text-xs text-white/40">
          Promotion progress · {Math.round(hub.promotionProgress * 100)}%
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <HubPanel title="Today's schedule">
          {hub.todaysSchedule.length ? (
            <ul className="space-y-2">
              {hub.todaysSchedule.map((item: CareerHubScheduleItem) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>{item.title}</span>
                  <span className="text-white/40">{item.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/40">No appointments scheduled for today.</p>
          )}
        </HubPanel>

        <HubPanel title="Upcoming">
          {hub.upcomingAppointments.length ? (
            <ul className="space-y-2">
              {hub.upcomingAppointments.map((item: CareerHubScheduleItem) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>{item.title}</span>
                  <span className="text-white/40">{item.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/40">Nothing on the horizon yet.</p>
          )}
        </HubPanel>

        <HubPanel title="Mentor feedback">
          <HubList items={hub.mentorFeedback} emptyLabel="Mentors are observing your progress." />
        </HubPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubPanel title="World news">
          <HubList items={hub.worldNews} emptyLabel="The industry is quiet." />
        </HubPanel>
        <HubPanel title="Community activity">
          <HubList items={hub.communityActivity} emptyLabel="Your professional story is just beginning." />
        </HubPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <HubPanel title="Industry challenges">
          <HubList items={hub.industryChallenges} emptyLabel="No active challenges." />
        </HubPanel>
        <HubPanel title="Active projects">
          <HubList items={hub.activeProjects} emptyLabel="No active projects." />
        </HubPanel>
        <HubPanel title="Open jobs">
          <HubList items={hub.openJobs} emptyLabel="No open postings in your districts." />
        </HubPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubPanel title="NPC ecosystem">
          <HubList items={npcSummary} emptyLabel="No professionals in network yet." />
        </HubPanel>
        <HubPanel title="Career snapshot">
          <ul className="space-y-2 text-sm text-white/80">
            <li>Experience · {save.playerProfile.experience} days</li>
            <li>Income · {save.playerProfile.income.toLocaleString()}</li>
            <li>Skills · {save.playerProfile.skills.map((s: CareerSkillRecord) => s.name).join(', ')}</li>
            <li>Awards · {save.awards.length || 'None yet'}</li>
            <li>Portfolio · {save.portfolio.length} items</li>
          </ul>
        </HubPanel>
      </div>
    </div>
  );
}
