/** Founder Notes™ — reusable Studio Object (department + project scoped). */

export type FounderNoteKind = 'text' | 'voice' | 'pinned' | 'reminder';

export type FounderNoteStatus = 'open' | 'pinned' | 'resolved';

export type FounderNote = {
  id: string;
  departmentId: string;
  projectId: string;
  kind: FounderNoteKind;
  body: string;
  status: FounderNoteStatus;
  createdAt: string;
  updatedAt: string;
};
