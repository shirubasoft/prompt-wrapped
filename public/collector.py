#!/usr/bin/env python3
"""Run a local coding agent against local history and build a Prompt Wrapped URL."""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
import webbrowser
import zlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


PUBLIC_URL = "https://shirubasoft.github.io/prompt-wrapped/"
THEMES = {
    "neon-orbit",
    "terminal-signal",
    "paper-cut",
    "cosmic-lava",
    "blueprint",
    "pixel-arcade",
}
HARNESSES = {"codex", "claude", "gemini", "opencode"}


def string_schema(max_length: int) -> dict[str, Any]:
    return {"type": "string", "minLength": 1, "maxLength": max_length}


REPORT_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "additionalProperties": False,
    "required": [
        "version", "generatedAt", "harness", "theme", "developer", "coverage",
        "scores", "fingerprint", "strengths", "friction", "moments", "skills", "share",
    ],
    "properties": {
        "version": {"const": 1},
        "generatedAt": string_schema(80),
        "harness": string_schema(80),
        "theme": {"type": "string", "enum": sorted(THEMES)},
        "developer": {
            "type": "object",
            "additionalProperties": False,
            "required": ["displayName", "archetype", "title", "tagline", "summary"],
            "properties": {
                "displayName": string_schema(80),
                "archetype": string_schema(100),
                "title": string_schema(120),
                "tagline": string_schema(180),
                "summary": string_schema(700),
            },
        },
        "coverage": {
            "type": "object",
            "additionalProperties": False,
            "required": ["sources", "totalPrompts", "window", "limitations"],
            "properties": {
                "sources": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": ["name", "prompts", "sessions", "status"],
                        "properties": {
                            "name": string_schema(80),
                            "prompts": {"type": ["integer", "null"], "minimum": 0},
                            "sessions": {"type": ["integer", "null"], "minimum": 0},
                            "status": {"type": "string", "enum": ["analyzed", "partial", "unavailable"]},
                        },
                    },
                },
                "totalPrompts": {"type": "integer", "minimum": 0},
                "window": string_schema(160),
                "limitations": {"type": "array", "maxItems": 8, "items": string_schema(240)},
            },
        },
        "scores": {
            "type": "array",
            "minItems": 6,
            "maxItems": 12,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["key", "label", "score", "confidence", "reason"],
                "properties": {
                    "key": string_schema(40),
                    "label": string_schema(60),
                    "score": {"type": "number", "minimum": 1, "maximum": 10},
                    "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
                    "reason": string_schema(280),
                },
            },
        },
        "fingerprint": {
            "type": "object",
            "additionalProperties": False,
            "required": ["shipsLike", "debugsLike", "testsLike", "communicatesLike"],
            "properties": {
                "shipsLike": string_schema(240),
                "debugsLike": string_schema(240),
                "testsLike": string_schema(240),
                "communicatesLike": string_schema(240),
            },
        },
        "strengths": {"type": "array", "minItems": 3, "maxItems": 6, "items": string_schema(180)},
        "friction": {"type": "array", "minItems": 3, "maxItems": 6, "items": string_schema(180)},
        "moments": {
            "type": "array",
            "minItems": 3,
            "maxItems": 6,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["label", "value", "detail"],
                "properties": {
                    "label": string_schema(60),
                    "value": string_schema(80),
                    "detail": string_schema(220),
                },
            },
        },
        "skills": {
            "type": "array",
            "minItems": 1,
            "maxItems": 6,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["name", "description", "trigger", "content"],
                "properties": {
                    "name": {"type": "string", "pattern": "^[a-z0-9-]+$", "maxLength": 63},
                    "description": string_schema(300),
                    "trigger": string_schema(220),
                    "content": {"type": "string", "minLength": 20, "maxLength": 12000},
                },
            },
        },
        "share": {
            "type": "object",
            "additionalProperties": False,
            "required": ["closingLine", "accentWords"],
            "properties": {
                "closingLine": string_schema(180),
                "accentWords": {"type": "array", "minItems": 2, "maxItems": 5, "items": string_schema(32)},
            },
        },
    },
}


