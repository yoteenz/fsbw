import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_AUDIENCE_INSIGHT_DEFAULT,
  type AudienceInsightFieldKey,
  type AudienceInsightRecord,
} from '../utils/adminStudioAudienceBrainDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type InsightPatch = Partial<AudienceInsightRecord>;

function readPatch(): InsightPatch {
  return readStudioJson<InsightPatch>(ADMIN_STUDIO_STORAGE_KEYS.audienceBrain) ?? {};
}

function writePatch(patch: InsightPatch): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.audienceBrain, patch);
}

export function getAudienceInsight(): AudienceInsightRecord {
  return { ...ADMIN_STUDIO_AUDIENCE_INSIGHT_DEFAULT, ...readPatch() };
}

export function exportAudienceBrainSnapshot() {
  return {
    insight: getAudienceInsight(),
    source: 'audience-brain-local' as const,
    aggregatedOnly: true,
  };
}

export function useAdminStudioAudienceBrain() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const insight = useMemo(() => {
    void version;
    return getAudienceInsight();
  }, [version]);

  const updateField = useCallback(
    (key: AudienceInsightFieldKey, value: string) => {
      const current = readPatch();
      writePatch({ ...current, [key]: value });
      bump();
    },
    [bump]
  );

  const resetToDefaults = useCallback(() => {
    writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.audienceBrain, {});
    bump();
  }, [bump]);

  return { insight, updateField, resetToDefaults };
}
