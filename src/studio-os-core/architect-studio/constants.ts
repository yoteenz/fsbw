import type { ArchitectStudioId, SpatialNavMode } from './types';

export const ARCHITECT_STUDIO_STORAGE_KEY = 'studioOsArchitectStudio_v1';
export const ARCHITECT_STUDIO_VERSION = '1.0.0';
export const ARCHITECT_STUDIO_ID = 'architect-studio';

export const STUDIO_PHILOSOPHY = [
  'Companies should be designed inside creative environments — not software interfaces',
  'One immersive innovation atelier where every discipline works together',
  'Spatial navigation · walk · zoom · focus · explore — not disconnected dashboards',
  'The physical heart of Studio OS — where founders step inside their company',
] as const;

export const ARCHITECT_STUDIO_CONNECTED_SYSTEMS = [
  'Business Architect',
  'Brand Architect',
  'Experience Architect',
  'Digital Architect',
  'Growth Architect',
  'Chief of Staff',
  'Studio Intelligence',
  'Company Genome',
  'Knowledge Graph',
  'Organizational Inheritance',
] as const;

export const SPATIAL_NAV_MODES: { mode: SpatialNavMode; label: string; description: string }[] = [
  { mode: 'campus', label: 'CAMPUS', description: 'Full innovation campus · five connected studios' },
  { mode: 'studio', label: 'STUDIO', description: 'Focus inside one architect workspace' },
  { mode: 'forum', label: 'FORUM', description: 'Central collaboration circle · major decisions' },
  { mode: 'evolution-wall', label: 'EVOLUTION WALL', description: 'Living organizational history' },
  { mode: 'innovation-lab', label: 'INNOVATION LAB', description: 'Prototype · simulate · experiment' },
  { mode: 'portfolio', label: 'PORTFOLIO', description: 'Multi-company innovation campus' },
];

export const STUDIO_ROOM_DEFS: {
  id: ArchitectStudioId;
  label: string;
  tagline: string;
  architectModule: string;
  accentColor: string;
}[] = [
  {
    id: 'business-studio',
    label: 'BUSINESS STUDIO',
    tagline: 'Where ideas become businesses',
    architectModule: 'Company Maturity Engine',
    accentColor: '#0369A1',
  },
  {
    id: 'brand-studio',
    label: 'BRAND STUDIO',
    tagline: 'Where businesses become brands',
    architectModule: 'Brand Architect',
    accentColor: '#BE185D',
  },
  {
    id: 'experience-studio',
    label: 'EXPERIENCE STUDIO',
    tagline: 'Where brands become unforgettable experiences',
    architectModule: 'Experience Architect',
    accentColor: '#0891B2',
  },
  {
    id: 'digital-studio',
    label: 'DIGITAL STUDIO',
    tagline: 'Where experiences become digital ecosystems',
    architectModule: 'Digital Architect',
    accentColor: '#6366F1',
  },
  {
    id: 'growth-studio',
    label: 'GROWTH STUDIO',
    tagline: 'Where businesses become enduring organizations',
    architectModule: 'Growth Architect',
    accentColor: '#059669',
  },
];