ANALYSIS_PROMPT = r"""
You are creating one evidence-based Prompt Wrapped report from this developer's locally available
coding-agent conversations. This is a read-only analysis task. Do not edit repositories, settings,
history stores, skills, or machine state. Do not install anything. Do not access remote accounts.
Your only output is one JSON object matching the supplied schema.

The approach is based on the extract-agent-preferences workflow. Its central rule is simple: turn
interaction history into claims another agent could audit and use. A repository instruction,
temporary recovery step, one project, or one flashy request is not a global personality trait.
Do not count this extraction request, its schema, tool traffic, or delegated prompts as evidence.

PRIVACY AND SOURCE BOUNDARY

1. Inventory relevant local sources before reading message bodies. Report inaccessible sources as
   gaps. Never read authentication values, cookies, keychains, login databases, editor auth rows,
   private third-party details, or unrelated browser data.
2. Keep raw conversations in their original stores. Do not create transcript dumps. If a parser
   truly needs temporary material, use a permission-restricted temporary directory and remove it.
3. Prefer direct human messages and corrections. Exclude assistant summaries, tool results,
   attachments, pasted logs as preference text, generated plans, agent memories, subagent tasks,
   environment envelopes, slash-command noise, and completions. An instruction next to a pasted log
   is evidence; the log is not.
4. One root task is one evidence episode. Follow-ups inside it do not become independent votes.
   Deduplicate copied sessions across tools. Prefer stable session IDs, then verified file hashes,
   then normalized prompt text plus time and project context.
5. Do not copy exact private paths, repository names, endpoints, location, identities, prompt excerpts,
   session IDs, or third-party personal information into the JSON. Source names and aggregate counts
   are enough for the public report.

SOURCE ROUTING

Inspect schemas before trusting a record role because formats change. Common sources include:

- Codex: ~/.codex/sessions/**/rollout-*.jsonl, archived_sessions, and history.jsonl. Separate root
  sessions from subagents. Older event_msg user_message and newer response_item role=user records may
  both exist. Treat CLI history as a deduplicated supplement.
- Claude Code: ~/.claude/history.jsonl and ~/.claude/projects/**/*.jsonl. Separate main human turns
  from sidechains, local commands, task notifications, tool results, and Memory observer traffic.
  ~/.claude-mem/claude-mem.db is a locating index, not independent evidence.
- ChatGPT: use a local conversations.json export when present. Sidebar titles, null mappings, caches,
  metrics, and login state are not message evidence. Do not trigger an export or remote session.
- GitHub Copilot: ~/.copilot/session-store.db, ~/.copilot/session-state/*/events.jsonl, and VS Code
  workspaceStorage chatSessions. Query only conversation tables and deduplicate editor copies.
- Cursor: state.vscdb cursorDiskKV bubble records and ~/.cursor/projects/*/agent-transcripts/*.txt.
  Verify bubble roles locally. Ignore auth keys, code-tracking stores, plans, and browser logs.
- Gemini and Antigravity: CLI history and records explicitly typed USER_INPUT from USER_EXPLICIT.
  Do not invent a protobuf schema or substitute generated brain/task Markdown for human prompts.
- Other agents: use a bounded home-directory search. Establish direct-human provenance, root versus
  subagent topology, duplicates, auth separation, dates, and usable counts before relying on a store.
- User-authored AGENTS.md files, skills, and Git history may corroborate direct prompts. They do not
  outrank corrections and do not become global rules merely because they exist in one repository.

Open SQLite databases read-only. Inspect table names and schemas first. Query only conversation-related
columns. Never dump a whole editor database. Record raw rows, usable direct prompts, unique prompts,
root sessions, date range, exclusions, duplicates, partial sources, and unavailable sources separately.

EVIDENCE AND CONFIDENCE

Rank evidence in this order:

1. A direct correction naming rejected behavior and the desired replacement.
2. An explicit standing preference.
3. Repeated behavior across independent projects or tools.
4. Repeated behavior inside one project.
5. A project-local instruction or commit pattern corroborating direct evidence.
6. Tentative inference.

Use high confidence for two independent episodes when one is explicit, or an explicit standing rule
with independent corroboration. Use medium for one correction, one uncorroborated standing statement,
or repetition inside one context. Use low for sparse, indirect, or unresolved evidence. Silence is not
approval. Lower confidence when counterevidence is not explained by task mode, repository policy, risk,
product type, work size, or lifecycle phase.

Analyze claims, not topic frequency. Each internal claim needs a decision it changes, trigger, scope,
confidence, independent episodes, counterexamples, provenance pointer, and overlap with existing skills.
Keep sensitive personality inference out. Describe observable working behavior, not motives, identity,
competency, job level, mental health, or general character.

RATINGS AND THE WRAPPED STORY

- Select 6 to 10 supported work domains, such as architecture, testing, validation, debugging, APIs and
  developer experience, documentation, delivery, product judgment, pragmatism, communication,
  performance, security, operations, or prioritization. Do not score an unobserved domain. Use one
  decimal place on a strict 1 to 10 scale. Five means competent, seven is strong, nine requires
  sustained exceptional evidence, and ten should be almost unreachable. Do not produce one overall score.
- Every rating needs a concise evidence-based reason and a confidence label. Do not claim unaided code
  authorship, production ownership, human-team influence, business results, or seniority from agent chats.
- Give a funny archetype and quirky ceremonial title. Make the joke precise and affectionate, based on
  repeated observable behavior. It must not pretend to be a real job-level assessment.
- Choose exactly one animation theme. neon-orbit fits systems thinking and cross-cutting ownership;
  terminal-signal fits diagnosis and evidence; paper-cut fits docs and careful editing; cosmic-lava fits
  energetic iteration; blueprint fits architecture and constraint design; pixel-arcade fits playful
  maker energy. Pick the best evidence-based fit, not a random theme.
- Strengths, friction, moments, fingerprint metaphors, tagline, and closing line must be specific enough
  that they could not be pasted unchanged into another developer's report. Humor may exaggerate the
  observable pattern, never the evidence.

GENERATE REUSABLE SKILLS

Create 1 to 6 small skills from the strongest high or medium confidence behavior units. Prefer fewer,
better-scoped skills. Do not create a large personality prompt.

Each skill must:

- own one decision family with a discriminating trigger and a nearby boundary;
- change what a capable agent would decide, check, or deliver;
- retain context-dependent exceptions and avoid project-specific versions or technologies unless the
  trigger is deliberately narrow;
- avoid duplicating installed skills or repository rules when those can be detected;
- use a lowercase hyphenated name under 64 characters;
- return a complete SKILL.md in content, starting with YAML frontmatter containing only name and a
  precise discovery description, then short outcome-focused instructions and verification if owned;
- assume the agent is capable. Remove generic advice, repeated policy, speculative cases, placeholder
  files, installation text, and examples that do not change a decision;
- preserve authorization boundaries. A workflow skill cannot grant itself permission to mutate,
  publish, deploy, commit, push, or contact external systems.

Useful candidate boundaries include proving the real user path, evidence-first diagnosis, honest test
boundaries, regression guardrails, one source of truth, readable composition, native typed APIs,
executable documentation, workflow preservation, critical review of feedback, recoverable operations,
equivalent benchmarks, and visual interaction checks. Treat these only as a coverage checklist. The
person's own evidence decides which skills exist. Do not automatically create all of them.

SUBAGENTS AND CONTEXT MANAGEMENT

If this harness supports subagents and the corpus is broad, partition independent source passes by
platform. Reserve one compact pass for omitted work domains and contradictions. Do not delegate small
corpora. Do not have several agents edit or author the final JSON.

The main agent owns a compact evidence ledger and synthesis. Give each subagent only its source boundary,
counting rules, privacy rules, cutoff, and a fixed return shape: coverage counts, paraphrased claims,
confidence, counterevidence, and short provenance pointers. Subagents must not return raw transcripts.
Reuse an existing subagent for follow-up instead of spawning a new reader for the same source.

Track context from the start. Inventory first, then read only likely evidence. Deduplicate before close
reading. After each source, compact its result into the ledger and stop carrying raw records forward.
If context grows, checkpoint aggregate counts, claim IDs, confidence, contradictions, and remaining
sources, then continue from that checkpoint. Do not reread completed sources after compaction. Synthesize
centrally, reconcile counts, and validate the final JSON once.

UNSLOP SKILL

Apply this writing skill to every visible field and every generated SKILL.md:

- Cut puffery, promotional language, vague attributions, generic conclusions, false ranges, and
  formulaic "despite challenges" prose. Name the actual behavior.
- Replace stock AI vocabulary and fancy substitutes for "is" with plain words. Avoid "not just X but Y,"
  forced groups of three, synonym cycling, and abstract technical metaphors.
- Use active voice. Prefer one idea per sentence. Cut filler, excess hedging, weak adverbs, and jargon.
- Avoid em dashes entirely. Do not replace them with parenthetical clutter. Use sentence breaks.
- Use colons only where a real list or example follows. Do not bold every noun, use title-case headings,
  decorative emoji, curly quotes, chatbot greetings, generic reassurance, or unnecessary sign-offs.
- Say what a mechanism does. A sentence that could describe any project says nothing and should be cut.
- Add human voice through concrete opinion, varied rhythm, precise reactions, and a little controlled mess.
  Then ask: what makes this obviously machine-written? Fix it.

FINAL CHECKS

Reconcile source counts and date window. Keep gaps visible. Check confidence against independent episodes.
Check that every score and joke has evidence, every skill has a clear trigger and boundary, and no skill
duplicates another. Scan the JSON mentally for credentials, private paths, transcript text, third-party
data, and real private project names. Return only the JSON object. No Markdown fence and no commentary.
"""


