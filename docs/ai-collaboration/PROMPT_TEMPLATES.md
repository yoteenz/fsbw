# Prompt Templates™ — Reusable Structures

**Version:** 1.0.0  
**Usage:** Copy template → fill sections → wrap in **one code block** → label **Composer** or **Terra**

---

## 1. Composer sprint (standard)

```
# COMPOSER SPRINT — [TITLE]
## [Subtitle / system area]

CURRENT PRODUCTION BEHAVIOR

• [Observed fact 1]
• [Observed fact 2]

Do not [explicit forbidden action 1].
Do not [explicit forbidden action 2].

====================================================

MISSION

[One sentence outcome]

====================================================

[Numbered requirements with pass criteria]

PASS CRITERIA

• [Testable criterion 1]
• [Testable criterion 2]

Return:

• [Required output item 1]
• [Required output item 2]
```

---

## 2. Composer P0 hotfix

```
# COMPOSER — P0 HOTFIX: [TITLE]

CURRENT PRODUCTION BEHAVIOR

• [User-visible failure]

Do not perform another broad architecture audit.
Do not [scope creep item].

====================================================

MISSION

[Single forensic or fix outcome]

====================================================

PASS CRITERIA

• [Must prove root cause OR restore behavior]
• One commit + one push
• MEMORY.md updated

Do not resume [deferred work] until this passes.
```

---

## 3. Terra governance review

```
# TERRA — GOVERNANCE REVIEW: [TITLE]

SCOPE

Page/system: [name]
Requested change: [summary]

CANON REFERENCES

• [Bible / CORE section 1]
• [Bible / CORE section 2]

QUESTIONS

1. Does this violate Genesis constitution?
2. Does this create an orphan feature (no Studio World address)?
3. State ownership — who writes persisted state?
4. Mobile-first verification path?

OUTPUT

• Approve / revise / split
• Required changes before Composer sprint
• Risks
```

---

## 4. Architecture review (ChatGPT → founder)

```
# ARCHITECTURE REVIEW — [TITLE]

CONTEXT

[2–3 sentences]

PROPOSAL

[Structure, owners, routes]

TOUCHES

• [System 1]
• [System 2]

UNTOUCHED

• [Explicit non-goals]

CANON ALIGNMENT

| Canon doc | Aligns? | Notes |
|-----------|---------|-------|

RISKS

• [Risk 1]

RECOMMENDATION

[Single path or phased plan]

NEXT STEP

[Founder decision needed → Composer prompt if approved]
```

---

## 5. Bug investigation (forensic)

```
# FORENSIC PASS — [SYSTEM]

SYMPTOM

[What user sees]

REPRO

URL:
[one url per block in actual prompt — here placeholder]

Device: [iOS Safari normal tab]

DO NOT

• Auto-retry masking failure
• Blanket cache clear as permanent fix

REQUIRED TRACE

[Transition list: ENTERED / FAILED / NEVER ENTERED]

REQUIRED OUTPUT

• Exact file, function, line
• Failed transition
• Expected vs actual input/output
• Smallest repair recommendation (may defer implementation)
```

---

## 6. Creative direction (ChatGPT)

```
# CREATIVE DIRECTION — [BRAND / CAMPAIGN / SCENE]

BRIEF

[Founder intent in 2–4 sentences]

CANON

• Design DNA: [path or summary]
• Company genome: [relevant traits]

CONSTRAINTS

• Mobile-first
• [Brand red / typography rules]

DELIVER

1. Narrative concept (2 options max)
2. Spatial staging in Studio World terms
3. Scene Stack layer implications
4. What Composer would need for preview (if any)

NOT IN SCOPE

• Implementation
```

---

## 7. Design critique

```
# DESIGN CRITIQUE — [PAGE / COMPONENT]

REFERENCE

• [Canon page or screenshot description]

CURRENT

• [What exists]

CRITERIA

• Executive IA / graphics-first
• Admin alignment protocol (if admin)
• Mobile layout

OUTPUT

• What works (preserve)
• Surgical changes only (if any)
• Do-not-change list
```

---

## 8. Visual generation (prompt to external tool)

```
# VISUAL GENERATION — [ASSET NAME]

PURPOSE

[Where it mounts in Scene Stack / UI]

PROMPT

[Generation prompt text]

TECHNICAL

• Aspect ratio:
• Model path (FAL / GPT Image):
• Reference URLs (if any):

GOVERNANCE

• Output class: exploratory_draft | material
• ProductionAuthorization: required if material
```

---

## 9. Debugging (diagnostic routes)

```
# DEBUG — [ISSUE]

Verify on normal tab (not private):

/__studio-os-recovery

Then:

/__studio-os-flight-recorder

Paste:

• Copy Boot Timeline
• Copy Storage Inventory
• Build mismatch yes/no

If Experience Lab compile:

?compilerDiag=1

Pass: [expected panel / error code]
```

---

## 10. Roadmap planning

```
# ROADMAP — [QUARTER / PHASE]

CURRENT BLOCKERS

• [From CURRENT_HANDOFF.md]

GOAL

[Phase outcome in Studio World terms]

DEPENDENCIES

• [Blocker / sprint / canon doc]

SEQUENCE

1. [Step — owner]
2. [Step — owner]

OUT OF SCOPE

• [Deferred items]

VERIFICATION

• [How we know phase complete]
```

---

## 11. New ChatGPT session bootstrap

Founder pastes to new ChatGPT:

```
Load the AI Collaboration package from docs/ai-collaboration/

Follow NEW_CHAT_CHECKLIST.md

Then help me with: [task]
```

---

## 12. Export AI Context Capsule (founder command)

```
Export AI Context Capsule
```

See `EXPORT_SPECIFICATION.md` for generation details (future automation).

---

*End of Prompt Templates™ v1.0.0*
