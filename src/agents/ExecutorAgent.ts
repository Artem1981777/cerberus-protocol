
import { ThreatProposal, AgentVote, ConsensusResult, evaluateConsensus } from '../consensus/ConsensusEngine'

export async function executeConsensus(
  proposal: ThreatProposal,
  votes: AgentVote[]
): Promise<ConsensusResult> {
  const outcome = evaluateConsensus(votes)
  const result: ConsensusResult = {
    proposalId: proposal.id,
    votes,
    outcome,
    yesCount: votes.filter(v => v.vote === 'YES').length,
    noCount: votes.filter(v => v.vote === 'NO').length,
    abstainCount: votes.filter(v => v.vote === 'ABSTAIN').length,
  }
  if (outcome === 'EXECUTE') {
    result.executedAt = Date.now()
    await Promise.all([
      triggerKeeperHub(proposal),
      writeToOG(proposal, result),
      sendTelegramAlert(proposal, result),
    ])
  }
  return result
}

async function sendTelegramAlert(proposal: ThreatProposal, result: ConsensusResult): Promise<void> {
  try {
    await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        severity: proposal.severity,
        evidence: proposal.evidence,
        txHash: proposal.txHash,
        proposalId: proposal.id,
        yesCount: result.yesCount,
        votes: result.votes.map(v => ({
          agentId: v.agentId,
          vote: v.vote,
          reasoning: v.reasoning
        })),
      })
    })
  } catch (e) { console.error('Telegram error:', e) }
}

async function triggerKeeperHub(proposal: ThreatProposal): Promise<void> {
  try {
    await fetch('/api/keeperhub', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ALERT', ...proposal })
    })
  } catch (e) { console.error('KeeperHub error:', e) }
}

async function writeToOG(proposal: ThreatProposal, result: ConsensusResult): Promise<void> {
  try {
    await fetch('/api/og-storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'CONSENSUS_RESULT', proposal, result, storedAt: Date.now() })
    })
  } catch (e) { console.error('0G error:', e) }
}