class CollectorError(RuntimeError):
    pass


def run_command(command: list[str], prompt: str | None = None, env: dict[str, str] | None = None) -> str:
    executable = command[0]
    if shutil.which(executable) is None:
        raise CollectorError(f"{executable!r} is not installed or is not on PATH.")
    print(f"\nRunning {executable} in read-only analysis mode. This can take a while...", file=sys.stderr)
    try:
        result = subprocess.run(
            command,
            input=prompt,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            check=False,
        )
    except OSError as error:
        raise CollectorError(f"Could not start {executable}: {error}") from error
    if result.returncode != 0:
        detail = result.stderr.strip()[-3000:] or result.stdout.strip()[-3000:]
        raise CollectorError(f"{executable} exited with code {result.returncode}.\n{detail}")
    return result.stdout


def prompt_for(harness: str) -> str:
    current = datetime.now(timezone.utc).isoformat()
    return textwrap.dedent(
        f"""\
        Analysis cutoff: {current}
        Harness producing this report: {harness}

        {ANALYSIS_PROMPT}
        """
    )


def run_harness(harness: str, prompt: str) -> str:
    with tempfile.TemporaryDirectory(prefix="prompt-wrapped-") as directory:
        task_dir = Path(directory)
        schema_path = task_dir / "schema.json"
        schema_path.write_text(json.dumps(REPORT_SCHEMA), encoding="utf-8")

        if harness == "codex":
            result_path = task_dir / "result.json"
            run_command(
                [
                    "codex", "exec", "--sandbox", "read-only", "--ephemeral",
                    "--skip-git-repo-check", "--output-schema", str(schema_path),
                    "--output-last-message", str(result_path), "-",
                ],
                prompt,
            )
            if not result_path.exists():
                raise CollectorError("Codex completed without writing its final report.")
            return result_path.read_text(encoding="utf-8")

        if harness == "claude":
            raw = run_command(
                [
                    "claude", "--print", "--permission-mode", "plan", "--no-session-persistence",
                    "--output-format", "json", "--json-schema", json.dumps(REPORT_SCHEMA, separators=(",", ":")),
                    prompt,
                ]
            )
            return raw

        if harness == "gemini":
            return run_command(["gemini", "--output-format", "json", "--prompt", prompt])

        if harness == "opencode":
            safe_env = os.environ.copy()
            safe_env["OPENCODE_PERMISSION"] = json.dumps(
                {
                    "*": "allow",
                    "edit": "deny",
                    "write": "deny",
                    "patch": "deny",
                    "bash": "deny",
                    "external_directory": "allow",
                }
            )
            return run_command(
                ["opencode", "run", "--format", "json", "--agent", "plan", prompt],
                env=safe_env,
            )

    raise CollectorError(f"Unsupported harness: {harness}")


