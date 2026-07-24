import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utilities/cn';
import type { FdsLayoutVariant } from '../tokens/types';

export type FdsLayoutProps = HTMLAttributes<HTMLDivElement> & {
  variant?: FdsLayoutVariant;
  marble?: boolean;
  children?: ReactNode;
};

const VARIANT_CLASS: Record<FdsLayoutVariant, string> = {
  desktop: 'fds-layout--desktop',
  mobile: 'fds-layout--mobile',
  'full-screen': 'fds-layout--full-screen',
  split: 'fds-layout--split',
  dashboard: 'fds-layout--dashboard',
  marketing: 'fds-layout--marketing',
  landing: 'fds-layout--landing',
  immersive: 'fds-layout--immersive',
};

export function FdsLayout({
  variant = 'mobile',
  marble = true,
  className,
  children,
  ...rest
}: FdsLayoutProps) {
  return (
    <div
      className={cn(
        'fds-layout',
        VARIANT_CLASS[variant],
        marble && 'fds-layout--marble',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function DesktopLayout(props: Omit<FdsLayoutProps, 'variant'>) {
  return <FdsLayout variant="desktop" {...props} />;
}

export function MobileLayout(props: Omit<FdsLayoutProps, 'variant'>) {
  return <FdsLayout variant="mobile" {...props} />;
}

export function FullScreenLayout(props: Omit<FdsLayoutProps, 'variant'>) {
  return <FdsLayout variant="full-screen" marble={false} {...props} />;
}

export function SplitLayout(props: Omit<FdsLayoutProps, 'variant'>) {
  return <FdsLayout variant="split" {...props} />;
}

export function DashboardLayout(props: Omit<FdsLayoutProps, 'variant'>) {
  return <FdsLayout variant="dashboard" {...props} />;
}

export function MarketingLayout(props: Omit<FdsLayoutProps, 'variant'>) {
  return <FdsLayout variant="marketing" {...props} />;
}

export function LandingLayout(props: Omit<FdsLayoutProps, 'variant'>) {
  return <FdsLayout variant="landing" {...props} />;
}

export function ImmersiveLayout(props: Omit<FdsLayoutProps, 'variant'>) {
  return <FdsLayout variant="immersive" marble={false} {...props} />;
}
