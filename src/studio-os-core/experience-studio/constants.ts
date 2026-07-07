import type { ExperienceDnaSliders, ExperienceTypeId } from './types';

export const EXPERIENCE_STUDIO_VERSION = '1.0';

export const EXPERIENCE_STUDIO_STORAGE_KEY = 'studioOs_experienceStudioSession_v1';

export const EXPERIENCE_ENTRY_CARDS: { id: ExperienceTypeId; label: string; hint: string }[] = [
  { id: 'website', label: 'Website', hint: 'Flagship presence · editorial rhythm' },
  { id: 'landing-page', label: 'Landing Page', hint: 'Single narrative · one decisive action' },
  { id: 'store', label: 'Store', hint: 'Commerce with hospitality · never catalog clutter' },
  { id: 'mobile-app', label: 'Mobile App', hint: 'Touch-first · calm native motion' },
  { id: 'desktop-app', label: 'Desktop App', hint: 'Focused workspace · invisible chrome' },
  { id: 'client-portal', label: 'Client Portal', hint: 'Trust · clarity · private confidence' },
  { id: 'dashboard', label: 'Dashboard', hint: 'Executive clarity · never SaaS noise' },
  { id: 'academy', label: 'Academy', hint: 'Learning journey · progressive revelation' },
  { id: 'marketplace', label: 'Marketplace', hint: 'Two-sided elegance · curated discovery' },
  { id: 'booking', label: 'Booking Experience', hint: 'Appointment flow · zero friction anxiety' },
  { id: 'interactive', label: 'Interactive Experience', hint: 'Immersive story · spatial navigation' },
  { id: 'internal-tool', label: 'Internal Tool', hint: 'Operations · precision without clutter' },
  { id: 'custom', label: 'Something Else', hint: 'Describe your world · Studio Intelligence listens' },
];

export const INTERVIEW_STYLE_CHOICES = [
  'Luxury',
  'Editorial',
  'Minimal',
  'Corporate',
  'Interactive',
  'Immersive',
  'Boutique',
  'Modern',
  'Organic',
  'Gaming',
  'Museum',
  'Hotel',
  'Technology',
  'Creative',
  'Futuristic',
] as const;

export const INTERVIEW_AUDIENCE_CHOICES = [
  'Hair Brand',
  'Law Firm',
  'Restaurant',
  'Medical Practice',
  'Agency',
  'Creator',
  'Construction',
  'School',
  'Nonprofit',
  'Custom Industry',
] as const;

export const INTERVIEW_FEELING_CHOICES = [
  'Inspired',
  'Exclusive',
  'Luxury',
  'Safe',
  'Confident',
  'Creative',
  'Powerful',
  'Excited',
  'Relaxed',
  'Trusted',
] as const;

export const DESIGN_DNA_PERSONALITIES: { id: string; label: string; accent: string }[] = [
  { id: 'luxury', label: 'Luxury™', accent: '#92704A' },
  { id: 'editorial', label: 'Editorial™', accent: '#0F172A' },
  { id: 'executive', label: 'Executive™', accent: '#334155' },
  { id: 'immersive', label: 'Immersive™', accent: '#6366F1' },
  { id: 'minimal', label: 'Minimal™', accent: '#64748B' },
  { id: 'organic', label: 'Organic™', accent: '#16A34A' },
  { id: 'museum', label: 'Museum™', accent: '#78716C' },
  { id: 'glass', label: 'Glass™', accent: '#0891B2' },
  { id: 'hospitality', label: 'Hospitality™', accent: '#B45309' },
  { id: 'modern', label: 'Modern™', accent: '#EB1C24' },
  { id: 'interactive', label: 'Interactive™', accent: '#7C3AED' },
  { id: 'gaming', label: 'Gaming™', accent: '#2563EB' },
];

export const DEFAULT_DESIGN_DNA: Record<string, number> = {
  luxury: 70,
  editorial: 20,
  immersive: 10,
};

export const DEFAULT_EXPERIENCE_DNA: ExperienceDnaSliders = {
  motion: 42,
  lighting: 68,
  depth: 55,
  glass: 72,
  storytelling: 61,
  navigation: 48,
  interaction: 52,
  animation: 38,
  transitions: 45,
  density: 35,
};

export const REMIX_OPTIONS = [
  'More Luxury',
  'More Editorial',
  'More Minimal',
  'More Feminine',
  'More Masculine',
  'More Dramatic',
  'More Interactive',
  'More Spacious',
  'More Premium',
  'More Organic',
  'More Corporate',
  'More Gaming',
  'More Apple-like',
] as const;

export const DESIGN_HEALTH_LABELS = [
  'Visual Hierarchy',
  'Brand Consistency',
  'Accessibility',
  'Performance',
  'Conversion',
  'Motion',
  'Typography',
  'Spacing',
  'Color Harmony',
  'Navigation',
  'Content Density',
] as const;
