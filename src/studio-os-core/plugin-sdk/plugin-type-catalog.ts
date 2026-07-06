import { PLUGIN_TYPES } from './constants';
import type { PluginTypeEntry, PluginTypeId } from './types';

const TYPE_META: Record<
  PluginTypeId,
  { name: string; description: string; exampleUse: string; status: PluginTypeEntry['status'] }
> = {
  'organization-modules': {
    name: 'Organization Modules',
    description: 'Extend Headquarters with custom organizational capabilities.',
    exampleUse: 'Custom CRM module for client intake workflows.',
    status: 'available',
  },
  'department-packs': {
    name: 'Department Packs',
    description: 'Add new departments with concierges, SOPs, and dashboards.',
    exampleUse: 'Contractor dispatch department pack.',
    status: 'available',
  },
  'profession-packs': {
    name: 'Profession Packs',
    description: 'Seed Profession Brain™ surfaces and Institute lessons.',
    exampleUse: 'Fuel tax compliance profession pack.',
    status: 'available',
  },
  'marketplace-extensions': {
    name: 'Marketplace Extensions',
    description: 'Extend Expert Marketplace with new product types.',
    exampleUse: 'Membership tier extension for academy access.',
    status: 'available',
  },
  'dashboard-widgets': {
    name: 'Dashboard Widgets',
    description: 'Mission Control and Headquarters dashboard tiles.',
    exampleUse: 'Custom revenue sparkline widget.',
    status: 'available',
  },
  'command-dock-skills': {
    name: 'Command Dock Skills',
    description: 'New Command Dock commands and proactive suggestions.',
    exampleUse: 'Weekly payroll summary skill.',
    status: 'available',
  },
  'automation-actions': {
    name: 'Automation Actions',
    description: 'Register new automation actions in Automation Registry™.',
    exampleUse: 'Send Slack notification on approval.',
    status: 'available',
  },
  'workflow-nodes': {
    name: 'Workflow Nodes',
    description: 'Visual workflow builder nodes for custom processes.',
    exampleUse: 'Client onboarding approval node.',
    status: 'available',
  },
  integrations: {
    name: 'Integrations',
    description: 'Connect external services with org-scoped credentials.',
    exampleUse: 'QuickBooks sync integration.',
    status: 'available',
  },
  reports: {
    name: 'Reports',
    description: 'Custom report templates and scheduled exports.',
    exampleUse: 'Monthly P&L executive report.',
    status: 'available',
  },
  analytics: {
    name: 'Analytics',
    description: 'Analytics panels and metric collectors.',
    exampleUse: 'Campaign ROI analytics dashboard.',
    status: 'available',
  },
  'custom-pages': {
    name: 'Custom Pages',
    description: 'Register new admin and Headquarters pages.',
    exampleUse: 'Vendor portal page.',
    status: 'available',
  },
  'custom-panels': {
    name: 'Custom Panels',
    description: 'Slide-over panels and Mission Control cards.',
    exampleUse: 'Inventory alert panel.',
    status: 'available',
  },
  'custom-commands': {
    name: 'Custom Commands',
    description: 'Named commands routable through Command Dock.',
    exampleUse: 'Generate weekly briefing command.',
    status: 'available',
  },
  'ai-tools': {
    name: 'AI Tools',
    description: 'Studio Intelligence™ tools via Model Orchestrator.',
    exampleUse: 'Contract clause review AI tool.',
    status: 'beta',
  },
  'developer-utilities': {
    name: 'Developer Utilities',
    description: 'SDK helpers, debug panels, and scaffolding.',
    exampleUse: 'Plugin manifest validator.',
    status: 'available',
  },
  'future-plugins': {
    name: 'Future Plugins',
    description: 'Reserved extension slot for upcoming platform capabilities.',
    exampleUse: 'Partner SDK v2 preview slot.',
    status: 'planned',
  },
};

export function buildPluginTypeCatalog(): PluginTypeEntry[] {
  return PLUGIN_TYPES.map((typeId) => ({
    typeId,
    extensible: true as const,
    ...TYPE_META[typeId],
  }));
}
