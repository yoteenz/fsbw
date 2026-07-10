/**
 * Route dispatcher — selects diagnostic or main application entry before either bundle graph loads.
 */
import { isDiagnosticRoute } from './diagnostic-entry/paths';

const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

if (isDiagnosticRoute(pathname)) {
  void import('./diagnostic-entry/diagnostic-main');
} else {
  void import('./main-app');
}
