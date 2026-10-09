import type { ExpertiseVisibility, JournalReader, PrivateNote } from './types';

export type PermissionAction = 'read' | 'edit' | 'review' | 'export' | 'share' | 'worker_context' | 'revoke';

const RANK: Record<ExpertiseVisibility, number> = {
  company_standard: 0,
  team_only: 1,
  owner_only: 2,
  restricted_expert: 3,
};

function roleCeiling(role: JournalReader['role']): ExpertiseVisibility {
  if (role === 'owner' || role === 'founder') return 'restricted_expert';
  if (role === 'expert') return 'restricted_expert';
  return 'team_only';
}

export function canPerform(input: {
  reader: JournalReader;
  noteOrganizationId: string;
  visibility: ExpertiseVisibility;
  action: PermissionAction;
  workerUseGranted: boolean;
  inviteRevoked: boolean;
}): boolean {
  if (input.inviteRevoked) return false;
  if (input.reader.organizationId !== input.noteOrganizationId) return false;
  if (input.action === 'worker_context') return false;
  if (input.action === 'revoke') return input.reader.role === 'owner' || input.reader.role === 'founder';
  if (!input.workerUseGranted && input.action === 'share' && input.visibility === 'restricted_expert') {
    return input.reader.role === 'owner' || input.reader.role === 'founder' || input.reader.role === 'expert';
  }
  return RANK[input.visibility] <= RANK[roleCeiling(input.reader.role)];
}

export function visiblePrivateNotes(notes: PrivateNote[], reader: JournalReader, noteOrganizationId: string): PrivateNote[] {
  return notes.filter((note) =>
    canPerform({
      reader,
      noteOrganizationId,
      visibility: note.visibility,
      action: 'read',
      workerUseGranted: false,
      inviteRevoked: false,
    }),
  );
}
