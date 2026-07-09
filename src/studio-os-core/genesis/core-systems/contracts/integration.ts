import { INITIAL_GENESIS_VERSION } from '../../versioning/semver';
import { mutateCoreSystemsStore, readCoreSystemsStore } from '../persistence';
import type { IntegrationContract } from '../types';
import type { IntegrationContractStatus } from '../constants';

function now(): string {
  return new Date().toISOString();
}

export function createContractId(
  providerSystemId: string,
  consumerSystemId: string,
  interfaceName: string
): string {
  const iface = interfaceName.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
  return `CTR-${providerSystemId}-${consumerSystemId}-${iface}-${Date.now().toString(36)}`;
}

export type RegisterIntegrationContractInput = {
  providerSystemId: string;
  consumerSystemId: string;
  interfaceName: string;
  status?: IntegrationContractStatus;
  description?: string;
};

/** Integration Contracts™ */
export function registerIntegrationContract(
  input: RegisterIntegrationContractInput
): IntegrationContract {
  const timestamp = now();
  const contract: IntegrationContract = {
    contractId: createContractId(
      input.providerSystemId,
      input.consumerSystemId,
      input.interfaceName
    ),
    providerSystemId: input.providerSystemId.trim(),
    consumerSystemId: input.consumerSystemId.trim(),
    interfaceName: input.interfaceName.trim(),
    version: { ...INITIAL_GENESIS_VERSION },
    status: input.status ?? 'draft',
    description: input.description,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    contracts: [...store.contracts, contract],
  }));

  return contract;
}

export function listIntegrationContracts(): IntegrationContract[] {
  return readCoreSystemsStore().contracts;
}

export function listContractsForSystem(systemId: string): IntegrationContract[] {
  return listIntegrationContracts().filter(
    (c) => c.providerSystemId === systemId || c.consumerSystemId === systemId
  );
}

export function listActiveContracts(): IntegrationContract[] {
  return listIntegrationContracts().filter((c) => c.status === 'active');
}

export function activateIntegrationContract(contractId: string): IntegrationContract | undefined {
  const contract = listIntegrationContracts().find((c) => c.contractId === contractId);
  if (!contract) return undefined;

  const updated: IntegrationContract = {
    ...contract,
    status: 'active',
    updatedAt: now(),
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    contracts: store.contracts.map((c) => (c.contractId === contractId ? updated : c)),
  }));

  return updated;
}

export function deprecateIntegrationContract(contractId: string): IntegrationContract | undefined {
  const contract = listIntegrationContracts().find((c) => c.contractId === contractId);
  if (!contract) return undefined;

  const updated: IntegrationContract = {
    ...contract,
    status: 'deprecated',
    updatedAt: now(),
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    contracts: store.contracts.map((c) => (c.contractId === contractId ? updated : c)),
  }));

  return updated;
}
