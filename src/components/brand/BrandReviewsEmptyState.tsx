/** Empty state for `/brand/reviews`, centered in a menu-toggle-height card. */
export default function BrandReviewsEmptyState() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: 0,
      }}
    >
      <p
        style={{
          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
          fontSize: '11px',
          color: '#808080',
          textTransform: 'uppercase',
          margin: 0,
          lineHeight: 1.45,
        }}
        dangerouslySetInnerHTML={{
          __html: 'UNFORTUNATELY, NO REVIEWS HAVE BEEN SUBMITTED YET.<br>PLEASE CHECK BACK SOON.',
        }}
      />
    </div>
  );
}
