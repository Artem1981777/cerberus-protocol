export const CONSENSUS_THRESHOLD = 2 / 3
export const AGENT_COUNT = 3
export const POLL_INTERVAL_MS = 5000

export const AGENTS = {
  WATCHER: 'Cerberus-Head-1',
  VALIDATOR_A: 'Cerberus-Head-2',
  VALIDATOR_B: 'Cerberus-Head-3',
} as const

export const VOTE = {
  YES: 'YES',
  NO: 'NO',
  ABSTAIN: 'ABSTAIN',
} as const
