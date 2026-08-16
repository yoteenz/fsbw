import { updateDemoStore } from '../demo/demoStore';
import type { ManagementPeriodId, ManagementPreferences, SavedReportConfig } from './managementTypes';

const DEFAULT_PREFS: ManagementPreferences = {
  defaultPeriodId: 'month',
  pinnedReportIds: ['executive_summary', 'receivables_aging'],
  financialDateBasis: 'payment_date',
};

export function getManagementPreferences(store: { managementPreferences?: ManagementPreferences }): ManagementPreferences {
  return { ...DEFAULT_PREFS, ...store.managementPreferences };
}

export function updateManagementPreferences(partial: Partial<ManagementPreferences>): void {
  updateDemoStore((s) => {
    s.managementPreferences = { ...getManagementPreferences(s), ...partial };
    return s;
  });
}

export function getSavedReports(store: { managementSavedReports?: SavedReportConfig[] }): SavedReportConfig[] {
  return store.managementSavedReports ?? [];
}

export function saveReportConfig(name: string, reportId: string, periodId: ManagementPeriodId): void {
  updateDemoStore((s) => {
    const list = [...(s.managementSavedReports ?? [])];
    list.push({
      id: crypto.randomUUID(),
      name,
      reportId,
      periodId,
      savedAt: new Date().toISOString(),
    });
    s.managementSavedReports = list;
    return s;
  });
}

export function acknowledgeManagementAttention(dedupeKey: string): void {
  updateDemoStore((s) => {
    const acks = new Set(s.managementAttentionAcks ?? []);
    acks.add(dedupeKey);
    s.managementAttentionAcks = [...acks];
    return s;
  });
}

export function pinReport(reportId: string): void {
  updateDemoStore((s) => {
    const prefs = getManagementPreferences(s);
    if (!prefs.pinnedReportIds.includes(reportId)) {
      prefs.pinnedReportIds = [...prefs.pinnedReportIds, reportId];
    }
    s.managementPreferences = prefs;
    return s;
  });
}
