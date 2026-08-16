import { computeQaOverview, ACCESSIBILITY_CHECKLIST, BROWSER_MATRIX, DEVICE_MATRIX, PERFORMANCE_BASELINE, getPlaceholderAuditResults, getLegacyBrandAudit } from '../qa/qaEngine';
import { QA_TEST_SUITES, E2E_JOURNEY_MATRIX } from '../qa/testSuites';
import { getKnownDefects } from '../qa/knownDefects';
import { canExtractAllInOne, evaluateExtractionReadiness } from '../qa/extractionGate';
import { AIO_ROUTE_MANIFEST, getRouteManifestSummary } from '../qa/routeManifest';
import { AIO_DEPENDENCY_GRAPH } from '../qa/dependencyGraph';
import { getExtractionInventorySummary, AIO_ENV_INVENTORY, AIO_DATABASE_INVENTORY } from '../qa/inventories';

export function getQaOverview() {
  return computeQaOverview();
}

export function getQaTestSuites() {
  return QA_TEST_SUITES;
}

export function getQaJourneys() {
  return E2E_JOURNEY_MATRIX;
}

export function getQaDefects() {
  return getKnownDefects();
}

export function getExtractionGate() {
  return canExtractAllInOne({ vitestAllPassing: true, buildPassing: true });
}

export function getExtractionReport() {
  return evaluateExtractionReadiness();
}

export function getQaRoutes() {
  return AIO_ROUTE_MANIFEST;
}

export function getQaRouteSummary() {
  return getRouteManifestSummary();
}

export function getQaDependencyGraph() {
  return AIO_DEPENDENCY_GRAPH;
}

export function getQaInventories() {
  return {
    extraction: getExtractionInventorySummary(),
    env: AIO_ENV_INVENTORY,
    database: AIO_DATABASE_INVENTORY,
  };
}

export function getQaAccessibility() {
  return ACCESSIBILITY_CHECKLIST;
}

export function getQaPerformance() {
  return PERFORMANCE_BASELINE;
}

export function getQaDevices() {
  return DEVICE_MATRIX;
}

export function getQaBrowsers() {
  return BROWSER_MATRIX;
}

export function getQaPlaceholderAudit() {
  return getPlaceholderAuditResults();
}

export function getQaBrandAudit() {
  return getLegacyBrandAudit();
}
