import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  BuildObjectReadinessReport,
  GlbInspectionResult,
  PackageInventory,
  TechnicalRequirementAssessment,
} from './types';
import type { AssetPackageManifest } from '../technical-art/asset-package';
import { packageCompletenessSummary } from '../technical-art/asset-package';

export function buildTechnicalAssessments(
  inventory: PackageInventory,
  glbInspections: GlbInspectionResult[],
  packageRoot: string
): TechnicalRequirementAssessment[] {
  const assessments: TechnicalRequirementAssessment[] = [];
  const has = (role: string) => inventory.files.some((f) => f.role === role);
  const webGlb = glbInspections.find((g) => g.filePath.includes('Web.glb'));

  assessments.push({
    requirementId: 'source_geometry_blend',
    category: 'GEOMETRY',
    cell: has('SOURCE_BLEND') ? 'PRESENT' : 'MISSING',
    evidence: inventory.files.filter((f) => f.role === 'SOURCE_BLEND').map((f) => f.sha256),
  });

  assessments.push({
    requirementId: 'runtime_web_glb',
    category: 'GEOMETRY',
    cell: has('RUNTIME_GLB') ? 'PRESENT' : 'MISSING',
    evidence: webGlb ? [`triangles=${webGlb.triangleCount}`, `sha256=${webGlb.sha256}`] : [],
  });

  assessments.push({
    requirementId: 'runtime_high_glb',
    category: 'GEOMETRY',
    cell: has('RUNTIME_GLB_HIGH') ? 'PRESENT' : 'MISSING',
    evidence: [],
    notes: 'Missing in reduced Under4MB fixture',
  });

  assessments.push({
    requirementId: 'runtime_fbx',
    category: 'GEOMETRY',
    cell: has('RUNTIME_FBX') ? 'PRESENT' : 'MISSING',
    notes: 'Missing in reduced Under4MB fixture',
    evidence: [],
  });

  assessments.push({
    requirementId: 'material_definitions',
    category: 'MATERIALS',
    cell: existsSync(join(packageRoot, '05_DOCUMENTATION/material-manifest.json')) ? 'PRESENT' : 'MISSING',
    evidence: ['material-manifest.json'],
  });

  assessments.push({
    requirementId: 'module_hierarchy',
    category: 'MODULARITY',
    cell: existsSync(join(packageRoot, '05_DOCUMENTATION/module-manifest.json')) ? 'PRESENT' : 'MISSING',
    evidence: ['module-manifest.json'],
  });

  assessments.push({
    requirementId: 'validation_report',
    category: 'QA',
    cell: has('VALIDATION_REPORT') ? 'PRESENT' : 'MISSING',
    evidence: ['export-validation-report.json'],
  });

  assessments.push({
    requirementId: 'render_evidence',
    category: 'QA',
    cell: inventory.missingFromFullReviewPackage.some((m) => m.startsWith('03_RENDERS'))
      ? 'MISSING'
      : 'PRESENT',
    notes: 'Full review package includes Blender renders; reduced fixture omits 03_RENDERS',
    evidence: [],
  });

  assessments.push({
    requirementId: 'reference_lineage',
    category: 'LINEAGE',
    cell: inventory.missingFromFullReviewPackage.some((m) => m.startsWith('04_COMPARISONS'))
      ? 'MISSING'
      : 'PRESENT',
    notes: 'Comparison assets absent in reduced fixture',
    evidence: [],
  });

  assessments.push({
    requirementId: 'collision_mesh',
    category: 'COLLISION',
    cell: 'NOT_REQUIRED',
    evidence: [],
    notes: 'Static prop web delivery — collision optional per profile',
  });

  assessments.push({
    requirementId: 'navigation',
    category: 'NAVIGATION',
    cell: 'NOT_APPLICABLE',
    evidence: [],
  });

  assessments.push({
    requirementId: 'lod_meshes',
    category: 'LOD',
    cell: 'NOT_REQUIRED',
    evidence: [],
  });

  assessments.push({
    requirementId: 'rig_animation',
    category: 'CHARACTER',
    cell: 'NOT_APPLICABLE',
    evidence: [],
  });

  assessments.push({
    requirementId: 'blender_native_inspection',
    category: 'DCC',
    cell: 'BLOCKED',
    evidence: [],
    notes: 'Blender CLI not available in cloud benchmark environment',
  });

  assessments.push({
    requirementId: 'unreal_import',
    category: 'ENGINE',
    cell: 'UNVERIFIED',
    evidence: ['export-validation-report.json: unreal NOT TESTED'],
  });

  if (webGlb) {
    assessments.push({
      requirementId: 'glb_integrity_parse',
      category: 'GEOMETRY',
      cell: webGlb.parseOk ? 'PRESENT' : 'BLOCKED',
      evidence: [`meshes=${webGlb.meshCount}`, `materials=${webGlb.materialNames.join(',')}`],
    });

    assessments.push({
      requirementId: 'uv_texture_embedded',
      category: 'TEXTURES',
      cell: webGlb.embeddedImageCount > 0 ? 'PRESENT' : 'MISSING',
      evidence: [`embeddedImages=${webGlb.embeddedImageCount}`],
    });
  }

  return assessments;
}

