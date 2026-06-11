import type { AnalysisTier, TemplateFieldDef, TextSlot } from '../types/hairstyleAnalysis';

function normalizeTier(tier: AnalysisTier): Exclude<AnalysisTier, 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

const CLIENT_IMAGE = { left: '5.4%', top: '14.2%', width: '47.5%', height: '68.5%' };
const CLIENT_NAME: TextSlot = { left: '8%', top: '11.5%', width: '40%', height: '3%' };

function line(left: string, top: number, width = '28%'): TextSlot {
  return { left, top: `${top}%`, width, height: '2.8%' };
}

function freeFields(): TemplateFieldDef[] {
  const L = '68%';
  return [
    { id: 'clientName', label: 'Client name', kind: 'text', slot: CLIENT_NAME },
    { id: 'clientImage', label: 'Client preview', kind: 'image', slot: CLIENT_IMAGE },
    { id: 'topScore', label: 'Match score', kind: 'text', slot: { left: '72%', top: '19%', width: '10%', height: '3.5%' } },
    { id: 'rating', label: 'Star rating', kind: 'text', slot: { left: '84%', top: '19%', width: '12%', height: '3.5%' } },
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
      id: `topBullet-${i}`,
      label: `Top match ${i + 1}`,
      kind: 'text' as const,
      slot: line(L, 27.5 + i * 3.1),
    })),
    ...[
      'specTexture',
      'specColor',
      'specHex',
      'specLength',
      'specLace',
      'specDensity',
      'specParting',
      'specHairline',
      'specStyle',
    ].map((id, i) => ({
      id,
      label: id,
      kind: 'text' as const,
      slot: line('70%', 52 + i * 2.35, '24%'),
    })),
    ...[0, 1, 2, 3, 4].map((i) => ({
      id: `whyLine-${i}`,
      label: `Why ${i + 1}`,
      kind: 'text' as const,
      slot: line(L, 74 + i * 2.6),
    })),
  ];
}

function threeMonthFields(): TemplateFieldDef[] {
  const L = '68%';
  const fields: TemplateFieldDef[] = [
    { id: 'clientName', label: 'Client name', kind: 'text', slot: CLIENT_NAME },
    { id: 'clientImage', label: 'Client preview', kind: 'image', slot: CLIENT_IMAGE },
    { id: 'topMatchBlock', label: 'Top match', kind: 'text', slot: line(L, 26, '30%'), multiline: true },
  ];
  [0, 1, 2].forEach((i) => {
    fields.push({
      id: `altBlock-${i}`,
      label: `Alternative ${i + 1}`,
      kind: 'text',
      slot: line(L, 42 + i * 10.5, '30%'),
      multiline: true,
    });
  });
  return fields;
}

function sixMonthFields(): TemplateFieldDef[] {
  const L = '68%';
  const fields: TemplateFieldDef[] = [
    { id: 'clientName', label: 'Client name', kind: 'text', slot: CLIENT_NAME },
    { id: 'clientImage', label: 'Client preview', kind: 'image', slot: CLIENT_IMAGE },
    { id: 'topMatchBlock', label: 'Top match', kind: 'text', slot: line(L, 24, '30%'), multiline: true },
  ];
  [0, 1, 2, 3, 4, 5, 6].forEach((i) => {
    fields.push({
      id: `portfolioLine-${i}`,
      label: `Portfolio ${i + 1}`,
      kind: 'text',
      slot: line(L, 36 + i * 4.2, '32%'),
    });
  });
  return fields;
}

function twelveMonthFields(): TemplateFieldDef[] {
  const L = '68%';
  const fields: TemplateFieldDef[] = [
    { id: 'clientName', label: 'Client name', kind: 'text', slot: CLIENT_NAME },
    { id: 'clientImage', label: 'Client preview', kind: 'image', slot: CLIENT_IMAGE },
    { id: 'topScore', label: 'Match score', kind: 'text', slot: { left: '72%', top: '18.5%', width: '10%', height: '3%' } },
    { id: 'rating', label: 'Star rating', kind: 'text', slot: { left: '84%', top: '18.5%', width: '12%', height: '3%' } },
    { id: 'topMatchBlock', label: 'Top match detail', kind: 'text', slot: line(L, 22, '30%'), multiline: true },
    ...[
      'specTexture',
      'specColor',
      'specHex',
      'specLength',
      'specLace',
      'specDensity',
      'specParting',
      'specHairline',
      'specStyle',
    ].map((id, i) => ({
      id,
      label: id,
      kind: 'text' as const,
      slot: line('70%', 58 + i * 2.1, '24%'),
    })),
  ];
  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => {
    const col = i < 3 ? 0 : i < 6 ? 1 : 2;
    const row = i % 3;
    fields.push({
      id: `altBlock-${i}`,
      label: `Alternative ${i + 1}`,
      kind: 'text',
      slot: {
        left: `${6 + col * 31}%`,
        top: `${36 + row * 11}%`,
        width: '28%',
        height: '10%',
      },
      multiline: true,
    });
  });
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((i) => {
    fields.push({
      id: `whyLine-${i}`,
      label: `Why ${i + 1}`,
      kind: 'text',
      slot: line(L, 78 + i * 1.9, '30%'),
    });
  });
  return fields;
}

const FIELD_BUILDERS: Record<Exclude<AnalysisTier, 'black'>, () => TemplateFieldDef[]> = {
  free: freeFields,
  three_month: threeMonthFields,
  six_month: sixMonthFields,
  twelve_month: twelveMonthFields,
};

export function getTemplateFields(tier: AnalysisTier): TemplateFieldDef[] {
  return FIELD_BUILDERS[normalizeTier(tier)]();
}
