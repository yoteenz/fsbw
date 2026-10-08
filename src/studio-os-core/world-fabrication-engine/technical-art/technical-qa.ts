import type { ProductionLane } from './types';
import type { AssetPackageManifest } from './asset-package';
import { packageCompletenessSummary } from './asset-package';
import { validateTextureMapColorSpace, type TextureMapRecord } from './geometry-uv-texture-material';
import { validateCharacterRequirements, type AnimationClipRecord, type SkeletonRecord, type SkinWeightsRecord } from './character-rig-animation';
import type { CharacterClassification } from './types';

export type TechnicalQaFinding = {
  lane: ProductionLane;
  category: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  executableInRepo: boolean;
};

export function runLaneTechnicalQa(
  lane: ProductionLane,
  pkg: AssetPackageManifest,
  textures: TextureMapRecord[],
  character?: {
    classification: CharacterClassification;
    skeleton?: SkeletonRecord;
    weights?: SkinWeightsRecord;
    animations?: AnimationClipRecord[];
  }
): TechnicalQaFinding[] {
  const findings: TechnicalQaFinding[] = [];
  const { ready, blocking } = packageCompletenessSummary(pkg);

  findings.push({
    lane,
    category: 'PACKAGE_COMPLETENESS',
    severity: ready ? 'INFO' : 'CRITICAL',
    message: ready
      ? 'Required deliverables satisfied at manifest level'
      : `Blocking slots: ${blocking.join(', ')}`,
    executableInRepo: true,
  });

  for (const map of textures) {
    const colorErrors = validateTextureMapColorSpace(map);
    for (const err of colorErrors) {
      findings.push({
        lane,
        category: 'TEXTURE_COLOR_SPACE',
        severity: 'CRITICAL',
        message: err,
        executableInRepo: true,
      });
    }
  }

  if (lane === 'CHARACTER_ART' && character) {
    const charResult = validateCharacterRequirements(
      character.classification,
      character.skeleton,
      character.weights,
      character.animations
    );
    if (charResult.severity === 'CRITICAL') {
      for (const msg of charResult.messages) {
        findings.push({
          lane: 'CHARACTER_ART',
          category: 'CHARACTER_RIG',
          severity: 'CRITICAL',
          message: msg,
          executableInRepo: true,
        });
      }
    }
  }

  if (lane === 'ENVIRONMENT_ART') {
    findings.push({
      lane,
      category: 'ENGINE_IMPORT',
      severity: 'WARNING',
      message: 'Unreal/Blender mesh import not executed — contract validation only',
      executableInRepo: false,
    });
  }

  return findings;
}
