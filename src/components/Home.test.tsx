import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Home } from './Home'

describe('Home', () => {
  it('shows an OS-adapted command for every harness', async () => {
    const user = userEvent.setup()
    render(<Home onOpen={vi.fn()} />)

    expect(screen.getByText(/curl -fsSL/)).toHaveTextContent(/codex/)
    for (const [name, id] of [
      ['Claude Code', 'claude'],
      ['OpenCode', 'opencode'],
      ['Copilot', 'copilot'],
      ['Agy', 'agy'],
      ['Qwen Code', 'qwen'],
    ]) {
      await user.click(screen.getByRole('radio', { name: new RegExp(name) }))
      expect(screen.getByText(/curl -fsSL/)).toHaveTextContent(new RegExp(id))
    }
    await user.click(screen.getByRole('radio', { name: /Claude Code/ }))
    await user.click(screen.getByRole('button', { name: 'Windows' }))
    expect(screen.getByText(/scriptblock/)).toHaveTextContent(/-Harness claude/)
  })

  it('offers the supported popular harnesses as a custom picker', () => {
    render(<Home onOpen={vi.fn()} />)

    for (const name of ['Codex', 'Claude Code', 'OpenCode', 'Copilot', 'Agy', 'Qwen Code']) {
      expect(screen.getByRole('radio', { name: new RegExp(name) })).toBeInTheDocument()
    }
    expect(screen.queryByRole('radio', { name: /Gemini CLI/ })).not.toBeInTheDocument()
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
