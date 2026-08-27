import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Home } from './Home'

describe('Home', () => {
  it('shows an OS-adapted command for every harness', async () => {
    const user = userEvent.setup()
    render(<Home onOpen={vi.fn()} />)

    expect(screen.getByText(/curl -fsSL/)).toHaveTextContent(/codex/)
    await user.selectOptions(screen.getByLabelText('1. Pick your agent'), 'claude')
    expect(screen.getByText(/curl -fsSL/)).toHaveTextContent(/claude/)
    await user.click(screen.getByRole('button', { name: 'Windows' }))
    expect(screen.getByText(/scriptblock/)).toHaveTextContent(/-Harness claude/)
  })

  it('opens the reference story without a model run', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<Home onOpen={onOpen} />)

    await user.click(screen.getByRole('button', { name: /watch the demo/i }))
    expect(onOpen).toHaveBeenCalledOnce()
    expect(location.hash).toMatch(/^#data=/)
  })
})
