import { useMemo } from 'react';
import { useAIOAuth } from '../auth/AIOAuthProvider';
import { isSupabaseMode } from '../config/dataMode';
import { resolveOrganizationId } from '../portal/organizationContext';
import { useDemoStore } from '../demo/useDemoStore';
import { demoShipperFreightRepository } from './demoShipperFreightRepository';
import { createSupabaseShipperFreightRepository } from './supabaseShipperFreightRepository';
import type { ShipperFreightRepository } from './shipperFreightRepositoryTypes';
import { SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE } from './shipperFreightRepositoryTypes';

export function useShipperFreightRepository(): {
  repository: ShipperFreightRepository;
  orgId: string;
  userId: string;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
} {
  const store = useDemoStore();
  const { session, loading: authLoading } = useAIOAuth();

  const orgId = useMemo(() => {
    if (isSupabaseMode() && session?.organization?.id) {
      return session.organization.id;
    }
    return resolveOrganizationId(store, 'shipper');
  }, [session?.organization?.id, store]);

  const userId = session?.user?.id ?? 'demo-user';

  const repository = useMemo<ShipperFreightRepository>(() => {
    if (isSupabaseMode() && session?.organization?.id && session.user?.id) {
      return createSupabaseShipperFreightRepository(session.organization.id, session.user.id);
    }
    return demoShipperFreightRepository;
  }, [session?.organization?.id, session?.user?.id]);

  const error =
    isSupabaseMode() && !authLoading && !session?.organization?.id
      ? SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE
      : null;

  return {
    repository,
    orgId,
    userId,
    loading: isSupabaseMode() ? authLoading : false,
    error,
    isDemo: !isSupabaseMode(),
  };
}
