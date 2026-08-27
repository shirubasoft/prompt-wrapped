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
  X,
} from 'lucide-react'
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { wrappedUrl } from '../lib/codec'
import { downloadPoster, sharePoster } from '../lib/poster'
import { type ThemeId, type WrappedData } from '../lib/schema'
import { themeName, themes } from '../lib/themes'
import { Atmosphere } from './Atmosphere'

const scenes = [
  { slug: 'intro', label: 'Opening signal', duration: 6200 },
  { slug: 'big-number', label: 'Prompt count', duration: 6800 },
  { slug: 'ranking', label: 'Signal ranking', duration: 8200 },
  { slug: 'portrait', label: 'Developer portrait', duration: 7400 },
  { slug: 'tunnel', label: 'Type tunnel', duration: 6700 },
  { slug: 'data-viz', label: 'Corpus map', duration: 7600 },
  { slug: 'personality', label: 'Developer archetype', duration: 8000 },
  { slug: 'quiz', label: 'Friction quiz', duration: 9000 },
  { slug: 'timeline', label: 'Prompt lore', duration: 8200 },
  { slug: 'top-item', label: 'Strongest signal', duration: 7200 },
  { slug: 'field-guide', label: 'Field guide', duration: 9000 },
  { slug: 'final', label: 'Final poster', duration: 9000 },
] as const

const sceneCount = scenes.length

type SceneStyle = CSSProperties & Record<`--${string}`, string | number>

type StoryProps = {
  initialData: WrappedData
  onClose: () => void
}

