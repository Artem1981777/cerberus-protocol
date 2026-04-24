
import { ThreatProposal, ThreatLevel, generateProposalId } from '../consensus/ConsensusEngine'

export interface OnChainEvent {
  txHash: string
  contractAddress: string
  eventName: string
  args: Record<string, any>
  blockNumber: number
}

export async function analyzeEvent(event: OnChainEvent, apiKey?: string): Promise<ThreatProposal | null> {
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKey || '',
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 200,
        system: 'You are Cerberus-Head-1, a smart contract security monitor. Respond ONLY with valid JSON, no markdown: {"isThreat":true,"severity":"CRITICAL","reason":"explanation"}. SuspiciousActivity events are ALWAYS threats with CRITICAL severity.',
        messages: [{ role: 'user', content: 'Analyze: Event=' + event.eventName + ' Args=' + JSON.stringify(event.args) }]
      })
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    if (!result.isThreat) return null
    return {
      id: generateProposalId(),
      timestamp: Date.now(),
      contractAddress: event.contractAddress,
      txHash: event.txHash,
      eventType: event.eventName,
      severity: result.severity as ThreatLevel,
      evidence: result.reason,
      proposedBy: 'Cerberus-Head-1'
    }
  } catch {
    if (event.eventName === 'SuspiciousActivity') {
      return {
        id: generateProposalId(),
        timestamp: Date.now(),
        contractAddress: event.contractAddress,
        txHash: event.txHash,
        eventType: event.eventName,
        severity: 'CRITICAL' as ThreatLevel,
        evidence: 'SuspiciousActivity detected on-chain',
        proposedBy: 'Cerberus-Head-1'
      }
    }
    return null
  }
}
