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
import { CONTEXT_CAPSULE_LATEST_DOWNLOAD_PATH } from '../../../../studio-os-core/context-capsule-export/constants';

const ACCENT = '#92704A';

function triggerDownload(path: string, fileName: string) {
  const a = document.createElement('a');
  a.href = path;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
      <span className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </span>
      <span className="text-[6px] font-futura uppercase text-right break-all" style={{ fontWeight: 515 }}>
        {value}
      </span>
    </div>
  );
}

export function ContextCapsuleWorkspace() {
  const {
    status,
    release,
    exports,
    loading,
    exporting,
    error,
    readyMessage,
    lastValidation,
    copiedPrompt,
    copiedLatestUrl,
    runExport,
    deleteExport,
    copyOnboardingPrompt,
    copyLatestUrl,
    downloadLatest,
    downloadExport,
  } = useContextCapsuleExport();

  const latestExport = exports[0] ?? null;
  const releaseHistory = release?.releaseHistory ?? status?.releaseHistory ?? [];
  const latestPath = status?.latestDownloadPath ?? CONTEXT_CAPSULE_LATEST_DOWNLOAD_PATH;
  const validationStatus = status?.validationStatus ?? 'unknown';

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
        eyebrow="AI CONTEXT CAPSULE EXPORT SYSTEM™ · 0.3.1"
        title="AI CONTEXT CAPSULE™"
        subtitle="Stable latest.zip channel + immutable versioned releases."
        progressPct={status?.packageHealth ?? 91}
        stats={[
          { label: 'ACTIVE', value: status?.capsuleVersion ?? '—' },
          { label: 'DOCS', value: String(status?.documentCount ?? 15) },
          { label: 'VALIDATION', value: validationStatus.toUpperCase() },
          { label: 'STATUS', value: readyMessage ? 'READY' : status?.generationStatus?.toUpperCase() ?? 'IDLE' },
        ]}
      />

      <ExecutiveFocusPanel
        title="VALIDATION SUMMARY"
        subtitle="Prebuild gate — latest.zip updates only when all checks pass."
        highlight={validationStatus === 'pass' ? 'Validation: PASS' : `Validation: ${validationStatus.toUpperCase()}`}
      >
        <StatRow label="Capsule Version" value={status?.capsuleVersion ?? release?.currentVersion ?? '—'} />
        <StatRow
          label="Generated"
          value={status?.lastGenerated ? new Date(status.lastGenerated).toISOString() : '—'}
        />
        <StatRow label="Validation" value={validationStatus.toUpperCase()} />
        <StatRow label="Manifest" value={`${release?.documentCount ?? status?.documentCount ?? 15} docs`} />
        <StatRow label="Documents" value={String(status?.documentCount ?? 15)} />
        <StatRow label="Download" value={latestPath} />
      </ExecutiveFocusPanel>

      <ExecutiveFocusPanel
        title="PERMANENT DOWNLOAD"
        subtitle="Use this URL for every new AI onboarding — never update after deploy."
        highlight={release?.currentVersion ? `Active release v${release.currentVersion}` : undefined}
      >
        <StatRow label="Latest alias" value={latestPath} />
        <StatRow
          label="Full URL"
          value={`https://fsbw.vercel.app${latestPath}`}
        />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => downloadLatest()}
            className="flex-1 py-2 text-[7px] font-futura uppercase border"
            style={{ borderColor: ACCENT, color: ACCENT, fontWeight: 515 }}
          >
            DOWNLOAD LATEST
          </button>
          <button
            type="button"
            onClick={() => void copyLatestUrl()}
            className="flex-1 py-2 text-[6px] font-futura uppercase border"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
          >
            {copiedLatestUrl ? 'URL COPIED' : 'COPY PERMANENT URL'}
          </button>
        </div>
      </ExecutiveFocusPanel>

      <div className="flex items-start gap-3 mb-3">
        <ExecutiveHealthRing value={status?.packageHealth ?? 91} size={56} label="CC" accent={ACCENT} />
        <div className="flex-1">
          <StatRow label="Current Version" value={status?.capsuleVersion ?? '—'} />
          <StatRow label="Previous Version" value={status?.previousVersion ?? release?.previousVersion ?? '—'} />
          <StatRow label="Release Date" value={status?.lastGenerated ? new Date(status.lastGenerated).toLocaleString() : 'Never'} />
          <StatRow label="Validation Status" value={validationStatus.toUpperCase()} />
          <StatRow label="Document Count" value={String(status?.documentCount ?? 15)} />
          <StatRow label="Git Commit" value={status?.gitCommit ? `${status.gitCommit.slice(0, 12)}…` : '—'} />
          <StatRow label="Project Version" value={status?.projectVersion ?? '—'} />
          <StatRow label="Package Health" value={`${status?.packageHealth ?? 91}%`} />
          <StatRow
            label="Checksum"
            value={status?.checksumSha256 ? `${status.checksumSha256.slice(0, 12)}…` : '—'}
          />
          <StatRow label="Versioned ZIP" value={status?.currentZipFileName ?? '—'} />
          <StatRow label="Generation Status" value={exporting ? 'EXPORTING…' : readyMessage ?? status?.generationStatus ?? 'idle'} />
        </div>
      </div>

      {error ? (
        <p className="text-[7px] font-futura uppercase mb-2" style={{ color: '#EB1C24' }}>
          {error}
        </p>
      ) : null}

      {readyMessage ? (
        <ExecutiveFocusPanel title="CONTEXT CAPSULE READY" highlight={readyMessage}>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => downloadLatest()}
              className="flex-1 py-2 text-center text-[7px] font-futura uppercase border"
              style={{ borderColor: ACCENT, color: ACCENT, fontWeight: 515 }}
            >
              DOWNLOAD LATEST
            </button>
            {latestExport ? (
              <button
                type="button"
                onClick={() => void downloadExport(latestExport)}
                className="flex-1 py-2 text-center text-[7px] font-futura uppercase border"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
              >
                v{latestExport.version} ZIP
              </button>
            ) : null}
          </div>
        </ExecutiveFocusPanel>
      ) : (
        <ExecutiveFocusPanel title="EXPORT" subtitle="Register prebuilt release — latest.zip updates only on prebuild validation pass.">
          <button
            type="button"
            disabled={exporting || !allPassed}
            onClick={() => void runExport()}
            className="w-full py-2 text-[7px] font-futura uppercase border disabled:opacity-50"
            style={{ borderColor: ACCENT, color: ACCENT, fontWeight: 515 }}
          >
            {exporting ? 'REGISTERING RELEASE…' : 'REGISTER CONTEXT CAPSULE RELEASE'}
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
              Validation failed — latest.zip was not updated. Fix errors and redeploy.
            </p>
          ) : null}
        </ExecutiveCollapsibleSection>
      ) : null}

      <ExecutiveCollapsibleSection title="RELEASE HISTORY" defaultOpen>
        {releaseHistory.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            No versioned releases yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[6px] font-futura uppercase">
              <thead>
                <tr style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  <th className="text-left py-1">Version</th>
                  <th className="text-left py-1">Date</th>
                  <th className="text-left py-1">Validation</th>
                  <th className="text-left py-1">Docs</th>
                  <th className="text-left py-1">Download</th>
                </tr>
              </thead>
              <tbody>
                {releaseHistory.map((row) => {
                  const isActive = row.version === release?.currentVersion;
                  return (
                    <tr
                      key={`${row.version}-${row.generatedAt}`}
                      className="border-t"
                      style={{
                        borderColor: ADMIN_STUDIO_THEME.panelBorder,
                        background: isActive ? 'rgba(146, 112, 74, 0.08)' : undefined,
                      }}
                    >
                      <td className="py-1">
                        v{row.version}
                        {isActive ? ' · ACTIVE' : ''}
                      </td>
                      <td className="py-1">{new Date(row.generatedAt).toLocaleString()}</td>
                      <td className="py-1">{row.validationStatus.toUpperCase()}</td>
                      <td className="py-1">{status?.documentCount ?? 15}</td>
                      <td className="py-1">
                        <button
                          type="button"
                          onClick={() => triggerDownload(row.downloadPath, row.zipFileName)}
                          style={{ color: ACCENT }}
                        >
                          ZIP
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ExecutiveCollapsibleSection>

      <ExecutiveCollapsibleSection title="ADMIN EXPORT LOG" defaultOpen={false}>
        {exports.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            No admin registrations yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[6px] font-futura uppercase">
              <thead>
                <tr style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  <th className="text-left py-1">Version</th>
                  <th className="text-left py-1">Date</th>
                  <th className="text-left py-1">Download</th>
                  <th className="text-left py-1">Delete</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((row) => (
                  <tr key={row.id} className="border-t" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                    <td className="py-1">{row.version}</td>
                    <td className="py-1">{new Date(row.generatedAt).toLocaleString()}</td>
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
