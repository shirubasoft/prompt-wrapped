import type { ThemeId } from './schema'

export type ThemeDefinition = {
  id: ThemeId
  name: string
  cue: string
}

export const themes: ThemeDefinition[] = [
  { id: 'neon-orbit', name: 'Neon orbit', cue: 'For systems thinkers with gravitational pull' },
  { id: 'terminal-signal', name: 'Terminal signal', cue: 'For evidence hunters and log whisperers' },
  { id: 'paper-cut', name: 'Paper cut', cue: 'For editors, documentarians, and tidy minds' },
  { id: 'cosmic-lava', name: 'Cosmic lava', cue: 'For high-energy builders who still demand proof' },
  { id: 'blueprint', name: 'Blueprint', cue: 'For architects who make every line earn its place' },
  { id: 'pixel-arcade', name: 'Pixel arcade', cue: 'For playful makers and ruthless debuggers' },
]

export function themeName(id: ThemeId): string {
  return themes.find((theme) => theme.id === id)?.name ?? id
}
