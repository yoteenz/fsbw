import { createHash } from 'node:crypto';
import type { ConstructionPlan } from '../../blueprint-author/construction-plan-schema';
import { appendArchitectureLawToEnvironmentPrompt, appendArchitectureLawToNegativePrompt } from '../../architecture-law-001/prompt-directives';
import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { getCanonicalDepartmentRecord } from '../../canonical-studio-world/canonical-department-registry';
import { resolveDepartmentFingerprint } from '../../canonical-studio-world/department-architectural-fingerprints';
import { resolveArchitecturalDna } from '../registry/dna-registry';
import { resolveCompanyDna } from '../registry/company-dna-registry';
import { resolveGoldenReferencePack, listGoldenReferenceAssetPaths } from '../references/golden-reference-library';
import { resolveDepartmentNegativePrompts } from '../references/negative-prompt-library';
import type { FounderRenderCompileRequest, FounderRenderCompileResult } from '../schemas/compiler-contract';
import { FOUNDER_RENDER_PROMPT_COMPILER_VERSION } from '../schemas/compiler-contract';

function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function describePlanAssets(plan: ConstructionPlan): string {
  const heroes = plan.heroAssets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId}`;
  });
  const furniture = plan.furnitureSet.assets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId}`;
  });
  return [
    heroes.length ? `Hero placement: ${heroes.join('; ')}` : '',
    furniture.length ? `Furniture: ${furniture.join('; ')}` : '',
  ]
    .filter(Boolean)
    .join('. ');
}

/**
 * FounderRenderPromptCompiler™ — compiles prompts from Architectural DNA + Golden References + Blueprint + Company DNA.
 * No handwritten runtime prompts.
 */
