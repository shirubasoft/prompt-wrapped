import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { demoWrapped } from '../data/demo'
import { Story } from './Story'

describe('Story', () => {
  it('moves through scenes with controls and keyboard', async () => {
    const user = userEvent.setup()
    render(<Story initialData={demoWrapped} onClose={vi.fn()} />)

    expect(await screen.findByText(/we read the prompts/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next scene' }))
    expect(await screen.findByText(/prompts walked into a model/i)).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByText(demoWrapped.developer.title)).toBeInTheDocument()
  })

  it('lets the viewer switch animation templates', async () => {
    const user = userEvent.setup()
    const { container } = render(<Story initialData={demoWrapped} onClose={vi.fn()} />)

    await user.selectOptions(screen.getByLabelText('Animation theme'), 'blueprint')
    expect(container.firstChild).toHaveClass('theme-blueprint')
  })

  it('offers the complete story sequence and reveals quiz feedback', async () => {
    const user = userEvent.setup()
    render(<Story initialData={demoWrapped} onClose={vi.fn()} />)

    expect(screen.getAllByRole('button', { name: /go to .*scene/i })).toHaveLength(12)
    await user.click(screen.getByRole('button', { name: /go to friction quiz/i }))
    await user.click(await screen.findByRole('button', { name: /an agent says "done"/i }))

    expect(await screen.findByText(/completion without execution is how trust issues are born/i)).toBeInTheDocument()
  })

  it('does not autoplay past an unanswered quiz', async () => {
    vi.useFakeTimers()
    try {
      const { container } = render(<Story initialData={demoWrapped} onClose={vi.fn()} />)

      await act(async () => {
        await Promise.resolve()
        await Promise.resolve()
      })
      act(() => vi.advanceTimersByTime(100))

      fireEvent.click(screen.getByRole('button', { name: /go to friction quiz/i }))
      act(() => vi.advanceTimersByTime(20_000))

      expect(container.firstChild).toHaveAttribute('data-scene', 'quiz')
      expect(screen.getByText(/which move got the loudest internal sigh/i)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps the corpus-map entrance and pulse transforms on separate elements', async () => {
    const user = userEvent.setup()
    const { container } = render(<Story initialData={demoWrapped} onClose={vi.fn()} />)

    await screen.findByText(/we read the prompts/i)
    await user.click(screen.getByRole('button', { name: /go to corpus map/i }))
    await screen.findByText(/every mark is about/i)

    const marks = container.querySelectorAll('.data-mark')
    expect(marks).toHaveLength(72)
    for (const mark of marks) expect(mark).toContainElement(mark.querySelector('i'))
  })

  it('prepares the next scene after the visible entrance settles', async () => {
    vi.useFakeTimers()
    try {
      const { container } = render(<Story initialData={demoWrapped} onClose={vi.fn()} />)

      await act(async () => {
        await Promise.resolve()
        await Promise.resolve()
      })
      act(() => vi.advanceTimersByTime(100))
      expect(container.querySelector('.scene-prewarm')).not.toBeInTheDocument()

      act(() => vi.advanceTimersByTime(1_400))
      expect(container.querySelector('.scene-prewarm')).toHaveClass('scene-motion--big-number')
    } finally {
      vi.useRealTimers()
    }
  })
})
