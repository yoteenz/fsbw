import type { ReactNode } from 'react';
import type { V3CoreWorkspaceId, V3WorkspaceDataState } from '../experience-lab-v3.types';

type Props = {
  workspaceId: V3CoreWorkspaceId;
  dataState: V3WorkspaceDataState;
  error?: string | null;
  emptyTitle: string;
  emptyBody: string;
  emptyAction?: string;
  children: ReactNode;
};

/** Loading / empty / error gate — never leaves a blank black viewport. */
export function V3WorkspaceStateGate({
  workspaceId,
  dataState,
  error,
  emptyTitle,
  emptyBody,
  emptyAction,
  children,
}: Props) {
  if (dataState === 'loading') {
    return (
      <div className="elab-v3-ws-state elab-v3-ws-state--loading" data-workspace={workspaceId}>
        <div className="elab-v3-ws-state__skeleton elab-v3-ws-state__skeleton--hero" />
        <div className="elab-v3-ws-state__skeleton elab-v3-ws-state__skeleton--row" />
        <div className="elab-v3-ws-state__skeleton elab-v3-ws-state__skeleton--row" />
        <p className="elab-v3-ws-state__label">Loading {workspaceId} workspace…</p>
      </div>
    );
  }

  if (dataState === 'error') {
    return (
      <div className="elab-v3-ws-state elab-v3-ws-state--error" data-workspace={workspaceId}>
        <h3>Workspace unavailable</h3>
        <p>{error ?? 'Package data could not be loaded.'}</p>
        <button type="button" className="elab-v3-ws-state__action" data-v3-no-swipe>
          Open diagnostics
        </button>
      </div>
    );
  }

  if (dataState === 'empty') {
    return (
      <div className="elab-v3-ws-state elab-v3-ws-state--empty" data-workspace={workspaceId}>
        <h3>{emptyTitle}</h3>
        <p>{emptyBody}</p>
        {emptyAction ? (
          <button type="button" className="elab-v3-ws-state__action" data-v3-no-swipe>
            {emptyAction}
          </button>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}

type FloatingProps = {
  persistentLabel: string;
  persistentBody: ReactNode;
  interchangeableLabel: string;
  interchangeableBody: ReactNode;
};

/** Exactly two floating displays — one persistent, one interchangeable. */
export function V3WorkspaceFloatingDisplays({
  persistentLabel,
  persistentBody,
  interchangeableLabel,
  interchangeableBody,
}: FloatingProps) {
  return (
    <div className="elab-v3-ws-floats" data-v3-no-swipe>
      <aside className="elab-v3-ws-float elab-v3-ws-float--persistent" aria-label={persistentLabel}>
        <span className="elab-v3-ws-float__label">{persistentLabel}</span>
        <div className="elab-v3-ws-float__body">{persistentBody}</div>
      </aside>
      <aside className="elab-v3-ws-float elab-v3-ws-float--swap" aria-label={interchangeableLabel}>
        <span className="elab-v3-ws-float__label">{interchangeableLabel}</span>
        <div className="elab-v3-ws-float__body">{interchangeableBody}</div>
      </aside>
    </div>
  );
}