export function compileFounderRenderPrompt(request: FounderRenderCompileRequest): FounderRenderCompileResult {
  const { departmentId, plan, brandPackage, companyDna, renderKind } = request;
  const record = getCanonicalDepartmentRecord(departmentId);
  if (!record) throw new Error(`Unknown department: ${departmentId}`);

  const dna = resolveArchitecturalDna(departmentId);
  const goldenPack = resolveGoldenReferencePack(departmentId);
  const fingerprint = resolveDepartmentFingerprint(departmentId);

  const isPortrait = renderKind === 'portrait';
  const cameraSection = isPortrait
    ? `MOBILE COMPOSITION: ${dna.cameraLanguage.mobileComposition}. Aspect ${dna.cameraLanguage.mobileAspectRatio}. Same architecture as desktop — reframe only.`
    : `DESKTOP COMPOSITION: ${dna.cameraLanguage.desktopComposition}. Aspect ${dna.cameraLanguage.desktopAspectRatio}.`;

  const goldenRefPaths = listGoldenReferenceAssetPaths(departmentId);

  const sections = [
    `COMPILED FOUNDER RENDER — ${dna.departmentName}`,
    `DEPARTMENT DNA: ${dna.dnaVersion} r${dna.profileRevision}`,
    `GOLDEN REFERENCE PACK: ${goldenPack.packId} r${goldenPack.packRevision}`,
    `PROMPT COMPILER: ${FOUNDER_RENDER_PROMPT_COMPILER_VERSION}`,
    `DEPARTMENT ID: ${departmentId}`,
    `PROMPT VERSION: ${record.departmentPromptVersion}`,
    `ARCHITECTURAL CHARTER: ${dna.architecturalCharter}`,
    `PURPOSE: ${dna.purpose}`,
    `VISUAL IDENTITY: ${dna.visualIdentity}`,
    `SIGNATURE MOOD: ${dna.signatureMood}`,
    `ARCHITECTURAL STYLE: ${dna.architecturalStyle}`,
    `SIGNATURE GEOMETRY: ${dna.signatureGeometry}`,
    `SPATIAL COMPOSITION: ${dna.spatialComposition}`,
    `HERO OBJECT: ${dna.heroObject}`,
    `ATMOSPHERE: ${dna.atmosphere}`,
    `ENVIRONMENT FX: ${dna.environmentFX.join(' · ')}`,
    `MUST INCLUDE: ${dna.signatureFurniture.join(' · ')} · ${dna.signatureTechnology.join(' · ')}`,
    `DNA POSITIVE TEMPLATE: ${dna.positivePromptTemplate}`,
    `BLUEPRINT: ${plan.architecture.architectureId} v${plan.architecture.version} · Shell ${plan.architecture.shellSpecId}`,
    `CONSTRUCTION PLAN: ${plan.planId} r${plan.metadata.revision}`,
    `ASSET PLACEMENT: ${describePlanAssets(plan)}`,
    `MATERIAL LANGUAGE — Floors: ${dna.materials.floorMaterial}. Walls: ${dna.materials.wallMaterial}. Ceiling: ${dna.materials.ceilingMaterial}. Metals: ${dna.materials.metalPalette.join(', ')}. Glass: ${dna.materials.glassPalette.join(', ')}.`,
    `LIGHTING: ${dna.lightingProfile} — ${dna.accentLighting}. Plan profile: ${plan.lightingProfile.profileId} ${plan.lightingProfile.colorTemperatureK}K.`,
    cameraSection,
    `FRAMING RULES: ${dna.cameraLanguage.framingRules.join(' · ')}`,
    `GOLDEN REFERENCES: Hero ${goldenPack.heroRender.assetPath} · Material ${goldenPack.materialBoard.assetPath} · Mood ${goldenPack.moodBoard.assetPath}`,
    `REFERENCE BOARDS: ${goldenRefPaths.slice(0, 4).join(', ')}`,
    companyDna.brandInjectionPrompt,
    `BRAND MATERIALS: ${brandPackage.promptSections.organizationMaterialAssignments}`,
    `COMMAND DOCK: ${dna.layoutRules.commandDockLayout}`,
    `WORKBENCH: ${dna.layoutRules.workbenchLayout}`,
    `QUALITY TARGETS: ${dna.qualityTargets.join(' · ')}`,
    request.founderRevisionNote ? `FOUNDER REVISION: ${request.founderRevisionNote}` : '',
    `OUTPUT: ${record.departmentPromptVersion} · ${isPortrait ? '9:16 portrait reframe' : '21:9 desktop hero'} · department-compiled · DNA-isolated.`,
  ].filter(Boolean);

  const prompt = appendArchitectureLawToEnvironmentPrompt(sections.join('\n\n'));

  const negativeItems = [
    dna.negativePromptTemplate,
    ...resolveDepartmentNegativePrompts(departmentId),
    ...dna.cameraLanguage.negativeCompositionRules,
    ...companyDna.forbiddenBrandSubstitutions,
    brandPackage.promptSections.forbiddenMaterialSubstitutions,
  ].filter(Boolean);

  const negativePrompt = appendArchitectureLawToNegativePrompt([...new Set(negativeItems)].join(', '));

  const promptHash = hashText(prompt);
  const negativePromptHash = hashText(negativePrompt);

  return {
    compilerVersion: FOUNDER_RENDER_PROMPT_COMPILER_VERSION,
    prompt,
    negativePrompt,
    promptVersion: record.departmentPromptVersion,
    promptHash,
    negativePromptHash,
    departmentId,
    dnaProfile: dna,
    goldenReferencePack: goldenPack,
    companyDna,
    artifactIntent: isPortrait ? 'master-founder-portrait' : 'master-founder-landscape',
    architecturalFingerprint: fingerprint.signatureElements,
    diagnostics: {
      departmentDnaVersion: dna.dnaVersion,
      departmentDnaRevision: dna.profileRevision,
      goldenReferenceVersion: goldenPack.packVersion,
      goldenReferenceRevision: goldenPack.packRevision,
      promptCompilerVersion: FOUNDER_RENDER_PROMPT_COMPILER_VERSION,
      blueprintVersion: plan.architecture.version,
      blueprintRevision: plan.metadata.revision,
      referencePackVersion: goldenPack.packId,
      cameraVersion: isPortrait ? dna.cameraLanguage.mobileAspectRatio : dna.cameraLanguage.desktopAspectRatio,
      lightingVersion: plan.lightingProfile.version,
      materialVersion: plan.materialSet.version,
      qualityVersion: dna.qualityTargets[0] ?? '4K photoreal',
      promptHash,
      negativePromptHash,
      companyDnaVersion: companyDna.companyDnaVersion,
      organizationId: companyDna.organizationId,
      renderKind,
      aspectRatio: isPortrait ? '9:16' : '21:9',
    },
  };
}

/** Bridge for existing canonical-founder-render-prompt consumers. */
export function compileFromConstructionPlan(input: {
  plan: ConstructionPlan;
  brandPackage: import('../../creative-production/brand-asset-grounding').BrandMaterialPackage;
  founderRevisionNote?: string | null;
  renderKind?: 'landscape' | 'portrait';
  organizationId?: string;
}): FounderRenderCompileResult {
  const departmentId = input.plan.room.roomId as CanonicalMainDepartmentId;
  return compileFounderRenderPrompt({
    departmentId,
    plan: input.plan,
    brandPackage: input.brandPackage,
    companyDna: resolveCompanyDna(input.organizationId ?? input.plan.metadata.organizationId),
    renderKind: input.renderKind ?? 'landscape',
    founderRevisionNote: input.founderRevisionNote,
  });
}