type SceneProps = {
  data: WrappedData
  index: number
  quizChoice: number | null
  onQuizChoice: (choice: number) => void
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function SceneLabel({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="scene-label">
      <span>{String(number + 1).padStart(2, '0')}</span>
      <p>{children}</p>
    </div>
  )
}

function Scene({ data, index, quizChoice, onQuizChoice }: SceneProps) {
  const rankedScores = useMemo(
    () => [...data.scores].sort((left, right) => right.score - left.score),
    [data.scores],
  )
  const topScore = rankedScores[0]

  if (index === 0) {
    return (
      <div className="scene scene--intro">
        <div className="intro-index">WRP / {new Date(data.generatedAt).getFullYear()}</div>
        <motion.div
          className="intro-shape intro-shape--sun"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 10 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 155, damping: 12 }}
        />
        <motion.div
          className="intro-shape intro-shape--bar"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.34, duration: 0.64, ease: [0.16, 1, 0.3, 1] }}
        />
        <h1 className="intro-title" aria-label="Your prompt wrapped">
          <motion.span initial={{ y: '115%', rotate: 3 }} animate={{ y: 0, rotate: -1 }} transition={{ delay: 0.08, type: 'spring', bounce: 0.28, duration: 0.85 }}>YOUR</motion.span>
          <motion.span initial={{ x: '-112%' }} animate={{ x: 0 }} transition={{ delay: 0.2, duration: 0.82, ease: [0.16, 1, 0.3, 1] }}>PROMPT</motion.span>
          <motion.span initial={{ y: '-120%', rotate: -4 }} animate={{ y: 0, rotate: 1.5 }} transition={{ delay: 0.3, type: 'spring', bounce: 0.32, duration: 0.95 }}>WRAPPED</motion.span>
        </h1>
        <motion.p className="intro-note" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.78 }}>
          We read the prompts.<br />The agents have notes.
        </motion.p>
        <p className="intro-window">{data.coverage.window}</p>
      </div>
    )
  }

  if (index === 1) {
    const digits = data.coverage.totalPrompts.toLocaleString().split('')
    return (
      <div className="scene scene--big-number">
        <SceneLabel number={index}>The complete corpus</SceneLabel>
        <div className="big-number" aria-label={`${data.coverage.totalPrompts.toLocaleString()} prompts`}>
          {digits.map((digit, digitIndex) => (
            <motion.span
              key={`${digit}-${digitIndex}`}
              initial={{ y: digitIndex % 2 ? '-110%' : '110%', rotate: digitIndex % 2 ? -8 : 8 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ delay: digitIndex * 0.075, type: 'spring', stiffness: 125, damping: 13 }}
            >
              {digit}
            </motion.span>
          ))}
        </div>
        <motion.p className="big-number-caption" initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ delay: 0.55, duration: 0.7 }}>
          prompts walked into a model.<br /><strong>Patterns walked back out.</strong>
        </motion.p>
        <div className="big-number-marquee" aria-hidden="true">
          <span>{data.harness} · {data.coverage.sources.length} sources · local only · </span>
          <span>{data.harness} · {data.coverage.sources.length} sources · local only · </span>
        </div>
      </div>
    )
  }

  if (index === 2) {
    return (
      <div className="scene scene--ranking">
        <SceneLabel number={index}>Your top five signals</SceneLabel>
        <span className="sr-only">{data.developer.title}</span>
        <ol className="ranking-list">
          {rankedScores.slice(0, 5).map((score, scoreIndex) => (
            <motion.li
              key={score.key}
              initial={{ x: scoreIndex % 2 ? '105%' : '-105%', skewX: scoreIndex % 2 ? -8 : 8 }}
              animate={{ x: 0, skewX: 0 }}
              transition={{ delay: scoreIndex * 0.085, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="ranking-number">0{scoreIndex + 1}</span>
              <strong>{score.label}</strong>
              <span className="ranking-score">{score.score.toFixed(1)}</span>
              <i style={{ '--rank-width': `${score.score * 10}%` } as SceneStyle} />
            </motion.li>
          ))}
        </ol>
        <p className="ranking-aside">Ranked by frequency, specificity, and how often an agent had to be asked twice.</p>
      </div>
    )
  }

  if (index === 3) {
    const fingerprint = Object.entries(data.fingerprint)
    return (
      <div className="scene scene--portrait">
        <SceneLabel number={index}>A portrait, drawn from behavior</SceneLabel>
        <div className="portrait-stage">
          <motion.div className="portrait-word portrait-word--one" initial={{ x: -120 }} animate={{ x: 0 }} transition={{ delay: 0.26, type: 'spring' }}>PROOF</motion.div>
          <motion.div className="portrait-word portrait-word--two" initial={{ x: 120 }} animate={{ x: 0 }} transition={{ delay: 0.34, type: 'spring' }}>FIRST</motion.div>
          <div className="portrait-rings" aria-hidden="true">
            {Array.from({ length: 5 }, (_, ringIndex) => <i key={ringIndex} style={{ '--ring': ringIndex } as SceneStyle} />)}
          </div>
          <motion.div className="portrait-avatar depth-layer depth-layer--deep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12, duration: 0.55 }}>
            <span>{initials(data.developer.displayName)}</span>
            <small>{data.developer.displayName}</small>
          </motion.div>
          {fingerprint.map(([label, value], itemIndex) => (
            <motion.div
              className={`portrait-tag portrait-tag--${itemIndex + 1} depth-layer`}
              key={label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48 + itemIndex * 0.09, duration: 0.42 }}
            >
              <span>{label.replace('Like', '')}</span>
              <p>{value}</p>
            </motion.div>
          ))}
        </div>
        <p className="pointer-note">Move your pointer. The layers keep their distance.</p>
      </div>
    )
  }

  if (index === 4) {
    const tunnelText = data.developer.archetype.toUpperCase()
    return (
      <div className="scene scene--tunnel">
        <SceneLabel number={index}>Your type, with nowhere to hide</SceneLabel>
        <div className="type-tunnel" aria-label={tunnelText}>
          {Array.from({ length: 9 }, (_, textIndex) => (
            <span
              aria-hidden="true"
              className="tunnel-plane"
              key={textIndex}
              style={{ '--tunnel-index': textIndex } as SceneStyle}
            >
              {tunnelText}
            </span>
          ))}
          <motion.strong initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 1 }} transition={{ delay: 0.58, type: 'spring', bounce: 0.42 }}>
            {data.developer.archetype}
          </motion.strong>
        </div>
        <p className="tunnel-caption">One archetype. Nine echoes. Zero subtlety.</p>
      </div>
    )
  }

  if (index === 5) {
    const objectCount = Math.min(96, Math.max(36, Math.round(Math.log10(data.coverage.totalPrompts + 1) * 22)))
    const perObject = Math.max(1, Math.round(data.coverage.totalPrompts / objectCount))
    const visualSources = data.coverage.sources.slice(0, 6)
    const visualTotal = visualSources.reduce((total, source) => total + Math.max(1, source.prompts ?? 0), 0)
    return (
      <div className="scene scene--data-viz">
        <SceneLabel number={index}>The corpus, made visible</SceneLabel>
        <div className="data-viz-copy">
          <h2>Every mark is about <strong>{perObject}</strong> prompts.</h2>
          <p>Dense source histories pull inward. Partial data drifts to the edge.</p>
        </div>
        <div className="data-field" aria-label={`${objectCount} animated marks representing the prompt corpus`}>
          {Array.from({ length: objectCount }, (_, dotIndex) => {
            const dotRatio = (dotIndex + 0.5) / objectCount
            let runningRatio = 0
            let sourceIndex = 0
            for (let candidate = 0; candidate < visualSources.length; candidate += 1) {
              runningRatio += Math.max(1, visualSources[candidate].prompts ?? 0) / visualTotal
              if (dotRatio <= runningRatio) {
                sourceIndex = candidate
                break
              }
            }
            return (
              <motion.i
                key={dotIndex}
                data-source={sourceIndex}
                style={{ '--dot-index': dotIndex, '--dot-size': `${8 + (dotIndex % 5) * 3}px` } as SceneStyle}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: dotIndex * 11 }}
                transition={{ delay: (dotIndex % 18) * 0.025, type: 'spring', stiffness: 170, damping: 12 }}
              />
            )
          })}
        </div>
        <div className="source-legend">
          {visualSources.map((source, sourceIndex) => (
            <span key={source.name} data-source={sourceIndex}><i />{source.name} <strong>{source.prompts?.toLocaleString() ?? 'n/a'}</strong></span>
          ))}
        </div>
      </div>
    )
  }

  if (index === 6) {
    return (
      <div className="scene scene--personality">
        <SceneLabel number={index}>Your developer archetype</SceneLabel>
        <div className="personality-composition">
          <motion.span className="personality-overline" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.58 }}>Apparently, you are</motion.span>
          <h2>
            {data.developer.archetype.split(' ').map((word, wordIndex) => (
              <motion.span key={word} initial={{ y: '120%', rotate: wordIndex % 2 ? 6 : -4 }} animate={{ y: 0, rotate: wordIndex % 2 ? -1 : 1 }} transition={{ delay: wordIndex * 0.11, type: 'spring', damping: 13 }}>
                {word}
              </motion.span>
            ))}
          </h2>
          <motion.p className="personality-title" initial={{ rotate: -7, scale: 0 }} animate={{ rotate: -2, scale: 1 }} transition={{ delay: 0.48, type: 'spring', bounce: 0.4 }}>
            {data.developer.title}
          </motion.p>
          <p className="personality-summary">{data.developer.summary}</p>
          <div className="accent-ribbon">{data.share.accentWords.join(' · ')}</div>
        </div>
      </div>
    )
  }

  if (index === 7) {
    const quizOptions = data.friction.slice(0, 3)
    return (
      <div className="scene scene--quiz">
        <SceneLabel number={index}>Quick gut check</SceneLabel>
        <div className="quiz-layout">
          <div className="quiz-prompt">
            <span>Q.</span>
            <h2>Which move got the loudest internal sigh?</h2>
            <p>There is one especially repeatable offender.</p>
          </div>
          <div className="quiz-options">
            {quizOptions.map((option, optionIndex) => {
              const selected = quizChoice === optionIndex
              const correct = optionIndex === 0
              const revealed = quizChoice !== null
              return (
                <motion.button
                  type="button"
                  key={option}
                  className={`${selected ? 'selected' : ''} ${revealed && correct ? 'correct' : ''} ${revealed && selected && !correct ? 'wrong' : ''}`}
                  onClick={() => onQuizChoice(optionIndex)}
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: optionIndex * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span>0{optionIndex + 1}</span>
                  <p>{option}</p>
                  <i>{revealed && correct ? 'THAT ONE' : selected ? 'NICE TRY' : 'PICK'}</i>
                </motion.button>
              )
            })}
          </div>
        </div>
        <AnimatePresence>
          {quizChoice !== null && (
            <motion.p className="quiz-result" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              {quizChoice === 0 ? 'Correct. Completion without execution is how trust issues are born.' : 'Plausible, but the data picked unfinished validation.'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (index === 8) {
    return (
      <div className="scene scene--timeline">
        <SceneLabel number={index}>Deep cuts from the corpus</SceneLabel>
        <h2>The prompt lore,<br />in four acts.</h2>
        <div className="timeline-track">
          {data.moments.slice(0, 4).map((moment, momentIndex) => (
            <motion.article
              key={moment.label}
              initial={{ y: momentIndex % 2 ? -45 : 45, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: momentIndex * 0.13, type: 'spring', damping: 15 }}
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

  if (index === 9) {
    const circumference = 2 * Math.PI * 154
    return (
      <div className="scene scene--top-item">
        <SceneLabel number={index}>Your strongest signal</SceneLabel>
        <div className="top-item-layout">
          <div className="top-item-meter">
            <svg viewBox="0 0 340 340" aria-hidden="true">
              <circle cx="170" cy="170" r="154" />
              <motion.circle
                className="meter-progress"
                cx="170"
                cy="170"
                r="154"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - topScore.score / 10) }}
                transition={{ delay: 0.22, duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <motion.strong initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35, type: 'spring', bounce: 0.4 }}>{topScore.score.toFixed(1)}</motion.strong>
            <span>/ 10</span>
          </div>
          <div className="top-item-copy">
            <p>NUMBER ONE</p>
            <h2>{topScore.label}</h2>
            <blockquote>{topScore.reason}</blockquote>
            <span>{topScore.confidence} confidence</span>
          </div>
        </div>
        <div className="top-item-ticker" aria-hidden="true">{topScore.label} · {topScore.label} · {topScore.label}</div>
      </div>
    )
  }

  if (index === 10) {
    return (
      <div className="scene scene--field-guide">
        <SceneLabel number={index}>The part that survives the party</SceneLabel>
        <div className="field-guide-heading">
          <h2>Your next agent gets the field guide.</h2>
          <p>Evidence-scoped, trigger-specific, and ready to save.</p>
        </div>
        <div className="field-guide-list">
          {data.skills.map((skill, skillIndex) => (
            <motion.article
              key={skill.name}
              initial={{ y: 70, rotate: skillIndex % 2 ? 3 : -3, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ delay: skillIndex * 0.1, type: 'spring', damping: 15 }}
            >
              <span>0{skillIndex + 1}</span>
              <div>
                <strong>${skill.name}</strong>
                <p>{skill.description}</p>
                <small>Loads when {skill.trigger.toLowerCase()}</small>
              </div>
              <button type="button" onClick={() => downloadText(`${skill.name}.SKILL.md`, skill.content)}>
                <FileDown size={17} /> <span className="sr-only">Save {skill.name}</span>
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="scene scene--final">
      <SceneLabel number={index}>The shareable version</SceneLabel>
      <div className="final-poster">
        <div className="final-poster__stamp">PROMPT<br />WRAPPED</div>
        <div className="final-poster__year">{new Date(data.generatedAt).getFullYear()}</div>
        <p className="final-poster__eyebrow">{data.developer.displayName}'s developer archetype</p>
        <h2>{data.developer.archetype}</h2>
        <p className="final-poster__title">{data.developer.title}</p>
        <div className="final-poster__scores">
          {rankedScores.slice(0, 3).map((score, scoreIndex) => (
            <motion.div key={score.key} initial={{ scale: 0, rotate: -8 }} animate={{ scale: 1, rotate: scoreIndex - 1 }} transition={{ delay: 0.35 + scoreIndex * 0.09, type: 'spring' }}>
              <strong>{score.score.toFixed(1)}</strong>
              <span>{score.label}</span>
            </motion.div>
          ))}
        </div>
        <p className="final-poster__closing">{data.share.closingLine}</p>
        <div className="final-poster__shape" aria-hidden="true" />
      </div>
      <div className="final-actions">
        <button className="button button--primary" type="button" onClick={() => void sharePoster(data)}>
          <Share2 size={18} /> Share poster
        </button>
        <button className="button button--ink" type="button" onClick={() => void downloadPoster(data)}>
          <Download size={18} /> Save image
        </button>
      </div>
      <p className="share-note">Your title and scores are included. Your prompt history stays out.</p>
    </div>
  )
}

export function Story({ initialData, onClose }: StoryProps) {
  const reduceMotion = useReducedMotion()
  const [data, setData] = useState(initialData)
  const [scene, setScene] = useState(0)
  const [direction, setDirection] = useState(1)
  const [playing, setPlaying] = useState(!reduceMotion)
  const [copied, setCopied] = useState(false)
  const [quizChoice, setQuizChoice] = useState<number | null>(null)
  const storyRef = useRef<HTMLElement>(null)
  const sceneRef = useRef(0)
  const swipeStart = useRef<number | null>(null)
  const waitingForQuizAnswer = scene === 7 && quizChoice === null

  const goTo = useCallback((next: number) => {
    const clamped = Math.min(sceneCount - 1, Math.max(0, next))
    const current = sceneRef.current
    if (clamped === current) return
    setDirection(clamped > current ? 1 : -1)
    sceneRef.current = clamped
    setScene(clamped)
    if (clamped === sceneCount - 1) setPlaying(false)
  }, [])

  useEffect(() => {
    if (!playing || waitingForQuizAnswer || scene === sceneCount - 1) return
    const timer = window.setTimeout(() => goTo(scene + 1), scenes[scene].duration)
    return () => window.clearTimeout(timer)
  }, [goTo, playing, scene, waitingForQuizAnswer])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (target instanceof HTMLElement && target.matches('input, select, textarea')) return
      if (event.key === ' ' && target instanceof HTMLElement && target.matches('button, a')) return
      if (event.key === 'ArrowRight') goTo(sceneRef.current + 1)
      if (event.key === 'ArrowLeft') goTo(sceneRef.current - 1)
      if (event.key === ' ') {
        event.preventDefault()
        setPlaying((value) => !value)
      }
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goTo, onClose])

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
      sceneRef.current = 0
      setDirection(-1)
      setScene(0)
      setPlaying(!reduceMotion)
      return
    }
    setPlaying((value) => !value)
  }

  function updatePointer(event: React.PointerEvent<HTMLElement>) {
    if (!storyRef.current) return
    const x = event.clientX / window.innerWidth - 0.5
    const y = event.clientY / window.innerHeight - 0.5
    storyRef.current.style.setProperty('--pointer-x', x.toFixed(3))
    storyRef.current.style.setProperty('--pointer-y', y.toFixed(3))
  }

  function endSwipe(event: React.PointerEvent<HTMLElement>) {
    if (swipeStart.current === null) return
    const distance = event.clientX - swipeStart.current
    swipeStart.current = null
    if (Math.abs(distance) < 64) return
    goTo(scene + (distance < 0 ? 1 : -1))
  }

  const transitionVariants = reduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (travel: number) => ({ x: travel * 110, opacity: 0, rotate: travel * 1.5, scale: 0.985 }),
        center: { x: 0, opacity: 1, rotate: 0, scale: 1 },
        exit: (travel: number) => ({ x: travel * -150, opacity: 0, rotate: travel * -1.5, scale: 1.02 }),
      }

  return (
    <main
      ref={storyRef}
      className={`story theme-${data.theme}`}
      data-scene={scenes[scene].slug}
      onPointerMove={updatePointer}
      onPointerDown={(event) => { swipeStart.current = event.clientX }}
      onPointerUp={endSwipe}
      onPointerCancel={() => { swipeStart.current = null }}
    >
      <Atmosphere />
      <header className="story-header">
        <button className="icon-button story-close" type="button" onClick={close} aria-label="Back to home">
          <X />
        </button>
        <div className="story-brand"><span>PW</span><p>Prompt Wrapped</p></div>
        <label className="theme-select">
          <span className="sr-only">Animation theme</span>
          <select value={data.theme} onChange={(event) => changeTheme(event.target.value as ThemeId)}>
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
          </select>
          <ChevronDown size={15} />
        </label>
      </header>

      <div className="story-progress" aria-label={`Scene ${scene + 1} of ${sceneCount}`}>
        {scenes.map((item, itemIndex) => (
          <button
            type="button"
            key={item.slug}
            className={itemIndex < scene ? 'past' : itemIndex === scene ? 'current' : ''}
            onClick={() => goTo(itemIndex)}
            aria-label={`Go to ${item.label}, scene ${itemIndex + 1}`}
            title={item.label}
          >
            <i>
              {itemIndex === scene && playing && !waitingForQuizAnswer && (
                <motion.span key={`${scene}-${playing}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: item.duration / 1000, ease: 'linear' }} />
              )}
            </i>
          </button>
        ))}
      </div>

      <section className="scene-shell" aria-live="polite">
        <AnimatePresence mode="sync" initial={false} custom={direction}>
          <motion.div
            className={`scene-motion scene-motion--${scenes[scene].slug}`}
            key={`${scene}-${data.theme}`}
            custom={direction}
            variants={transitionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0.12 : 0.58, ease: [0.16, 1, 0.3, 1] }}
          >
            <Scene data={data} index={scene} quizChoice={quizChoice} onQuizChoice={setQuizChoice} />
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
        <div className="scene-meta">
          <strong>{String(scene + 1).padStart(2, '0')}</strong>
          <span>{scenes[scene].label}</span>
        </div>
        <span className="theme-name">{themeName(data.theme)}</span>
        <button className="copy-link" type="button" onClick={() => void copyLink()}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy private link'}
        </button>
      </footer>
    </main>
  )
}
