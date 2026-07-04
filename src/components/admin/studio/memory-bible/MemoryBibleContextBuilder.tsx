import { useMemo, useState } from 'react';
import type { ContextBuilderInput, ContextPackage } from '../../../../studio-os/memory-bible';
import {
  CONTEXT_BUILDER_SCOPES,
  CONTEXT_BUILDER_TARGETS,
  CONTEXT_BUILDER_TASK_TYPES,
  CONTEXT_BUILDER_WORKSPACES,
} from '../../../../utils/adminStudioMemoryBibleDemo';
import { MB_VISUAL, mbActionBtn, mbCaption, mbPanelStyle, mbSectionTitle } from './memoryBibleTheme';

type MemoryBibleContextBuilderProps = {
  buildPackage: (input: ContextBuilderInput) => ContextPackage;
  onSavePackage: (pkg: ContextPackage) => void;
  onRecordExport: (pkg: ContextPackage, label: string) => void;
};

const DEFAULT_INPUT: ContextBuilderInput = {
  workspaceId: 'frontal-slayer',
  target: 'cursor',
  taskType: 'development-milestone',
  scopes: ['asset-factory', 'photography-bible', 'creative-dna'],
  includeMemoryBible: true,
  includeWritingRules: true,
  includeKnowledgeGraph: true,
  includeDecisions: true,
  includeArchitecture: true,
  includeWorkspaceStandards: true,
  includePromptStandards: true,
  includeBrandRules: true,
  includeFeatureSummary: true,
  includeConstraints: true,
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function MemoryBibleContextBuilder({ buildPackage, onSavePackage, onRecordExport }: MemoryBibleContextBuilderProps) {
  const [input, setInput] = useState<ContextBuilderInput>(DEFAULT_INPUT);
  const [generated, setGenerated] = useState<ContextPackage | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const toggleScope = (scopeId: (typeof CONTEXT_BUILDER_SCOPES)[number]['id']) => {
    setInput((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scopeId)
        ? prev.scopes.filter((s) => s !== scopeId)
        : [...prev.scopes, scopeId],
    }));
  };

  const pkg = useMemo(() => (generated ? generated : null), [generated]);

  const handleGenerate = () => {
    const next = buildPackage(input);
    setGenerated(next);
    setCopyMsg(null);
  };

  const flash = (msg: string) => {
    setCopyMsg(msg);
    window.setTimeout(() => setCopyMsg(null), 2000);
  };

  return (
    <div>
      <p style={{ ...mbCaption, color: MB_VISUAL.red, marginBottom: 8 }}>
        BUILD TASK-SPECIFIC CONTEXT PACKAGES · TRACEABLE SOURCES · ADMIN EXPORT ONLY
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
        <div style={{ ...mbPanelStyle, padding: '10px' }}>
          <p style={mbSectionTitle}>WORKSPACE</p>
          <select
            value={input.workspaceId}
            onChange={(e) => setInput({ ...input, workspaceId: e.target.value })}
            style={{ ...mbCaption, width: '100%', padding: 6, border: MB_VISUAL.border }}
          >
            {CONTEXT_BUILDER_WORKSPACES.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ ...mbPanelStyle, padding: '10px' }}>
          <p style={mbSectionTitle}>TARGET</p>
          <select
            value={input.target}
            onChange={(e) => setInput({ ...input, target: e.target.value as ContextBuilderInput['target'] })}
            style={{ ...mbCaption, width: '100%', padding: 6, border: MB_VISUAL.border }}
          >
            {CONTEXT_BUILDER_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ ...mbPanelStyle, padding: '10px' }}>
          <p style={mbSectionTitle}>TASK TYPE</p>
          <select
            value={input.taskType}
            onChange={(e) => setInput({ ...input, taskType: e.target.value as ContextBuilderInput['taskType'] })}
            style={{ ...mbCaption, width: '100%', padding: 6, border: MB_VISUAL.border }}
          >
            {CONTEXT_BUILDER_TASK_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ ...mbPanelStyle, padding: '10px' }}>
          <p style={mbSectionTitle}>INCLUDE</p>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ['includeMemoryBible', 'MEMORY BIBLE'],
                ['includeWritingRules', 'WRITING'],
                ['includeKnowledgeGraph', 'GRAPH'],
                ['includeDecisions', 'DECISIONS'],
                ['includeArchitecture', 'ARCHITECTURE'],
                ['includeWorkspaceStandards', 'WORKSPACE'],
                ['includePromptStandards', 'PROMPTS'],
                ['includeBrandRules', 'BRAND'],
                ['includeFeatureSummary', 'FEATURES'],
                ['includeConstraints', 'CONSTRAINTS'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} style={{ ...mbCaption, fontSize: '7px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="checkbox"
                  checked={input[key]}
                  onChange={(e) => setInput({ ...input, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...mbPanelStyle, padding: '10px', marginBottom: 12 }}>
        <p style={mbSectionTitle}>SCOPE</p>
        <div className="flex flex-wrap gap-1">
          {CONTEXT_BUILDER_SCOPES.map((s) => {
            const on = input.scopes.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                style={{
                  ...mbActionBtn,
                  fontSize: '7px',
                  background: on ? MB_VISUAL.red : '#fff',
                  color: on ? '#fff' : MB_VISUAL.black,
                  borderColor: on ? MB_VISUAL.red : '#000',
                }}
                onClick={() => toggleScope(s.id)}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <button type="button" style={{ ...mbActionBtn, color: MB_VISUAL.red, marginBottom: 12 }} onClick={handleGenerate}>
        GENERATE CONTEXT PACKAGE
      </button>

      {copyMsg ? <p style={{ ...mbCaption, color: MB_VISUAL.pass, marginBottom: 8 }}>{copyMsg}</p> : null}

      {pkg ? (
        <div style={{ ...mbPanelStyle, padding: '12px' }}>
          <p style={{ ...mbSectionTitle, color: MB_VISUAL.red }}>{pkg.shortSummary}</p>
          <p style={{ ...mbCaption, marginBottom: 8 }}>{pkg.expectedOutput}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              style={mbActionBtn}
              onClick={async () => {
                if (await copyText(pkg.fullStructuredContext)) flash('FULL CONTEXT COPIED');
              }}
            >
              COPY CONTEXT
            </button>
            <button
              type="button"
              style={mbActionBtn}
              onClick={async () => {
                if (await copyText(pkg.copyPastePrompt)) flash('CURSOR PROMPT COPIED');
              }}
            >
              COPY CURSOR PROMPT
            </button>
            <button
              type="button"
              style={mbActionBtn}
              onClick={() => {
                downloadMarkdown(`studio-os-context-${pkg.id}.md`, pkg.fullStructuredContext);
                onRecordExport(pkg, 'markdown-export');
                flash('MARKDOWN EXPORTED');
              }}
            >
              EXPORT MARKDOWN
            </button>
            <button
              type="button"
              style={mbActionBtn}
              onClick={() => {
                onSavePackage(pkg);
                flash('PACKAGE SAVED');
              }}
            >
              SAVE PACKAGE
            </button>
          </div>

          <p style={mbSectionTitle}>SOURCES</p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 16 }}>
            {pkg.sources.map((s) => (
              <li key={s.id} style={{ ...mbCaption, fontSize: '7px', marginBottom: 2 }}>
                {s.label} · {s.kind}{s.detail ? ` · ${s.detail}` : ''}
              </li>
            ))}
          </ul>

          <p style={mbSectionTitle}>DO NOT BREAK</p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 16 }}>
            {pkg.doNotBreakRules.map((r) => (
              <li key={r} style={{ ...mbCaption, fontSize: '7px', marginBottom: 2 }}>
                {r}
              </li>
            ))}
          </ul>

          <p style={mbSectionTitle}>RELEVANT FILES / DOCS</p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 16 }}>
            {pkg.relevantFilesDocs.map((f) => (
              <li key={f} style={{ ...mbCaption, fontSize: '7px', wordBreak: 'break-all', marginBottom: 2 }}>
                {f}
              </li>
            ))}
          </ul>

          <details>
            <summary style={{ ...mbCaption, cursor: 'pointer', color: MB_VISUAL.red }}>VIEW FULL STRUCTURED CONTEXT</summary>
            <pre
              style={{
                ...mbCaption,
                fontSize: '7px',
                whiteSpace: 'pre-wrap',
                marginTop: 8,
                maxHeight: 320,
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.03)',
                padding: 8,
              }}
            >
              {pkg.fullStructuredContext}
            </pre>
          </details>
        </div>
      ) : null}
    </div>
  );
}
