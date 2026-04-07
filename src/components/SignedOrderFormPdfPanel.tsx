type Props = {
  url: string | null;
  loading: boolean;
  error: string | null;
};

/** PDF preview only (iframe). Download lives outside the modal card in admin clients. */
export function SignedOrderFormPdfPanel({ url, loading, error }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, flex: 1 }}>
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
