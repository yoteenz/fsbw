import {
  ExecutiveCollapsibleSection,
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { useContextCapsuleExport } from '../../../../hooks/useContextCapsuleExport';

const ACCENT = '#92704A';

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
      <span className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </span>
      <span className="text-[6px] font-futura uppercase text-right" style={{ fontWeight: 515 }}>
        {value}
      </span>
    </div>
  );
}

export function ContextCapsuleWorkspace() {
  const {
    status,
    exports,
    loading,
    exporting,
    error,
    readyMessage,
    lastValidation,
    copiedPrompt,
    runExport,
    deleteExport,
    copyOnboardingPrompt,
    downloadExport,
  } = useContextCapsuleExport();

  const latestExport = exports[0] ?? null;

  if (loading && !status) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AI CONTEXT CAPSULE™ LOADING…
      </p>
    );
  }

  const validation = lastValidation.length ? lastValidation : status?.validation ?? [];
  const allPassed = validation.every((v) => v.passed);

  return (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="AI CONTEXT CAPSULE EXPORT SYSTEM™ · v0.1"
        title="AI CONTEXT CAPSULE™"
        subtitle="One downloadable package — institutional memory for external AI onboarding."
        progressPct={status?.packageHealth ?? 91}
        stats={[
          { label: 'VERSION', value: status?.capsuleVersion ?? '—' },
          { label: 'DOCS', value: String(status?.documentCount ?? 14) },
          { label: 'HEALTH', value: `${status?.packageHealth ?? 91}%` },
          { label: 'STATUS', value: readyMessage ? 'READY' : status?.generationStatus?.toUpperCase() ?? 'IDLE' },
        ]}
      />

      <div className="flex items-start gap-3 mb-3">
        <ExecutiveHealthRing value={status?.packageHealth ?? 91} size={56} label="CC" accent={ACCENT} />
        <div className="flex-1">
          <StatRow label="Current Capsule Version" value={status?.capsuleVersion ?? '—'} />
          <StatRow label="Last Generated" value={status?.lastGenerated ? new Date(status.lastGenerated).toLocaleString() : 'Never'} />
          <StatRow label="Project Version" value={status?.projectVersion ?? '—'} />
          <StatRow label="Studio OS Version" value={status?.studioOsVersion ?? '—'} />
          <StatRow label="Document Count" value={String(status?.documentCount ?? 14)} />
          <StatRow label="Package Health" value={`${status?.packageHealth ?? 91}%`} />
          <StatRow
            label="Checksum"
            value={status?.checksumSha256 ? `${status.checksumSha256.slice(0, 12)}…` : '—'}
          />
          <StatRow label="Generation Status" value={exporting ? 'EXPORTING…' : readyMessage ?? status?.generationStatus ?? 'idle'} />
          <StatRow label="Compatibility" value={status?.compatibility ?? '—'} />
          <StatRow label="AI Manual Version" value={status?.aiManualVersion ?? '—'} />
          <StatRow label="Founder Profile Version" value={status?.founderProfileVersion ?? '—'} />
          <StatRow label="Current Sprint Version" value={status?.sprintVersion ?? '—'} />
        </div>
      </div>

      {error ? (
        <p className="text-[7px] font-futura uppercase mb-2" style={{ color: '#EB1C24' }}>
          {error}
        </p>
      ) : null}

      {readyMessage ? (
        <ExecutiveFocusPanel title="CONTEXT CAPSULE READY" highlight={readyMessage}>
          {latestExport ? (
            <button
              type="button"
              onClick={() => void downloadExport(latestExport)}
              className="block w-full py-2 text-center text-[7px] font-futura uppercase border mb-2"
              style={{ borderColor: ACCENT, color: ACCENT, fontWeight: 515 }}
            >
              DOWNLOAD PACKAGE
            </button>
          ) : null}
        </ExecutiveFocusPanel>
      ) : (
        <ExecutiveFocusPanel title="EXPORT" subtitle="Package existing capsule documents — no content regeneration.">
          <button
            type="button"
            disabled={exporting}
            onClick={() => void runExport()}
            className="w-full py-2 text-[7px] font-futura uppercase border disabled:opacity-50"
            style={{ borderColor: ACCENT, color: ACCENT, fontWeight: 515 }}
          >
            {exporting ? 'GENERATING PACKAGE…' : 'EXPORT CONTEXT CAPSULE'}
          </button>
        </ExecutiveFocusPanel>
      )}

      <ExecutiveSecondaryCard title="AI ONBOARDING">
        <button
          type="button"
          onClick={() => void copyOnboardingPrompt()}
          className="w-full py-2 text-[6px] font-futura uppercase border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          {copiedPrompt ? 'COPIED ONBOARDING PROMPT' : 'COPY AI ONBOARDING PROMPT'}
        </button>
      </ExecutiveSecondaryCard>

      {validation.length ? (
        <ExecutiveCollapsibleSection title="VALIDATION CHECKS" defaultOpen>
          <ul className="space-y-1">
            {validation.map((check) => (
              <li key={check.id} className="text-[6px] font-futura" style={{ color: check.passed ? ACCENT : '#EB1C24' }}>
                {check.passed ? '✓' : '✗'} {check.label}
                {check.detail ? ` — ${check.detail}` : ''}
              </li>
            ))}
          </ul>
          {!allPassed ? (
            <p className="text-[6px] font-futura mt-2" style={{ color: '#EB1C24' }}>
              Fix validation before export.
            </p>
          ) : null}
        </ExecutiveCollapsibleSection>
      ) : null}

      <ExecutiveCollapsibleSection title="DOWNLOAD HISTORY" defaultOpen>
        {exports.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            No exports yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[6px] font-futura uppercase">
              <thead>
                <tr style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  <th className="text-left py-1">Version</th>
                  <th className="text-left py-1">Date</th>
                  <th className="text-left py-1">Project</th>
                  <th className="text-left py-1">Studio OS</th>
                  <th className="text-left py-1">Download</th>
                  <th className="text-left py-1">Delete</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((row) => (
                  <tr key={row.id} className="border-t" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                    <td className="py-1">{row.version}</td>
                    <td className="py-1">{new Date(row.generatedAt).toLocaleString()}</td>
                    <td className="py-1 max-w-[80px] truncate">{row.projectVersion}</td>
                    <td className="py-1 max-w-[60px] truncate">{row.studioOsVersion}</td>
                    <td className="py-1">
                      <button type="button" onClick={() => void downloadExport(row)} style={{ color: ACCENT }}>
                        ZIP
                      </button>
                    </td>
                    <td className="py-1">
                      <button type="button" onClick={() => void deleteExport(row.id)} style={{ color: '#EB1C24' }}>
                        DEL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ExecutiveCollapsibleSection>
    </ExecutivePageShell>
  );
}
