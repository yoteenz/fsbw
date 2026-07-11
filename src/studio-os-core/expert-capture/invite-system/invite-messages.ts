import type { ExpertInvite } from './types';
import { getInviteProfileLabel } from './invite-profiles';

type MessageVariant = 'default' | 'tax_preparation' | 'permitting';

function resolveVariant(profileId: string): MessageVariant {
  if (profileId.includes('tax')) return 'tax_preparation';
  if (profileId.includes('permitting')) return 'permitting';
  return 'default';
}

function professionParagraph(variant: MessageVariant): string {
  if (variant === 'tax_preparation') {
    return 'This interview focuses on your tax preparation workflow — document review, quality-control methods, communication preferences, and the professional judgment you use when serving clients.';
  }
  if (variant === 'permitting') {
    return 'This interview focuses on your permitting workflow — municipality processes, document requirements, inspections, project coordination, and the quality-control methods you rely on every day.';
  }
  return 'This interview is designed to document your professional workflow, methods, decision-making, and expertise.';
}

export function buildDefaultInviteMessage(invite: ExpertInvite, inviteUrl: string): string {
  const variant = resolveVariant(invite.profileId);
  const interviewLabel = getInviteProfileLabel(invite.profileId);
  const welcome = invite.welcomeNote?.trim()
    ? `${invite.welcomeNote.trim()}\n\n`
    : '';

  return `${welcome}Hi ${invite.inviteeName},

I created a private Studio Institute interview for you.

${professionParagraph(variant)}

The goal is to capture knowledge you choose to approve so we can begin training a dedicated Studio professional (${invite.workerBeingCreated || interviewLabel}) based on what you confirm — not everything is used automatically.

The session uses a conversational interview format with video and audio. You can pause, correct, delete, redo, or edit any answer. Your progress saves automatically, so you can leave and return later using the same private link.

Open your interview here:

${inviteUrl}

Please keep this link private because it connects directly to your saved interview session.

Thank you.`.trim();
}

export function buildShareTitle(invite: ExpertInvite): string {
  return `Studio Institute interview for ${invite.inviteeName}`;
}
