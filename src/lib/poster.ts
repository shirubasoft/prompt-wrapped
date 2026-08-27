import type { WrappedData } from './schema'

const palettes = {
  'neon-orbit': ['#0a0710', '#efff7a', '#ff5cce', '#8d7bff'],
  'terminal-signal': ['#03130d', '#8dffb5', '#e2ffe9', '#37d67a'],
  'paper-cut': ['#f1eadb', '#1d1a15', '#e84932', '#5267d8'],
  'cosmic-lava': ['#16040f', '#ffcc67', '#ff4d74', '#7d5cff'],
  blueprint: ['#072c4b', '#f5fbff', '#5bc7ff', '#ffca5c'],
  'pixel-arcade': ['#160c2a', '#f9f871', '#ff67d4', '#5ef5ff'],
} as const

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  let size = 106
  do {
    context.font = `900 ${size}px Arial, sans-serif`
    size -= 2
  } while (context.measureText(text).width > maxWidth && size > 52)
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = `${line} ${word}`.trim()
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  lines.slice(0, maxLines).forEach((wrappedLine, index) => {
    context.fillText(wrappedLine, x, y + index * lineHeight)
  })
}

export async function createPoster(data: WrappedData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not supported in this browser.')

  const [background, foreground, accent, accentTwo] = palettes[data.theme]
  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)

  const gradient = context.createRadialGradient(930, 150, 20, 930, 150, 720)
  gradient.addColorStop(0, `${accent}cc`)
  gradient.addColorStop(0.5, `${accentTwo}44`)
  gradient.addColorStop(1, `${background}00`)
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.strokeStyle = `${foreground}22`
  context.lineWidth = 2
  for (let x = -200; x < 1280; x += 64) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x + 520, 1350)
    context.stroke()
  }

  context.fillStyle = foreground
  context.font = '700 28px ui-monospace, monospace'
  context.letterSpacing = '5px'
  context.fillText('PROMPT WRAPPED / 2026', 72, 90)
  context.letterSpacing = '0px'

  context.fillStyle = accent
  context.font = '900 34px Arial, sans-serif'
  context.fillText(data.developer.archetype.toUpperCase(), 72, 190)

  context.fillStyle = foreground
  fitText(context, data.developer.title, 930)
  const titleWords = data.developer.title.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of titleWords) {
    const candidate = `${line} ${word}`.trim()
    if (context.measureText(candidate).width > 900 && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  lines.push(line)
  lines.slice(0, 4).forEach((titleLine, index) => context.fillText(titleLine, 72, 310 + index * 112))

  const cardY = 760
  const topScores = [...data.scores].sort((left, right) => right.score - left.score).slice(0, 3)
  topScores.forEach((score, index) => {
    const x = 72 + index * 316
    context.fillStyle = `${foreground}12`
    roundedRect(context, x, cardY, 286, 230, 28)
    context.fillStyle = index === 1 ? accentTwo : accent
    context.font = '900 72px Arial, sans-serif'
    context.fillText(score.score.toFixed(1), x + 24, cardY + 92)
    context.fillStyle = foreground
    context.font = '700 23px Arial, sans-serif'
    wrapText(context, score.label, x + 24, cardY + 145, 238, 31, 2)
  })

  context.fillStyle = foreground
  context.font = '600 31px Arial, sans-serif'
  wrapText(context, data.share.closingLine, 72, 1100, 920, 42, 2)

  context.fillStyle = accent
  context.font = '800 26px ui-monospace, monospace'
  context.fillText('prompt-wrapped', 72, 1275)
  context.fillStyle = foreground
  context.textAlign = 'right'
  context.fillText(`made with ${data.harness}`, 1008, 1275)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Poster export failed.'))), 'image/png')
  })
}

export async function downloadPoster(data: WrappedData) {
  const blob = await createPoster(data)
  const link = document.createElement('a')
  link.download = `prompt-wrapped-${data.developer.displayName.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.png`
  link.href = URL.createObjectURL(blob)
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}

export async function sharePoster(data: WrappedData): Promise<'shared' | 'downloaded'> {
  const blob = await createPoster(data)
  const file = new File([blob], 'prompt-wrapped.png', { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: data.developer.title,
      text: `${data.developer.archetype}: ${data.developer.tagline}`,
      files: [file],
    })
    return 'shared'
  }
  await downloadPoster(data)
  return 'downloaded'
}
