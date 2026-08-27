import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  Clipboard,
  Code2,
  FileJson,
  LockKeyhole,
  Play,
  Sparkles,
  Terminal,
} from 'lucide-react'

import { demoWrapped } from '../data/demo'
import { wrappedUrl } from '../lib/codec'
import { wrappedSchema, type WrappedData } from '../lib/schema'

type HarnessId = 'codex' | 'claude' | 'opencode' | 'copilot' | 'agy' | 'qwen'
type OsId = 'unix' | 'windows'

const harnesses: Array<{ id: HarnessId; name: string; detail: string }> = [
  { id: 'codex', name: 'Codex', detail: 'OpenAI coding agent' },
  { id: 'claude', name: 'Claude Code', detail: 'Anthropic coding agent' },
  { id: 'opencode', name: 'OpenCode', detail: 'Open source coding agent' },
  { id: 'copilot', name: 'Copilot', detail: 'GitHub Copilot CLI' },
  { id: 'agy', name: 'Agy', detail: 'Google Antigravity CLI' },
  { id: 'qwen', name: 'Qwen Code', detail: 'Qwen coding agent' },
]

function HarnessMark({ id }: { id: HarnessId }) {
  if (id === 'codex') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 6 34 12v12l-10 6-10-6V12L24 6Zm10 6 8 5v12l-10 6-8-5m-10-6-8 5 10 6 8-5m0-24v12l10 6" />
      </svg>
    )
  }
  if (id === 'claude') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5v38M5 24h38M10.6 10.6l26.8 26.8M37.4 10.6 10.6 37.4M16.7 6.8l14.6 34.4M41.2 16.7 6.8 31.3M31.3 6.8 16.7 41.2M41.2 31.3 6.8 16.7" />
      </svg>
    )
  }
  if (id === 'opencode') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="m17 12-10 12 10 12M31 12l10 12-10 12M27 8l-6 32" />
      </svg>
    )
  }
  if (id === 'copilot') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M21 17a8 8 0 1 0 0 14v-7h-6M27 16v16M37 16v16M27 24h10" />
      </svg>
    )
  }
  if (id === 'agy') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="m14 38 10-30 10 30M18 27h12" />
        <ellipse cx="24" cy="24" rx="21" ry="9" transform="rotate(-20 24 24)" />
        <circle cx="42" cy="17" r="2.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 141.38 140" aria-hidden="true">
      <path d="m140.93 85-16.35-28.33-1.93-3.34 8.66-15a3.323 3.323 0 0 0 0-3.34l-9.62-16.67c-.3-.51-.72-.93-1.22-1.22s-1.07-.45-1.67-.45H82.23l-8.66-15a3.33 3.33 0 0 0-2.89-1.67H51.43c-.59 0-1.17.16-1.66.45-.5.29-.92.71-1.22 1.22L32.19 29.98l-1.92 3.33H12.96c-.59 0-1.17.16-1.66.45-.5.29-.93.71-1.22 1.22L.45 51.66a3.323 3.323 0 0 0 0 3.34l18.28 31.67-8.66 15a3.32 3.32 0 0 0 0 3.34l9.62 16.67c.3.51.72.93 1.22 1.22s1.07.45 1.67.45h36.56l8.66 15a3.35 3.35 0 0 0 2.89 1.67h19.25a3.34 3.34 0 0 0 2.89-1.67l18.28-31.67h17.32c.6 0 1.17-.16 1.67-.45s.92-.71 1.22-1.22l9.62-16.67a3.323 3.323 0 0 0 0-3.34ZM51.44 3.33 61.07 20l-9.63 16.66h76.98l-9.62 16.66H45.67l-11.54-20zM57.21 120H22.58l9.63-16.67h19.25l-38.5-66.67h19.25l9.62 16.67L68.78 100l-11.55 20Zm61.59-33.34-9.62-16.67-38.49 66.67-9.63-16.67 9.63-16.66 26.94-46.67h23.1l17.32 30z" />
    </svg>
  )
}

const installBase = 'https://shiruba.software/prompt-wrapped'

function detectOs(): OsId {
  return /Win/i.test(navigator.userAgent) ? 'windows' : 'unix'
}

function commandFor(harness: HarnessId, os: OsId): string {
  if (os === 'windows') {
    return `$s=(irm '${installBase}/run.ps1'); & ([scriptblock]::Create($s)) -Harness ${harness}`
  }
  return `curl -fsSL ${installBase}/run.sh | sh -s -- ${harness}`
}

type HomeProps = {
  onOpen: (data: WrappedData) => void
}

