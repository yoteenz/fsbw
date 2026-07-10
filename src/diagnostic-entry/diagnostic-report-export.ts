/**
 * Export diagnostic reports — Normal vs Private diff, boot timeline, storage inventory.
 */
import { compareEnvironmentSnapshots, findSnapshotPairs } from '../studio-os/diagnostics/environment-diff/compare';
import { loadEnvironmentSnapshots } from '../studio-os/diagnostics/environment-diff/capture';
import { readBootTrace, readPreMainProbe, type PreMainProbeSnapshot } from './boot-events';
import { quarantineIncompatiblePersistedState, listQuarantinedKeys } from './persisted-state-audit';
import type { ServiceWorkerAudit } from './service-worker-audit';

export function buildStorageInventoryMarkdown(probe: PreMainProbeSnapshot | null): string {
  const lines = ['# Storage Inventory', ''];
  if (!probe) {
    lines.push('_No pre-main probe snapshot._');
    return lines.join('\n');
  }
  lines.push(`- Route: \`${probe.route}\``);
  lines.push(`- Build ID: \`${probe.buildId}\``);
  lines.push(`- Build mismatch: ${probe.buildMismatch}`);
  lines.push(`- SW controller: ${probe.serviceWorker.controller ?? 'none'}`);
  lines.push('');
  lines.push('## Studio OS localStorage keys');
  for (const k of probe.studioOsLocalKeys) {
    lines.push(`- \`${k.key}\` (${k.bytes} bytes)`);
  }
  lines.push('');
  lines.push('## Studio OS sessionStorage keys');
  for (const k of probe.studioOsSessionKeys) {
    lines.push(`- \`${k.key}\` (${k.bytes} bytes)`);
  }
  lines.push('');
  lines.push('## Quarantined keys');
  for (const k of listQuarantinedKeys()) {
    lines.push(`- \`${k}\``);
  }
  return lines.join('\n');
}

export function buildBootTimelineMarkdown(): string {
  const trace = readBootTrace();
  const lines = ['# Boot Timeline', ''];
  for (const entry of trace) {
    const iso = new Date(entry.ts).toISOString();
    lines.push(`- \`${iso}\` **${entry.event}**${entry.detail ? ` — ${JSON.stringify(entry.detail)}` : ''}`);
  }
  if (trace.length === 0) lines.push('_Empty — open a diagnostic route to populate._');
  return lines.join('\n');
}

export function buildNormalVsPrivateDiffMarkdown(): string {
  const snapshots = loadEnvironmentSnapshots();
  const pairs = findSnapshotPairs(snapshots);
  const lines = ['# Normal vs Private Environment Diff', ''];
  if (pairs.length === 0) {
    lines.push('_Capture environment snapshots with labels `safari-normal`, `safari-private`, `chrome-normal`, or `chrome-incognito` from the flight recorder._');
    lines.push('');
    lines.push('## Pre-main probe diff hint');
    const probe = readPreMainProbe();
    if (probe?.buildMismatch) {
      lines.push(`- **Build mismatch detected**: previous=\`${probe.previousBuildId}\` current=\`${probe.buildId}\``);
      lines.push('- Normal tabs may be serving stale cached assets while private tabs fetch fresh bundles.');
    } else {
      lines.push('- No build mismatch in current pre-main probe.');
    }
    return lines.join('\n');
  }
  for (const pair of pairs) {
    const diff = compareEnvironmentSnapshots(pair.baseline, pair.compare);
    lines.push(`## ${diff.baselineLabel} vs ${diff.compareLabel}`);
    lines.push(`Differing keys: ${diff.differingKeys.length}`);
    for (const d of diff.differingKeys.slice(0, 40)) {
      lines.push(`- \`${d.path}\`: ${JSON.stringify(d.baseline)} → ${JSON.stringify(d.compare)}`);
    }
    if (diff.differingKeys.length > 40) lines.push(`- … and ${diff.differingKeys.length - 40} more`);
    lines.push('');
  }
  return lines.join('\n');
}

export function buildFullDiagnosticJson(swAudit: ServiceWorkerAudit | null): string {
  return JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      preMainProbe: readPreMainProbe(),
      bootTrace: readBootTrace(),
      persistedStateAudit: quarantineIncompatiblePersistedState(),
      quarantinedKeys: listQuarantinedKeys(),
      serviceWorkerAudit: swAudit,
      environmentSnapshots: loadEnvironmentSnapshots(),
    },
    null,
    2
  );
}

export function buildFullDiagnosticMarkdown(swAudit: ServiceWorkerAudit | null): string {
  return [
    buildNormalVsPrivateDiffMarkdown(),
    '',
    '---',
    '',
    buildBootTimelineMarkdown(),
    '',
    '---',
    '',
    buildStorageInventoryMarkdown(readPreMainProbe()),
    '',
    '---',
    '',
    '## Service Worker / Cache',
    swAudit
      ? [
          `- Registrations: ${swAudit.registrations}`,
          `- Controllers: ${swAudit.controllerUrls.join(', ') || 'none'}`,
          `- Caches: ${swAudit.cacheNames.join(', ') || 'none'}`,
          `- Stale hints: ${swAudit.staleAssetHints.join('; ') || 'none'}`,
        ].join('\n')
      : '_Not inspected._',
  ].join('\n');
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function copyNormalVsPrivateDiff(): Promise<boolean> {
  return copyText(buildNormalVsPrivateDiffMarkdown());
}

export async function copyBootTimeline(): Promise<boolean> {
  return copyText(buildBootTimelineMarkdown());
}

export async function copyStorageInventory(): Promise<boolean> {
  return copyText(buildStorageInventoryMarkdown(readPreMainProbe()));
}

export async function exportDiagnosticJson(swAudit: ServiceWorkerAudit | null): Promise<boolean> {
  return copyText(buildFullDiagnosticJson(swAudit));
}

export async function exportDiagnosticMarkdown(swAudit: ServiceWorkerAudit | null): Promise<boolean> {
  return copyText(buildFullDiagnosticMarkdown(swAudit));
}
