/** Future expansion hooks — register new divisions, publication types, and AI submitters. */
export type InstituteExpansionHook = {
  id: string;
  label: string;
  modulePath: string;
  onRegister?: () => void;
};

const registeredHooks: InstituteExpansionHook[] = [];

export function registerInstituteExpansionHook(hook: InstituteExpansionHook): void {
  if (registeredHooks.some((h) => h.id === hook.id)) return;
  registeredHooks.push(hook);
  hook.onRegister?.();
}

export function listInstituteExpansionHooks(): InstituteExpansionHook[] {
  return [...registeredHooks];
}

/** Pre-register known future AI systems per C03 architecture. */
export function bootstrapInstituteExpansionHooks(): void {
  registerInstituteExpansionHook({
    id: 'future-ai-systems',
    label: 'Future AI Knowledge Submitters',
    modulePath: 'review/pipeline',
  });
  registerInstituteExpansionHook({
    id: 'supabase-persistence',
    label: 'Supabase Institute Store Adapter',
    modulePath: 'persistence/store',
  });
  registerInstituteExpansionHook({
    id: 'external-research-feeds',
    label: 'External Research Feed Integration',
    modulePath: 'research/queue',
  });
}
