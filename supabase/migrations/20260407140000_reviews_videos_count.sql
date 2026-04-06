-- Optional video attachment count for shop/tool reviews (admin pending breakdown + client metrics).
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS videos integer NOT NULL DEFAULT 0;