export function Home({ onOpen }: HomeProps) {
  const [harness, setHarness] = useState<HarnessId>('codex')
  const [os, setOs] = useState<OsId>(() => detectOs())
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const command = commandFor(harness, os)

  async function copyCommand() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
  }

  function startDemo() {
    const url = wrappedUrl(demoWrapped)
    history.replaceState(null, '', url)
    onOpen(demoWrapped)
  }

  async function loadFile(file?: File) {
    if (!file) return
    try {
      const data = wrappedSchema.parse(JSON.parse(await file.text()))
      history.replaceState(null, '', wrappedUrl(data))
      onOpen(data)
      setError(null)
    } catch {
      setError('That file is not a valid Prompt Wrapped report.')
    }
  }

  return (
    <main className="home">
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="./" aria-label="Prompt Wrapped home">
          <span className="brand__mark">P</span>
          <span>prompt-wrapped</span>
        </a>
        <a className="nav-link" href="https://github.com/shirubasoft/prompt-wrapped">
          <Code2 size={18} aria-hidden="true" />
          Source
        </a>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={15} /> Your year in prompts</p>
          <h1>
            <span>The agents</span>
            <span>kept receipts.</span>
          </h1>
          <p className="hero-lede">
            Turn your local coding-agent history into an animated developer recap, a lovingly specific roast,
            and reusable skills that teach the next agent how you work.
          </p>
          <button className="button button--ghost" type="button" onClick={startDemo}>
            <Play size={17} fill="currentColor" /> Watch the demo
          </button>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-art__orbit">
            {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
          </div>
          <div className="hero-art__number">
            <strong>{demoWrapped.coverage.totalPrompts.toLocaleString()}</strong>
            <span>prompts, one peculiar developer</span>
          </div>
          <div className="hero-art__type">
            <span>PROOF</span><span>PROOF</span><span>PROOF</span><span>PROOF</span>
          </div>
        </div>

        <div className="runner-card" id="make-yours">
          <div className="runner-card__header">
            <span><Terminal size={18} /> Make yours</span>
            <span className="local-pill"><LockKeyhole size={13} /> local analysis</span>
          </div>

          <fieldset className="harness-picker">
            <legend className="field-label">1. Pick your agent</legend>
            <div className="harness-options">
              {harnesses.map((item) => (
                <label className="harness-option" data-harness={item.id} key={item.id} title={item.detail}>
                  <input
                    type="radio"
                    name="harness"
                    value={item.id}
                    checked={harness === item.id}
                    aria-label={`${item.name}, ${item.detail}`}
                    onChange={() => setHarness(item.id)}
                  />
                  <span className="harness-option__face">
                    <span className="harness-option__mark"><HarnessMark id={item.id} /></span>
                    <span className="harness-option__name">{item.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field-row">
            <span className="field-label">2. Run one command</span>
            <div className="os-switch" aria-label="Operating system">
              <button className={os === 'unix' ? 'active' : ''} onClick={() => setOs('unix')} type="button">
                macOS / Linux
              </button>
              <button className={os === 'windows' ? 'active' : ''} onClick={() => setOs('windows')} type="button">
                Windows
              </button>
            </div>
          </div>

          <div className="command-box">
            <code>{command}</code>
            <button type="button" onClick={copyCommand} aria-label="Copy command">
              {copied ? <Check size={18} /> : <Clipboard size={18} />}
            </button>
          </div>
          <p className="runner-note">
            The script asks your installed agent to read local conversation stores in read-only mode. It saves the
            report and new <code>SKILL.md</code> files beside the terminal where you run it.
          </p>

          <div className="runner-divider"><span>or</span></div>
          <button className="json-button" type="button" onClick={() => fileInput.current?.click()}>
            <FileJson size={18} /> Open an existing JSON report <ArrowRight size={17} />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => void loadFile(event.target.files?.[0])}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      </section>

      <section className="proof-strip" aria-label="How privacy works">
        <div>
          <span className="proof-strip__number">01</span>
          <p><strong>Local corpus.</strong> Your selected agent reads its own history and any other eligible local stores.</p>
        </div>
        <div>
          <span className="proof-strip__number">02</span>
          <p><strong>No upload.</strong> The report is compressed into the part of the URL after <code>#</code>.</p>
        </div>
        <div>
          <span className="proof-strip__number">03</span>
          <p><strong>Useful after the confetti.</strong> You get evidence-scoped skills, not a horoscope with gradients.</p>
        </div>
      </section>

      <footer>
        <span>Built in public by Shiruba Software.</span>
        <span>No accounts. No analytics. No prompt upload.</span>
      </footer>
    </main>
  )
}
