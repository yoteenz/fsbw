/**
 * Delta Context Capsule export constants.
 * Keep in sync with api/_lib/deltaContextConstants.ts
 */

export const DELTA_CONTEXT_CAPSULE_VERSION = '1.0.0';

export const DELTA_CONTEXT_DOWNLOAD_BASE = '/downloads/context-updates';

export const DELTA_CONTEXT_PERMANENT_LATEST_PATH = '/context-updates/latest';

export const DELTA_CONTEXT_PUBLIC_HUB_PATH = '/context-updates';

export const DELTA_CONTEXT_PUBLIC_RELEASE_PATH = '/context-updates/release.json';

export const DELTA_CONTEXT_UPDATE_PROMPT = `I uploaded the Studio OS Delta Context Capsule (incremental context update).

Download: https://fsbw.vercel.app/context-updates/latest

You have already completed the Unified Onboarding Pack. Read ONLY this Delta Capsule and merge updates into your existing understanding.

1. Read README_FIRST.md, then UPDATE_SUMMARY.md, then every specialized update file
2. Read files under changes/ for full modified content
3. Merge — do NOT replace prior onboarding knowledge
4. Update Founder preferences, Collaboration Memory, Canon, and Current Handoff in your working model
5. Acknowledge synchronization with a brief delta report
6. Stop — wait for my instructions before implementation or sprints`;

export function versionedDeltaContextZipFileName(version: string): string {
  return `StudioOS_ContextUpdate_v${version}.zip`;
}
