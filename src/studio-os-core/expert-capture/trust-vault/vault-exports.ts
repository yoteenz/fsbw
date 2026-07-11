import type { KnowledgeProgram } from '../knowledge-mirror/types';
import type { ExpertCaptureSession } from '../types';
import type { VaultExportKind } from './types';

export type VaultExportBundle = {
  exportedAt: string;
  kind: VaultExportKind;
  format: 'json' | 'csv' | 'zip';
  filename: string;
  content: string | Blob;
};

function downloadBlob(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildVaultExport(
  kind: VaultExportKind,
  session: ExpertCaptureSession | null,
  program: KnowledgeProgram | null
): VaultExportBundle {
  const exportedAt = new Date().toISOString();
  const org = session?.meta.organizationLabel ?? 'organization';

  switch (kind) {
    case 'transcripts': {
      const rows = (session?.answers ?? [])
        .filter((a) => !a.deleted)
        .map((a) => ({
          question: a.questionText,
          transcript: a.correctedTranscript ?? a.transcript,
          status: a.status,
          recordedAt: a.recordedAt,
        }));
      return {
        exportedAt,
        kind,
        format: 'json',
        filename: `${org}-transcripts.json`,
        content: JSON.stringify(rows, null, 2),
      };
    }
    case 'approved_knowledge': {
      const rows = (program?.entries ?? []).filter((e) =>
        ['approved_for_training', 'active_knowledge', 'scenario_tested'].includes(e.lifecycleStatus)
      );
      return {
        exportedAt,
        kind,
        format: 'json',
        filename: `${org}-approved-knowledge.json`,
        content: JSON.stringify(rows, null, 2),
      };
    }
    case 'version_history': {
      return {
        exportedAt,
        kind,
        format: 'json',
        filename: `${org}-version-history.json`,
        content: JSON.stringify(program?.versions ?? [], null, 2),
      };
    }
    case 'audit_history': {
      return {
        exportedAt,
        kind,
        format: 'json',
        filename: `${org}-audit-history.json`,
        content: JSON.stringify([], null, 2),
      };
    }
    case 'competency_reports': {
      return {
        exportedAt,
        kind,
        format: 'json',
        filename: `${org}-competency-reports.json`,
        content: JSON.stringify(program?.competencies ?? [], null, 2),
      };
    }
    case 'worker_reports': {
      return {
        exportedAt,
        kind,
        format: 'json',
        filename: `${org}-worker-report.json`,
        content: JSON.stringify(
          {
            authorizations: program?.authorizations ?? [],
            competencies: program?.competencies ?? [],
            packets: program?.packets ?? [],
          },
          null,
          2
        ),
      };
    }
    case 'knowledge_graph':
    case 'workflow_maps':
    case 'ai_summaries':
    case 'recordings':
    default:
      return {
        exportedAt,
        kind,
        format: 'json',
        filename: `${org}-${kind}.json`,
        content: JSON.stringify({ note: 'Export prepared — media assets require vault session access.', kind, exportedAt }, null, 2),
      };
  }
}

export function downloadVaultExport(bundle: VaultExportBundle): void {
  if (typeof bundle.content === 'string') {
    downloadBlob(bundle.filename, bundle.content, bundle.format === 'csv' ? 'text/csv' : 'application/json');
  }
}

export const VAULT_EXPORT_OPTIONS: { kind: VaultExportKind; label: string; format: string }[] = [
  { kind: 'recordings', label: 'Recordings', format: 'ZIP (placeholder)' },
  { kind: 'transcripts', label: 'Transcripts', format: 'JSON' },
  { kind: 'knowledge_graph', label: 'Knowledge Graph', format: 'JSON' },
  { kind: 'workflow_maps', label: 'Workflow Maps', format: 'JSON' },
  { kind: 'ai_summaries', label: 'AI Summaries', format: 'JSON' },
  { kind: 'worker_reports', label: 'Worker Reports', format: 'JSON' },
  { kind: 'competency_reports', label: 'Competency Reports', format: 'JSON' },
  { kind: 'audit_history', label: 'Audit History', format: 'JSON' },
  { kind: 'approved_knowledge', label: 'Approved Knowledge', format: 'JSON' },
  { kind: 'version_history', label: 'Version History', format: 'JSON' },
];
