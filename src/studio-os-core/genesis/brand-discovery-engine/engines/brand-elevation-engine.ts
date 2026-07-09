import { mutateBrandDiscoveryEngineStore, readBrandDiscoveryEngineStore } from '../persistence';
import { getBrandDnaById } from './brand-dna-registry';
import type { XbdBrandDnaRecord, XbdElevationReport } from '../types';

function buildFindings(brand: XbdBrandDnaRecord): XbdElevationReport['findings'] {
  const findings: XbdElevationReport['findings'] = [];

  if (brand.antiPatterns.length < 3) {
    findings.push({
      findingId: 'anti-patterns-thin',
      category: 'Governance',
      severity: 'warning',
      summary: 'Anti-pattern list is thin for automated consistency checks.',
      recommendation: 'Document at least five anti-patterns with concrete UI/copy examples.',
    });
  }

  if (brand.luxuryLevel >= 80 && !brand.materials.some((m) => m.includes('marble') || m.includes('velvet'))) {
    findings.push({
      findingId: 'luxury-materials',
      category: 'Visual',
      severity: 'info',
      summary: 'High luxury level without premium material vocabulary.',
      recommendation: 'Add material cues that signal premium without clutter.',
    });
  }

  if (brand.competitors.length === 0) {
    findings.push({
      findingId: 'competitors-missing',
      category: 'Positioning',
      severity: 'critical',
      summary: 'No competitor references — differentiation scoring will be weak.',
      recommendation: 'Add 3–5 named competitors or category substitutes.',
    });
  }

  if (brand.brandRules.length < 4) {
    findings.push({
      findingId: 'rules-thin',
      category: 'Governance',
      severity: 'warning',
      summary: 'Brand rules need expansion for downstream engines.',
      recommendation: 'Add operational rules for Orb, packaging, and HQ expression.',
    });
  }

  if (findings.length === 0) {
    findings.push({
      findingId: 'health-strong',
      category: 'Overall',
      severity: 'info',
      summary: 'Brand DNA profile is structurally complete.',
      recommendation: 'Schedule quarterly elevation review after major product launches.',
    });
  }

  return findings;
}

/** Brand Elevation Engine™ — audits strategic Brand DNA health */
export function generateElevationReport(brandId: string): XbdElevationReport {
  const brand = getBrandDnaById(brandId);
  if (!brand) {
    return {
      reportId: `elev-${brandId}-missing`,
      brandId,
      overallHealth: 0,
      findings: [
        {
          findingId: 'missing-brand',
          category: 'Registry',
          severity: 'critical',
          summary: 'Brand not found in Brand DNA Registry™.',
          recommendation: 'Complete Brand Discovery Flow or seed canonical profile.',
        },
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  const findings = buildFindings(brand);
  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const overallHealth = Math.max(
    0,
    Math.min(100, 95 - criticalCount * 25 - warningCount * 8)
  );

  const report: XbdElevationReport = {
    reportId: `elev-${brandId}-${Date.now()}`,
    brandId,
    overallHealth,
    findings,
    generatedAt: new Date().toISOString(),
  };

  const store = readBrandDiscoveryEngineStore();
  const reports = [report, ...store.elevationReports.filter((r) => r.brandId !== brandId)].slice(
    0,
    12
  );
  mutateBrandDiscoveryEngineStore((s) => ({ ...s, elevationReports: reports }));

  return report;
}

export function getLatestElevationReport(brandId: string): XbdElevationReport | undefined {
  return readBrandDiscoveryEngineStore().elevationReports.find((r) => r.brandId === brandId);
}
