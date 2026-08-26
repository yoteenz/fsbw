import { loadDemoStore } from '../../demo/demoStore';
import {
  ensureAutopilotStoreFields,
  getAutopilotStateForLoad,
} from './freightAutopilotService';
import { evaluateDocumentCompleteness } from './documentCompleteness';
import type { FreightAutopilotRepository } from './freightAutopilotRepositoryTypes';

export const demoFreightAutopilotRepository: FreightAutopilotRepository = {
  async getPanelData(loadId: string) {
    const store = ensureAutopilotStoreFields(loadDemoStore());
    const load = store.loads.find((l) => l.id === loadId);
    if (!load) return undefined;
    const state = getAutopilotStateForLoad(store, loadId);
    if (!state) return undefined;
    const exceptions = (store.freightExceptions ?? []).filter(
      (e) => e.loadId === loadId && e.status === 'open',
    );
    const documentCompleteness = evaluateDocumentCompleteness(load);
    return { load, state, exceptions, documentCompleteness };
  },
};
