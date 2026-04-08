type Props = {
  url: string | null;
  loading: boolean;
  error: string | null;
};

function pdfIframeSrc(blobUrl: string): string {
  // Fit page width (tall single-page PDFs use custom height; FitH avoids side letterboxing in the viewer).
  return `${blobUrl}#toolbar=1&navpanes=0&view=FitH&zoom=page-width`;
}

/** PDF preview only (iframe). Download lives outside the modal card in admin clients. */
export function SignedOrderFormPdfPanel({ url, loading, error }: Props) {
  const minH = 'min(420px, 55vh)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, flex: 1, alignItems: 'stretch' }}>
      <div
        style={{
          flex: 1,
          minHeight: minH,
          border: '1px solid #e5e7eb',
          background: '#f3f4f6',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
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
              maxWidth: '100%',
              height: '100%',
              minHeight: minH,
              minWidth: 0,
              border: 'none',
              display: 'block',
              margin: '0 auto',
              alignSelf: 'stretch',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
