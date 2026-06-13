/**
 * Every-detail-matters phrasing pools — human product copy without catalog unit names.
 * Keep in sync with src/utils/hairstyleAnalysisEveryDetailMattersPools.ts
 */

export type EveryDetailLineCtx = {
  unit: string;
  color: string;
  style: string;
  length: string;
  density: string;
  part: string;
  hairline: string;
  inches: number | null;
  laceLabel: string;
  face: { faceShape: string; eyeDescriptor: string };
  withFace: boolean;
};

export type EveryDetailLineBuilder = (ctx: EveryDetailLineCtx) => string;

/** Straight / wavy / curly — never print catalog unit names (NOIR, BEACH WAVE, etc.). */
function hairPatternLabel(unit: string): string {
  const u = unit.trim().toUpperCase();
  if (u === 'NOIR' || u === 'BLANCO') return 'STRAIGHT';
  if (u === 'SOFT WAVE' || u === 'BEACH WAVE') return 'WAVY';
  if (u === 'SOFT CURL' || u === 'OCEAN CURL') return 'CURLY';
  return 'STRAIGHT';
}

export function laceLinePool(): EveryDetailLineBuilder[] {
  return [
    (c) => `MELTED LACE, ${c.hairline} HAIRLINE`,
    (c) => `${c.hairline} HAIRLINE WITH HD LACE MELT`,
    (c) => `${c.laceLabel} THAT MELTS INTO THE SCALP`,
    (c) => `${c.laceLabel} WITH SINGLE STRAND KNOTS`,
    (c) => `SEAMLESS ${c.hairline} LACE FRONT`,
    (c) => `${c.laceLabel} FOR AN UNDETECTABLE MELT`,
    (c) => `${c.hairline} EDGE ON ${c.laceLabel}`,
    (c) => `${c.laceLabel} FOR A READY TO WEAR MELT`,
    (c) => `${c.hairline} HAIRLINE WITH MELTED LACE`,
    () => `HD LACE WITH A NATURAL HAIRLINE MELT`,
    (c) => `${c.laceLabel} LACE FRONT THAT DISAPPEARS`,
    (c) => `${c.hairline} HAIRLINE ON ${c.laceLabel}`,
  ];
}

export function colorLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  const generic: EveryDetailLineBuilder[] = [
    (c) => `${c.color} TO ACCENTUATE YOUR FEATURES`,
    (c) => `${c.color} TO WARM YOUR COMPLEXION`,
    (c) => `${c.color} FOR A RICH, EVEN TONE`,
    (c) => `${c.color} FROM ROOT TO TIP`,
    (c) => `${c.color} TO BRIGHTEN YOUR LOOK`,
    (c) => `${c.color} FOR SOFT CONTRAST AT THE HAIRLINE`,
    (c) => `${c.color} THAT HOLDS COLOR EVENLY`,
    (c) => `${c.color} FOR A POLISHED FINISH`,
    (c) => `${c.color} TO ADD DEPTH TO YOUR LOOK`,
    (c) => `${c.color} PAIRED WITH YOUR SKIN TONE`,
    (c) => `${c.color} FOR A CLEAN COLOR MATCH`,
    (c) => `${c.color} TO ENRICH YOUR NATURAL GLOW`,
    (c) => `${c.color} FOR BOLD COLOR PAYOFF`,
    (c) => `${c.color} TO FRAME THE FACE`,
  ];
  if (!ctx.withFace) return generic;
  return [
    ...generic,
    (c) => `${c.color} FLATTERS YOUR ${c.face.faceShape}`,
    (c) => `${c.color} TO SOFTEN YOUR ${c.face.faceShape}`,
    (c) => `${c.color} HIGHLIGHTS YOUR CHEEKBONES`,
    (c) => `${c.color} TO COMPLEMENT YOUR ${c.face.eyeDescriptor} EYES`,
  ];
}

