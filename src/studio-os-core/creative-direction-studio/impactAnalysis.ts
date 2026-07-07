import type { DirectionChangeImpact } from './types';

export function analyzeDirectionChangeImpact(
  changeSummary: string,
  currentDepartment?: string
): DirectionChangeImpact {
  const text = changeSummary.toLowerCase();
  const visual = /visual|color|typography|packaging|luxury|design|motion/.test(text);
  const copy = /hook|script|caption|tone|editorial|corporate|copy/.test(text);
  const campaign = /campaign|strategy|audience|direction|start over|merge/.test(text);

  const affectedDepartments: string[] = [];
  const affectedArtifacts: string[] = [];

  if (campaign || currentDepartment === 'discover') {
    affectedDepartments.push('Discover', 'Development', 'Assembly', 'Production', 'Review');
    affectedArtifacts.push('Creative Brief', 'Production Package', 'Master Content Asset');
  } else if (copy) {
    affectedDepartments.push('Development', 'Production', 'Review', 'Expansion');
    affectedArtifacts.push('Script', 'Hook', 'Caption', 'Instagram derivatives');
  } else if (visual) {
    affectedDepartments.push('Production', 'Review', 'Expansion', 'Publishing');
    affectedArtifacts.push('Thumbnail', 'Visual frames', 'Carousel layouts');
  } else {
    affectedDepartments.push(currentDepartment ?? 'Production', 'Review');
    affectedArtifacts.push('Master Content Asset', 'Derivative library');
  }

  return {
    affectedDepartments: [...new Set(affectedDepartments)],
    affectedArtifacts: [...new Set(affectedArtifacts)],
    summary: `Creative direction change may affect ${affectedDepartments.slice(0, 3).join(', ')}.`,
    options: [
      {
        id: 'update-downstream',
        label: 'Update downstream assets',
        detail: 'Apply new direction to in-progress work without restarting the pipeline.',
      },
      {
        id: 'rebuild-stages',
        label: 'Rebuild affected stages',
        detail: 'Regenerate Development and Production artifacts from the updated brief.',
      },
      {
        id: 'keep-versions',
        label: 'Keep existing versions',
        detail: 'Preserve current master asset; new direction applies to future work only.',
      },
      {
        id: 'parallel-branch',
        label: 'Create parallel creative branch',
        detail: 'Compare directions side-by-side without overwriting prior ideas.',
      },
    ],
  };
}
