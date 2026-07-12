import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { ImmuneRecoveryIncident } from '../studio-os-core/immune-system/types';

type HealthPayload = {
  ok: boolean;
  environment?: string;
  projectRef?: string | null;
  autoRepairEnabled?: boolean;
  productionTargetVerified?: boolean;
  subsystems?: {
    governedGeneration?: {
      health: string;
      message: string;
      missingResources: string[];
    };
  };
  deploymentReadiness?: {
    ready: boolean;
    blockedFeatures: string[];
    missing: string[];
  };
  recentIncidentCount?: number;
};

export function useImmuneSystemHealth(pollMs = 0) {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [incidents, setIncidents] = useState<ImmuneRecoveryIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hRes, iRes] = await Promise.all([
        apiFetch('/api/admin/immune-system-health'),
        apiFetch('/api/admin/immune-system-incidents?limit=10'),
      ]);
      const hText = await hRes.text();
      const iText = await iRes.text();
      setHealth(hText ? (JSON.parse(hText) as HealthPayload) : null);
      const iData = iText ? (JSON.parse(iText) as { incidents?: ImmuneRecoveryIncident[] }) : {};
      setIncidents(iData.incidents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load immune system status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!pollMs) return;
    const id = window.setInterval(() => void refresh(), pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, refresh]);

  return { health, incidents, loading, error, refresh };
}
