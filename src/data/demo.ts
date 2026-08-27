import type { WrappedData } from '../lib/schema'

export const demoWrapped: WrappedData = {
  version: 1,
  generatedAt: '2026-08-27T12:00:00Z',
  harness: 'Codex',
  theme: 'neon-orbit',
  developer: {
    displayName: 'Daniel',
    archetype: 'The Evidence Goblin',
    title: 'Patron Saint of "Did You Actually Run It?"',
    tagline: 'Small architecture. Real dependencies. Receipts or it did not happen.',
    summary:
      'You give agents room to move, then demand the one thing they keep trying to substitute with confidence: observable proof. You like systems compact, ownership obvious, and every celebratory "done" attached to a command that actually ran.',
  },
  coverage: {
    sources: [
      { name: 'Codex', prompts: 653, sessions: 157, status: 'analyzed' },
      { name: 'Claude Code', prompts: 912, sessions: 251, status: 'analyzed' },
      { name: 'Cursor', prompts: 146, sessions: 45, status: 'analyzed' },
      { name: 'GitHub Copilot', prompts: 79, sessions: 28, status: 'analyzed' },
      { name: 'Gemini CLI', prompts: 9, sessions: 4, status: 'partial' },
      { name: 'ChatGPT', prompts: null, sessions: null, status: 'unavailable' },
    ],
    totalPrompts: 1799,
    window: 'December 2025 to August 2026',
    limitations: [
      'ChatGPT message bodies were unavailable locally.',
      'Remote-only and deleted conversations were outside this snapshot.',
    ],
  },
  scores: [
    {
      key: 'validation',
      label: 'Receipts demanded',
      score: 9.7,
      confidence: 'high',
      reason: 'You repeatedly turn "looks correct" into a real build, browser run, sample, benchmark, or CI check.',
    },
    {
      key: 'architecture',
      label: 'Architecture restraint',
      score: 9.1,
      confidence: 'high',
      reason: 'You reach for one source of truth and make abstractions earn rent before they get a folder.',
    },
    {
      key: 'debugging',
      label: 'Debugging discipline',
      score: 9.4,
      confidence: 'high',
      reason: 'Logs, traces, runtime state, and reproduction beat a plausible theory every time.',
    },
    {
      key: 'testing',
      label: 'Test boundary honesty',
      score: 9.5,
      confidence: 'high',
      reason: 'A mock may prove a unit. You refuse to let it cosplay as a working integration.',
    },
    {
      key: 'docs',
      label: 'Documentation signal',
      score: 8.8,
      confidence: 'high',
      reason: 'You want a short useful front door, detailed references behind it, and commands that still exist.',
    },
    {
      key: 'product',
      label: 'Workflow empathy',
      score: 9.0,
      confidence: 'high',
      reason: 'Every new manual step is treated as a product regression until proven necessary.',
    },
    {
      key: 'operations',
      label: 'Rollback instincts',
      score: 8.2,
      confidence: 'medium',
      reason: 'Risky machine and deployment changes need a known-good state and a way back.',
    },
    {
      key: 'communication',
      label: 'Decision density',
      score: 8.9,
      confidence: 'high',
      reason: 'You cut chronology and filler, but keep the evidence and tradeoffs needed to decide.',
    },
  ],
  fingerprint: {
    shipsLike: 'A release captain who checks the lifeboats, then asks CI for its boarding pass.',
    debugsLike: 'A courtroom cross-examination where the logs are sworn in before the hypothesis.',
    testsLike: 'A border inspector. Every test must declare which boundary it actually crossed.',
    communicatesLike: 'A very polite editor holding a red pen over the phrase "should work."',
  },
  strengths: [
    'Turns fuzzy completion claims into observable acceptance paths.',
    'Keeps systems small without pretending future variation does not exist.',
    'Protects the user workflow from accidental setup taxes.',
    'Challenges premises, including your own, when evidence changes.',
  ],
  friction: [
    'An agent says "done" after reading the code but before running it.',
    'A mocked dependency arrives wearing an integration-test name tag.',
    'A five-layer abstraction appears to save twelve lines.',
    'Documentation turns into a transcript of how the task happened.',
  ],
  moments: [
    {
      label: 'Most replayed phrase',
      value: 'Did you run it?',
      detail: 'The unofficial checksum for every implementation handoff.',
    },
    {
      label: 'Natural predator',
      value: 'Fake abstractions',
      detail: 'Especially the ones that leak the technology they claim to hide.',
    },
    {
      label: 'Love language',
      value: 'A green real-path test',
      detail: 'Bonus points when it uses the same defaults as a first-time user.',
    },
    {
      label: 'Plot twist',
      value: 'Flashy is allowed',
      detail: 'Clean tools, expressive stories, and readability in both.',
    },
  ],
  skills: [
    {
      name: 'prove-the-user-path',
      description: 'Prove executable changes through the closest safe version of the real user workflow.',
      trigger: 'Implementation, repair, migration, or integration work changes executable behavior.',
      content: `---\nname: prove-the-user-path\ndescription: Prove executable changes through the closest safe version of the real user workflow.\n---\n\n# Prove the user path\n\nName the acceptance path before editing. Run focused checks and the closest safe real entry point before handoff. Report what ran and what remains unverified.`,
    },
    {
      name: 'diagnose-from-evidence',
      description: 'Establish causes from runtime evidence before proposing or implementing a repair.',
      trigger: 'Unexpected behavior where the cause has not been established.',
      content: `---\nname: diagnose-from-evidence\ndescription: Establish causes from runtime evidence before proposing or implementing a repair.\n---\n\n# Diagnose from evidence\n\nCapture expected and observed behavior. Inspect native evidence and test the leading explanation. Keep diagnosis separate from an authorized repair.`,
    },
    {
      name: 'keep-one-source-of-truth',
      description: 'Keep generated values, configuration, commands, and ownership in one authoritative path.',
      trigger: 'Configuration, generated values, derived names, replacement, or removal work.',
      content: `---\nname: keep-one-source-of-truth\ndescription: Keep generated values, configuration, commands, and ownership in one authoritative path.\n---\n\n# Keep one source of truth\n\nName the owner of each value and flow data from it. Remove residual paths when replacing behavior unless compatibility is part of the contract.`,
    },
  ],
  share: {
    closingLine: 'May your diffs stay small and your claims remain reproducible.',
    accentWords: ['evidence', 'restraint', 'real paths', 'tiny diffs'],
  },
}
