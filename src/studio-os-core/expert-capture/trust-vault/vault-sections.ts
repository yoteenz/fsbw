import type { VaultSection } from './types';

export const VAULT_SECTIONS: VaultSection[] = [
  { id: 'original_recordings', title: 'Original Recordings', description: 'Source video and audio from every session.', icon: '🎬' },
  { id: 'audio', title: 'Audio', description: 'Audio-only captures and segments.', icon: '🎙' },
  { id: 'video', title: 'Video', description: 'Video answer recordings with timestamps.', icon: '📹' },
  { id: 'transcripts', title: 'Transcripts', description: 'Raw and expert-corrected transcripts.', icon: '📝' },
  { id: 'ai_summaries', title: 'AI Summaries', description: 'Interpretations awaiting or past approval.', icon: '✨' },
  { id: 'knowledge_graph', title: 'Knowledge Graph', description: 'Structured relationships between rules and workflows.', icon: '🕸' },
  { id: 'workflow_maps', title: 'Workflow Maps', description: 'Step-by-step procedures extracted from teaching.', icon: '🗺' },
  { id: 'corrections', title: 'Corrections', description: 'Expert corrections and superseding instructions.', icon: '✏️' },
  { id: 'published_knowledge', title: 'Published Knowledge', description: 'Active, approved knowledge in production.', icon: '✅' },
  { id: 'draft_knowledge', title: 'Draft Knowledge', description: 'Private drafts not yet submitted for review.', icon: '📋' },
  { id: 'retired_knowledge', title: 'Retired Knowledge', description: 'Superseded or retired rules preserved in history.', icon: '📦' },
  { id: 'version_history', title: 'Version History', description: 'Every version with effective dates and reasons.', icon: '📚' },
  { id: 'training_sessions', title: 'Training Sessions', description: 'Interview and continuing-education sessions.', icon: '🎓' },
  { id: 'worker_progress', title: 'Worker Progress', description: 'How your Studio worker is learning over time.', icon: '📈' },
  { id: 'competency_reports', title: 'Competency Reports', description: 'Area-by-area competency evidence.', icon: '🏆' },
  { id: 'permissions', title: 'Permissions', description: 'Who can access interview, vault, and training.', icon: '🔐' },
  { id: 'access_logs', title: 'Access Logs', description: 'Recent access events by role.', icon: '👁' },
  { id: 'audit_history', title: 'Audit History', description: 'Full institutional audit trail.', icon: '📜' },
  { id: 'exports', title: 'Exports', description: 'Download vault assets in standard formats.', icon: '⬇️' },
  { id: 'backups', title: 'Backups', description: 'Vault backup status and recovery points.', icon: '💾' },
  { id: 'legal_agreements', title: 'Legal Agreements', description: 'Signed trust framework agreements.', icon: '⚖️' },
  { id: 'trust_settings', title: 'Trust Settings', description: 'Privacy, retention, and access preferences.', icon: '⚙️' },
];

export const CONTINUOUS_EDUCATION_OPTIONS = [
  { id: 'teach_something_new', label: 'Teach Something New' },
  { id: 'correct_previous_lesson', label: 'Correct Previous Lesson' },
  { id: 'industry_update', label: 'Industry Update' },
  { id: 'law_change', label: 'Law Change' },
  { id: 'better_method', label: 'Better Method' },
  { id: 'common_mistake', label: 'Common Mistake' },
  { id: 'faq', label: 'FAQ' },
  { id: 'case_study', label: 'Case Study' },
  { id: 'new_client_scenario', label: 'New Client Scenario' },
  { id: 'emergency_update', label: 'Emergency Update' },
] as const;
