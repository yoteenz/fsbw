-- Optional per-review client photo when profile join is not used or URL is stored on the row.
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS client_profile_photo_url text;

COMMENT ON COLUMN public.reviews.client_profile_photo_url IS 'Optional client avatar URL for admin review list; GET /api/admin/reviews also fills from profiles.profile_image by email when null.';
