# Wisdom Capture™ V1.0 (Milestone 101)

**Route:** `/admin/studio/wisdom-capture`

## Purpose

**Wisdom Capture™** continuously preserves the small lessons, observations, decisions, and discoveries made throughout the life of an organization **before they are forgotten**.

> Processes explain what happened. **Wisdom explains why.**

Organizations gain thousands of valuable insights every year. Most disappear because nobody records them. Studio OS preserves them automatically.

## Wisdom detection

Whenever founders or employees communicate statements such as:

- "I learned…"
- "Next time…"
- "We should always…"
- "We'll never do that again."
- "I finally figured out…"
- "This works much better."
- "I wish I knew this sooner."

Studio OS recognizes potential organizational wisdom and gently asks:

**Would you like to preserve this as Organizational Wisdom?**

API: `detectWisdomInText()` · `queueWisdomDetection()` · `preserveWisdomEntry()`

## Wisdom Library

Permanent, searchable library organized by:

Department · Profession Brain™ · Projects · Customers · Industry · Lessons Learned · Leadership · Operations · Marketing · Customer Experience · Growth

Every lesson remains searchable forever.

API: `searchOrganizationWisdom()` · `groupWisdomByCategory()`

## Organizational learning

Every preserved lesson improves:

- Profession Brain™
- Digital Concierges
- Studio Institute™
- Automation
- Executive Council
- Future recommendations

Synced to **Memory Engine™** as lesson records.

API: `syncWisdomToMemoryEngine()` · `computeLearningImpacts()`

## Command Dock

- Wisdom phrases trigger non-interrupting capture prompts
- Say **"preserve wisdom"** to save pending detections
- Proactive suggestions when wisdom depth is low or detections pending

API: `resolveWisdomCaptureAdvice()` · `buildProactiveWisdomSuggestion()`

## Brand voice

*"Capture why. Not just what."*

Strengthens the Studio OS promise: **PRESERVE EXPERTISE. BUILD LEGACY.**

## Core module

`src/studio-os-core/wisdom-capture/`
