import './styles/fds.css';

/**
 * Frontal Slayer Design System (FDS)
 * Official visual DNA for every digital experience.
 */

// Tokens
export * from './tokens/types';
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadows';
export * from './animations';
export * from './themes';

// Utilities & hooks
export * from './utilities';
export * from './hooks';

// Typography component
export { FdsText, type FdsTextProps } from './typography/FdsText';

// Glass system
export {
  GlassSurface,
  GlassCard,
  GlassPanel,
  GlassWindow,
  GlassDrawer,
  GlassNavigation,
  GlassModal,
  GlassSidebar,
  GlassTooltip,
  GlassBadge,
  GlassChip,
  type GlassSurfaceProps,
  type GlassCardProps,
} from './glass';
export { FDS_GLASS_VARIANTS, FDS_GLASS_CSS_VARS, fdsGlassClass } from './glass/tokens';

// Buttons
export {
  FdsButton,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  GlassButton,
  LuxuryButton,
  IconButton,
  FloatingButton,
  LoadingButton,
  DisabledButton,
  type FdsButtonProps,
} from './buttons';

// Cards (GlassCard exported as GlassStyleCard to avoid clash with glass/GlassCard)
export {
  FdsCard,
  StandardCard,
  LuxuryCard,
  GlassCard as GlassStyleCard,
  ProductCard,
  CampaignCard,
  AnalyticsCard,
  FeatureCard,
  DashboardCard,
  type FdsCardProps,
} from './cards';

// Panels
export {
  FdsPanel,
  FloatingAcrylicPanel,
  DesktopPanel,
  LobbyPanel,
  DashboardPanel,
  LuxuryModalPanel,
  DrawerPanel,
  InfoPanel,
  NotificationPanel,
  ContentPanel,
  type FdsPanelProps,
} from './panels';

// Forms
export {
  FdsField,
  FdsLabel,
  FdsInput,
  FdsTextarea,
  FdsSelect,
  type FdsFieldProps,
  type FdsLabelProps,
  type FdsInputProps,
  type FdsTextareaProps,
  type FdsSelectProps,
} from './forms';

// Icons
export { FdsIcon, type FdsIconProps, type FdsIconSize } from './icons';

// Layouts
export {
  FdsLayout,
  DesktopLayout,
  MobileLayout,
  FullScreenLayout,
  SplitLayout,
  DashboardLayout,
  MarketingLayout,
  LandingLayout,
  ImmersiveLayout,
  type FdsLayoutProps,
} from './layouts';

// Theme application
export { applyFdsTheme } from './themes/applyTheme';
export { applyFdsCssVariables } from './colors/css-variables';
