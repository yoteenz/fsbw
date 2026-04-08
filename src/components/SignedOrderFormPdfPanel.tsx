type Props = {
  url: string | null;
  loading: boolean;
  error: string | null;
  /** Taller iframe for admin pending form modal (full form in view). */
  variant?: 'default' | 'adminModal';
};

function pdfIframeSrc(blobUrl: string, mode: 'fit' | 'fitWidth' = 'fit'): string {
  // `Fit`: letterbox whole page (desktop). On some mobile PDF viewers `Fit` scales to height and crops sides — use `FitH` there.
  const view = mode === 'fitWidth' ? 'FitH' : 'Fit';
  return `${blobUrl}#page=1&toolbar=0&navpanes=0&view=${view}`;
}

/** PDF preview only (iframe). Download lives outside the modal card in admin clients. */
export function SignedOrderFormPdfPanel({ url, loading, error, variant = 'default' }: Props) {
  /** Shorter admin modal viewport + FitH: keep full page width in view; scroll vertically inside (better on iOS). */
  const isAdmin = variant === 'adminModal';
  const viewportH = isAdmin ? 'min(46dvh, 380px)' : 'min(56vh, 520px)';
  const iframeMode = isAdmin ? 'fitWidth' : 'fit';
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
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: isAdmin ? '6px' : '4px',
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
            src={pdfIframeSrc(url, iframeMode)}
            style={{
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
              maxWidth: '100%',
              border: 'none',
              display: 'block',
              margin: '0 auto',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
