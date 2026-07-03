-- Public bucket for reusable Frontal Slayer email assets (marble background, rose, diamond, monogram).
-- Upload files with: npm run email:upload-assets

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-assets',
  'email-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for email clients
DROP POLICY IF EXISTS "email_assets_public_read" ON storage.objects;
CREATE POLICY "email_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-assets');

-- Service role manages uploads (scripts use service role key)
DROP POLICY IF EXISTS "email_assets_service_write" ON storage.objects;
CREATE POLICY "email_assets_service_write"
  ON storage.objects FOR ALL
  USING (bucket_id = 'email-assets' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'email-assets' AND auth.role() = 'service_role');
