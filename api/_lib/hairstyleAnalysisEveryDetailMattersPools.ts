/**
 * Every-detail-matters phrasing pools — PDP details tab + spec-led fit notes.
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

export function laceLinePool(): EveryDetailLineBuilder[] {
  return [
    (c) => `MELTED LACE, ${c.hairline} HAIRLINE`,
    (c) => `${c.hairline} HAIRLINE WITH HD MELT`,
    (c) => `${c.laceLabel} FOR UNDETECTABLE SCALP MELT`,
    () => `HD FILM LACE MELTS SEAMLESSLY`,
    (c) => `${c.laceLabel} WITH SINGLE STRAND KNOTS`,
    (c) => `SEAMLESS ${c.hairline} LACE FRONT`,
    (c) => `${c.laceLabel} MELTS INTO ${c.hairline} EDGE`,
    (c) => `INVISIBLE ${c.laceLabel} FRONT`,
    (c) => `${c.hairline} EDGE ON ${c.laceLabel}`,
    (c) => `${c.laceLabel} FOR READY TO WEAR MELT`,
    (c) => `FLAWLESS ${c.hairline} LACE FINISH`,
    (c) => `${c.laceLabel} SCALP LIKE APPEARANCE`,
    (c) => `${c.hairline} HAIRLINE WITH MELTED LACE`,
    (c) => `${c.laceLabel} FOR FLAWLESS LACE MELT`,
  ];
}

export function colorLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  const generic: EveryDetailLineBuilder[] = [
    (c) => `${c.color} TO ACCENTUATE YOUR FEATURES`,
    (c) => `${c.color} FOR RICH INSTALL DEPTH`,
    (c) => `${c.color} TO WARM YOUR COMPLEXION`,
    (c) => `${c.color} FOR LUXE RAW HAIR TONE`,
    (c) => `${c.color} ADDS DIMENSION AT THE ROOTS`,
    (c) => `${c.color} FOR EVEN PIGMENT ROOT TO TIP`,
    (c) => `${c.color} KEEPS YOUR TONE BALANCED`,
    (c) => `${c.color} FOR A POLISHED FINISH`,
    (c) => `${c.color} PAIRS CLEANLY WITH YOUR SKIN`,
    (c) => `${c.color} FOR SOFT HAIRLINE CONTRAST`,
    (c) => `${c.color} TO BRIGHTEN YOUR OVERALL LOOK`,
    (c) => `${c.color} GROUNDS YOUR INSTALL COLOR`,
    (c) => `${c.color} FOR COLOR HARMONY`,
    (c) => `${c.color} TO ENRICH YOUR NATURAL GLOW`,
    (c) => `${c.color} FOR RICH CONTRAST WITH YOUR LOOK`,
    (c) => `${c.color} ADDS DEPTH TO YOUR LOOK`,
  ];
  if (!ctx.withFace) return generic;
  return [
    ...generic,
    (c) => `${c.color} TO FRAME YOUR ${c.face.faceShape}`,
    (c) => `${c.color} TO SOFTEN YOUR ${c.face.faceShape}`,
    (c) => `${c.color} HIGHLIGHTS YOUR CHEEKBONES`,
    (c) => `${c.color} TO BALANCE YOUR ${c.face.faceShape}`,
    (c) => `${c.color} TO COMPLEMENT YOUR ${c.face.eyeDescriptor} EYES`,
    (c) => `${c.color} WARMS THE LINE OF YOUR ${c.face.eyeDescriptor} EYES`,
  ];
}

export function textureLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  const generic: EveryDetailLineBuilder[] = [
    (c) => `${c.unit} FOR SLEEK STRAND FLOW`,
    (c) => `${c.unit} RAW TEXTURE FOR VERSATILITY`,
    (c) => `${c.unit} FOR MAXIMUM STYLING FLEX`,
    (c) => `${c.unit} BODY FOR INSTALL FULLNESS`,
    (c) => `${c.unit} FOR A CLEAN SILHOUETTE`,
    (c) => `${c.unit} STRANDS FOR DEFINED FINISH`,
    (c) => `${c.unit} FOR NATURAL LOOKING MOVEMENT`,
    (c) => `${c.unit} TEXTURE FOR EVERYDAY WEAR`,
    (c) => `${c.unit} FOR LUXE RAW FINISH`,
    (c) => `${c.unit} ADDS VERTICAL LINE`,
    (c) => `${c.unit} FOR BALANCED FULLNESS`,
    (c) => `${c.unit} FOR SINGLE DONOR CONSISTENCY`,
    (c) => `${c.unit} KEEPS ENDS WEIGHTED CLEANLY`,
    (c) => `${c.unit} FOR NATURAL STRAND FLOW`,
    (c) => `${c.unit} TEXTURE FOR CLEAN LINES`,
    (c) => `${c.unit} FOR A SLEEK SILHOUETTE`,
  ];
  if (!ctx.withFace) return generic;
  return [
    ...generic,
    (c) => `${c.unit} TO FRAME YOUR ${c.face.faceShape}`,
    (c) => `${c.unit} SOFTENS YOUR ${c.face.faceShape}`,
    (c) => `${c.unit} BALANCES YOUR ${c.face.faceShape}`,
    (c) => `${c.unit} LENGTHENS YOUR ${c.face.faceShape}`,
  ];
}

export function styleLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  if (ctx.style === 'NONE') {
    const natural: EveryDetailLineBuilder[] = [
      (c) => `${c.unit} SILHOUETTE FOR CLEAN LINES`,
      (c) => `${c.unit} IN ITS NATURAL TEXTURE STATE`,
      (c) => `${c.unit} FINISH FOR RAW HAIR LOOK`,
      (c) => `${c.unit} FOR UNCUSTOMIZED VERSATILITY`,
      (c) => `${c.unit} STRANDS FOR NATURAL FLOW`,
      (c) => `${c.unit} FOR A SOFT EVERYDAY FINISH`,
      (c) => `${c.unit} FOR BEGINNER FRIENDLY WEAR`,
      (c) => `${c.unit} DELIVERED IN NATURAL STATE`,
      (c) => `${c.unit} FOR STYLING FLEXIBILITY`,
      (c) => `${c.unit} FOR A POLISHED NATURAL LOOK`,
    ];
    if (!ctx.withFace) return natural;
    return [
      ...natural,
      (c) => `${c.unit} SHAPE SUITS YOUR ${c.face.faceShape}`,
      (c) => `${c.unit} FLOW ON YOUR ${c.face.faceShape}`,
    ];
  }
  return [
    (c) => `${c.style} FOR SCULPTED FACE FRAMING`,
    (c) => `${c.style} TO ENHANCE YOUR JAWLINE`,
    (c) => `${c.style} ADDS STRUCTURE AT THE CROWN`,
    (c) => `${c.style} FOR POLISHED SILHOUETTE`,
    (c) => `${c.style} KEEPS ENDS WEIGHTED CLEANLY`,
    (c) => `${c.style} TO BALANCE YOUR PART LINE`,
    (c) => `${c.style} FOR SALON FINISH SHAPE`,
    (c) => `${c.style} DEFINES YOUR NECKLINE`,
    (c) => `${c.style} FOR CHEEKBONE DEFINITION`,
    (c) => `${c.style} ADDS MOVEMENT AT THE ENDS`,
    (c) => `${c.style} FOR LAYERED DIMENSION`,
    (c) => `${c.style} TO REFINE YOUR HAIRLINE`,
    (c) => `${c.style} POLISHES YOUR JAWLINE`,
    (c) => `${c.style} FOR A SCULPTED FINISH`,
    (c) => `${c.style} ADDS STRUCTURE AT YOUR JAWLINE`,
    (c) => `${c.style} FOR CUSTOM SALON STYLING`,
  ];
}

export function lengthLinePool(ctx: EveryDetailLineCtx): EveryDetailLineBuilder[] {
  const { inches, withFace, face } = ctx;
  if (inches !== null && inches >= 28) {
    const long: EveryDetailLineBuilder[] = [
      (c) => `${c.length} FOR LONG INSTALL LENGTH`,
      (c) => `${c.length} FOR EXTRA LONG DRAMA`,
      (c) => `${c.length} FOR A LONG SILHOUETTE`,
      (c) => `${c.length} FOR MAXIMUM LENGTH IMPACT`,
      (c) => `${c.length} DRAWS THE EYE DOWNWARD`,
      (c) => `${c.length} FOR FULL BODY DRAMA`,
      (c) => `${c.length} LANDS LONG WITH CLEAN ENDS`,
    ];
    if (!withFace) return long;
    return [
      ...long,
      (c) => `${c.length} FOR LONG LENGTH ON YOUR ${face.faceShape}`,
      (c) => `${c.length} ADDS LENGTH ON YOUR ${face.faceShape}`,
    ];
  }
  if (inches !== null && inches <= 22) {
    return [
      (c) => `${c.length} AT COLLARBONE LENGTH`,
      (c) => `${c.length} STOPS AT COLLARBONE FOR BALANCE`,
      (c) => `${c.length} FOR A LIGHT COLLARBONE HIT`,
      (c) => `${c.length} LANDS AT COLLARBONE CLEANLY`,
      (c) => `${c.length} FOR EVERYDAY COLLARBONE WEAR`,
      (c) => `${c.length} HITS COLLARBONE WITH CLEAN ENDS`,
      (c) => `${c.length} FOR BALANCED COLLARBONE LENGTH`,
    ];
  }
  const mid: EveryDetailLineBuilder[] = [
    (c) => `${c.length} AT MID CHEST LENGTH`,
    (c) => `${c.length} LANDS AT MID CHEST FOR BALANCE`,
    (c) => `${c.length} HITS MID CHEST WITH CLEAN LINES`,
    (c) => `${c.length} FOR MID CHEST INSTALL LENGTH`,
    (c) => `${c.length} FOR MID CHEST DRAMA`,
    (c) => `${c.length} FOR VERSATILE MID CHEST WEAR`,
    (c) => `${c.length} SITS MID CHEST WITH FULL BODY`,
    (c) => `${c.length} FOR BALANCED MID CHEST FALL`,
  ];
  if (!withFace) return mid;
  return [
    ...mid,
    (c) => `${c.length} SITS MID CHEST ON YOUR ${face.faceShape}`,
  ];
}

export function densityLinePool(): EveryDetailLineBuilder[] {
  return [
    (c) => `${c.density} DENSITY FOR INSTALL FULLNESS`,
    (c) => `${c.density} DENSITY FOR MAXIMUM VOLUME`,
    (c) => `${c.density} DENSITY FOR RICH BODY`,
    (c) => `${c.density} DENSITY FOR BELIEVABLE FULLNESS`,
    (c) => `${c.density} DENSITY FOR STYLING FLEX`,
  ];
}

export function partLinePool(): EveryDetailLineBuilder[] {
  return [
    (c) => `${c.part} PART FOR BALANCED FRAMING`,
    (c) => `${c.part} PART FOR CLEAN FACE FRAMING`,
    (c) => `${c.part} PART FOR SYMMETRICAL BALANCE`,
    (c) => `${c.part} PART TO OPEN THE FACE`,
    (c) => `${c.part} PART FOR INSTALL BALANCE`,
  ];
}

export function hairlineLinePool(): EveryDetailLineBuilder[] {
  return [
    (c) => `${c.hairline} HAIRLINE FOR A SEAMLESS ${c.laceLabel} BLEND`,
    (c) => `${c.hairline} HAIRLINE WITH MELTED LACE`,
    (c) => `${c.hairline} HAIRLINE FOR HD LACE MELT`,
    (c) => `${c.hairline} HAIRLINE FOR NATURAL MELT`,
    (c) => `${c.hairline} EDGE FOR FLAWLESS LACE FINISH`,
    (c) => `${c.hairline} HAIRLINE FOR READY TO WEAR MELT`,
  ];
}
