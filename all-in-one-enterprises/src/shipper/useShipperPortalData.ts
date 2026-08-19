import { useCallback, useEffect, useState } from 'react';
import type {
  BrokerageFreightQuote,
  BrokerageShipperInvoice,
  ShipmentRequest,
} from '../brokerage/brokerageTypes';
import type { Load } from '../dispatch/dispatchTypes';
import { useShipperFreightRepository } from './useShipperFreightRepository';

export function useShipperPortalData<T>(
  loader: () => Promise<{ ok: true; data: T } | { ok: false; error: { message: string } }>,
  deps: unknown[] = [],
): { data: T | null; loading: boolean; error: string | null; reload: () => void } {
  const { loading: authLoading, error: repoError } = useShipperFreightRepository();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    void loader().then((result) => {
      if (result.ok) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    });
  }, deps);

  useEffect(() => {
    if (authLoading || repoError) {
      setLoading(authLoading);
      setError(repoError);
      return;
    }
    reload();
  }, [authLoading, repoError, reload]);

  return { data, loading, error, reload };
}

export function useShipperRequestsList() {
  const { repository, orgId } = useShipperFreightRepository();
  return useShipperPortalData<ShipmentRequest[]>(
    () => repository.listRequests(orgId),
    [repository, orgId],
  );
}

export function useShipperQuotesList() {
  const { repository, orgId } = useShipperFreightRepository();
  return useShipperPortalData<BrokerageFreightQuote[]>(
    () => repository.listQuotes(orgId),
    [repository, orgId],
  );
}

export function useShipperShipmentsList() {
  const { repository, orgId } = useShipperFreightRepository();
  return useShipperPortalData<Load[]>(
    () => repository.listShipments(orgId),
    [repository, orgId],
  );
}

export function useShipperInvoicesList() {
  const { repository, orgId } = useShipperFreightRepository();
  return useShipperPortalData<BrokerageShipperInvoice[]>(
    () => repository.listInvoices(orgId),
    [repository, orgId],
  );
}
