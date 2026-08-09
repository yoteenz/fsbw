-- Product-aware Care: immutable order configuration snapshot on purchase profiles.

ALTER TABLE public.care_purchase_entitlements
  ADD COLUMN IF NOT EXISTS configuration_snapshot jsonb;

COMMENT ON COLUMN public.care_purchase_entitlements.configuration_snapshot IS
  'Immutable Build-A-Wig / unit configuration at entitlement grant time for rule-based Care matching.';
