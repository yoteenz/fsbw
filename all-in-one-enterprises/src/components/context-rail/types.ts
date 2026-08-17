import type { ReactNode } from 'react';

export type ContextRailItemState = 'complete' | 'current' | 'future' | 'default';

export type ContextRailVariant =
  | 'journey'
  | 'navigation'
  | 'service'
  | 'dashboard'
  | 'document'
  | 'marketplace'
  | 'status';

export type ContextRailItem = {
  id: string;
  label: string;
  subtitle?: string;
  href?: string;
  scrollTarget?: string;
  state?: ContextRailItemState;
  external?: boolean;
};

export type ContextRailProgress = {
  label: string;
  value: number;
};

export type ContextRailStatusRow = {
  label: string;
  value: string;
};

export type ContextRailHelp = {
  title: string;
  copy?: string;
  href: string;
  linkLabel: string;
};

export type ContextRailTrust = {
  title: string;
  copy: string;
};

export type ContextRailConfig = {
  variant: ContextRailVariant;
  eyebrow?: string;
  title: string;
  description?: string;
  showLogo?: boolean;
  itemsLabel?: string;
  items?: ContextRailItem[];
  progress?: ContextRailProgress;
  status?: ContextRailStatusRow[];
  footer?: ReactNode;
  help?: ContextRailHelp;
  trust?: ContextRailTrust;
  ariaLabel?: string;
};