export function textureLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  const generic: EveryDetailLineBuilder[] = [
    () => `EXTENSIONS THAT MOVE LIKE REAL HAIR`,
    () => `EXTENSIONS WITH A NATURAL FEEL`,
    () => `EXTENSIONS YOU CAN STYLE EASILY`,
    () => `RAW HAIR WITH A POLISHED FINISH`,
    () => `HAIR THAT FALLS CLEANLY`,
    () => `TEXTURE WITH BELIEVABLE MOVEMENT`,
    () => `TEXTURE THAT IS EASY TO WEAR EVERY DAY`,
    (c) => `${hairPatternLabel(c.unit)} TEXTURE FOR A CLEAN FINISH`,
    (c) => `${hairPatternLabel(c.unit)} TEXTURE WITH NATURAL BODY`,
    (c) => `${hairPatternLabel(c.unit)} TEXTURE FOR A SOFT NATURAL LOOK`,
    () => `EXTENSIONS WITH FULL, NATURAL BODY`,
    () => `HAIR WITH SMOOTH, DEFINED STRANDS`,
  ];
  if (!ctx.withFace) return generic;
  return [
    ...generic,
    (c) => `${hairPatternLabel(c.unit)} TEXTURE TO FRAME YOUR ${c.face.faceShape}`,
    () => `EXTENSIONS THAT FLATTER YOUR ${ctx.face.faceShape}`,
    (c) => `${hairPatternLabel(c.unit)} TEXTURE TO BALANCE YOUR ${c.face.faceShape}`,
  ];
}

export function styleLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  if (ctx.style === 'NONE') {
    const natural: EveryDetailLineBuilder[] = [
      () => `NO SALON STYLING ADDED`,
      () => `WORN IN NATURAL TEXTURE`,
      () => `READY TO CUT AND STYLE`,
      () => `SOFT NATURAL FINISH`,
      () => `EASY EVERYDAY FINISH`,
      () => `LEFT IN RAW TEXTURE`,
      () => `TEXTURE YOU CAN PERSONALIZE`,
      () => `NATURAL TEXTURE, EASY TO STYLE`,
    ];
    if (!ctx.withFace) return natural;
    return [
      ...natural,
      (c) => `NATURAL TEXTURE FOR YOUR ${c.face.faceShape}`,
    ];
  }
  return [
    (c) => `${c.style} TO SHAPE THE FACE`,
    (c) => `${c.style} TO CLEAN UP THE JAWLINE`,
    (c) => `${c.style} FOR A SALON FINISHED LOOK`,
    (c) => `${c.style} TO ADD STRUCTURE AT THE CROWN`,
    (c) => `${c.style} FOR POLISHED ENDS`,
    (c) => `${c.style} TO WORK WITH YOUR ${c.part} PART`,
    (c) => `${c.style} FOR DEFINED CHEEKBONES`,
    (c) => `${c.style} TO OPEN UP THE NECKLINE`,
    (c) => `${c.style} FOR LAYERED MOVEMENT`,
    (c) => `${c.style} TO REFINE THE HAIRLINE`,
    (c) => `${c.style} FOR A SCULPTED FINISH`,
    (c) => `${c.style} THAT HOLDS ITS SHAPE`,
  ];
}

