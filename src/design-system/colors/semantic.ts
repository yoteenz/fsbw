/** Semantic color tokens — always reference CSS variables in UI */

export const FDS_SEMANTIC_COLORS = {
  primary: 'var(--fds-color-primary)',
  secondary: 'var(--fds-color-secondary)',
  accent: 'var(--fds-color-accent)',
  success: 'var(--fds-color-success)',
  warning: 'var(--fds-color-warning)',
  danger: 'var(--fds-color-danger)',
  neutral: 'var(--fds-color-neutral)',
  background: 'var(--fds-color-background)',
  surface: 'var(--fds-color-surface)',
  glass: 'var(--fds-color-glass)',
  overlay: 'var(--fds-color-overlay)',
  border: 'var(--fds-color-border)',
  shadow: 'var(--fds-color-shadow)',
  textPrimary: 'var(--fds-color-text-primary)',
  textSecondary: 'var(--fds-color-text-secondary)',
  disabled: 'var(--fds-color-disabled)',
  interactive: 'var(--fds-color-interactive)',
  hover: 'var(--fds-color-hover)',
  pressed: 'var(--fds-color-pressed)',
  focus: 'var(--fds-color-focus)',
} as const;

export type FdsSemanticColorKey = keyof typeof FDS_SEMANTIC_COLORS;
