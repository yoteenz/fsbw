import type { BootModuleContract, BootModuleStatus } from './types';
import { BOOT_MODULE_DISPLAY_LABELS } from './types';

type ModuleFactory = () => BootModuleContract;

/** BootRegistry™ — central registry for Studio OS boot modules. */
class BootRegistryImpl {
  private factories = new Map<string, ModuleFactory>();
  private instances = new Map<string, BootModuleContract>();

  register(factory: ModuleFactory): void {
    const probe = factory();
    if (this.factories.has(probe.id)) {
      console.warn(`[BootRegistry] duplicate module id: ${probe.id}`);
    }
    this.factories.set(probe.id, factory);
    this.instances.delete(probe.id);
  }

  get(id: string): BootModuleContract | undefined {
    if (!this.instances.has(id)) {
      const factory = this.factories.get(id);
      if (!factory) return undefined;
      this.instances.set(id, factory());
    }
    return this.instances.get(id);
  }

  list(): BootModuleContract[] {
    return [...this.factories.keys()]
      .map((id) => this.get(id))
      .filter((m): m is BootModuleContract => Boolean(m));
  }

  resetRuntimeState(): void {
    for (const mod of this.instances.values()) {
      mod.status = 'idle';
      mod.errors.length = 0;
      mod.warnings.length = 0;
    }
  }

  snapshot(): Array<{
    id: string;
    name: string;
    status: BootModuleStatus;
    dependencies: string[];
    required: boolean;
    errors: string[];
    warnings: string[];
    fallback?: string;
  }> {
    return this.list().map((m) => ({
      id: m.id,
      name: m.name,
      status: m.status,
      dependencies: [...m.dependencies],
      required: m.required,
      errors: [...m.errors],
      warnings: [...m.warnings],
      fallback: m.fallback,
    }));
  }
}

export const bootRegistry = new BootRegistryImpl();

export function createBootModule(config: {
  id: string;
  name: string;
  dependencies?: string[];
  required?: boolean;
  initialize: () => Promise<void>;
  isReady?: () => boolean;
}): BootModuleContract {
  const mod: BootModuleContract = {
    id: config.id,
    name: config.name,
    label: BOOT_MODULE_DISPLAY_LABELS[config.id] ?? config.id,
    dependencies: config.dependencies ?? [],
    required: config.required ?? true,
    status: 'idle',
    errors: [],
    warnings: [],
    initialize: config.initialize,
    isReady:
      config.isReady ??
      (() => ['ready', 'fallback', 'skipped', 'failed'].includes(mod.status)),
  };
  return mod;
}
