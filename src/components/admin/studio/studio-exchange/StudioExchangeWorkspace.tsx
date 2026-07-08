import { useMemo, useState } from 'react';
import { useStudioExchangeState } from '../../../../hooks/useStudioExchangeState';
import type { CareerWorldId } from '../../../../studio-os-core/career-worlds/types';
import { listExpansionsForWorld } from '../../../../studio-os-core/studio-exchange/expansions/registry';
import { listCertificationsForWorld } from '../../../../studio-os-core/studio-exchange/certifications/registry';

type TabId = 'licenses' | 'expansions' | 'ceremonies' | 'mentor' | 'businesses';

const TABS: { id: TabId; label: string }[] = [
  { id: 'licenses', label: 'Professional Licenses™' },
  { id: 'expansions', label: 'Career Expansions™' },
  { id: 'ceremonies', label: 'Certification Ceremonies™' },
  { id: 'mentor', label: 'Mentor Economy™' },
  { id: 'businesses', label: 'Legacy Businesses™' },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Studio Exchange™ — professional economy workspace (ARTICLE-E05).
 * Reusable across every Career World; no profession hardcoding in UI logic.
 */
export function StudioExchangeWorkspace() {
  const {
    catalog,
    careerWorlds,
    dashboard,
    licenses,
    store,
    claimLicense,
    attachExpansion,
    updateProgress,
    startCeremony,
    advanceCeremony,
    refresh,
  } = useStudioExchangeState();

  const [tab, setTab] = useState<TabId>('licenses');
  const [selectedWorld, setSelectedWorld] = useState<CareerWorldId>(
    careerWorlds[0]?.careerWorldId ?? 'marketing-world',
  );

  const worldExpansions = useMemo(
    () => listExpansionsForWorld(selectedWorld),
    [selectedWorld],
  );
  const worldCerts = useMemo(() => listCertificationsForWorld(selectedWorld), [selectedWorld]);
  const activeLicense = licenses.find((l) => l.careerWorldId === selectedWorld);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400/80">Studio Exchange™</p>
            <h1 className="mt-1 text-3xl font-semibold">Professional License System™</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Enter professions — not courses. Every Career World inherits the same commerce foundation.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20"
          >
            Refresh Exchange
          </button>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-white/70">
          <span>{dashboard.catalogListingCount} listings</span>
          <span>{dashboard.licenseCount} licenses</span>
          <span>{dashboard.ceremoniesInProgress.length} ceremonies in progress</span>
          <span>{dashboard.businesses.length} legacy businesses</span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-2 text-xs uppercase tracking-wider ${
              tab === item.id
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                : 'bg-white/5 text-white/50 border border-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-white/40">Career World</label>
        <select
          value={selectedWorld}
          onChange={(e) => setSelectedWorld(e.target.value as CareerWorldId)}
          className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white"
        >
          {careerWorlds.map((world) => (
            <option key={world.careerWorldId} value={world.careerWorldId}>
              {world.displayName}
            </option>
          ))}
        </select>
        {!activeLicense ? (
          <button
            type="button"
            onClick={() => claimLicense(selectedWorld)}
            className="rounded-lg bg-emerald-600/80 px-4 py-2 text-sm font-medium hover:bg-emerald-600"
          >
            Acquire Professional License™
          </button>
        ) : (
          <span className="text-sm text-emerald-300/90">License active · {activeLicense.licenseId}</span>
        )}
      </div>

      {tab === 'licenses' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Your Licenses">
            {licenses.length === 0 ? (
              <p className="text-sm text-white/40">No Professional Licenses™ yet. Claim entry into a Career World.</p>
            ) : (
              <ul className="space-y-3">
                {licenses.map((license) => (
                  <li key={license.licenseId} className="rounded-lg border border-white/10 p-3 text-sm">
                    <p className="font-medium">{license.careerWorldId}</p>
                    <p className="text-white/50">Status: {license.status}</p>
                    <p className="text-white/50">Expansions: {license.includedExpansionIds.length}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Exchange Catalog">
            <ul className="max-h-64 space-y-2 overflow-y-auto text-sm text-white/80">
              {catalog.listings.slice(0, 12).map((listing) => (
                <li key={listing.listingId}>
                  <span className="text-white/40">{listing.assetClass}</span> — {listing.displayName}
                </li>
              ))}
              <li className="text-white/40">+ {Math.max(0, catalog.listings.length - 12)} more listings</li>
            </ul>
          </Panel>
        </div>
      )}

      {tab === 'expansions' && activeLicense && (
        <Panel title="Career Expansions™">
          <ul className="space-y-3">
            {worldExpansions.map((expansion) => (
              <li key={expansion.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3">
                <div>
                  <p className="font-medium">{expansion.displayName}</p>
                  <p className="text-sm text-white/50">{expansion.summary}</p>
                </div>
                <button
                  type="button"
                  disabled={activeLicense.includedExpansionIds.includes(expansion.id)}
                  onClick={() => attachExpansion(activeLicense.licenseId, expansion.id)}
                  className="rounded border border-white/20 px-3 py-1 text-xs uppercase disabled:opacity-40"
                >
                  {activeLicense.includedExpansionIds.includes(expansion.id) ? 'Included' : 'Add Expansion'}
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === 'ceremonies' && activeLicense && (
        <Panel title="Certification Ceremonies™">
          <ul className="space-y-3">
            {worldCerts.map((cert) => {
              const progress = activeLicense.certificationProgress.find((c) => c.certificationId === cert.id);
              return (
                <li key={cert.id} className="rounded-lg border border-white/10 p-3 text-sm">
                  <p className="font-medium">{cert.displayName}</p>
                  <p className="text-white/50">
                    Progress: {progress?.progressPercent ?? 0}% · {progress?.status ?? 'locked'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateProgress(activeLicense.licenseId, cert.id, 100)}
                      className="rounded border border-white/20 px-2 py-1 text-xs"
                    >
                      Mark ready
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ceremony = startCeremony(activeLicense.licenseId, cert.id);
                        if (ceremony) advanceCeremony(ceremony.ceremonyId);
                      }}
                      className="rounded border border-amber-500/40 px-2 py-1 text-xs text-amber-200"
                    >
                      Run ceremony stage
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {store.ceremonies.length > 0 && (
            <p className="mt-4 text-xs text-white/40">
              {store.ceremonies.filter((c) => !c.completedAt).length} ceremony runs active
            </p>
          )}
        </Panel>
      )}

      {tab === 'mentor' && activeLicense && (
        <Panel title="Mentor Economy™">
          <p className="text-sm text-white/70">
            Eligible: {activeLicense.mentorEligibility.eligible ? 'Yes' : 'No'} · Level:{' '}
            {activeLicense.mentorEligibility.mentorLevel}
          </p>
          <p className="mt-2 text-sm text-white/50">
            Teaching rights: {activeLicense.mentorEligibility.teachingRights.join(', ') || '—'}
          </p>
          <p className="mt-2 text-sm text-white/50">
            Mentor assignments: {store.mentorAssignments.length} · Points ledger:{' '}
            {store.mentorPointsLedger.length}
          </p>
        </Panel>
      )}

      {tab === 'businesses' && activeLicense && (
        <Panel title="Legacy Businesses™">
          <p className="text-sm text-white/70">
            Business eligible: {activeLicense.businessEligibility.eligible ? 'Yes' : 'No'}
          </p>
          <p className="mt-2 text-sm text-white/50">
            {activeLicense.businessEligibility.unlockReasons.join(' · ')}
          </p>
          <p className="mt-4 text-sm text-white/50">
            Founded businesses: {dashboard.businesses.length}
          </p>
        </Panel>
      )}
    </div>
  );
}
