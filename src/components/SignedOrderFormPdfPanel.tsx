import { useEffect, useState, useCallback } from 'react';
import type { StoredSignedOrderForm } from '../utils/signedOrderFormsStorage';
import { buildSignedOrderFormPdf } from '../utils/signedOrderFormPdf';

type Props = {
  form: StoredSignedOrderForm;
};

export function SignedOrderFormPdfPanel({ form }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const revoke = useCallback(() => {
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
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

  const safeFile = `signed-order-form-${String(form.orderNumber || form.id).replace(/[^\w.-]+/g, '_')}.pdf`;

  const download = () => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = safeFile;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minHeight: 0, flex: 1 }}>
      {form.summaryOnly && !form.photoIdDataUrl && !form.signatureDataUrl ? (
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '10px',
            color: '#808080',
            margin: 0,
            textTransform: 'uppercase',
            textAlign: 'center',
            padding: '8px 4px',
          }}
        >
          STORED SNAPSHOT INCOMPLETE — PDF MAY ONLY INCLUDE ORDER STATUS. CLIENT SHOULD RE-SUBMIT THE FORM FOR A FULL COPY.
        </p>
      ) : null}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
        <button
          type="button"
          onClick={download}
          disabled={!url || loading}
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '10px',
            color: '#EB1C24',
            background: '#fff',
            border: '1.3px solid #000',
            padding: '8px 12px',
            cursor: url && !loading ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
          }}
        >
          SAVE / DOWNLOAD PDF
        </button>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 'min(420px, 55vh)',
          border: '1px solid #e5e7eb',
          background: '#f3f4f6',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '11px',
              color: '#808080',
              textAlign: 'center',
              padding: '24px',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            BUILDING PDF…
          </p>
        ) : error ? (
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', padding: '16px', margin: 0 }}>{error}</p>
        ) : url ? (
          <iframe title="Signed order form PDF" src={`${url}#toolbar=1`} style={{ width: '100%', height: '100%', minHeight: 'min(420px, 55vh)', border: 'none' }} />
        ) : null}
      </div>
    </div>
  );
}
