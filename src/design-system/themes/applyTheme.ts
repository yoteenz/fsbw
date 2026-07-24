import { FDS_DEFAULT_THEME } from './defaultTheme';

export function applyFdsTheme(el: HTMLElement = document.documentElement): void {
  Object.entries(FDS_DEFAULT_THEME.cssVars).forEach(([key, value]) => {
    el.style.setProperty(key, value);
  });
  el.classList.add('fds-theme');
}

export { FDS_DEFAULT_THEME, FDS_ALL_CSS_VARS, FDS_BREAKPOINTS } from './defaultTheme';
export type { FdsTheme } from './defaultTheme';
