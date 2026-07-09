import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import { submitStudioInteraction } from '../interactions/engine';
import type { InteractionStatus } from '../constants';
import type { StudioCommand } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createCommandId(slug: string): string {
  const token = (slug.trim() || 'command')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `CMD-${token}-${Date.now().toString(36)}`;
}

/** Command Registry™ */
export function listCommandRegistry(): StudioCommand[] {
  return readInteractionModelStore().commands;
}

export function getStudioCommand(commandId: string): StudioCommand | undefined {
  return readInteractionModelStore().commands.find((c) => c.commandId === commandId);
}

export function issueStudioCommand(input: {
  officialName: string;
  commandType: string;
  issuerObjectId: string;
  targetObjectId: string;
  parameters?: Record<string, unknown>;
}): StudioCommand {
  const timestamp = now();

  const interaction = submitStudioInteraction({
    interactionType: 'command',
    officialName: input.officialName,
    initiatorObjectId: input.issuerObjectId,
    recipientObjectId: input.targetObjectId,
    slug: input.commandType,
    metadata: { parameters: input.parameters ?? {} },
  });

  const command: StudioCommand = {
    commandId: createCommandId(input.commandType),
    officialName: input.officialName.trim(),
    commandType: input.commandType.trim(),
    issuerObjectId: input.issuerObjectId,
    targetObjectId: input.targetObjectId,
    parameters: input.parameters ?? {},
    interactionId: interaction.interactionId,
    status: 'requested',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateInteractionModelStore((store) => ({
    ...store,
    commands: [...store.commands, command],
  }));

  return command;
}

export function updateCommandStatus(
  commandId: string,
  status: InteractionStatus
): StudioCommand | undefined {
  let updated: StudioCommand | undefined;

  mutateInteractionModelStore((store) => {
    const idx = store.commands.findIndex((c) => c.commandId === commandId);
    if (idx < 0) return store;

    updated = {
      ...store.commands[idx],
      status,
      updatedAt: now(),
    };

    const commands = [...store.commands];
    commands[idx] = updated;
    return { ...store, commands };
  });

  return updated;
}

export function listCommandsForObject(objectId: string): StudioCommand[] {
  return listCommandRegistry().filter(
    (c) => c.issuerObjectId === objectId || c.targetObjectId === objectId
  );
}
