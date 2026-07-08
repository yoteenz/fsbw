import { useMemo } from 'react';
import { FOUNDER_DISPLAY_NAME, DOCK_COMMAND_EXAMPLES } from '../../../../studio-os-core/command-dock/constants';
import { greetingForFounder } from '../../../../studio-os-core/command-dock/context';
import { buildFounderPilotDockBrief } from '../../../../studio-os-core/founder-pilot-mode';
import { dismissDiscoveryPrompt } from '../../../../studio-os-core/life-culture-preferences';
import { useOrganizationContextOptional } from '../../../../studio-os-core/organization-context';
import { useCommandDockState } from '../../../../hooks/useCommandDockState';
import { useLifeCulturePreferencesState } from '../../../../hooks/useLifeCulturePreferencesState';
import { useLivingHeadquartersPresence } from '../../../../hooks/useLivingHeadquartersPresence';
import type { DockExpansionSize, CommandHistoryEntry, FavoriteCommand, RecurringCommand } from '../../../../studio-os-core/command-dock/types';
import { useStudioOrbOptional } from '../studio-orb/StudioOrbProvider';
import {
  DOCK_ANIMATION_CSS,
  DOCK_HEIGHT,
  DOCK_VISUAL,
  dockLabel,
  dockPanelStyle,
  dockValue,
} from './commandDockTheme';
import { conversationDockPanelStyle, orbGrace, orbLabel, ORB_VISUAL } from '../studio-orb/studioOrbTheme';

/** Whether Studio Orb / Command Dock should render for a headquarters path. */
export function shouldShowCommandDock(pathname: string): boolean {
  if (pathname.startsWith('/admin/studio/') || pathname === '/admin/studio') return true;
  if (pathname.startsWith('/admin/studio-os')) return true;
  if (pathname.startsWith('/admin/headquarters')) return true;
  return false;
}

/**
 * Conversation Mode™ Command Dock — centered acrylic panel.
 * Opens from Studio Orb™ radial menu · greetings live here only.
 */
