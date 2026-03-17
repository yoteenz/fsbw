# Agent context (Build-a-Wig)

**At the start of every new chat:** Read `motherboard/README.md`, `motherboard/CORE.md`, `motherboard/CODEBASE.md`, and `motherboard/MEMORY.md` in order before answering or implementing. Do not skip this; use them as project context.

## "Add to motherboard" / "Load motherboard" / "Snapshot codebase to motherboard"

**If the user says any of these and you are unsure what they mean:** The **motherboard** exists in this repo. It is a **folder** (not a single file) at:

**`motherboard/`** (project root)

Do **not** say "there is no file or reference named motherboard" or ask the user to specify what to add or where the motherboard is. Do the following:

1. **Open and read** `motherboard/README.md` (in this repo).
2. For **"add to motherboard"**: also read `motherboard/ADDING.md`, then append one new entry to `motherboard/MEMORY.md` following the format and rules there; optionally add to `motherboard/CORE.md` only for new permanent design/stack facts. Do not create a new file named `MOTHERBOARD.md` at project root.
3. For **"load motherboard"**: read `motherboard/README.md`, `motherboard/CORE.md`, `motherboard/CODEBASE.md`, `motherboard/MEMORY.md` and use them as context.
4. For **"Snapshot codebase to motherboard"**: explore the repo and overwrite `motherboard/CODEBASE.md` with a structured summary of the current codebase (see `motherboard/README.md`).

The folder contains: `README.md`, `CORE.md`, `MEMORY.md`, `ADDING.md`, `CODEBASE.md`. Use only these existing files; do **not** create `MOTHERBOARD.md` or `Motherboard.md` at project root.

For full command details and protocol, see **`motherboard/README.md`**.
