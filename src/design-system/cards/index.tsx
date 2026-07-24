import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utilities/cn';
import type { FdsCardVariant } from '../tokens/types';

export type FdsCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: FdsCardVariant;
  children?: ReactNode;
};

const VARIANT_CLASS: Record<FdsCardVariant, string> = {
  standard: '',
  luxury: 'fds-card--luxury',
  glass: 'fds-card--glass',
  product: 'fds-card--product',
  campaign: 'fds-card--campaign',
  analytics: 'fds-card--analytics',
  feature: 'fds-card--feature',
  dashboard: 'fds-card--dashboard',
};

export function FdsCard({ variant = 'standard', className, children, ...rest }: FdsCardProps) {
  return (
    <div className={cn('fds-card', VARIANT_CLASS[variant], className)} {...rest}>
      {children}
    </div>
  );
}

export function StandardCard(props: Omit<FdsCardProps, 'variant'>) {
  return <FdsCard variant="standard" {...props} />;
}

export function LuxuryCard(props: Omit<FdsCardProps, 'variant'>) {
  return <FdsCard variant="luxury" {...props} />;
}

export function GlassCard(props: Omit<FdsCardProps, 'variant'>) {
  return <FdsCard variant="glass" {...props} />;
}

export function ProductCard(props: Omit<FdsCardProps, 'variant'>) {
  return <FdsCard variant="product" {...props} />;
}

export function CampaignCard(props: Omit<FdsCardProps, 'variant'>) {
  return <FdsCard variant="campaign" {...props} />;
}

export function AnalyticsCard(props: Omit<FdsCardProps, 'variant'>) {
  return <FdsCard variant="analytics" {...props} />;
}

export function FeatureCard(props: Omit<FdsCardProps, 'variant'>) {
  return <FdsCard variant="feature" {...props} />;
}

export function DashboardCard(props: Omit<FdsCardProps, 'variant'>) {
  return <FdsCard variant="dashboard" {...props} />;
}
