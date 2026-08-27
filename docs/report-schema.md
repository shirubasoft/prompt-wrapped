# Report contract

Version 1 reports follow [`prompt-wrapped.schema.json`](../public/prompt-wrapped.schema.json). The browser validates the decoded object again with Zod.

## Sections

- `developer` holds display copy, the archetype, ceremonial title, and evidence-based summary.
- `coverage` lists each source, usable counts, analysis window, and material gaps.
- `scores` contains 6 to 12 supported work domains on a strict 1 to 10 scale. There is no overall score.
- `fingerprint`, `strengths`, `friction`, and `moments` drive the story scenes.
- `skills` contains complete `SKILL.md` content and the short metadata shown in the recap.
- `theme` chooses one of the six animation systems.
- `share` supplies poster copy without exposing transcript evidence.

## URL encoding

The collector serializes compact UTF-8 JSON, compresses it with zlib level 9, encodes it as base64url without padding, and writes it after `#data=`. The browser performs the inverse operation with Pako.

The decoder rejects fragments above 120,000 characters before decompression. This is a browser safety limit, not a promise that every messenger accepts a URL that large. The local JSON remains the reliable artifact.

## Compatibility

Breaking schema changes require a new integer `version`. The site may keep a version-specific decoder when real reports require it. Do not add optional aliases or parallel field names in anticipation of an unknown second format.
