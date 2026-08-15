/**
 * Lazy entry for All In One debug app — code-split from Frontal Slayer main bundle.
 */
import { lazyWithRetry } from '../../utils/lazyWithRetry';

export const AllInOneRoutesLazy = lazyWithRetry(
  () => import('./AllInOneRoutes'),
  'AllInOneRoutes',
);

export { AllInOneLoading } from './AllInOneRoutes';
