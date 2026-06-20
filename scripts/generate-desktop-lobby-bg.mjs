#!/usr/bin/env node
/**
 * Generate the Frontal Slayer Desktop Flagship Lobby background image.
 *
 * Uses openai/gpt-image-2/edit via @fal-ai/client.
 * IMAGE 1: The existing brand marble texture (marble bg.png) — so the floor, walls,
 *          and surfaces use the exact same marble material as the rest of the app.
 * Generates a massive bright white flagship showroom and uploads to Supabase Storage.
 *
 * Usage:
 *   source .env.wig-preview or load .env.local in PowerShell
 *   npm run lobby:generate-desktop-bg            -- generates if not exists
 *   OVERWRITE=1 npm run lobby:generate-desktop-bg -- force regenerate
 *   DRY_RUN=1 npm run lobby:generate-desktop-bg  -- print prompt only
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const falKey = process.env.FAL_KEY || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const bucket = process.env.STORAGE_BUCKET || 'live-preview';
const storagePath = process.env.STORAGE_PATH || 'desktop-lobby/lobby-bg-v1.webp';
const outputPath = process.env.OUTPUT_PATH || join(repoRoot, 'tmp/desktop-lobby-bg.webp');
const dryRun = process.env.DRY_RUN === '1';
const overwrite = process.env.OVERWRITE === '1';

// The brand marble texture used throughout the mobile app.
// GPT Image 2 will use this as the primary material reference for the showroom.
const MARBLE_REF_PATH = join(repoRoot, 'public/assets/marble bg.png');

// Flagship environment prompt.
// The marble reference image is passed as IMAGE 1 so GPT Image 2 applies
// that exact material to the floor, walls, pedestal, and surfaces.
const PROMPT = Ultra-realistic luxury flagship showroom interior.
IMAGE 1 is the approved brand marble material. Apply it as the primary surface across the floor, architectural walls, pedestal, and display surfaces throughout this showroom.

SCALE AND ARCHITECTURE:
Grand double-height atrium. Soaring white ceilings with ornate architectural moulding. Massive central space with long sight lines. Grand curved marble staircase on one or both sides leading to a visible upper balcony level. The space must feel enormous and immersive — a world-class flagship destination, not a room.

MATERIALS (critical):
- Floor: polished brand marble from IMAGE 1 with deep specular mirror reflections
- Walls: white marble panels from IMAGE 1 with clean architectural lines
- Columns: clear crystal acrylic columns with edge lighting — NOT stone, NOT carved marble
- Display towers: clear acrylic illuminated structures
- Pedestal: brand marble base with clear acrylic crystal cap, softly lit from within
- Vessels, planters, display cases: ALL clear acrylic or crystal — absolutely no stone urns, no stone planters

LIGHTING (critical — white light ONLY):
Bright white crystal chandeliers with cascading pendants filling the ceiling. White prismatic light refractions across the marble floor. Crisp white ambient illumination. Crystal sparkle highlights. Diamond-light dispersion. NO warm amber. NO cream glow. NO golden tones. NO pink wash. NO purple. The room is illuminated by crystal and acrylic — the light is white, bright, and clean.

CENTER PEDESTAL EXHIBIT:
Large illuminated marble pedestal in the center foreground. On top: a luxury heather gray upholstered fabric mannequin bust — fine woven textile surface, no facial features, elegant couture silhouette. The mannequin displays a center-part bone-straight jet black wig — hyper realistic hair strands, mirror symmetry, luxury campaign quality. Soft white spotlight from above. The pedestal and mannequin should be the immediate visual focal point.

ROSES:
Large intentional crimson red rose arrangements. Displayed in tall clear acrylic vessels or elevated acrylic rose pedestals. Placed symmetrically flanking the central exhibit. Rich saturated crimson color. NO scattered petals on floor. Every rose placement is architectural and intentional.

DIAMONDS:
Oversized clear crystal diamond sculptures displayed on acrylic plinths. Faceted surfaces refracting white prismatic light. Placed architecturally on both sides of the central space. Large scale — architectural presence, not small decorations.

FLOATING ACRYLIC PANELS:
Left side: large floating clear acrylic panel with edge lighting. Right side: matching floating clear acrylic panel with edge lighting. Both appear suspended in the air inside the showroom. Each panel has visible thickness, crystal clear faces, and subtle internal glow.

TYPOGRAPHY:
FRONTAL SLAYER in large uppercase letters, brand red color (#C81C24), with a subtle white-edge neon glow halo, centered above the pedestal at architectural scale. Below it in smaller uppercase: LUXURY WITHOUT LIMITS.

COLOR PALETTE (absolute):
White. Bright white. Crisp white marble. Clear acrylic. Crystal clear. Crimson red accents (roses, small brand text only). Jet black hair. Heather gray mannequin. NO cream. NO beige. NO warm gold. NO amber. NO terracotta. NO blush dominant tones.

STYLE: Architectural visualization quality. Luxury flagship retail photography. Ultra-realistic. Photorealistic render.

NEGATIVE: cream walls, beige surfaces, gold dominant surfaces, stone columns, stone urns, carved stone, warm amber lighting, hotel lobby, traditional luxury, dark mode, purple glow, blue glow, cyberpunk, anime, illustration, cartoon, warm golden tones, clutter, random text, human faces.;

async function downloadToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(Download failed:  );
  return Buffer.from(await res.arrayBuffer());
}

async function storageObjectExists(supabase) {
  const { error } = await supabase.storage.from(bucket).download(storagePath);
  return !error;
}

async function main() {
  console.log('\n Frontal Slayer - Desktop Flagship Lobby Generator (v2)');
  console.log('======================================================\n');

  if (dryRun) {
    console.log('[DRY RUN] Prompt:\n');
    console.log(PROMPT);
    return;
  }

  if (!falKey) { console.error('Missing FAL_KEY'); process.exit(1); }
  if (!supabaseUrl || !supabaseKey) { console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (!overwrite) {
    console.log(Checking Storage: /...);
    const exists = await storageObjectExists(supabase);
    if (exists) {
      const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
      console.log('Already exists. Use OVERWRITE=1 to regenerate.');
      console.log('\nVITE_DESKTOP_LOBBY_BG_URL=' + publicUrl);
      return;
    }
  }

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  // Upload the brand marble reference to FAL storage
  if (!existsSync(MARBLE_REF_PATH)) {
    console.error('Brand marble not found at:', MARBLE_REF_PATH);
    process.exit(1);
  }
  console.log('Uploading brand marble reference to FAL storage...');
  const marbleBuf = readFileSync(MARBLE_REF_PATH);
  const marbleBlob = new Blob([marbleBuf], { type: 'image/png' });
  const marbleFile = new File([marbleBlob], 'marble-bg.png', { type: 'image/png' });
  const marbleUrl = await fal.storage.upload(marbleFile);
  console.log('Marble reference uploaded:', marbleUrl.slice(0, 60) + '...');

  console.log('\nModel: openai/gpt-image-2/edit');
  console.log('Quality: high | Size: 1536x1024 | Calling FAL...');

  const result = await fal.subscribe('openai/gpt-image-2/edit', {
    input: {
      prompt: PROMPT,
      image_urls: [marbleUrl],
      image_size: { width: 1536, height: 1024 },
      quality: 'high',
      output_format: 'webp',
      num_images: 1,
    },
    logs: true,
    onQueueUpdate(update) {
      if (update.status === 'IN_QUEUE') process.stdout.write('Queued...\r');
      if (update.status === 'IN_PROGRESS') process.stdout.write('Generating...\r');
    },
  });

  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) {
    console.error('Unexpected FAL response:', JSON.stringify(result?.data).slice(0, 400));
    process.exit(1);
  }
  console.log('\nFAL complete. URL:', imageUrl);

  const imageBuf = await downloadToBuffer(imageUrl);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, imageBuf);
  console.log('Saved locally:', outputPath);

  console.log(Uploading to Supabase: /...);
  const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, imageBuf, {
    contentType: 'image/webp',
    upsert: true,
  });
  if (upErr) {
    console.error('Upload failed:', upErr.message);
    process.exit(1);
  }

  const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
  console.log('\nDone!');
  console.log('Public URL:', publicUrl);
  console.log('\nVITE_DESKTOP_LOBBY_BG_URL=' + publicUrl);
}

main().catch((err) => { console.error(err); process.exit(1); });