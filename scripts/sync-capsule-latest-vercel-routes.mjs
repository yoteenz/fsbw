#!/usr/bin/env node
/**
 * Sync permanent capsule latest URLs to static rewrites + versioned Content-Disposition headers.
 * Avoids serverless functions that over-bundle public/ due to dynamic fs paths (~1GB+ deploy failure).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VERCEL_JSON = path.join(ROOT, 'vercel.json');

const ROUTES = [
  {
    source: '/context/latest',
    destination: '/downloads/context-capsules/latest.zip',
    manifest: 'api/_lib/context-capsule-release.json',
    fallbackArtifact: 'StudioOS_ContextCapsule_v0.3.1.zip',
  },
  {
    source: '/onboarding/latest',
    destination: '/downloads/onboarding-packs/latest.zip',
    manifest: 'api/_lib/onboarding-pack-release.json',
    fallbackArtifact: 'StudioOS_OnboardingPack_v1.1.0.zip',
  },
  {
    source: '/founder-intelligence/latest',
    destination: '/downloads/founder-intelligence-capsules/latest.zip',
    manifest: 'api/_lib/founder-intelligence-capsule-release.json',
    fallbackArtifact: 'Founder_Intelligence_Capsule_v1.0.0.zip',
  },
  {
    source: '/founder/latest',
    destination: '/downloads/founder-intelligence-capsules/latest.zip',
    manifest: 'api/_lib/founder-intelligence-capsule-release.json',
    fallbackArtifact: 'Founder_Intelligence_Capsule_v1.0.0.zip',
  },
  {
    source: '/collaboration-intelligence/latest',
    destination: '/downloads/collaboration-intelligence-capsules/latest.zip',
    manifest: 'api/_lib/collaboration-intelligence-capsule-release.json',
    fallbackArtifact: 'Collaboration_Intelligence_Capsule_v1.0.0.zip',
  },
  {
    source: '/context-updates/latest',
    destination: '/downloads/context-updates/latest.zip',
    manifest: 'api/_lib/delta-context-release.json',
    fallbackArtifact: 'StudioOS_ContextUpdate_v1.0.0.zip',
  },
];

function readManifest(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function safeFilename(name) {
  return name.replace(/[^\w.\-()+]/g, '_');
}

function buildHeaders(source, artifact, version) {
  return {
    source,
    headers: [
      {
        key: 'Content-Disposition',
        value: `attachment; filename="${safeFilename(artifact)}"`,
      },
      { key: 'Cache-Control', value: 'no-cache, must-revalidate' },
      { key: 'Content-Type', value: 'application/zip' },
      { key: 'X-Capsule-Version', value: version ?? 'unknown' },
      { key: 'X-Capsule-Artifact', value: artifact },
    ],
  };
}

function syncVercelRoutes() {
  const vercel = JSON.parse(fs.readFileSync(VERCEL_JSON, 'utf8'));
  vercel.functions = vercel.functions ?? {};

  for (const key of Object.keys(vercel.functions)) {
    if (key.startsWith('api/capsules/')) delete vercel.functions[key];
  }

  const rewrites = vercel.rewrites ?? [];
  const withoutCapsuleLatest = rewrites.filter(
    (r) => !ROUTES.some((route) => route.source === r.source),
  );

  const capsuleRewrites = ROUTES.map(({ source, destination }) => ({ source, destination }));
  vercel.rewrites = [...capsuleRewrites, ...withoutCapsuleLatest];

  const capsuleSources = new Set(ROUTES.map((r) => r.source));
  const staticHeaders = (vercel.headers ?? []).filter((h) => !capsuleSources.has(h.source));

  const capsuleHeaders = ROUTES.map(({ source, manifest, fallbackArtifact }) => {
    const release = readManifest(manifest);
    const artifact = release?.artifact?.trim() || fallbackArtifact;
    const version = release?.currentVersion ?? 'unknown';
    return buildHeaders(source, artifact, version);
  });

  vercel.headers = [...staticHeaders, ...capsuleHeaders];

  fs.writeFileSync(VERCEL_JSON, JSON.stringify(vercel, null, 2) + '\n');

  console.log('\nCapsule latest routes synced to vercel.json (static + versioned filename):');
  for (const route of ROUTES) {
    const release = readManifest(route.manifest);
    const artifact = release?.artifact?.trim() || route.fallbackArtifact;
    console.log(`  ${route.source} → ${route.destination} (${artifact})`);
  }
  console.log('');
}

syncVercelRoutes();
