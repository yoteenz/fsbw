export type ExperienceLabSafeProbeResult = {
  label: string;
  ok: boolean;
  ms: number;
  error?: string;
};

/** Probe Experience Lab runtime chain one module at a time (debug route only). */
export async function probeExperienceLabSafeChain(): Promise<ExperienceLabSafeProbeResult[]> {
  const probes: Array<{ label: string; run: () => Promise<unknown> }> = [
    {
      label: 'StudioBootstrap',
      run: async () => {
        const mod = await import('../../../studio-os-core/bootstrap/studio-bootstrap');
        return mod.runStudioBootstrap({ through: 'experience-runtime', force: true });
      },
    },
    {
      label: 'BrandRegistry',
      run: async () => {
        const { ensureExperienceEngineDnaSubsystem } = await import(
          '../../../studio-os-core/genesis/experience-engine/engine'
        );
        const { withExperienceEngineSeedFallback } = await import(
          '../../../studio-os-core/genesis/experience-engine/persistence'
        );
        ensureExperienceEngineDnaSubsystem();
        const store = withExperienceEngineSeedFallback();
        if (!store.brands?.length) throw new Error('Brand registry empty');
        return store.brands.length;
      },
    },
    {
      label: 'DepartmentRegistry',
      run: async () => {
        const { withExperienceEngineSeedFallback } = await import(
          '../../../studio-os-core/genesis/experience-engine/persistence'
        );
        const store = withExperienceEngineSeedFallback();
        if (!store.departments?.length) throw new Error('Department registry empty');
        return store.departments.length;
      },
    },
    {
      label: 'SceneRegistry',
      run: async () => {
        const { withExperienceEngineSeedFallback } = await import(
          '../../../studio-os-core/genesis/experience-engine/persistence'
        );
        const store = withExperienceEngineSeedFallback();
        if (!store.scenes?.length) throw new Error('Scene registry empty');
        return store.scenes.length;
      },
    },
    {
      label: 'DNAResolver',
      run: async () => import('../../../studio-os-core/genesis/experience-runtime/runtime-engine/dna-resolver'),
    },
    {
      label: 'SceneAssembler',
      run: async () => {
        const { assembleExperienceRuntime } = await import(
          '../../../studio-os-core/genesis/experience-runtime/runtime-engine/experience-runtime'
        );
        return assembleExperienceRuntime({
          brandId: 'studio-os',
          departmentId: 'executive',
          sceneId: 'executive-headquarters',
          skipCache: true,
        });
      },
    },
    {
      label: 'RuntimeInspector',
      run: async () => {
        const { assembleExperienceRuntime } = await import(
          '../../../studio-os-core/genesis/experience-runtime/runtime-engine/experience-runtime'
        );
        const { buildRuntimeInspectorView } = await import(
          '../../../studio-os-core/genesis/experience-runtime/runtime-preview/inspector-view'
        );
        const graph = assembleExperienceRuntime({
          brandId: 'studio-os',
          departmentId: 'executive',
          sceneId: 'executive-headquarters',
          skipCache: true,
        });
        return buildRuntimeInspectorView(graph);
      },
    },
  ];

  const results: ExperienceLabSafeProbeResult[] = [];
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
