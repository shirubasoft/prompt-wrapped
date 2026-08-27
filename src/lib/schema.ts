import { z } from 'zod'

export const themeIds = [
  'neon-orbit',
  'terminal-signal',
  'paper-cut',
  'cosmic-lava',
  'blueprint',
  'pixel-arcade',
] as const

export type ThemeId = (typeof themeIds)[number]

const confidenceSchema = z.enum(['high', 'medium', 'low'])

export const wrappedSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string().min(1),
  harness: z.string().min(1).max(80),
  theme: z.enum(themeIds),
  developer: z.object({
    displayName: z.string().min(1).max(80),
    archetype: z.string().min(1).max(100),
    title: z.string().min(1).max(120),
    tagline: z.string().min(1).max(180),
    summary: z.string().min(1).max(700),
  }),
  coverage: z.object({
    sources: z.array(
      z.object({
        name: z.string().min(1).max(80),
        prompts: z.number().int().nonnegative().nullable(),
        sessions: z.number().int().nonnegative().nullable(),
        status: z.enum(['analyzed', 'partial', 'unavailable']),
      }),
    ),
    totalPrompts: z.number().int().nonnegative(),
    window: z.string().min(1).max(160),
    limitations: z.array(z.string().min(1).max(240)).max(8),
  }),
  scores: z
    .array(
      z.object({
        key: z.string().min(1).max(40),
        label: z.string().min(1).max(60),
        score: z.number().min(1).max(10),
        confidence: confidenceSchema,
        reason: z.string().min(1).max(280),
      }),
    )
    .min(6)
    .max(12),
  fingerprint: z.object({
    shipsLike: z.string().min(1).max(240),
    debugsLike: z.string().min(1).max(240),
    testsLike: z.string().min(1).max(240),
    communicatesLike: z.string().min(1).max(240),
  }),
  strengths: z.array(z.string().min(1).max(180)).min(3).max(6),
  friction: z.array(z.string().min(1).max(180)).min(3).max(6),
  moments: z
    .array(
      z.object({
        label: z.string().min(1).max(60),
        value: z.string().min(1).max(80),
        detail: z.string().min(1).max(220),
      }),
    )
    .min(3)
    .max(6),
  skills: z
    .array(
      z.object({
        name: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .max(63),
        description: z.string().min(1).max(300),
        trigger: z.string().min(1).max(220),
        content: z.string().min(20).max(12_000),
      }),
    )
    .min(1)
    .max(6),
  share: z.object({
    closingLine: z.string().min(1).max(180),
    accentWords: z.array(z.string().min(1).max(32)).min(2).max(5),
  }),
})

export type WrappedData = z.infer<typeof wrappedSchema>