export function CommandDockConversationPanel() {
  const orb = useStudioOrbOptional();
  const open = orb?.activeSurface === 'command-dock';

  const {
    store,
    setInput,
    setFocused,
    submit,
    approve,
    cancel,
    modify,
    askWhy,
    dismiss,
    toggleHistory,
    runFavorite,
  } = useCommandDockState();

  const { getMicroMoment, tick } = useLivingHeadquartersPresence();
  const org = useOrganizationContextOptional();
  const organizationId = org?.organizationId ?? 'frontal-slayer';
  const { discoveryPrompts } = useLifeCulturePreferencesState(organizationId);
  const gentlePrompt = discoveryPrompts.find((p) => p.id === 'intro-life-culture');
  const pilotBrief = useMemo(
    () => (org ? buildFounderPilotDockBrief(org.organizationId, org.organizationName) : null),
    [org]
  );
  const processingLabel = store.processingActive
    ? getMicroMoment(tick)
    : store.activeMicrointeraction;

  const greeting = useMemo(() => greetingForFounder(FOUNDER_DISPLAY_NAME), []);
  const height = DOCK_HEIGHT[store.expansionSize as DockExpansionSize];
  const suggested = store.contextProfile?.suggestedCommands ?? [...DOCK_COMMAND_EXAMPLES].slice(0, 3);

  const handleClose = () => {
    dismiss();
    orb?.closeSurface();
  };

  if (!open) return null;

  return (
    <>
      <style>{DOCK_ANIMATION_CSS}</style>
      <div
        className="command-dock-root studio-conversation-dock-panel fixed left-1/2 z-[100055] pointer-events-none"
        style={{
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(720px, calc(100vw - 24px))',
        }}
        aria-label="Studio Command Dock"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`command-dock-panel relative overflow-hidden rounded-md transition-all duration-500 ease-out pointer-events-none ${store.processingActive ? 'command-dock-processing' : ''}`}
          style={{
            ...conversationDockPanelStyle,
            height,
            maxHeight: 'min(420px, 72vh)',
          }}
        >
          <div
            className="command-dock-ambient absolute inset-0 pointer-events-none"
            style={{ background: DOCK_VISUAL.ambient }}
          />

          <div className="relative z-10 h-full flex flex-col px-4 py-3 pointer-events-none">
            <div className="flex items-start justify-between gap-2 mb-1 shrink-0">
              <div className="min-w-0">
                <p style={{ ...orbLabel, color: ORB_VISUAL.champagne, margin: 0 }}>STUDIO ORB · COMMAND DOCK</p>
                {pilotBrief ? (
                  <>
                    <p style={{ ...orbGrace, fontSize: '14px', margin: '6px 0 0' }}>{pilotBrief.greeting}</p>
                    <p style={{ ...dockValue, fontSize: '7px', color: DOCK_VISUAL.textMuted, marginTop: 4 }}>
                      {pilotBrief.missionTitle}
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ ...orbGrace, fontSize: '14px', margin: '6px 0 0' }}>{greeting}</p>
                    <p style={{ ...dockValue, fontSize: '7px', color: DOCK_VISUAL.textMuted, marginTop: 4 }}>
                      What would you like your organization to accomplish today?
                    </p>
                  </>
                )}
                <p style={{ ...dockLabel, marginTop: 6 }}>
                  {store.contextProfile?.label ?? 'HEADQUARTERS'} · STUDIO INTELLIGENCE
                </p>
              </div>
              <div className="flex gap-2 shrink-0 pointer-events-auto">
                <button type="button" onClick={toggleHistory} style={{ ...dockLabel, cursor: 'pointer', fontSize: '5px' }}>
                  HISTORY
                </button>
                <button type="button" onClick={handleClose} style={{ ...dockLabel, cursor: 'pointer', fontSize: '5px' }}>
                  CLOSE
                </button>
              </div>
            </div>

            {store.proactiveSuggestion && (
              <button
                type="button"
                onClick={() => {
                  if (store.proactiveSuggestion?.suggestedCommand) {
                    runFavorite(store.proactiveSuggestion.suggestedCommand);
                  }
                }}
                className="text-left mb-2 px-2 py-1.5 rounded-sm shrink-0 pointer-events-auto"
                style={{ background: 'rgba(235,28,36,0.06)', border: '1px solid rgba(235,28,36,0.15)' }}
              >
                <p style={{ ...dockLabel, color: ORB_VISUAL.brandRed, fontSize: '5px' }}>
                  {store.proactiveSuggestion.concierge}
                </p>
                <p style={{ ...dockValue, fontSize: '6px', color: DOCK_VISUAL.textMuted }}>
                  {store.proactiveSuggestion.insight}
                </p>
              </button>
            )}

            {gentlePrompt ? (
              <div
                className="text-left mb-2 px-2 py-1.5 rounded-sm shrink-0 pointer-events-auto"
                style={{ background: 'rgba(146,112,74,0.08)', border: '1px solid rgba(146,112,74,0.18)' }}
              >
                <p style={{ ...dockValue, fontSize: '7px', color: DOCK_VISUAL.textMuted, lineHeight: 1.45 }}>
                  {gentlePrompt.message}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    dismissDiscoveryPrompt(organizationId, gentlePrompt.id);
                    orb?.openLifeCulture();
                  }}
                  style={{ ...dockLabel, color: ORB_VISUAL.brandRed, marginTop: 8, cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  {gentlePrompt.ctaLabel} →
                </button>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto min-h-0 mb-2 pointer-events-auto">
              {store.processingActive && processingLabel && (
                <p style={{ ...dockValue, fontSize: '7px', color: DOCK_VISUAL.portfolio, marginBottom: 8 }}>
                  {processingLabel}
                </p>
              )}

              {store.lastRoutingSummary && (
                <div className="mb-2 px-2 py-1.5 rounded-sm" style={{ background: 'rgba(99,102,241,0.06)' }}>
                  <p style={{ ...dockLabel, marginBottom: 4 }}>
                    {store.pendingRoute ? 'ROUTING' : 'EXECUTIVE ADVICE'}
                  </p>
                  {store.lastRoutingSummary.split('\n').map((line: string) => (
                    <p key={line} style={{ ...dockValue, fontSize: '6px', color: DOCK_VISUAL.textMuted }}>
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {store.pendingRoute?.impactPreview && (
                <div className="mb-2">
                  <p style={{ ...dockLabel, marginBottom: 4 }}>COMMAND PREVIEW</p>
                  <p style={{ ...dockValue, fontSize: '7px' }}>{store.pendingRoute.impactPreview.primaryAction}</p>
                  {store.pendingRoute.organizationId && (
                    <p style={{ ...dockValue, fontSize: '6px', color: DOCK_VISUAL.textMuted, marginTop: 4 }}>
                      Organization · {store.pendingRoute.organizationId.replace(/-/g, ' ').toUpperCase()}
                    </p>
                  )}
                  <p style={{ ...dockLabel, marginTop: 6, color: DOCK_VISUAL.portfolio }}>
                    {store.pendingRoute.confidencePct}% CONFIDENCE
                  </p>
                </div>
              )}

              {store.pendingRoute?.clarificationQuestion && (
                <p style={{ ...dockValue, fontSize: '6px', fontStyle: 'italic', color: DOCK_VISUAL.textMuted, marginBottom: 8 }}>
                  {store.pendingRoute.clarificationQuestion}
                </p>
              )}

              {store.askWhyAnswer && (
                <p style={{ ...dockValue, fontSize: '6px', color: DOCK_VISUAL.textDim, marginBottom: 8 }}>
                  {store.askWhyAnswer}
                </p>
              )}

              {store.showHistoryPanel && (
                <div className="mb-2">
                  <p style={{ ...dockLabel, marginBottom: 4 }}>RECENT · FAVORITES · RECURRING</p>
                  {store.recentCommands.slice(0, 4).map((c: CommandHistoryEntry) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => runFavorite(c.rawText)}
                      style={{ ...dockValue, fontSize: '6px', display: 'block', color: DOCK_VISUAL.textMuted, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}
                    >
                      · {c.rawText}
                    </button>
                  ))}
                  {store.favoriteCommands.map((f: FavoriteCommand) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => runFavorite(f.rawText)}
                      style={{ ...dockLabel, fontSize: '5px', display: 'block', cursor: 'pointer', textAlign: 'left', marginBottom: 2, color: DOCK_VISUAL.gold }}
                    >
                      ★ {f.label}
                    </button>
                  ))}
                  {store.recurringCommands.map((r: RecurringCommand) => (
                    <p key={r.id} style={{ ...dockValue, fontSize: '5px', color: DOCK_VISUAL.textDim }}>
                      ↻ {r.label} · {r.cadence}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 mt-auto pointer-events-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={store.dockInput}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => !store.pendingRoute && setFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="Ask the Orb…"
                  className="flex-1 px-3 py-2 rounded-sm bg-white/50 border"
                  style={{ ...dockValue, fontSize: '8px', borderColor: 'rgba(0,0,0,0.08)' }}
                  aria-label="Command Dock input"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={submit}
                  className="px-4 py-2 rounded-sm"
                  style={{ ...dockPanelStyle, background: 'rgba(235,28,36,0.12)', cursor: 'pointer' }}
                >
                  <span style={{ ...dockLabel, color: ORB_VISUAL.brandRed }}>LEAD</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {suggested.map((ex: string) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setInput(ex);
                      setFocused(true);
                    }}
                    style={{ ...dockLabel, fontSize: '5px', border: DOCK_VISUAL.glassBorder, padding: '2px 5px', cursor: 'pointer' }}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {store.pendingRoute?.status === 'pending-approval' && (
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  <DockAction label="APPROVE" color={DOCK_VISUAL.approved} onClick={approve} />
                  <DockAction label="MODIFY" color={DOCK_VISUAL.gold} onClick={modify} />
                  <DockAction label="CANCEL" color={DOCK_VISUAL.textDim} onClick={cancel} />
                  <DockAction label="ASK WHY" color={DOCK_VISUAL.portfolio} onClick={askWhy} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** @deprecated Use StudioOrbShell — kept for import compatibility. */
export function CommandDock(_props: { bottomOffset?: number }) {
  return null;
}

function DockAction({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...dockLabel, color, cursor: 'pointer', border: DOCK_VISUAL.glassBorder, padding: '3px 10px', fontSize: '5px' }}
    >
      {label}
    </button>
  );
}
