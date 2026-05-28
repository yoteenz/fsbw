/** Empty state for `/brand/reviews` — compact centered gray copy (card hugs content). */
export default function BrandReviewsEmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '24px 12px' }}>
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
