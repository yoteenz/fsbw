import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utilities/cn';
import type { FdsPanelVariant } from '../tokens/types';

export type FdsPanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?: FdsPanelVariant;
  children?: ReactNode;
};

const VARIANT_CLASS: Record<FdsPanelVariant, string> = {
  'floating-acrylic': 'fds-panel--floating-acrylic',
  desktop: 'fds-panel--desktop',
  lobby: 'fds-panel--lobby',
  dashboard: 'fds-panel--dashboard',
  'luxury-modal': 'fds-panel--luxury-modal',
  drawer: 'fds-panel--drawer',
  info: 'fds-panel--info',
  notification: 'fds-panel--notification',
  content: 'fds-panel--content',
};

export function FdsPanel({ variant = 'content', className, children, ...rest }: FdsPanelProps) {
  return (
    <div className={cn('fds-panel', VARIANT_CLASS[variant], className)} {...rest}>
      {children}
    </div>
  );
}

export function FloatingAcrylicPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="floating-acrylic" {...props} />;
}

export function DesktopPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="desktop" {...props} />;
}

export function LobbyPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="lobby" {...props} />;
}

export function DashboardPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="dashboard" {...props} />;
}

export function LuxuryModalPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="luxury-modal" {...props} />;
}

export function DrawerPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="drawer" {...props} />;
}

export function InfoPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="info" {...props} />;
}

export function NotificationPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="notification" {...props} />;
}

export function ContentPanel(props: Omit<FdsPanelProps, 'variant'>) {
  return <FdsPanel variant="content" {...props} />;
}
