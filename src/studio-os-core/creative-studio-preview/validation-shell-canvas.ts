import type { EnvironmentShellRecipe } from './environment-shell';

/** Browser-only — raster environment shell from compiled preview recipe (no pre-existing asset). */
export function renderValidationShellCanvas(recipe: EnvironmentShellRecipe): string | null {
  if (typeof document === 'undefined') return null;

  const { width, height } = recipe.renderTarget;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  renderCompanyShell(ctx, width, height, recipe);

  try {
    return canvas.toDataURL('image/webp', 0.92);
  } catch {
    return canvas.toDataURL('image/png');
  }
}

function renderCompanyShell(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  recipe: EnvironmentShellRecipe
) {
  const { companyId } = recipe;
  if (companyId === 'studio-os') {
    drawInstitutionalShell(ctx, w, h);
  } else if (companyId === 'frontal-slayer') {
    drawLuxuryFlagshipShell(ctx, w, h);
  } else {
    drawMediaCommandShell(ctx, w, h);
  }

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255,255,255,0.08)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawInstitutionalShell(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, '#e8ecf0');
  sky.addColorStop(1, '#c8d0d8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#d4cfc8';
  ctx.fillRect(0, h * 0.72, w, h * 0.28);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.08, w * 0.42, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(200,210,225,0.7)';
  ctx.fillRect(w * 0.08, h * 0.25, w * 0.18, h * 0.45);
  ctx.fillRect(w * 0.74, h * 0.25, w * 0.18, h * 0.45);

  const crystal = ctx.createLinearGradient(w * 0.4, h * 0.35, w * 0.6, h * 0.65);
  crystal.addColorStop(0, 'rgba(255,255,255,0.85)');
  crystal.addColorStop(0.5, 'rgba(180,200,220,0.65)');
  crystal.addColorStop(1, 'rgba(140,160,180,0.45)');
  ctx.fillStyle = crystal;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.32);
  ctx.lineTo(w * 0.58, h * 0.62);
  ctx.lineTo(w * 0.42, h * 0.62);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(220,225,235,0.6)';
  ctx.fillRect(w * 0.15, h * 0.48, w * 0.7, h * 0.04);
}

function drawLuxuryFlagshipShell(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#f8f5f0');
  bg.addColorStop(0.6, '#ebe6df');
  bg.addColorStop(1, '#d8d2c8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(w * 0.06, h * 0.58, w * 0.22, h * 0.12);

  const mirror = ctx.createLinearGradient(w * 0.55, h * 0.15, w * 0.92, h * 0.55);
  mirror.addColorStop(0, 'rgba(255,252,248,0.95)');
  mirror.addColorStop(0.5, 'rgba(235,228,218,0.85)');
  mirror.addColorStop(1, 'rgba(210,205,195,0.75)');
  ctx.fillStyle = mirror;
  ctx.fillRect(w * 0.58, h * 0.14, w * 0.34, h * 0.42);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(w * 0.62, h * 0.2, w * 0.24, h * 0.28);

  ctx.fillStyle = 'rgba(245,240,235,0.9)';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(w * (0.12 + i * 0.22), h * 0.62, w * 0.14, h * 0.08);
  }
}

function drawMediaCommandShell(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#0f1419';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#1a222c';
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  ctx.fillStyle = '#141c26';
  ctx.fillRect(w * 0.12, h * 0.18, w * 0.76, h * 0.38);

  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = `rgba(40,80,120,${0.45 + (i % 3) * 0.15})`;
    ctx.fillRect(w * (0.16 + (i % 3) * 0.24), h * (0.22 + Math.floor(i / 3) * 0.16), w * 0.2, h * 0.12);
  }

  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(w * (0.1 + i * 0.18), h * 0.04, w * 0.08, h * 0.025);
  }
}
