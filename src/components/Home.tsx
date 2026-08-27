import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
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

type HarnessId = 'codex' | 'claude' | 'gemini' | 'opencode'
type OsId = 'unix' | 'windows'

const harnesses: Array<{ id: HarnessId; name: string; detail: string }> = [
  { id: 'codex', name: 'Codex', detail: 'OpenAI coding agent' },
  { id: 'claude', name: 'Claude Code', detail: 'Anthropic CLI' },
  { id: 'gemini', name: 'Gemini CLI', detail: 'Google agent' },
  { id: 'opencode', name: 'OpenCode', detail: 'Open source harness' },
]

const installBase = 'https://shirubasoft.github.io/prompt-wrapped'

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
            The agents kept
            <span>receipts.</span>
          </h1>
          <p className="hero-lede">
            Turn your local coding-agent history into an animated developer recap, a lovingly specific roast,
            and reusable skills that teach the next agent how you work.
          </p>
          <button className="button button--ghost" type="button" onClick={startDemo}>
            <Play size={17} fill="currentColor" /> Watch the demo
          </button>
        </div>

        <div className="runner-card" id="make-yours">
          <div className="runner-card__header">
            <span><Terminal size={18} /> Make yours</span>
            <span className="local-pill"><LockKeyhole size={13} /> local analysis</span>
          </div>

          <label className="field-label" htmlFor="harness">1. Pick your agent</label>
          <div className="select-shell">
            <select id="harness" value={harness} onChange={(event) => setHarness(event.target.value as HarnessId)}>
              {harnesses.map((item) => (
                <option key={item.id} value={item.id}>{item.name} · {item.detail}</option>
              ))}
            </select>
            <ChevronDown size={18} aria-hidden="true" />
          </div>

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
