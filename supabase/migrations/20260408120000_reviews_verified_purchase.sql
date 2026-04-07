-- Whether the reviewer is confirmed as a purchaser of the product (admin UI "(VERIFIED)").
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS verified_purchase boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.reviews.verified_purchase IS 'True when review is tied to an authenticated purchase; exposed as verifiedPurchase on GET /api/admin/reviews.';
