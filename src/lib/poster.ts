import type { WrappedData } from './schema'

const palettes = {
  'neon-orbit': ['#0a0710', '#efff7a', '#ff5cce', '#8d7bff'],
  'terminal-signal': ['#03130d', '#8dffb5', '#e2ffe9', '#37d67a'],
  'paper-cut': ['#f1eadb', '#1d1a15', '#e84932', '#5267d8'],
  'cosmic-lava': ['#16040f', '#ffcc67', '#ff4d74', '#7d5cff'],
  blueprint: ['#072c4b', '#f5fbff', '#5bc7ff', '#ffca5c'],
  'pixel-arcade': ['#160c2a', '#f9f871', '#ff67d4', '#5ef5ff'],
} as const

function fitWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startSize = 146,
  minSize = 58,
) {
  for (let size = startSize; size >= minSize; size -= 2) {
    context.font = `900 ${size}px Arial, sans-serif`
    const lines: string[] = []
    let line = ''
    for (const word of text.split(/\s+/)) {
      const candidate = `${line} ${word}`.trim()
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    if (line) lines.push(line)
    if (lines.length <= maxLines) return { lines, size }
  }
  return { lines: [text], size: minSize }
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
  const topScores = [...data.scores].sort((left, right) => right.score - left.score).slice(0, 3)
  const year = new Date(data.generatedAt).getFullYear()

  context.fillStyle = accentTwo
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = background
  context.fillRect(48, 48, 984, 1254)
  context.fillStyle = accent
  context.fillRect(68, 68, 944, 1214)

  context.beginPath()
  context.arc(955, 42, 270, 0, Math.PI * 2)
  context.fillStyle = accentTwo
  context.fill()
  context.lineWidth = 54
  context.strokeStyle = foreground
  context.stroke()

  context.fillStyle = background
  context.fillRect(68, 68, 204, 112)
  context.fillStyle = foreground
  context.font = '900 24px ui-monospace, monospace'
  context.letterSpacing = '4px'
  context.fillText('PROMPT', 88, 112)
  context.fillText('WRAPPED', 88, 146)

  context.textAlign = 'right'
  context.fillStyle = background
  context.font = '900 74px Arial, sans-serif'
  context.letterSpacing = '-4px'
  context.fillText(String(year), 980, 156)
  context.textAlign = 'left'
  context.letterSpacing = '0px'

  context.fillStyle = background
  context.font = '900 25px ui-monospace, monospace'
  context.fillText(`${data.developer.displayName.toUpperCase()}'S DEVELOPER ARCHETYPE`, 88, 252)

  const archetypeLayout = fitWrappedText(context, data.developer.archetype.toUpperCase(), 860, 3)
  context.fillStyle = background
  archetypeLayout.lines.forEach((archetypeLine, index) => {
    context.fillText(archetypeLine, 88, 382 + index * archetypeLayout.size * 0.83)
  })

  context.fillStyle = background
  context.font = '800 27px Arial, sans-serif'
  wrapText(context, data.developer.title, 88, 720, 770, 35, 2)

  const scoreY = 842
  topScores.forEach((score, index) => {
    const x = 88 + index * 300
    context.fillStyle = index === 1 ? accentTwo : background
    context.fillRect(x, scoreY, 282, 208)
    context.fillStyle = index === 1 ? background : foreground
    context.font = '900 78px Arial, sans-serif'
    context.fillText(score.score.toFixed(1), x + 18, scoreY + 84)
    context.font = '800 20px Arial, sans-serif'
    wrapText(context, score.label.toUpperCase(), x + 18, scoreY + 137, 238, 26, 2)
  })

  context.fillStyle = background
  context.font = '800 27px Arial, sans-serif'
  wrapText(context, data.share.closingLine, 88, 1125, 820, 36, 2)

  context.fillStyle = background
  context.font = '900 20px ui-monospace, monospace'
  context.letterSpacing = '2px'
  context.fillText('PROMPT-WRAPPED', 88, 1237)
  context.textAlign = 'right'
  context.fillText(`MADE WITH ${data.harness.toUpperCase()}`, 980, 1237)
  context.textAlign = 'left'
  context.letterSpacing = '0px'

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
