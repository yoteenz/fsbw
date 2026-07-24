import type { ReactNode } from 'react';
import { GlassSurface, type GlassSurfaceProps } from './GlassSurface';

export type GlassCardProps = Omit<GlassSurfaceProps, 'variant'> & { children?: ReactNode };

export function GlassCard(props: GlassCardProps) {
  return <GlassSurface variant="card" {...props} />;
}

export function GlassPanel(props: GlassCardProps) {
  return <GlassSurface variant="panel" {...props} />;
}

export function GlassWindow(props: GlassCardProps) {
  return <GlassSurface variant="window" {...props} />;
}

export function GlassDrawer(props: GlassCardProps) {
  return <GlassSurface variant="drawer" {...props} />;
}

export function GlassNavigation(props: GlassCardProps) {
  return <GlassSurface variant="navigation" {...props} />;
}

export function GlassModal(props: GlassCardProps) {
  return <GlassSurface variant="modal" {...props} />;
}

export function GlassSidebar(props: GlassCardProps) {
  return <GlassSurface variant="sidebar" {...props} />;
}

export function GlassTooltip(props: GlassCardProps) {
  return <GlassSurface variant="tooltip" {...props} />;
}

export function GlassBadge(props: GlassCardProps) {
  return <GlassSurface variant="badge" {...props} />;
}

export function GlassChip(props: GlassCardProps) {
  return <GlassSurface variant="chip" {...props} />;
}

export { GlassSurface, type GlassSurfaceProps } from './GlassSurface';
