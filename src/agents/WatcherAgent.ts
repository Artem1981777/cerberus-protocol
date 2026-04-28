
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
        system: `You are Cerberus-Head-1, an expert smart contract security monitor with deep knowledge of DeFi exploits, reentrancy attacks, flash loans, and unauthorized access patterns.

THREAT CLASSIFICATION RULES:
- SuspiciousActivity event: ALWAYS CRITICAL threat
- Withdrawal > 10 ETH (10000000000000000000 wei): HIGH threat
- OwnershipTransferred to unknown address: HIGH threat  
- Any unauthorized access attempt: CRITICAL threat
- Normal deposits < 1 ETH: NOT a threat
- Regular small withdrawals by owner: NOT a threat

Respond ONLY with valid JSON, no markdown, no explanation outside JSON:
{"isThreat": boolean, "severity": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "reason": "one sentence explanation", "attackVector": "what type of attack this could be", "recommendation": "what action to take"}`,
        messages: [{ role: 'user', content: 'Analyze this on-chain event for security threats:\nEvent: ' + event.eventName + '\nArgs: ' + JSON.stringify(event.args) + '\nContract: ' + event.contractAddress + '\nBlock: ' + event.blockNumber }]
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
