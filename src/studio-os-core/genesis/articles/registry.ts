import { listGenesisObjects } from '../objects/factory';
import type { GenesisObject } from '../types';

/** Article registry — Genesis articles are objects of type `article`. */
export function listGenesisArticles(): GenesisObject[] {
  return listGenesisObjects({ type: 'article' });
}

export function listDraftArticles(): GenesisObject[] {
  return listGenesisObjects({ type: 'article', status: 'draft' });
}

export function listCanonicalArticles(): GenesisObject[] {
  return listGenesisObjects({ type: 'article', canonicalStatus: 'canonical' });
}
