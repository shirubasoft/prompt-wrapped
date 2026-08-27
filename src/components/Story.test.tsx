import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { demoWrapped } from '../data/demo'
import { Story } from './Story'

describe('Story', () => {
  it('moves through scenes with controls and keyboard', async () => {
    const user = userEvent.setup()
    render(<Story initialData={demoWrapped} onClose={vi.fn()} />)

    expect(screen.getByText(/we read the prompts/i)).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: /an agent says "done"/i }))

    expect(await screen.findByText(/completion without execution is how trust issues are born/i)).toBeInTheDocument()
  })

  it('does not autoplay past an unanswered quiz', () => {
    vi.useFakeTimers()
    try {
      const { container } = render(<Story initialData={demoWrapped} onClose={vi.fn()} />)

      fireEvent.click(screen.getByRole('button', { name: /go to friction quiz/i }))
      act(() => vi.advanceTimersByTime(20_000))

      expect(container.firstChild).toHaveAttribute('data-scene', 'quiz')
      expect(screen.getByText(/which move got the loudest internal sigh/i)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
