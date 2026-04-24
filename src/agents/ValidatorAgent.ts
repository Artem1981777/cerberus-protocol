
import { ThreatProposal, AgentVote, Vote } from '../consensus/ConsensusEngine'

export async function validateProposal(
  proposal: ThreatProposal,
  agentId: string,
  apiKey?: string
): Promise<AgentVote> {
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKey || '',
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 200,
        system: 'You are ' + agentId + ', an independent security validator in Cerberus Protocol. Evaluate threat proposals critically. Respond ONLY with valid JSON: {"vote":"YES","reasoning":"explanation"}. Vote YES for CRITICAL/HIGH severity events.',
        messages: [{ role: 'user', content: 'Vote on: Event=' + proposal.eventType + ' Severity=' + proposal.severity + ' Evidence=' + proposal.evidence }]
      })
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    return {
      agentId,
      vote: (result.vote as Vote) || 'YES',
      reasoning: result.reasoning || 'Threat confirmed',
      timestamp: Date.now()
    }
  } catch {
    return {
      agentId,
      vote: proposal.severity === 'CRITICAL' ? 'YES' : 'ABSTAIN',
      reasoning: proposal.severity === 'CRITICAL' ? 'CRITICAL threat confirmed' : 'Unable to evaluate',
      timestamp: Date.now()
    }
  }
}

export async function runValidatorSwarm(proposal: ThreatProposal, apiKey?: string): Promise<AgentVote[]> {
  const validators = ['Cerberus-Head-2', 'Cerberus-Head-3']
  return Promise.all(validators.map(id => validateProposal(proposal, id, apiKey)))
}
