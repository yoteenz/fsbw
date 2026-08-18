/**
 * SITE 00 asset registry — metadata for environments, objects, icons.
 * Components resolve assets through this registry, not hardcoded filenames.
 */

export type AssetType = 'environment' | 'object' | 'icon' | 'texture' | 'motion' | 'interface-reference';

export type AssetStatus = 'reference-only' | 'temporary' | 'production' | 'pending';

export type Site00Asset = {
  id: string;
  type: AssetType;
  src?: string;
  alt: string;
  environment?: string;
  route?: string;
  status: AssetStatus;
  notes?: string;
};

export const SITE00_ASSET_REGISTRY: Site00Asset[] = [
  {
    id: 'env-origin',
    type: 'environment',
    alt: 'SITE 00 Origin architectural environment',
    environment: 'ORIGIN_ENVIRONMENT',
    route: '/',
    status: 'production',
    notes: 'Desktop 942898D3-6953-47CD-8987-0697EC1C9F11.png · mobile C63192EC-00BE-46DB-8D3A-952173F6F5D1.png @ live-preview/site00',
  },
  {
    id: 'env-workflow',
    type: 'environment',
    alt: 'SITE 00 workflow hall environment',
    environment: 'WORKFLOW_ENVIRONMENT',
    route: '/idnty/state',
    status: 'production',
    notes: 'Desktop background — live-preview/site00/3A2AC3AD-7192-45E8-B4B3-B811CB0DD792.png (/idnty/state, /bldr/state)',
  },
  {
    id: 'env-enter-00',
    type: 'environment',
    alt: 'ENTER 00 waiting room lobby',
    environment: 'ENTER_00_WAITING_ROOM',
    route: '/enter',
    status: 'production',
    notes: 'Desktop background — live-preview/site00/89319E70-D080-4798-9BCA-E53B137F2387.png',
  },
  {
    id: 'obj-idnty-state-00',
    type: 'object',
    alt: 'Identity state 00 wireframe geometry',
    status: 'pending',
    notes: 'Four identity-state wireframe objects for brand state cards',
  },
  {
    id: 'obj-idnty-state-01',
    type: 'object',
    alt: 'Identity state 01 wireframe geometry',
    status: 'pending',
  },
  {
    id: 'obj-idnty-state-02',
    type: 'object',
    alt: 'Identity state 02 wireframe geometry',
    status: 'pending',
  },
  {
    id: 'obj-idnty-state-03',
    type: 'object',
    alt: 'Identity state 03 wireframe geometry',
    status: 'pending',
  },
  {
    id: 'obj-bldr-site',
    type: 'object',
    alt: 'BLDR SITE build class wireframe',
    status: 'pending',
  },
  {
    id: 'obj-bldr-world',
    type: 'object',
    alt: 'BLDR WORLD build class wireframe',
    status: 'pending',
  },
  {
    id: 'obj-bldr-enterprise',
    type: 'object',
    alt: 'BLDR ENTERPRISE build class wireframe',
    status: 'pending',
  },
  {
    id: 'obj-bldr-discovery',
    type: 'object',
    alt: 'BLDR NOT SURE discovery wireframe',
    status: 'pending',
  },
  {
    id: 'icon-geometric-red',
    type: 'icon',
    alt: 'SITE 00 red wireframe icons',
    status: 'temporary',
    notes: 'CSS/SVG wireframe placeholders until production icon set',
  },
];

export function getAsset(id: string): Site00Asset | undefined {
  return SITE00_ASSET_REGISTRY.find((a) => a.id === id);
}
