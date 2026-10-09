import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import {
  estimateDataUrlBytesInDocuments,
  measureDemoStoreSectionSizes,
  serializeDemoStoreForLocalStorage,
} from './demoStorePersistence';

describe('demo store persistence sizing', () => {
  it('identifies inline document payloads as the dominant growth vector', () => {
    const store = createDemoSeed();
    const baseDocBytes = estimateDataUrlBytesInDocuments(store);
    const fakePdf = `data:application/pdf;base64,${'A'.repeat(800_000)}`;
    store.documents.push({
      ...store.documents[0]!,
      id: 'migration-test-doc',
      storageReference: fakePdf,
      fileName: 'large-scan.pdf',
      title: 'Large Scan',
    });

    const withPayload = estimateDataUrlBytesInDocuments(store);
    expect(withPayload).toBeGreaterThan(baseDocBytes + 700_000);

    const sections = measureDemoStoreSectionSizes(store);
    expect(sections.documents).toBeGreaterThan(700_000);

    const compact = serializeDemoStoreForLocalStorage(store);
    expect(estimateDataUrlBytesInDocuments(compact)).toBe(0);
    expect(compact.documents.find((d) => d.id === 'migration-test-doc')?.storageReference).toMatch(/^demo-blob:/);
  });
});
