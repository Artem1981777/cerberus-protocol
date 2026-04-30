
export type Vote = 'YES' | 'NO' | 'ABSTAIN'
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ThreatProposal {
  id: string
  timestamp: number
  contractAddress: string
  txHash: string
  eventType: string
  severity: ThreatLevel
  evidence: string
  proposedBy: string
}

export interface AgentVote {
  agentId: string
  vote: Vote
  reasoning: string
  timestamp: number
  riskScore?: number
  confidence?: string
  keyFactor?: string
}

export interface ConsensusResult {
  proposalId: string
  votes: AgentVote[]
  outcome: 'EXECUTE' | 'DISCARD'
  yesCount: number
  noCount: number
  abstainCount: number
  executedAt?: number
}

export const THRESHOLD = 2 / 3

export function evaluateConsensus(votes: AgentVote[]): 'EXECUTE' | 'DISCARD' {
  const yes = votes.filter(v => v.vote === 'YES').length
  const total = votes.filter(v => v.vote !== 'ABSTAIN').length
  if (total === 0) return 'DISCARD'
  return yes / total >= THRESHOLD ? 'EXECUTE' : 'DISCARD'
}

export function generateProposalId(): string {
  return 'prop_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}
