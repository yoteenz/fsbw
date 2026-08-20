import { useCallback, useEffect, useState } from 'react';
import type { OperatorProductionContext } from '../studio-os-core/partner-onboarding/types';

const API = '/api/admin/studio-partner-onboarding';

type UseStudioWorldOperatorContextOptions = {
  organizationSlug?: string;
  clientId?: string;
  projectId?: string;
  campaignId?: string;
  enabled?: boolean;
};

export function useStudioWorldOperatorContext(options: UseStudioWorldOperatorContextOptions = {}) {
  const { organizationSlug, clientId, projectId, campaignId, enabled = true } = options;
  const [context, setContext] = useState<OperatorProductionContext | null>(null);
  const [organizations, setOrganizations] = useState<
    Array<{ slug: string; name: string; organizationType: string; role: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ action: 'context' });
      if (organizationSlug) params.set('organizationSlug', organizationSlug);
      if (clientId) params.set('clientId', clientId);
      if (projectId) params.set('projectId', projectId);
      if (campaignId) params.set('campaignId', campaignId);

      const [ctxRes, orgRes] = await Promise.all([
        fetch(`${API}?${params.toString()}`),
        fetch(`${API}?action=organizations`),
      ]);

      const ctxJson = await ctxRes.json();
      const orgJson = await orgRes.json();

      if (!ctxRes.ok) throw new Error(ctxJson.error || `HTTP ${ctxRes.status}`);
      setContext(ctxJson.context as OperatorProductionContext);
      if (orgRes.ok) {
        setOrganizations(orgJson.organizations ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load operator context');
      setContext(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, organizationSlug, clientId, projectId, campaignId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const switchOrganization = useCallback(
    async (slug: string) => {
      setError(null);
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch_organization', organizationSlug: slug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setContext(json.context as OperatorProductionContext);
      await reload();
      return json.context as OperatorProductionContext;
    },
    [reload]
  );

  return { context, organizations, loading, error, reload, switchOrganization };
}
