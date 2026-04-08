import { useCallback, useEffect, useState } from 'react';
import type { StoredSignedOrderForm } from '../utils/signedOrderFormsStorage';
import { buildSignedOrderFormPdf } from '../utils/signedOrderFormPdf';

export function useSignedOrderFormPdf(form: StoredSignedOrderForm | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!form);
  const [error, setError] = useState<string | null>(null);

  const revoke = useCallback(() => {
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!form) {
      revoke();
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    revoke();
    void (async () => {
      try {
        const blob = await buildSignedOrderFormPdf(form);
        if (cancelled) return;
        const u = URL.createObjectURL(blob);
        setUrl(u);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not build PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      revoke();
    };
  }, [form, revoke]);

  return { url, loading, error, revoke };
}

export function signedOrderFormPdfFileName(form: StoredSignedOrderForm): string {
  return `signed-order-form-${String(form.orderNumber || form.id).replace(/[^\w.-]+/g, '_')}.pdf`;
}
