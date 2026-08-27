import type { ComponentType } from 'react'

import type { WrappedData } from './schema'

type StoryProps = {
  initialData: WrappedData
  onClose: () => void
}

type StoryModule = { default: ComponentType<StoryProps> }

let storyModule: Promise<StoryModule> | undefined

export function loadStory(): Promise<StoryModule> {
  storyModule ??= import('../components/Story').then(({ Story }) => ({ default: Story }))
  return storyModule
}

export function preloadStory(): void {
  void loadStory()
}
