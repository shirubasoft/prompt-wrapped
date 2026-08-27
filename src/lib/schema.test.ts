import { describe, expect, it } from 'vitest'

import { demoWrapped } from '../data/demo'
import { wrappedSchema } from './schema'

describe('Prompt Wrapped schema', () => {
  it('accepts the reference report', () => {
    expect(wrappedSchema.parse(demoWrapped)).toEqual(demoWrapped)
  })

  it('requires a useful scorecard and skill bundle', () => {
    const result = wrappedSchema.safeParse({ ...demoWrapped, scores: [], skills: [] })

    expect(result.success).toBe(false)
  })

  it('rejects skill names that cannot be folders', () => {
    const skills = [{ ...demoWrapped.skills[0], name: '../surprise' }]

    expect(wrappedSchema.safeParse({ ...demoWrapped, skills }).success).toBe(false)
  })
})
