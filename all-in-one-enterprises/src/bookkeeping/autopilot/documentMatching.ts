import type { BookkeepingTransaction, DocumentMatchResult } from './autopilotTypes';

export interface DocumentMatchCandidate {
  transactionId: string;
  documentId: string;
  score: number;
  factors: string[];
}

export function matchDocumentToTransaction(
  transaction: Pick<BookkeepingTransaction, 'id' | 'amountMinor' | 'transactionDate' | 'merchantName'>,
  documents: Array<{ id: string; amountMinor?: number; documentDate?: string; merchant?: string; invoiceNumber?: string }>,
): { result: DocumentMatchResult; matches: DocumentMatchCandidate[] } {
  const candidates: DocumentMatchCandidate[] = [];

  for (const doc of documents) {
    const factors: string[] = [];
    let score = 0;
    if (doc.amountMinor != null && doc.amountMinor === transaction.amountMinor) {
      score += 50;
      factors.push('amount');
    }
    if (doc.documentDate && doc.documentDate.slice(0, 10) === transaction.transactionDate.slice(0, 10)) {
      score += 30;
      factors.push('date');
    }
    if (doc.merchant && transaction.merchantName && doc.merchant.toLowerCase().includes(transaction.merchantName.toLowerCase().slice(0, 6))) {
      score += 20;
      factors.push('merchant');
    }
    if (score >= 50) candidates.push({ transactionId: transaction.id, documentId: doc.id, score, factors });
  }

  candidates.sort((a, b) => b.score - a.score);
  if (candidates.length === 0) return { result: 'NO_MATCH', matches: [] };
  if (candidates.length > 1 && candidates[0].score === candidates[1].score) {
    return { result: 'MULTIPLE_CANDIDATES', matches: candidates.slice(0, 3) };
  }
  if (candidates[0].score >= 80) return { result: 'MATCHED', matches: [candidates[0]] };
  if (candidates[0].score >= 50) return { result: 'LIKELY_MATCH', matches: [candidates[0]] };
  return { result: 'REVIEW_REQUIRED', matches: candidates.slice(0, 2) };
}