export function buildReadinessReport(
  manifest: AssetPackageManifest,
  inventory: PackageInventory,
  glbInspections: GlbInspectionResult[],
  packageRoot: string
): BuildObjectReadinessReport {
  const completeness = packageCompletenessSummary(manifest);
  let visualFidelity: BuildObjectReadinessReport['architecturalVisualFidelity'] = 'PENDING';
  const fidelityPath = join(packageRoot, '05_DOCUMENTATION/VISUAL_FIDELITY_REPORT.md');
  if (existsSync(fidelityPath)) {
    const text = readFileSync(fidelityPath, 'utf8');
    if (text.toLowerCase().includes('partial')) visualFidelity = 'PARTIAL';
  }

  const exportReportPath = join(packageRoot, '05_DOCUMENTATION/export-validation-report.json');
  let technicalQuality: BuildObjectReadinessReport['technicalAssetQuality'] = 'UNVERIFIED';
  if (existsSync(exportReportPath)) {
    const report = JSON.parse(readFileSync(exportReportPath, 'utf8')) as { status?: string };
    technicalQuality = report.status === 'PASS' ? 'PASS' : 'PARTIAL';
  }

  const webGlb = glbInspections.find((g) => g.filePath.includes('Web.glb'));
  let webReadiness: BuildObjectReadinessReport['webRuntimeReadiness'] = 'UNVERIFIED';
  if (webGlb?.parseOk && webGlb.triangleCount > 0) {
    webReadiness = webGlb.triangleCount < 15000 ? 'PASS' : 'PARTIAL';
  }

  const packageCompleteness: BuildObjectReadinessReport['productionPackageCompleteness'] =
    inventory.missingFromFullReviewPackage.length === 0 && !completeness.blocking.length
      ? 'COMPLETE'
      : 'PARTIAL';

  const blockers: string[] = [];
  if (inventory.missingFromFullReviewPackage.length > 0) {
    blockers.push('Reduced archive — missing full review package folders/exports');
  }
  if (completeness.blocking.length > 0) {
    blockers.push(`Profile blocking slots: ${completeness.blocking.join(', ')}`);
  }

  return {
    reportId: 'site00-build-object-v2-readiness',
    assetId: manifest.assetId,
    packageVersion: manifest.version,
    architecturalVisualFidelity: visualFidelity,
    technicalAssetQuality: technicalQuality,
    webRuntimeReadiness: webReadiness,
    unrealReadiness: 'NOT_TESTED',
    productionPackageCompleteness: packageCompleteness,
    founderApproval: 'PENDING',
    founderApprovalNotes: [
      'V2 architecture awaiting founder visual approval — technical ingest does not imply creative approval',
      'README recommends REVISE / pending decision',
    ],
    recommendedTechnicalCorrections: [
      'Ingest full review package (High GLB, FBX, renders, comparisons) for complete founder review bundle',
      'Add optional collision mesh if Builder interaction requires physics',
      'Run Unreal import validation when authorized',
      'Re-run Blender validate_v2.py when Shadow PC or CI Blender is available',
    ],
    blockers,
  };
}
