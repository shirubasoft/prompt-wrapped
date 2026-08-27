# Collector design

The collector borrows the evidence model and source routing from the local `extract-agent-preferences` skill and its knowledge base. It does not copy that user's findings into other reports. It carries over the method.

## Evidence rules

Corrections outrank standing preferences, which outrank repeated behavior across independent projects or tools. Repetition inside one project is weaker. Repository instructions and commit history only corroborate direct prompts. Silence, assistant summaries, generated memories, and subagent tasks do not count.

One root task is one evidence episode. Follow-ups in that task do not become extra votes. The harness must preserve counterexamples and explain conflicts through task mode, repository policy, risk, product type, work size, or lifecycle phase. It lowers confidence when context does not resolve a conflict.

The report uses three confidence levels:

- High needs independent support and at least one explicit signal, or a standing rule with corroboration.
- Medium fits one correction, one standing statement, or repeated behavior in one context.
- Low marks sparse or unresolved evidence. Low-confidence observations should rarely become skills.

## Source routing

The prompt covers Codex, Claude Code, ChatGPT exports, GitHub Copilot, Cursor, Gemini and Antigravity, and bounded discovery of other stores. It tells the harness to inspect live schemas before trusting roles. It also separates root sessions, sidechains, tool traffic, generated plans, editor copies, and authentication state.

SQLite stores open read-only. Aggregate counts distinguish raw records, usable direct prompts, exact-unique prompts, sessions, exclusions, date windows, duplicates, partial sources, and inaccessible sources.

## Context management

Broad corpora may use one subagent per independent platform. Each subagent receives a fixed source boundary and returns only counts, paraphrased claims, confidence, counterevidence, and short provenance pointers. The main agent owns a compact evidence ledger and the final JSON.

After each source, the main agent compacts results into the ledger and drops raw records from active context. It reuses an existing subagent for follow-up and does not reread completed sources after compaction. This prevents internal delegation text from becoming evidence and keeps large histories within context limits.

## Harness adapters

- Codex uses `codex exec` with the read-only sandbox, ephemeral sessions, and the JSON schema.
- Claude Code uses print mode, plan permissions, no session persistence, and structured output.
- Gemini CLI uses headless JSON output.
- OpenCode uses its plan agent, JSON events, external-directory reads, and denied write, patch, edit, and shell tools.

The collector parses plain JSON, structured wrappers, JSONL events, and fenced fallback output. It validates the report again before writing files.

## Skill generation

Each generated skill owns one decision family. It needs a precise trigger, nearby boundary, and complete `SKILL.md`. The prompt checks overlap with installed skills, avoids project-specific generalization, preserves authorization boundaries, and applies the Unslop writing rules before output.

Generated files are not installed automatically. This makes the machine change reviewable and recoverable.
