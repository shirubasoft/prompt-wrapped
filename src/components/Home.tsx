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
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path
          fill="#111"
          d="M25.9489 10.854C26.5806 8.48721 25.968 5.85728 24.1111 4.0005C22.2544 2.14371 19.6244 1.53106 17.2576 2.16271C15.5236.432283 12.9397-.352139 10.4032.32755 7.86677 1.00724 6.02142 2.97849 5.38482 5.34396 3.01935 5.9804 1.0481 7.82591.368566 10.3624-.311124 12.8988.473299 15.4826 2.20372 17.2166 1.57208 19.5834 2.18473 22.2134 4.04152 24.0701 5.89829 25.927 8.52823 26.5396 10.8951 25.9079 12.6291 27.6384 15.213 28.4228 17.7493 27.7431 20.2857 27.0634 22.1311 25.0921 22.7677 22.7267 25.1333 22.0903 27.1046 20.2447 27.7841 17.7083 28.4638 15.1718 27.6794 12.5881 25.9489 10.854ZM16.3108 4.19745C18.4392 2.96691 21.208 3.2621 23.029 5.08306 24.3143 6.36844 24.8391 8.12667 24.6041 9.79791L18.6092 6.33677C18.3724 6.20006 18.0806 6.20006 17.8438 6.33677L10.8241 10.3897V7.66464C10.8241 7.48081 10.9226 7.30904 11.0817 7.21712L16.3107 4.1976 16.3108 4.19745ZM14.0764 10.2797 17.3288 12.1575V15.9131L14.0764 17.7909 10.8239 15.9131V12.1575L14.0764 10.2797ZM6.67376 7.18129C6.67221 4.72282 8.31227 2.47243 10.7998 1.80602 12.5555 1.3355 14.3406 1.76015 15.6705 2.7993L9.67567 6.26046C9.43886 6.39717 9.29303 6.64989 9.29303 6.92332V15.0291L6.93297 13.6665C6.77386 13.5745 6.67422 13.4032 6.67422 13.2196L6.67376 7.18144V7.18129ZM1.84704 10.7583C2.31757 9.00254 3.57778 7.66881 5.14261 7.0367V13.9588C5.14261 14.2323 5.28843 14.485 5.52524 14.6217L12.545 18.6747 10.1849 20.0373C10.0259 20.1292 9.82765 20.1298 9.66856 20.0379L4.43913 17.0193C2.30923 15.7914 1.18049 13.2458 1.84689 10.7585L1.84704 10.7583ZM11.8419 23.8732C9.71352 25.1038 6.94471 24.8085 5.12376 22.9876 3.83838 21.7022 3.31362 19.944 3.54858 18.2727L9.54344 21.7339C9.7802 21.8706 10.0721 21.8706 10.3089 21.7339L17.3286 17.6809V20.406C17.3286 20.5899 17.2301 20.7617 17.071 20.8535L11.842 23.8731 11.8419 23.8732ZM21.479 20.8894C21.4805 23.3479 19.8404 25.5983 17.3529 26.2646 15.5971 26.7352 13.812 26.3105 12.4822 25.2713L18.477 21.8102C18.7139 21.6735 18.8597 21.4207 18.8597 21.1473V13.0416L21.2198 14.4042C21.3788 14.4961 21.4785 14.6675 21.4785 14.8511L21.479 20.8892V20.8894ZM26.3055 17.3123C25.835 19.0681 24.5748 20.4018 23.0099 21.034V14.1118C23.0099 13.8384 22.8641 13.5857 22.6273 13.4489L15.6075 9.39599 17.9676 8.03337C18.1266 7.94146 18.3249 7.94083 18.484 8.03275L23.7134 11.0513C25.8434 12.2792 26.972 14.8249 26.3056 17.3122L26.3055 17.3123Z"
        />
      </svg>
    )
  }
  if (id === 'claude') {
    return (
      <svg viewBox="0 0 125 125" aria-hidden="true">
        <path
          fill="#D97757"
          d="M54.375 118.75 56.125 111 58.125 101 59.75 93 61.25 83.125 62.125 79.875 62 79.625 61.375 79.75 53.875 90 42.5 105.375 33.5 114.875 31.375 115.75 27.625 113.875 28 110.375 30.125 107.375 42.5 91.5 50 81.625 54.875 76 54.75 75.25H54.5L21.5 96.75 15.625 97.5 13 95.125 13.375 91.25 14.625 90 24.5 83.125 49.125 69.375 49.5 68.125 49.125 67.5H47.875L43.75 67.25 29.75 66.875 17.625 66.375 5.75 65.75 2.75 65.125 0 61.375.25 59.5 2.75 57.875 6.375 58.125 14.25 58.75 26.125 59.5 34.75 60 47.5 61.375H49.5L49.75 60.5 49.125 60 48.625 59.5 36.25 51.25 23 42.5 16 37.375 12.25 34.75 10.375 32.375 9.625 27.125 13 23.375 17.625 23.75 18.75 24 23.375 27.625 33.25 35.25 46.25 44.875 48.125 46.375 49 45.875V45.5L48.125 44.125 41.125 31.375 33.625 18.375 30.25 13 29.375 9.75C29.0417 8.625 28.875 7.375 28.875 6L32.75.750006 34.875 0 40.125.750006 42.25 2.625 45.5 10 50.625 21.625 58.75 37.375 61.125 42.125 62.375 46.375 62.875 47.75H63.75V47L64.375 38 65.625 27.125 66.875 13.125 67.25 9.125 69.25 4.375 73.125 1.87501 76.125 3.25 78.625 6.875 78.25 9.125 76.875 18.75 73.875 33.875 72 44.125H73.125L74.375 42.75 79.5 36 88.125 25.25 91.875 21 96.375 16.25 99.25 14H104.625L108.5 19.875 106.75 26 101.25 33 96.625 38.875 90 47.75 86 54.875 86.375 55.375H87.25L102.125 52.125 110.25 50.75 119.75 49.125 124.125 51.125 124.625 53.125 122.875 57.375 112.625 59.875 100.625 62.25 82.75 66.5 82.5 66.625 82.75 67 90.75 67.75 94.25 68H102.75L118.5 69.125 122.625 71.875 125 75.125 124.625 77.75 118.25 80.875 109.75 78.875 89.75 74.125 83 72.5H82V73L87.75 78.625 98.125 88 111.25 100.125 111.875 103.125 110.25 105.625 108.5 105.375 97 96.625 92.5 92.75 82.5 84.375H81.875V85.25L84.125 88.625 96.375 107 97 112.625 96.125 114.375 92.875 115.5 89.5 114.875 82.25 104.875 74.875 93.5 68.875 83.375 68.25 83.875 64.625 121.625 63 123.5 59.25 125 56.125 122.625 54.375 118.75Z"
        />
      </svg>
    )
  }
  if (id === 'opencode') {
    return (
      <svg viewBox="0 0 300 300" aria-hidden="true">
        <g transform="translate(30)">
          <path d="M180 240H60V120H180V240Z" fill="#4B4646" />
          <path d="M180 60H60V240H180V60ZM240 300H0V0H240V300Z" fill="#F1ECEC" />
        </g>
      </svg>
    )
  }
  if (id === 'copilot') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          fill="#111"
          d="M7.998 15.035c-4.562 0-7.873-2.914-7.998-3.749V9.338c.085-.628.677-1.686 1.588-2.065.013-.07.024-.143.036-.218.029-.183.06-.384.126-.612-.201-.508-.254-1.084-.254-1.656 0-.87.128-1.769.693-2.484.579-.733 1.494-1.124 2.724-1.261 1.206-.134 2.262.034 2.944.765.05.053.096.108.139.165.044-.057.094-.112.143-.165.682-.731 1.738-.899 2.944-.765 1.23.137 2.145.528 2.724 1.261.566.715.693 1.614.693 2.484 0 .572-.053 1.148-.254 1.656.066.228.098.429.126.612.012.076.024.148.037.218.924.385 1.522 1.471 1.591 2.095v1.872c0 .766-3.351 3.795-8.002 3.795Zm0-1.485c2.28 0 4.584-1.11 5.002-1.433V7.862l-.023-.116c-.49.21-1.075.291-1.727.291-1.146 0-2.059-.327-2.71-.991A3.222 3.222 0 0 1 8 6.303a3.24 3.24 0 0 1-.544.743c-.65.664-1.563.991-2.71.991-.652 0-1.236-.081-1.727-.291l-.023.116v4.255c.419.323 2.722 1.433 5.002 1.433ZM6.762 2.83c-.193-.206-.637-.413-1.682-.297-1.019.113-1.479.404-1.713.7-.247.312-.369.789-.369 1.554 0 .793.129 1.171.308 1.371.162.181.519.379 1.442.379.853 0 1.339-.235 1.638-.54.315-.322.527-.827.617-1.553.117-.935-.037-1.395-.241-1.614Zm4.155-.297c-1.044-.116-1.488.091-1.681.297-.204.219-.359.679-.242 1.614.091.726.303 1.231.618 1.553.299.305.784.54 1.638.54.922 0 1.28-.198 1.442-.379.179-.2.308-.578.308-1.371 0-.765-.123-1.242-.37-1.554-.233-.296-.693-.587-1.713-.7Z"
        />
        <path fill="#111" d="M6.25 9.037a.75.75 0 0 1 .75.75v1.501a.75.75 0 0 1-1.5 0V9.787a.75.75 0 0 1 .75-.75Zm4.25.75v1.501a.75.75 0 0 1-1.5 0V9.787a.75.75 0 0 1 1.5 0Z" />
      </svg>
    )
  }
  if (id === 'agy') {
    return (
      <img
        alt=""
        src="https://antigravity.google/assets/image/brand/antigravity-icon__full-color.png"
      />
    )
  }
  return (
    <svg viewBox="0 0 141.38 140" aria-hidden="true">
      <path fill="#6D44E8" d="m140.93 85-16.35-28.33-1.93-3.34 8.66-15a3.323 3.323 0 0 0 0-3.34l-9.62-16.67c-.3-.51-.72-.93-1.22-1.22s-1.07-.45-1.67-.45H82.23l-8.66-15a3.33 3.33 0 0 0-2.89-1.67H51.43c-.59 0-1.17.16-1.66.45-.5.29-.92.71-1.22 1.22L32.19 29.98l-1.92 3.33H12.96c-.59 0-1.17.16-1.66.45-.5.29-.93.71-1.22 1.22L.45 51.66a3.323 3.323 0 0 0 0 3.34l18.28 31.67-8.66 15a3.32 3.32 0 0 0 0 3.34l9.62 16.67c.3.51.72.93 1.22 1.22s1.07.45 1.67.45h36.56l8.66 15a3.35 3.35 0 0 0 2.89 1.67h19.25a3.34 3.34 0 0 0 2.89-1.67l18.28-31.67h17.32c.6 0 1.17-.16 1.67-.45s.92-.71 1.22-1.22l9.62-16.67a3.323 3.323 0 0 0 0-3.34ZM51.44 3.33 61.07 20l-9.63 16.66h76.98l-9.62 16.66H45.67l-11.54-20zM57.21 120H22.58l9.63-16.67h19.25l-38.5-66.67h19.25l9.62 16.67L68.78 100l-11.55 20Zm61.59-33.34-9.62-16.67-38.49 66.67-9.63-16.67 9.63-16.66 26.94-46.67h23.1l17.32 30z" />
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
