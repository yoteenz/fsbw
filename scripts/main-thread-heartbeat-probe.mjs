#!/usr/bin/env node
/**
 * Production-accurate main-thread heartbeat probe.
 * Usage: node scripts/main-thread-heartbeat-probe.mjs [url] [--wait-ms=15000]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:4173/';
const waitArg = process.argv.find((a) => a.startsWith('--wait-ms='));
const waitMs = waitArg ? Number(waitArg.split('=')[1]) : 15_000;

async function sample(page, label) {
  return page.evaluate((lbl) => {
    const mtd = window.__MTD?.() ?? null;
    const hbOverlay = document.getElementById('main-thread-heartbeat-overlay');
    const loading = document.querySelector('.loading-screen-root');
    const breaker = document.getElementById('main-thread-loop-prevented');
    return {
      label: lbl,
      path: location.pathname,
      mtd,
      hasHbOverlay: Boolean(hbOverlay),
      hasLoading: Boolean(loading),
      hasBreaker: Boolean(breaker),
      rootTextLen: (document.getElementById('root')?.innerText ?? '').length,
    };
  }, label);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLines = [];
  page.on('console', (msg) => {
    consoleLines.push(`[${msg.type()}] ${msg.text()}`);
  });

  console.log(`Probing ${url} for ${waitMs}ms…`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const samples = [];
  samples.push(await sample(page, 't+0s'));
  await page.waitForTimeout(3000);
  samples.push(await sample(page, 't+3s'));
  await page.waitForTimeout(Math.max(0, waitMs - 3000));
  samples.push(await sample(page, `t+${waitMs / 1000}s`));

  const hb0 = samples[0]?.mtd?.heartbeat ?? 0;
  const hbLast = samples[samples.length - 1]?.mtd?.heartbeat ?? 0;
  const delta = hbLast - hb0;
  const frozen = delta < 3;

  console.log('\n=== Heartbeat samples ===');
  for (const s of samples) {
    const mtd = s.mtd;
    console.log(
      `${s.label} path=${s.path} hb=${mtd?.heartbeat ?? '?'} raf=${mtd?.rafCount ?? '?'} to=${mtd?.timeoutProbe ?? '?'} ckpt=${mtd?.currentCheckpoint ?? '?'} loading=${s.hasLoading} breaker=${s.hasBreaker}`
    );
  }

  console.log(`\nHeartbeat delta over window: ${delta} (${frozen ? 'FROZEN/BLOCKED' : 'alive'})`);
  if (samples.some((s) => s.hasBreaker)) {
    console.log('Circuit breaker overlay detected — see trace in page.');
  }

  const lastTrace = samples[samples.length - 1]?.mtd?.trace?.slice(-15) ?? [];
  if (lastTrace.length) {
    console.log('\nLast trace events:');
    for (const e of lastTrace) {
      console.log(`  ${e.kind} ${e.name}${e.detail ? ` — ${e.detail}` : ''}${e.durationMs != null ? ` (${e.durationMs.toFixed(1)}ms)` : ''}`);
    }
  }

  if (consoleLines.length) {
    console.log('\nConsole (tail):');
    consoleLines.slice(-20).forEach((l) => console.log(l));
  }

  await browser.close();
  process.exit(frozen ? 2 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
