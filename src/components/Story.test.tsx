import { render, screen } from '@testing-library/react'
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
})
