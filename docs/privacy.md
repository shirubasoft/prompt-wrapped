# Privacy and threat boundaries

Prompt Wrapped has no application server, account system, analytics script, or report database. GitHub Pages serves static files.

## What stays local

The selected harness reads conversation stores available on the machine. The collector instructs it to exclude credentials, cookies, login databases, unrelated browser state, full transcripts, private project names, exact paths, third-party details, and raw prompt excerpts. The harness returns aggregate coverage, paraphrased findings, scores, and skill text.

The collector writes two local artifacts:

```text
prompt-wrapped-YYYY-MM-DD/
|-- prompt-wrapped.json
`-- skills/
    `-- <skill-name>/SKILL.md
```

The script does not install generated skills. Review them, then copy the ones you want into the skill directory used by your agent.

## What the URL protects

The JSON is zlib-compressed and base64url-encoded after `#data=`. A browser fragment is not part of the HTTP request, so GitHub Pages, a reverse proxy, and ordinary access logs do not receive it.

Compression is not encryption. Browser extensions, screenshots, copied links, clipboard managers, local browser history, and anyone who receives the URL may see or decode the report. Use the poster export for public sharing. It contains the title and top scores, not the full report or skill bodies.

## Model-provider boundary

"Fully local" describes collection, file generation, and site rendering. The chosen coding harness may call its configured model provider. Its normal provider data policy still applies. Prompt Wrapped does not add a second model API or receive a copy of the request.

Use a locally hosted model through a compatible harness when conversation text must not leave the machine at all.

## Script trust

The one-liner downloads a script from the deployed site and executes it. Review [`run.sh`](../public/run.sh), [`run.ps1`](../public/run.ps1), and [`collector.py`](../public/collector.py) first when that trust model does not fit. Pin a commit from `raw.githubusercontent.com` for reproducible internal use.
