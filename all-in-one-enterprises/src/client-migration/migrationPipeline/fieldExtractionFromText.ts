import type { ProposedFact } from './types';

/** Document class from text + filename hints (no filename-only fact values). */
export function classifyDocumentFromText(text: string, fileName: string): string {
  const blob = `${text}\n${fileName}`.toLowerCase();
  if (/certificate of insurance|policy number|insured|coi\b/.test(blob)) return 'certificate_of_insurance';
  if (/ifta|international fuel tax/.test(blob)) return 'ifta_return';
  if (/cab card|registration|license plate|vin\b/.test(blob)) return 'vehicle_registration';
  if (/articles of organization|certificate of formation|secretary of state|llc/.test(blob)) return 'business_formation';
  if (/operating authority|usdot|mc[- ]?mx|motor carrier/.test(blob)) return 'authority_document';
  return 'general_correspondence';
}

function pick(pattern: RegExp, text: string): string | undefined {
  const m = text.match(pattern);
  return m?.[1]?.trim().replace(/\s{2,}/g, ' ');
}

/** Structured field proposals from OCR/text — values must appear in document text. */
export function extractFactsFromDocumentText(text: string, sourceReference: string): ProposedFact[] {
  const facts: ProposedFact[] = [];
  const flat = text.replace(/\r\n/g, '\n');

  const legalName =
    pick(/(?:legal\s+business\s+name|company\s+name|legal\s+name|name of (?:llc|company|organization))\s*[:\-]\s*([^\n\r]{3,120})/i, flat)
    ?? pick(/\b([A-Z][A-Z0-9&.,'\- ]{2,60}\s+(?:LLC|L\.L\.C\.|INC\.?|CORP\.?|CO\.?))\b/, flat);

  if (legalName) {
    facts.push({
      entityType: 'company',
      fieldKey: 'legal_name',
      proposedValue: legalName.toUpperCase(),
      confidence: 'HIGH',
      sourceReference,
    });
  }

  const usdot = pick(/\bUSDOT\s*#?\s*:?\s*(\d{5,8})\b/i, flat);
  if (usdot) {
    facts.push({
      entityType: 'company',
      fieldKey: 'usdot',
      proposedValue: usdot,
      confidence: 'HIGH',
      sourceReference,
    });
  }

  const mc = pick(/\bMC\s*#?\s*:?\s*(\d{5,7})\b/i, flat) ?? pick(/\bMC[- ]?MX\s*#?\s*:?\s*(\d{5,7})\b/i, flat);
  if (mc) {
    facts.push({
      entityType: 'company',
      fieldKey: 'mc_number',
      proposedValue: mc,
      confidence: 'HIGH',
      sourceReference,
    });
  }

  const ein = pick(/\bEIN\s*#?\s*:?\s*(\d{2}-\d{7})\b/i, flat) ?? pick(/\b(\d{2}-\d{7})\b/, flat);
  if (ein && /ein|employer identification|tax id/i.test(flat)) {
    facts.push({
      entityType: 'company',
      fieldKey: 'ein',
      proposedValue: ein,
      confidence: 'MEDIUM',
      sourceReference,
    });
  }

  const phone = pick(/\b(?:phone|tel|telephone)\s*[:\-]?\s*(\(\d{3}\)\s*\d{3}-\d{4}|\d{3}[-.\s]\d{3}[-.\s]\d{4})\b/i, flat);
  if (phone) {
    facts.push({
      entityType: 'company',
      fieldKey: 'company_phone',
      proposedValue: phone,
      confidence: 'MEDIUM',
      sourceReference,
    });
  }

  const email = pick(/\b(?:email|e-mail)\s*[:\-]?\s*([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i, flat);
  if (email) {
    facts.push({
      entityType: 'company',
      fieldKey: 'company_email',
      proposedValue: email.toLowerCase(),
      confidence: 'MEDIUM',
      sourceReference,
    });
  }

  const address = pick(
    /(?:principal\s+)?(?:office\s+)?address\s*[:\-]\s*([^\n\r]{8,160})/i,
    flat,
  );
  if (address) {
    facts.push({
      entityType: 'company',
      fieldKey: 'business_address',
      proposedValue: address.replace(/\s{2,}/g, ' ').trim(),
      confidence: 'MEDIUM',
      sourceReference,
    });
  }

  const vin = pick(/\bVIN\s*[:\-]?\s*([A-HJ-NPR-Z0-9]{11,17})\b/i, flat);
  if (vin) {
    facts.push({
      entityType: 'vehicle',
      fieldKey: 'vin',
      proposedValue: vin.toUpperCase(),
      confidence: 'HIGH',
      sourceReference,
    });
  }

  const policy = pick(/\b(?:policy\s*(?:#|number|no\.?)|policy number)\s*[:\-]?\s*([A-Z0-9-]{5,24})\b/i, flat);
  if (policy) {
    facts.push({
      entityType: 'insurance',
      fieldKey: 'policy_number',
      proposedValue: policy.toUpperCase(),
      confidence: 'MEDIUM',
      sourceReference,
    });
  }

  const carrier = pick(/\b(?:insurer|insurance company|carrier)\s*[:\-]?\s*([^\n\r]{3,80})/i, flat);
  if (carrier) {
    facts.push({
      entityType: 'insurance',
      fieldKey: 'carrier_name',
      proposedValue: carrier.trim(),
      confidence: 'LOW',
      sourceReference,
    });
  }

  const unit = pick(/\b(?:unit|truck)\s*(?:#|no\.?|number)?\s*[:\-]?\s*([A-Z0-9-]{2,12})\b/i, flat);
  if (unit) {
    facts.push({
      entityType: 'vehicle',
      fieldKey: 'unit_number',
      proposedValue: unit.toUpperCase(),
      confidence: 'LOW',
      sourceReference,
    });
  }

  return facts;
}
