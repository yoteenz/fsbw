export type SafeImportProbeResult = {
  label: string;
  ok: boolean;
  ms: number;
  error?: string;
};

/** Probe genesis/runtime modules one at a time (call from safe route only). */
export async function probeExperienceLabImports(): Promise<SafeImportProbeResult[]> {
  const probes: Array<{ label: string; run: () => Promise<unknown> }> = [
    {
      label: 'experience-lab/constants',
      run: async () => import('../../../../studio-os-core/genesis/experience-lab/constants'),
    },
    {
      label: 'experience-lab/persistence',
      run: async () => import('../../../../studio-os-core/genesis/experience-lab/persistence'),
    },
    {
      label: 'experience-runtime/runtime-boot/default-contract',
      run: async () => import('../../../../studio-os-core/genesis/experience-runtime/runtime-boot/default-contract'),
    },
    {
      label: 'experience-runtime/runtime-boot/default-seed',
      run: async () => import('../../../../studio-os-core/genesis/experience-runtime/runtime-boot/default-seed'),
    },
    {
      label: 'experience-engine/bootstrap/seed-data',
      run: async () => import('../../../../studio-os-core/genesis/experience-engine/bootstrap/seed-data'),
    },
    {
      label: 'genesis/persistence/store',
      run: async () => import('../../../../studio-os-core/genesis/persistence/store'),
    },
    {
      label: 'experience-runtime/persistence',
      run: async () => import('../../../../studio-os-core/genesis/experience-runtime/persistence'),
    },
    {
      label: 'experience-engine/persistence',
      run: async () => import('../../../../studio-os-core/genesis/experience-engine/persistence'),
    },
    {
      label: 'experience-runtime/runtime-boot/runtime-fallback-resolver',
      run: async () => import('../../../../studio-os-core/genesis/experience-runtime/runtime-boot/runtime-fallback-resolver'),
    },
    {
      label: 'experience-runtime/runtime-boot/runtime-boot-validator',
      run: async () => import('../../../../studio-os-core/genesis/experience-runtime/runtime-boot/runtime-boot-validator'),
    },
    {
      label: 'experience-lab/room/ready-view',
      run: async () => import('../../../../studio-os-core/genesis/experience-lab/room/ready-view'),
    },
    {
      label: 'genesis barrel (index)',
      run: async () => import('../../../../studio-os-core/genesis'),
    },
  ];

  const results: SafeImportProbeResult[] = [];
  for (const probe of probes) {
    const started = performance.now();
    try {
      await probe.run();
      results.push({ label: probe.label, ok: true, ms: Math.round(performance.now() - started) });
    } catch (err) {
      results.push({
        label: probe.label,
        ok: false,
        ms: Math.round(performance.now() - started),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return results;
}
