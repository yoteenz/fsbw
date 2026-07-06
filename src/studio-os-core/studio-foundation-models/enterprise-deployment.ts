import { ENTERPRISE_DEPLOYMENT_LABELS, ENTERPRISE_DEPLOYMENT_MODES } from './constants';
import type { EnterpriseDeploymentProfile } from './types';

export function buildEnterpriseDeployments(
  trustRegulated: boolean,
  orchestratorOfflineCapable: boolean
): EnterpriseDeploymentProfile[] {
  return ENTERPRISE_DEPLOYMENT_MODES.map((mode) => {
    let available = false;
    let detail = ENTERPRISE_DEPLOYMENT_LABELS[mode];
    let regulatedIndustryReady = false;

    switch (mode) {
      case 'private-studio-models':
        available = true;
        detail = 'Private Studio Models™ — customer-controlled inference endpoints planned.';
        break;
      case 'industry-specific':
        available = true;
        detail = 'Industry-specific Profession Model™ deployments for vertical expertise.';
        break;
      case 'offline-enterprise':
        available = orchestratorOfflineCapable;
        detail = orchestratorOfflineCapable
          ? 'Offline enterprise models via Model Orchestrator™ local path.'
          : 'Offline enterprise path calibrating with Model Orchestrator™.';
        break;
      case 'regulated-industry':
        available = trustRegulated;
        regulatedIndustryReady = trustRegulated;
        detail = trustRegulated
          ? 'Regulated-industry models with Professional Trust Framework™ gates.'
          : 'Regulated deployment ready when trust scope requires it.';
        break;
      case 'customer-owned-instances':
        available = false;
        detail = 'Customer-owned model instances — long-term enterprise deployment mode.';
        break;
      case 'secure-local-inference':
        available = orchestratorOfflineCapable;
        detail = 'Secure local inference for legal, medical, finance, and government workloads.';
        break;
      default:
        break;
    }

    return {
      mode,
      label: ENTERPRISE_DEPLOYMENT_LABELS[mode],
      available,
      detail,
      regulatedIndustryReady,
    };
  });
}

export function summarizeEnterpriseDeployment(deployments: EnterpriseDeploymentProfile[]): string {
  const available = deployments.filter((d) => d.available).length;
  const regulated = deployments.filter((d) => d.regulatedIndustryReady).length;
  return `${available}/${deployments.length} enterprise deployment modes prepared. ${regulated > 0 ? 'Regulated-industry path active.' : 'Regulated paths ready on demand.'} Private · offline · customer-owned instances planned.`;
}
