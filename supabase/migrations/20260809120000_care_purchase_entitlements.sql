-- Purchase-included Care entitlements (server-authoritative, no expiration / no watch limits).

CREATE TABLE IF NOT EXISTS public.care_purchase_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  order_id text NOT NULL,
  order_line_key text NOT NULL,
  product_name text NOT NULL,
  product_type text NOT NULL,
  base_unit_id text,
  texture_family text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, order_id, order_line_key)
);

CREATE INDEX IF NOT EXISTS care_purchase_entitlements_user_idx
  ON public.care_purchase_entitlements (user_id, status, granted_at DESC);

ALTER TABLE public.care_purchase_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS care_purchase_entitlements_select_own ON public.care_purchase_entitlements;
CREATE POLICY care_purchase_entitlements_select_own ON public.care_purchase_entitlements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.care_purchase_entitlements IS 'Purchase-included Care access profiles derived from qualifying DELIVERED hair orders.';
