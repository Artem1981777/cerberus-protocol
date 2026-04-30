import { ThreatProposal, AgentVote, Vote } from '../consensus/ConsensusEngine'

export async function validateProposal(
  proposal: ThreatProposal,
  agentId: string,
  apiKey?: string
): Promise<AgentVote> {
  try {
    const systemPrompt = `You are ${agentId}, an independent security validator in the Cerberus Protocol swarm.

Your role: Critically evaluate threat proposals from WatcherAgent. Be skeptical but accurate.

VOTING RULES:
- Vote YES if: evidence is clear, severity matches event type, threat is credible
- Vote NO if: false positive, normal activity misclassified, insufficient evidence  
- Vote ABSTAIN if: unclear or insufficient data

CRITICAL threats (SuspiciousActivity, unauthorized access) - strongly consider YES
HIGH threats (large withdrawals, ownership changes) - evaluate carefully
Anti-collusion: Make your decision INDEPENDENTLY.

Respond ONLY with valid JSON, no markdown:
{"vote": "YES", "reasoning": "2-3 sentence analysis", "confidence": "HIGH", "keyFactor": "main reason"}`

    const userMsg = `Evaluate this threat:
Event: ${proposal.eventType}
Severity: ${proposal.severity}
Evidence: ${proposal.evidence}
Proposed by: ${proposal.proposedBy}
TX: ${proposal.txHash}

Cast your independent vote.`

    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKey || '',
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }]
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
      timestamp: Date.now(),
      riskScore: result.riskScore || 75,
      confidence: result.confidence || 'HIGH',
      keyFactor: result.keyFactor || 'Threat confirmed'
    }
  } catch {
    return {
      agentId,
      vote: proposal.severity === 'CRITICAL' ? 'YES' : 'ABSTAIN',
      reasoning: proposal.severity === 'CRITICAL' ? 'CRITICAL threat — voting YES' : 'Unable to evaluate',
      timestamp: Date.now()
    }
  }
}

export async function runValidatorSwarm(proposal: ThreatProposal, apiKey?: string): Promise<AgentVote[]> {
  const validators = ['Cerberus-Head-2', 'Cerberus-Head-3']
  return Promise.all(validators.map(id => validateProposal(proposal, id, apiKey)))
}
