import type { XerResolvedDnaLayers } from './dna-resolver';

export type XerInteractionBundle = {
  hover: string;
  focus: string;
  selected: string;
  success: string;
  warning: string;
  approval: string;
  disabled: string;
};

export function assembleInteractionProfile(layers: XerResolvedDnaLayers): XerInteractionBundle {
  const { interaction } = layers;
  return {
    hover: interaction.hover,
    focus: interaction.focus,
    selected: interaction.selected,
    success: interaction.success,
    warning: interaction.warning,
    approval: interaction.approval,
    disabled: interaction.disabled,
  };
}