def nested_values(value: Any) -> Iterable[Any]:
    yield value
    if isinstance(value, dict):
        priority = ["structured_output", "response", "result", "output_text", "text", "content"]
        for key in priority:
            if key in value:
                yield from nested_values(value[key])
        for key, child in value.items():
            if key not in priority:
                yield from nested_values(child)
    elif isinstance(value, list):
        for child in reversed(value):
            yield from nested_values(child)


def json_candidates(text: str) -> Iterable[Any]:
    stripped = text.strip()
    try:
        parsed = json.loads(stripped)
        yield from nested_values(parsed)
    except json.JSONDecodeError:
        pass

    lines = [line for line in stripped.splitlines() if line.strip()]
    if len(lines) > 1:
        event_text: list[str] = []
        for line in lines:
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            for value in nested_values(event):
                if isinstance(value, dict) and value.get("version") == 1:
                    yield value
                elif isinstance(value, str) and len(value) > 20:
                    event_text.append(value)
        if event_text:
            yield from json_candidates("".join(event_text))

    for fenced in re.findall(r"```(?:json)?\s*([\s\S]*?)```", stripped, flags=re.IGNORECASE):
        try:
            yield json.loads(fenced)
        except json.JSONDecodeError:
            continue

    decoder = json.JSONDecoder()
    for match in re.finditer(r"\{", stripped):
        try:
            candidate, _ = decoder.raw_decode(stripped[match.start():])
        except json.JSONDecodeError:
            continue
        yield candidate


