import { ASSET_METADATA_FIELDS } from './constants';
import type { AssetMetadataSchema, AssetMetadataField } from './types';

const FIELD_META: Record<AssetMetadataField, { label: string; required: boolean }> = {
  'unique-id': { label: 'Unique ID', required: true },
  name: { label: 'Name', required: true },
  category: { label: 'Category', required: true },
  owner: { label: 'Owner', required: true },
  organization: { label: 'Organization', required: true },
  department: { label: 'Department', required: false },
  version: { label: 'Version', required: true },
  tags: { label: 'Tags', required: false },
  keywords: { label: 'Keywords', required: false },
  description: { label: 'Description', required: false },
  usage: { label: 'Usage', required: false },
  'related-systems': { label: 'Related Systems', required: false },
  'associated-workflows': { label: 'Associated Workflows', required: false },
  'brand-guidelines': { label: 'Brand Guidelines', required: false },
  license: { label: 'License', required: false },
  'storage-location': { label: 'Storage Location', required: true },
  'last-modified': { label: 'Last Modified', required: true },
  'usage-history': { label: 'Usage History', required: false },
};

export function buildAssetMetadataSchema(): AssetMetadataSchema[] {
  return ASSET_METADATA_FIELDS.map((field) => ({
    field,
    tracked: true as const,
    ...FIELD_META[field],
  }));
}
