# Prompt Wrapped

Your coding agents kept receipts.

Prompt Wrapped turns local coding-assistant conversations into an animated developer recap and a small bundle of reusable working-style skills. The analysis runs through an agent already installed on the developer's machine. The static site decodes the report from the URL fragment and never receives the JSON.

[Open the live site](https://shirubasoft.github.io/prompt-wrapped/) or run it locally:

```sh
npm install
npm run dev
```

## What ships

- One-line runners for macOS, Linux, and Windows.
- Read-only adapters for Codex, Claude Code, Gemini CLI, and OpenCode.
- A provenance-aware analysis prompt based on [`extract-agent-preferences`](docs/collector.md).
- Six animated themes selected by the model and switchable by the viewer.
- A domain scorecard, quirky title, evidence limits, and local PNG poster export.
- Complete `SKILL.md` files that capture the developer's strongest working preferences.
- Compressed, schema-validated reports carried after `#data=` in the URL.

## Privacy model

The collector reads local stores through the chosen agent. It writes the final JSON and skills to a new local directory. It does not upload transcripts to this site. The report lives in the URL fragment, which browsers do not include in HTTP requests.

Anyone who receives a copied Wrapped link can decode its report. The UI calls it a private link to distinguish it from a server upload, not to claim encryption. Share the generated poster when the full report should stay private.

Read [privacy and threat boundaries](docs/privacy.md) before adapting the collector for another service.

## Checks

```sh
npm run lint
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
npm run build
python3 public/collector.py --prompt-only --harness codex >/dev/null
```

The Pages workflow runs the first three checks before every deployment.

## Project map

- [`public/collector.py`](public/collector.py) contains the local prompt, harness adapters, validation, skill writer, and URL encoder.
- [`public/prompt-wrapped.schema.json`](public/prompt-wrapped.schema.json) is the public report contract.
- [`src/components/Story.tsx`](src/components/Story.tsx) renders the nine-scene recap.
- [`src/styles/themes.css`](src/styles/themes.css) contains the six animation systems.
- [`docs/collector.md`](docs/collector.md) explains evidence rules and harness behavior.
- [`docs/report-schema.md`](docs/report-schema.md) documents the payload and compatibility policy.

MIT licensed.
