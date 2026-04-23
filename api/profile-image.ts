import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { getSupabaseAdminServiceRole } from './_lib/supabase.js';

const BUCKET = 'profile-images';

function parseDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) return null;
  const mime = (match[1] || '').toLowerCase();
  const b64 = match[2] || '';
  try {
    const buffer = Buffer.from(b64, 'base64');
    return { mime, bytes: new Uint8Array(buffer) };
  } catch {
    return null;
  }
}

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg';
  if (mime === 'image/webp') return 'webp';
  return 'png';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
  if (!imageDataUrl) return res.status(400).json({ error: 'Missing imageDataUrl' });

  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) return res.status(400).json({ error: 'Invalid image data URL' });
  if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(parsed.mime)) {
    return res.status(400).json({ error: 'Unsupported image type' });
  }
  if (parsed.bytes.byteLength > 2 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image must be <= 2MB' });
  }

  try {
    const admin = getSupabaseAdminServiceRole();
    const { data: existingBucket } = await admin.storage.getBucket(BUCKET);
    if (!existingBucket) {
      const { error: createBucketError } = await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });
      if (createBucketError && !/already exists/i.test(createBucketError.message || '')) {
        return res.status(500).json({ error: createBucketError.message });
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Storage bucket setup failed';
    return res.status(500).json({ error: msg });
  }

  const ext = extFromMime(parsed.mime);
  const objectPath = `${user.id}/avatar.${ext}`;
  try {
    const admin = getSupabaseAdminServiceRole();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(objectPath, parsed.bytes, {
        upsert: true,
        contentType: parsed.mime,
      });
    if (uploadError) return res.status(500).json({ error: uploadError.message });

    const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(objectPath);
    const profileImage = publicData.publicUrl;

    // Persist URL with service role so RLS/JWT quirks cannot block the write after a successful upload.
    // User identity is already verified via getAuthUser (Bearer); we only touch row id = that user.
    const now = new Date().toISOString();
    const { data: existing } = await admin.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (existing) {
      const { error: updateError } = await admin
        .from('profiles')
        .update({ profile_image: profileImage, updated_at: now })
        .eq('id', user.id);
      if (updateError) return res.status(500).json({ error: updateError.message });
    } else {
      const { error: insertError } = await admin.from('profiles').insert({
        id: user.id,
        email: user.email || null,
        profile_image: profileImage,
        created_at: now,
        updated_at: now,
      });
      if (insertError) return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ profileImage });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed';
    return res.status(500).json({ error: msg });
  }
}
