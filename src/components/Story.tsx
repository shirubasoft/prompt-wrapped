import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileDown,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Sparkles,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { downloadPoster, sharePoster } from '../lib/poster'
import { type ThemeId, type WrappedData } from '../lib/schema'
import { themeName, themes } from '../lib/themes'
import { wrappedUrl } from '../lib/codec'
import { Atmosphere } from './Atmosphere'

const sceneCount = 9
const sceneDuration = 7600

type StoryProps = {
  initialData: WrappedData
  onClose: () => void
}

function downloadText(filename: string, content: string, type = 'text/markdown') {
  const link = document.createElement('a')
  link.download = filename
  link.href = URL.createObjectURL(new Blob([content], { type }))
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}

function scoreTone(score: number) {
  if (score >= 9.3) return 'scorching'
  if (score >= 8.7) return 'hot'
  return 'steady'
}

function Scene({ index, data }: { index: number; data: WrappedData }) {
  const topScore = useMemo(
    () => [...data.scores].sort((left, right) => right.score - left.score)[0],
    [data.scores],
  )

  if (index === 0) {
    return (
      <div className="scene scene--intro">
        <p className="scene-kicker">{data.coverage.window}</p>
        <h1>Hey, {data.developer.displayName}.</h1>
        <p className="scene-lede">We read the prompts. The agents have notes.</p>
        <div className="intro-orbit"><span>{data.coverage.totalPrompts.toLocaleString()}</span> usable prompts</div>
      </div>
    )
  }

  if (index === 1) {
    return (
      <div className="scene scene--coverage">
        <p className="scene-kicker">The listening party</p>
        <h2>{data.coverage.totalPrompts.toLocaleString()} prompts walked into a model.</h2>
        <div className="source-stack">
          {data.coverage.sources.map((source, sourceIndex) => (
            <motion.div
              className={`source-row source-row--${source.status}`}
              key={source.name}
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: sourceIndex * 0.08 }}
            >
              <span>{source.name}</span>
              <strong>{source.prompts === null ? 'no bodies' : source.prompts.toLocaleString()}</strong>
              <i />
            </motion.div>
          ))}
        </div>
        {data.coverage.limitations[0] && <p className="scene-footnote">Reality check: {data.coverage.limitations[0]}</p>}
      </div>
    )
  }

  if (index === 2) {
    return (
      <div className="scene scene--title">
        <p className="scene-kicker">Your developer archetype</p>
        <p className="archetype">{data.developer.archetype}</p>
        <h2>{data.developer.title}</h2>
        <p className="scene-lede">{data.developer.tagline}</p>
        <p className="long-copy">{data.developer.summary}</p>
      </div>
    )
  }

  if (index === 3) {
    return (
      <div className="scene scene--scores">
        <p className="scene-kicker">The extremely scientific scorecard</p>
        <h2>Your strongest signal: {topScore.label.toLowerCase()}.</h2>
        <div className="score-grid">
          {data.scores.map((score, scoreIndex) => (
            <motion.article
              className={`score-card score-card--${scoreTone(score.score)}`}
              key={score.key}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: scoreIndex * 0.055, type: 'spring', bounce: 0.25 }}
            >
              <span className="score-card__number">{score.score.toFixed(1)}</span>
              <strong>{score.label}</strong>
              <div className="score-bar"><i style={{ width: `${score.score * 10}%` }} /></div>
              <p>{score.reason}</p>
              <span className="confidence">{score.confidence} confidence</span>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  if (index === 4) {
    return (
      <div className="scene scene--fingerprint">
        <p className="scene-kicker">Four ways to spot you in a repo</p>
        <h2>Your working fingerprint.</h2>
        <div className="fingerprint-grid">
          {Object.entries(data.fingerprint).map(([label, value], itemIndex) => (
            <motion.article
              key={label}
              initial={{ rotate: itemIndex % 2 ? 4 : -4, y: 45, opacity: 0 }}
              animate={{ rotate: itemIndex % 2 ? 1 : -1, y: 0, opacity: 1 }}
              transition={{ delay: itemIndex * 0.11 }}
            >
              <span>{label.replace('Like', '').toUpperCase()}</span>
              <p>{value}</p>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  if (index === 5) {
    return (
      <div className="scene scene--moments">
        <p className="scene-kicker">Deep cuts from the corpus</p>
        <h2>The prompt lore.</h2>
        <div className="moment-carousel">
          {data.moments.map((moment, momentIndex) => (
            <motion.article
              key={moment.label}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: momentIndex * 0.12, type: 'spring' }}
            >
              <span>{String(momentIndex + 1).padStart(2, '0')}</span>
              <small>{moment.label}</small>
              <strong>{moment.value}</strong>
              <p>{moment.detail}</p>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  if (index === 6) {
    return (
      <div className="scene scene--roast">
        <p className="scene-kicker">Your agent's performance review</p>
        <h2>Things that make you type slower and sigh louder.</h2>
        <div className="roast-list">
          {data.friction.map((item, itemIndex) => (
            <motion.div
              key={item}
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ delay: itemIndex * 0.15, duration: 0.55 }}
            >
              <X aria-hidden="true" />
              <p>{item}</p>
            </motion.div>
          ))}
        </div>
        <p className="scene-footnote">Fair. The mocked integration test knows what it did.</p>
      </div>
    )
  }

  if (index === 7) {
    return (
      <div className="scene scene--skills">
        <p className="scene-kicker">The part that survives the party</p>
        <h2>Your next agent gets the field guide.</h2>
        <p className="scene-lede">Each skill is evidence-scoped, trigger-specific, and already cleaned with Unslop.</p>
        <div className="skill-list">
          {data.skills.map((skill, skillIndex) => (
            <motion.article
              key={skill.name}
              initial={{ x: skillIndex % 2 ? 70 : -70, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: skillIndex * 0.1 }}
            >
              <div><span>$</span><strong>{skill.name}</strong></div>
              <p>{skill.description}</p>
              <small>Loads when: {skill.trigger}</small>
              <button type="button" onClick={() => downloadText(`${skill.name}.SKILL.md`, skill.content)}>
                <FileDown size={16} /> Save skill
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="scene scene--final">
      <p className="scene-kicker">Your 2026 prompt wrapped</p>
      <p className="final-archetype">{data.developer.archetype}</p>
      <h2>{data.developer.title}</h2>
      <div className="final-scores">
        {[...data.scores]
          .sort((left, right) => right.score - left.score)
          .slice(0, 3)
          .map((score) => (
            <div key={score.key}><strong>{score.score.toFixed(1)}</strong><span>{score.label}</span></div>
          ))}
      </div>
      <p className="closing-line">{data.share.closingLine}</p>
      <div className="final-actions">
        <button className="button button--primary" type="button" onClick={() => void sharePoster(data)}>
          <Share2 size={18} /> Share poster
        </button>
        <button className="button button--glass" type="button" onClick={() => void downloadPoster(data)}>
          <Download size={18} /> Save image
        </button>
      </div>
      <p className="share-note">The poster contains your title and scores, not your prompt history.</p>
    </div>
  )
}

export function Story({ initialData, onClose }: StoryProps) {
  const reduceMotion = useReducedMotion()
  const [data, setData] = useState(initialData)
  const [scene, setScene] = useState(0)
  const [playing, setPlaying] = useState(!reduceMotion)
  const [copied, setCopied] = useState(false)

  const goTo = useCallback((next: number) => {
    const clamped = Math.min(sceneCount - 1, Math.max(0, next))
    setScene(clamped)
    if (clamped === sceneCount - 1) setPlaying(false)
  }, [])

  useEffect(() => {
    if (!playing || scene === sceneCount - 1) return
    const timer = window.setTimeout(() => goTo(scene + 1), sceneDuration)
    return () => window.clearTimeout(timer)
  }, [goTo, playing, scene])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') goTo(scene + 1)
      if (event.key === 'ArrowLeft') goTo(scene - 1)
      if (event.key === ' ') {
        event.preventDefault()
        setPlaying((value) => !value)
      }
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goTo, onClose, scene])

  function changeTheme(theme: ThemeId) {
    const next = { ...data, theme }
    setData(next)
    history.replaceState(null, '', wrappedUrl(next))
  }

  async function copyLink() {
    await navigator.clipboard.writeText(wrappedUrl(data))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function close() {
    history.replaceState(null, '', `${location.pathname}${location.search}`)
    onClose()
  }

  function togglePlayback() {
    if (scene === sceneCount - 1) {
      setScene(0)
      setPlaying(!reduceMotion)
      return
    }
    setPlaying((value) => !value)
  }

  return (
    <main className={`story theme-${data.theme}`}>
      <Atmosphere />
      <header className="story-header">
        <button className="icon-button story-close" type="button" onClick={close} aria-label="Back to home">
          <X />
        </button>
        <div className="story-brand"><Sparkles size={16} /> Prompt Wrapped</div>
        <label className="theme-select">
          <span className="sr-only">Animation theme</span>
          <select value={data.theme} onChange={(event) => changeTheme(event.target.value as ThemeId)}>
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
          </select>
          <ChevronDown size={15} />
        </label>
      </header>

      <div className="story-progress" aria-label={`Scene ${scene + 1} of ${sceneCount}`}>
        {Array.from({ length: sceneCount }, (_, index) => (
          <button
            type="button"
            key={index}
            className={index <= scene ? 'filled' : ''}
            onClick={() => goTo(index)}
            aria-label={`Go to scene ${index + 1}`}
          ><i /></button>
        ))}
      </div>

      <section className="scene-shell" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            className="scene-motion"
            key={`${scene}-${data.theme}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 42, scale: 0.97, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -32, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: reduceMotion ? 0.12 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <Scene index={scene} data={data} />
          </motion.div>
        </AnimatePresence>
      </section>

      <footer className="story-controls">
        <button className="icon-button" type="button" onClick={() => goTo(scene - 1)} disabled={scene === 0} aria-label="Previous scene">
          <ArrowLeft />
        </button>
        <button className="play-button" type="button" onClick={togglePlayback} aria-label={scene === sceneCount - 1 ? 'Replay story' : playing ? 'Pause story' : 'Play story'}>
          {scene === sceneCount - 1 ? <RotateCcw /> : playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        </button>
        <button className="icon-button" type="button" onClick={() => goTo(scene + 1)} disabled={scene === sceneCount - 1} aria-label="Next scene">
          <ArrowRight />
        </button>
        <span className="scene-count">{String(scene + 1).padStart(2, '0')} / {String(sceneCount).padStart(2, '0')}</span>
        <span className="theme-name">{themeName(data.theme)}</span>
        <button className="copy-link" type="button" onClick={() => void copyLink()}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy private link'}
        </button>
      </footer>
    </main>
  )
}
