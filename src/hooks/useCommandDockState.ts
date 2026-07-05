import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { buildCommandDockSeed } from '../studio-os-core/command-dock/bootstrap';
import {
  advanceMicrointeraction,
  approveDockCommand,
  askWhyDockCommand,
  bootstrapCommandDockStore,
  cancelDockCommand,
  dismissDockToCompact,
  modifyDockCommand,
  readCommandDockStore,
  runFavoriteCommand,
  setDockExpansion,
  setDockFocused,
  setDockInput,
  submitDockCommand,
  syncDockContext,
  toggleDockHistory,
} from '../studio-os-core/command-dock/store';
import { buildConciergeRoutingSeed } from '../studio-os-core/concierge-routing/bootstrap';
import { bootstrapConciergeRoutingStore } from '../studio-os-core/concierge-routing/store';
import { buildExecutiveTimelineSeed } from '../studio-os-core/executive-timeline/bootstrap';
import { bootstrapExecutiveTimelineStore } from '../studio-os-core/executive-timeline/store';

function ensureBootstrap(): void {
  bootstrapCommandDockStore(buildCommandDockSeed());
  bootstrapConciergeRoutingStore(buildConciergeRoutingSeed());
  bootstrapExecutiveTimelineStore(buildExecutiveTimelineSeed());
}

export function useCommandDockState() {
  const { pathname } = useLocation();
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useState(() => {
    ensureBootstrap();
    return 0;
  });

  useEffect(() => {
    syncDockContext(pathname);
    refresh();
  }, [pathname, refresh]);

  const store = readCommandDockStore();

  useEffect(() => {
    if (!store.processingActive) return;
    const id = window.setInterval(() => {
      advanceMicrointeraction();
      refresh();
    }, 900);
    return () => window.clearInterval(id);
  }, [store.processingActive, refresh]);

  const setInput = useCallback(
    (text: string) => {
      setDockInput(text);
      refresh();
    },
    [refresh]
  );

  const setFocused = useCallback(
    (focused: boolean) => {
      setDockFocused(focused);
      refresh();
    },
    [refresh]
  );

  const submit = useCallback(() => {
    submitDockCommand(store.dockInput, pathname);
    refresh();
  }, [store.dockInput, pathname, refresh]);

  const approve = useCallback(() => {
    approveDockCommand();
    refresh();
  }, [refresh]);

  const cancel = useCallback(() => {
    cancelDockCommand();
    refresh();
  }, [refresh]);

  const modify = useCallback(() => {
    modifyDockCommand(store.dockInput);
    refresh();
  }, [store.dockInput, refresh]);

  const askWhy = useCallback(() => {
    askWhyDockCommand();
    refresh();
  }, [refresh]);

  const dismiss = useCallback(() => {
    dismissDockToCompact();
    refresh();
  }, [refresh]);

  const toggleHistory = useCallback(() => {
    toggleDockHistory();
    refresh();
  }, [refresh]);

  const expand = useCallback(
    (size: 'compact' | 'medium' | 'large') => {
      setDockExpansion(size);
      refresh();
    },
    [refresh]
  );

  const runFavorite = useCallback(
    (rawText: string) => {
      runFavoriteCommand(rawText, pathname);
      refresh();
    },
    [pathname, refresh]
  );

  return {
    store,
    pathname,
    setInput,
    setFocused,
    submit,
    approve,
    cancel,
    modify,
    askWhy,
    dismiss,
    toggleHistory,
    expand,
    runFavorite,
    refresh,
  };
}
