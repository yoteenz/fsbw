type Props = {
  url: string | null;
  loading: boolean;
  error: string | null;
  /** Taller iframe for admin pending form modal (full form in view). */
  variant?: 'default' | 'adminModal';
};

function pdfIframeSrc(blobUrl: string): string {
  // Fit entire page in the iframe (width + height) — avoids “width only” zoom that crops tall forms.
  return `${blobUrl}#page=1&toolbar=1&navpanes=0&view=Fit`;
}

/** PDF preview only (iframe). Download lives outside the modal card in admin clients. */
export function SignedOrderFormPdfPanel({ url, loading, error, variant = 'default' }: Props) {
  /** Bounded viewport so native PDF viewers can scale the whole page to fit (see `#view=Fit`). */
  const viewportH = variant === 'adminModal' ? 'min(72vh, 680px)' : 'min(56vh, 520px)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, flex: 1, alignItems: 'stretch' }}>
      <div
        style={{
          flex: '1 1 auto',
          height: viewportH,
          minHeight: viewportH,
          maxHeight: viewportH,
          border: '1px solid #e5e7eb',
          background: '#f3f4f6',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px',
          boxSizing: 'border-box',
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
              alignSelf: 'center',
            }}
          >
            BUILDING PDF…
          </p>
        ) : error ? (
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', padding: '16px', margin: 0, alignSelf: 'center' }}>{error}</p>
        ) : url ? (
          <iframe
            title="Signed order form PDF"
            src={pdfIframeSrc(url)}
            style={{
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
              border: 'none',
              display: 'block',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
