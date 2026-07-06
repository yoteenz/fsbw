import { ASSET_CATEGORIES } from './constants';
import type { AssetCategory, AssetCategoryEntry } from './types';

const CATEGORY_META: Record<
  AssetCategory,
  { label: string; description: string; registeredCount: number }
> = {
  images: { label: 'Images', description: 'Photography, hero images, product shots.', registeredCount: 312 },
  videos: { label: 'Videos', description: 'Promotional, training, and lounge content.', registeredCount: 48 },
  audio: { label: 'Audio', description: 'Voiceovers, music beds, podcast clips.', registeredCount: 22 },
  logos: { label: 'Logos', description: 'Primary, secondary, and partner logos.', registeredCount: 12 },
  'brand-kits': { label: 'Brand Kits', description: 'Complete brand identity packages.', registeredCount: 4 },
  documents: { label: 'Documents', description: 'SOPs, contracts, internal docs.', registeredCount: 142 },
  pdfs: { label: 'PDFs', description: 'Downloadable guides and reports.', registeredCount: 67 },
  templates: { label: 'Templates', description: 'Reusable design and content templates.', registeredCount: 38 },
  presentations: { label: 'Presentations', description: 'Executive decks and pitch materials.', registeredCount: 19 },
  icons: { label: 'Icons', description: 'UI icons and navigation glyphs.', registeredCount: 86 },
  illustrations: { label: 'Illustrations', description: 'Custom artwork and diagrams.', registeredCount: 54 },
  '3d-models': { label: '3D Models', description: 'Product renders and scene assets.', registeredCount: 15 },
  animations: { label: 'Animations', description: 'Motion graphics and Lottie files.', registeredCount: 28 },
  'marketing-assets': { label: 'Marketing Assets', description: 'Campaign creatives and ad units.', registeredCount: 94 },
  'training-assets': { label: 'Training Assets', description: 'Employee onboarding materials.', registeredCount: 41 },
  'knowledge-assets': { label: 'Knowledge Assets', description: 'Profession Brain and wiki resources.', registeredCount: 33 },
  'academy-resources': { label: 'Academy Resources', description: 'Studio Institute course materials.', registeredCount: 22 },
  'marketplace-resources': { label: 'Marketplace Resources', description: 'Expert Marketplace product assets.', registeredCount: 15 },
  'documentation-assets': { label: 'Documentation Assets', description: 'Help center and guide illustrations.', registeredCount: 29 },
};

export function buildAssetCategoryCatalog(): AssetCategoryEntry[] {
  return ASSET_CATEGORIES.map((category) => ({
    category,
    searchable: true as const,
    ...CATEGORY_META[category],
  }));
}

export function countTotalRegisteredAssets(): number {
  return buildAssetCategoryCatalog().reduce((sum, c) => sum + c.registeredCount, 0);
}