export function lengthLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  const { inches, withFace, face } = ctx;

  // 16" and under — short lengths sit near the collarbone.
  if (inches !== null && inches <= 16) {
    const collarbone: EveryDetailLineBuilder[] = [
      (c) => `${c.length} SITS NEAR THE COLLARBONE`,
      (c) => `${c.length} FALLS TO THE COLLARBONE`,
      (c) => `${c.length} FOR A SHORT, CLEAN LENGTH`,
      (c) => `${c.length} AT A COLLARBONE LENGTH`,
      (c) => `${c.length} THAT STAYS LIGHT AND BALANCED`,
      (c) => `${c.length} WITH A NEAT COLLARBONE HEM`,
    ];
    if (!withFace) return collarbone;
    return [...collarbone, (c) => `${c.length} FLATTERS YOUR ${face.faceShape}`];
  }

  // 26"+ — hip length and longer.
  if (inches !== null && inches >= 26) {
    const hip: EveryDetailLineBuilder[] = [
      (c) => `${c.length} FALLS TO THE HIP`,
      (c) => `${c.length} SITS AT THE HIP`,
      (c) => `${c.length} FOR A LONG, DRAMATIC LINE`,
      (c) => `${c.length} WITH CLEAN ENDS`,
      (c) => `${c.length} THAT DRAWS THE EYE DOWN`,
      (c) => `${c.length} FOR A STATEMENT LENGTH`,
      (c) => `${c.length} FALLS BELOW THE HIP`,
      (c) => `${c.length} FOR LENGTH BELOW THE HIP`,
    ];
    if (!withFace) return hip;
    return [...hip, (c) => `${c.length} FLATTERS YOUR ${face.faceShape}`];
  }

  // 18"–25" — waist length.
  if (inches !== null && inches >= 18) {
    const waist: EveryDetailLineBuilder[] = [
      (c) => `${c.length} FALLS TO THE WAIST`,
      (c) => `${c.length} SITS AT THE WAIST`,
      (c) => `${c.length} FOR A CLASSIC WAIST LENGTH`,
      (c) => `${c.length} WITH CLEAN WAIST LENGTH ENDS`,
      (c) => `${c.length} THAT HITS THE WAIST`,
      (c) => `${c.length} FOR A BALANCED EVERYDAY LENGTH`,
      (c) => `${c.length} FALLS BELOW THE WAIST`,
      (c) => `${c.length} FOR LENGTH BELOW THE WAIST`,
    ];
    if (!withFace) return waist;
    return [...waist, (c) => `${c.length} FLATTERS YOUR ${face.faceShape}`];
  }

  // 17" — between collarbone and waist; use below-waist phrasing when placement is less exact.
  if (inches !== null && inches === 17) {
    return [
      (c) => `${c.length} FALLS BELOW THE WAIST`,
      (c) => `${c.length} FOR LENGTH BELOW THE WAIST`,
      (c) => `${c.length} FOR A SHORT, EASY LENGTH`,
      (c) => `${c.length} WITH CLEAN ENDS`,
      (c) => `${c.length} THAT STAYS LIGHT AND BALANCED`,
      (c) => `${c.length} FOR EVERYDAY WEAR`,
    ];
  }

  const generic: EveryDetailLineBuilder[] = [
    (c) => `${c.length} FOR EASY EVERYDAY WEAR`,
    (c) => `${c.length} WITH CLEAN ENDS`,
    (c) => `${c.length} FOR A BALANCED EVERYDAY LENGTH`,
    (c) => `${c.length} THAT STAYS LIGHT AND BALANCED`,
  ];
  if (!withFace) return generic;
  return [...generic, (c) => `${c.length} FLATTERS YOUR ${face.faceShape}`];
}

export function densityLinePool(): EveryDetailLineBuilder[] {
  return [
    (c) => `${c.density} DENSITY FOR FULL, NATURAL BODY`,
    (c) => `${c.density} DENSITY WITH REALISTIC VOLUME`,
    (c) => `${c.density} DENSITY FOR A FULL LOOK`,
    (c) => `${c.density} DENSITY WITHOUT HELMET HAIR`,
    (c) => `${c.density} DENSITY YOU CAN STYLE EASILY`,
  ];
}

export function partLinePool(): EveryDetailLineBuilder[] {
  return [
    (c) => `${c.part} PART TO FRAME THE FACE`,
    (c) => `${c.part} PART FOR A CLEAN, BALANCED LOOK`,
    (c) => `${c.part} PART THAT OPENS UP THE FACE`,
    (c) => `${c.part} PART FOR SYMMETRY AT THE FRONT`,
    (c) => `${c.part} PART THAT WORKS WITH YOUR FEATURES`,
  ];
}

export function hairlineLinePool(): EveryDetailLineBuilder[] {
  return [
    (c) => `${c.hairline} HAIRLINE ON ${c.laceLabel}`,
    (c) => `${c.hairline} HAIRLINE WITH MELTED LACE`,
    (c) => `${c.hairline} HAIRLINE FOR A SEAMLESS MELT`,
    (c) => `${c.hairline} EDGE THAT BLENDS CLEANLY`,
    (c) => `${c.hairline} HAIRLINE FOR HD LACE`,
    (c) => `${c.hairline} HAIRLINE READY TO WEAR`,
  ];
}
