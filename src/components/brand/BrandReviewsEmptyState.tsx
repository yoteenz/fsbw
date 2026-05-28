/** Empty state for `/brand/reviews`, centered in a card sized like Become a Member. */
export default function BrandReviewsEmptyState() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px 12px',
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
