-- Catalog/mock review ids (e.g. shop tab "2","3") are not in user_submitted_reviews; store supplemental state here.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_supplemental_overlay jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.review_supplemental_overlay IS 'Per review id: supplementalPhotos, supplementalVideos, supplementalContentStatus, supplementalPendingQueueId for non–userSubmittedReviews rows.';