def require_string(value: Any, path: str, maximum: int) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise CollectorError(f"Invalid or missing {path}.")
    return value


def validate_report(report: Any) -> dict[str, Any]:
    if not isinstance(report, dict) or report.get("version") != 1:
        raise CollectorError("The model did not return a Prompt Wrapped v1 object.")
    if report.get("theme") not in THEMES:
        raise CollectorError("The report chose an unknown animation theme.")
    require_string(report.get("generatedAt"), "generatedAt", 80)
    require_string(report.get("harness"), "harness", 80)

    developer = report.get("developer")
    if not isinstance(developer, dict):
        raise CollectorError("The report is missing developer details.")
    for key, maximum in {"displayName": 80, "archetype": 100, "title": 120, "tagline": 180, "summary": 700}.items():
        require_string(developer.get(key), f"developer.{key}", maximum)

    coverage = report.get("coverage")
    if not isinstance(coverage, dict) or not isinstance(coverage.get("sources"), list):
        raise CollectorError("The report is missing source coverage.")
    total_prompts = coverage.get("totalPrompts")
    if not isinstance(total_prompts, int) or total_prompts < 0:
        raise CollectorError("coverage.totalPrompts must be a non-negative integer.")

    scores = report.get("scores")
    if not isinstance(scores, list) or not 6 <= len(scores) <= 12:
        raise CollectorError("The report needs 6 to 12 supported domain scores.")
    for index, score in enumerate(scores):
        if not isinstance(score, dict) or not isinstance(score.get("score"), (int, float)):
            raise CollectorError(f"scores[{index}] is invalid.")
        if not 1 <= score["score"] <= 10 or score.get("confidence") not in {"high", "medium", "low"}:
            raise CollectorError(f"scores[{index}] has an invalid value or confidence.")

    fingerprint = report.get("fingerprint")
    if not isinstance(fingerprint, dict):
        raise CollectorError("The report is missing its working fingerprint.")
    for key in ("shipsLike", "debugsLike", "testsLike", "communicatesLike"):
        require_string(fingerprint.get(key), f"fingerprint.{key}", 240)

    for key, minimum, maximum in (("strengths", 3, 6), ("friction", 3, 6), ("moments", 3, 6)):
        value = report.get(key)
        if not isinstance(value, list) or not minimum <= len(value) <= maximum:
            raise CollectorError(f"{key} must contain {minimum} to {maximum} items.")

    skills = report.get("skills")
    if not isinstance(skills, list) or not 1 <= len(skills) <= 6:
        raise CollectorError("The report needs 1 to 6 reusable skills.")
    for index, skill in enumerate(skills):
        if not isinstance(skill, dict) or not re.fullmatch(r"[a-z0-9-]{1,63}", str(skill.get("name", ""))):
            raise CollectorError(f"skills[{index}] has an invalid name.")
        content = require_string(skill.get("content"), f"skills[{index}].content", 12000)
        if not content.lstrip().startswith("---"):
            raise CollectorError(f"skills[{index}] does not contain a complete SKILL.md.")
        require_string(skill.get("description"), f"skills[{index}].description", 300)
        require_string(skill.get("trigger"), f"skills[{index}].trigger", 220)

    share = report.get("share")
    if not isinstance(share, dict) or not isinstance(share.get("accentWords"), list):
        raise CollectorError("The report is missing share copy.")
    require_string(share.get("closingLine"), "share.closingLine", 180)
    return report


