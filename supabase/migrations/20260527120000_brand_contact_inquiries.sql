-- Brand / Contact Us form submissions (public POST via API + admin read).
CREATE TABLE IF NOT EXISTS public.brand_contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  is_order_related boolean NOT NULL DEFAULT false,
  order_number text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS brand_contact_inquiries_status_created
  ON public.brand_contact_inquiries (status, created_at DESC);

ALTER TABLE public.brand_contact_inquiries ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.brand_contact_inquiries IS 'Contact form on /brand/contact; inserted by Vercel API (service role).';
