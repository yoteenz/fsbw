import type { ProtectionCard } from './types';

export const PROTECTION_CARDS: ProtectionCard[] = [
  {
    id: 'confidentiality',
    title: 'Confidentiality',
    summary: 'Your recordings remain confidential and are only accessible according to permissions you approve.',
    detail: 'Access is role-gated. Unpublished material stays within your approved visibility boundary.',
  },
  {
    id: 'ownership',
    title: 'Ownership',
    summary: 'You continue to own your proprietary methods.',
    detail: 'Studio stores and organizes your knowledge but does not become the owner of your business processes.',
  },
  {
    id: 'training_scope',
    title: 'Training Scope',
    summary: 'Your knowledge is only used to train the Studio Worker(s) you authorize.',
    detail: 'We never silently train unrelated workers. Each organization receives an isolated worker.',
  },
  {
    id: 'version_history',
    title: 'Version History',
    summary: 'Every change is tracked. Nothing disappears.',
    detail: 'Previous knowledge versions remain recoverable in your Knowledge Vault.',
  },
  {
    id: 'audit_trail',
    title: 'Audit Trail',
    summary: 'Every interaction with your knowledge is logged.',
    detail: 'Date, user, worker, purpose, and action — visible in your vault audit history.',
  },
  {
    id: 'encryption',
    title: 'Encryption',
    summary: 'Videos, audio, transcripts, knowledge graphs, and AI summaries are encrypted at rest.',
    detail: 'Institutional-grade protection for every asset class in your vault.',
  },
  {
    id: 'review_before_training',
    title: 'Review Before Training',
    summary: 'Nothing becomes official until approved.',
    detail: 'AI suggestions remain drafts until you and authorized reviewers approve them.',
  },
  {
    id: 'knowledge_updates',
    title: 'Knowledge Updates',
    summary: 'You can continuously improve your worker.',
    detail: 'Teaching never ends — corrections, industry updates, and confessional entries are always welcome.',
  },
  {
    id: 'access_control',
    title: 'Access Control',
    summary: 'Choose exactly who can access interview, knowledge, worker, vault, training, and reports.',
    detail: 'Granular permissions with owner oversight at every stage.',
  },
  {
    id: 'withdrawal_rights',
    title: 'Withdrawal Rights',
    summary: 'Archive or remove unpublished knowledge whenever possible.',
    detail: 'Subject to agreed legal or operational requirements — you retain control over drafts and unpublished material.',
  },
];
