/**
 * Every-detail-matters phrasing pools — spec value + plain English (reads like product copy).
 * Keep in sync with api/_lib/hairstyleAnalysisEveryDetailMattersPools.ts
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

/** Straight / wave / curl label for texture-row copy (not the catalog unit name alone). */
function unitTextureKind(unit: string): string {
  const u = unit.trim().toUpperCase();
  if (u === 'NOIR' || u === 'BLANCO') return 'STRAIGHT';
  if (u === 'SOFT WAVE') return 'LOOSE WAVE';
  if (u === 'BEACH WAVE') return 'BEACH WAVE';
  if (u === 'SOFT CURL') return 'TIGHT WAVE';
  if (u === 'OCEAN CURL') return 'TIGHT CURL';
  return 'RAW';
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
    (c) => `${c.unit} ${unitTextureKind(c.unit)} TEXTURE FOR A CLEAN FINISH`,
    (c) => `${c.unit} TEXTURE, EXTENSIONS THAT MOVE LIKE REAL HAIR`,
    (c) => `${c.unit} TEXTURE WITH NATURAL BODY AND FULLNESS`,
    (c) => `${c.unit} TEXTURE, EXTENSIONS YOU CAN STYLE EASILY`,
    (c) => `${c.unit} RAW HAIR WITH A SLEEK FINISH`,
    (c) => `${c.unit} TEXTURE WITH SMOOTH, DEFINED STRANDS`,
    (c) => `${c.unit} TEXTURE THAT FALLS CLEANLY`,
    (c) => `${c.unit} TEXTURE, EASY TO WEAR EVERY DAY`,
    (c) => `${c.unit} FOR A SOFT ${unitTextureKind(c.unit)} LOOK`,
    (c) => `${c.unit} TEXTURE WITH BELIEVABLE MOVEMENT`,
    (c) => `${c.unit} TEXTURE, EXTENSIONS WITH A NATURAL FEEL`,
    (c) => `${c.unit} TEXTURE FOR EVERYDAY WEAR`,
  ];
  if (!ctx.withFace) return generic;
  return [
    ...generic,
    (c) => `${c.unit} TEXTURE TO FRAME YOUR ${c.face.faceShape}`,
    (c) => `${c.unit} TEXTURE FLATTERS YOUR ${c.face.faceShape}`,
    (c) => `${c.unit} TEXTURE TO BALANCE YOUR ${c.face.faceShape}`,
  ];
}

export function styleLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  if (ctx.style === 'NONE') {
    const natural: EveryDetailLineBuilder[] = [
      (c) => `${c.unit} TEXTURE, NO SALON STYLING ADDED`,
      (c) => `${c.unit} WORN IN ITS NATURAL TEXTURE`,
      (c) => `${c.unit} TEXTURE, READY TO CUT AND STYLE`,
      (c) => `${c.unit} TEXTURE FOR A SOFT NATURAL FINISH`,
      (c) => `NO ADDED STYLING ON ${c.unit} TEXTURE`,
      (c) => `${c.unit} TEXTURE, EASY EVERYDAY FINISH`,
      (c) => `${c.unit} LEFT IN ITS RAW TEXTURE`,
      (c) => `${c.unit} TEXTURE YOU CAN PERSONALIZE`,
    ];
    if (!ctx.withFace) return natural;
    return [
      ...natural,
      (c) => `${c.unit} TEXTURE SUITS YOUR ${c.face.faceShape}`,
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
  if (inches !== null && inches >= 28) {
    const long: EveryDetailLineBuilder[] = [
      (c) => `${c.length} FOR EXTRA LENGTH`,
      (c) => `${c.length} THAT FALLS PAST MID CHEST`,
      (c) => `${c.length} FOR A LONG, DRAMATIC LINE`,
      (c) => `${c.length} WITH CLEAN ENDS`,
      (c) => `${c.length} THAT DRAWS THE EYE DOWN`,
      (c) => `${c.length} FOR A STATEMENT LENGTH`,
    ];
    if (!withFace) return long;
    return [...long, (c) => `${c.length} FLATTERS YOUR ${face.faceShape}`];
  }
  if (inches !== null && inches <= 22) {
    return [
      (c) => `${c.length} SITS AT THE COLLARBONE`,
      (c) => `${c.length} FALLS TO THE COLLARBONE`,
      (c) => `${c.length} FOR EASY EVERYDAY LENGTH`,
      (c) => `${c.length} AT A CLEAN COLLARBONE LENGTH`,
      (c) => `${c.length} THAT STAYS LIGHT AND BALANCED`,
      (c) => `${c.length} WITH A NEAT COLLARBONE HEM`,
    ];
  }
  const mid: EveryDetailLineBuilder[] = [
    (c) => `${c.length} HITS MID CHEST`,
    (c) => `${c.length} LANDS AT MID CHEST`,
    (c) => `${c.length} AT CLASSIC MID CHEST LENGTH`,
    (c) => `${c.length} FOR A BALANCED EVERYDAY LENGTH`,
    (c) => `${c.length} WITH CLEAN MID CHEST ENDS`,
    (c) => `${c.length} THAT FALLS TO MID CHEST`,
    (c) => `${c.length} FOR A FLATTERING MID LENGTH`,
  ];
  if (!withFace) return mid;
  return [...mid, (c) => `${c.length} FLATTERS YOUR ${face.faceShape}`];
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
