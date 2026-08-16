import { useCallback, useEffect, useState } from 'react';
import { loadDemoStore, subscribeDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';

export function useDemoStore(): DemoStore {
  const [store, setStore] = useState<DemoStore>(() => loadDemoStore());
  useEffect(() => subscribeDemoStore(() => setStore(loadDemoStore())), []);
  return store;
}

export function useDemoStoreSelector<T>(selector: (store: DemoStore) => T): T {
  const store = useDemoStore();
  return selector(store);
}

export function useRefreshDemoStore(): () => void {
  return useCallback(() => {
    loadDemoStore();
  }, []);
}
