import type { PluginGovernanceFinding } from './types';

export function runPluginGovernanceAudit(): PluginGovernanceFinding[] {
  return [
    {
      id: 'gov-manifest-required',
      severity: 'info',
      message: 'All plugins must ship a manifest with SDK capability declarations.',
      recommendation: 'Validate manifest against Plugin SDK registration schema before install.',
    },
    {
      id: 'gov-policy-permission-sync',
      severity: 'info',
      message: 'Plugin permissions and policies sync to Permission Engine™ and Policy Engine™ on install.',
      recommendation: 'Review capability grants after every plugin update.',
    },
    {
      id: 'gov-marketplace-verification',
      severity: 'warning',
      message: 'Community plugins require verification before production sandbox deploy.',
      recommendation: 'Install community plugins in testing sandbox first.',
    },
  ];
}

export function computeExtensibilityScorePct(pluginTypeCount: number, capabilityCount: number): number {
  return Math.min(99, Math.round((pluginTypeCount * 3 + capabilityCount) / 2));
}