def parse_report(raw: str) -> dict[str, Any]:
    errors: list[str] = []
    for candidate in json_candidates(raw):
        if isinstance(candidate, str):
            try:
                yield_candidate = json.loads(candidate)
            except json.JSONDecodeError:
                continue
            candidate = yield_candidate
        try:
            return validate_report(candidate)
        except CollectorError as error:
            errors.append(str(error))
    detail = errors[-1] if errors else "No JSON object was found in the harness output."
    raise CollectorError(f"Could not parse a valid report. {detail}")


def encode_report(report: dict[str, Any]) -> str:
    raw = json.dumps(report, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    compressed = zlib.compress(raw, level=9)
    return base64.urlsafe_b64encode(compressed).decode("ascii").rstrip("=")


def unique_output_directory(requested: str | None) -> Path:
    if requested:
        output = Path(requested).expanduser().resolve()
        output.mkdir(parents=True, exist_ok=True)
        return output
    base = Path.cwd() / f"prompt-wrapped-{datetime.now().date().isoformat()}"
    output = base
    suffix = 2
    while output.exists():
        output = Path(f"{base}-{suffix}")
        suffix += 1
    output.mkdir(mode=0o700)
    return output


def write_outputs(report: dict[str, Any], output: Path) -> None:
    (output / "prompt-wrapped.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    skill_root = output / "skills"
    skill_root.mkdir(mode=0o700)
    for skill in report["skills"]:
        directory = skill_root / skill["name"]
        directory.mkdir(mode=0o700)
        (directory / "SKILL.md").write_text(skill["content"].rstrip() + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a private, local Prompt Wrapped report.")
    parser.add_argument("--harness", choices=sorted(HARNESSES), default="codex")
    parser.add_argument("--input", help="Use an existing report JSON instead of running a harness.")
    parser.add_argument("--output-dir", help="Directory for the report and generated skills.")
    parser.add_argument("--base-url", default=os.getenv("PROMPT_WRAPPED_URL", PUBLIC_URL))
    parser.add_argument("--no-open", action="store_true", help="Print the URL without opening a browser.")
    parser.add_argument("--prompt-only", action="store_true", help="Print the analysis prompt and exit.")
    args = parser.parse_args()

    if args.prompt_only:
        print(prompt_for(args.harness))
        return 0

    try:
        if args.input:
            report = validate_report(json.loads(Path(args.input).read_text(encoding="utf-8")))
        else:
            raw = run_harness(args.harness, prompt_for(args.harness))
            report = parse_report(raw)

        output = unique_output_directory(args.output_dir)
        write_outputs(report, output)
        base_url = args.base_url.rstrip("/") + "/"
        url = f"{base_url}#data={encode_report(report)}"

        print("\nPrompt Wrapped is ready.")
        print(f"Report: {output / 'prompt-wrapped.json'}")
        print(f"Skills: {output / 'skills'}")
        print(f"\n{url}\n")
        print("The JSON is in the URL fragment after #. Browsers do not send it to GitHub Pages.")
        if len(url) > 60_000:
            print("Warning: this link is unusually long. Keep the JSON file as the reliable copy.", file=sys.stderr)
        if not args.no_open:
            webbrowser.open(url)
        return 0
    except (CollectorError, OSError, json.JSONDecodeError) as error:
        print(f"Prompt Wrapped stopped: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
