import { useMemo } from 'react';
import { useAIOAuth } from '../auth/AIOAuthProvider';
import { isSupabaseMode } from '../config/dataMode';
import { resolveOrganizationId } from '../portal/organizationContext';
import { useDemoStore } from '../demo/useDemoStore';
import { demoFreightRepository } from './demoFreightRepository';
import { createSupabaseFreightRepository } from './supabaseFreightRepository';
import type { FreightRepository } from './freightRepositoryTypes';

export function useFreightRepository(): {
  repository: FreightRepository;
  orgId: string;
  userId: string;
  loading: boolean;
  error: string | null;
} {
  const store = useDemoStore();
  const { session, loading: authLoading } = useAIOAuth();

  const orgId = useMemo(() => {
    if (isSupabaseMode() && session?.organization?.id) {
      return session.organization.id;
    }
    return resolveOrganizationId(store, 'carrier');
  }, [session?.organization?.id, store]);

  const userId = session?.user?.id ?? 'demo-user';

  const repository = useMemo<FreightRepository>(() => {
    if (isSupabaseMode() && session?.organization?.id && session.user?.id) {
      return createSupabaseFreightRepository(session.organization.id, session.user.id);
    }
    return demoFreightRepository;
  }, [session?.organization?.id, session?.user?.id]);

  const error =
    isSupabaseMode() && !authLoading && !session?.organization?.id
      ? 'Sign in required for production load board.'
      : null;

  return {
    repository,
    orgId,
    userId,
    loading: isSupabaseMode() ? authLoading : false,
    error,
  };
}
