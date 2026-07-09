import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import type { StudioMessage } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createMessageId(): string {
  return `MSG-${Date.now().toString(36)}`;
}

export function sendStudioMessage(input: {
  senderObjectId: string;
  recipientObjectId: string;
  body: string;
  conversationId?: string;
  interactionId?: string;
  metadata?: Record<string, unknown>;
}): StudioMessage {
  const message: StudioMessage = {
    messageId: createMessageId(),
    conversationId: input.conversationId,
    interactionId: input.interactionId,
    senderObjectId: input.senderObjectId,
    recipientObjectId: input.recipientObjectId,
    body: input.body.trim(),
    metadata: input.metadata ?? {},
    createdAt: now(),
  };

  mutateInteractionModelStore((store) => ({
    ...store,
    messages: [...store.messages, message],
  }));

  return message;
}

export function listStudioMessages(conversationId?: string): StudioMessage[] {
  const messages = readInteractionModelStore().messages;
  return conversationId ? messages.filter((m) => m.conversationId === conversationId) : messages;
}

export function listMessagesForObject(objectId: string): StudioMessage[] {
  return readInteractionModelStore().messages.filter(
    (m) => m.senderObjectId === objectId || m.recipientObjectId === objectId
  );
}
