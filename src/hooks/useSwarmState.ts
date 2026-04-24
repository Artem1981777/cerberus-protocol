
import { useState, useCallback } from 'react'
import { ThreatProposal, AgentVote, ConsensusResult } from '../consensus/ConsensusEngine'
import { analyzeEvent, OnChainEvent } from '../agents/WatcherAgent'
import { runValidatorSwarm } from '../agents/ValidatorAgent'
import { executeConsensus } from '../agents/ExecutorAgent'

export type SwarmStatus = 'idle' | 'watching' | 'voting' | 'executing' | 'done'

export interface SwarmState {
  status: SwarmStatus
  currentProposal: ThreatProposal | null
  votes: AgentVote[]
  result: ConsensusResult | null
  log: string[]
}

export function useSwarmState() {
  const [state, setState] = useState<SwarmState>({
    status: 'idle', currentProposal: null, votes: [], result: null, log: []
  })

  const addLog = (msg: string) =>
    setState(s => ({ ...s, log: ['[' + new Date().toISOString() + '] ' + msg, ...s.log] }))

  const runSwarm = useCallback(async (event: OnChainEvent, apiKey?: string) => {
    setState(s => ({ ...s, status: 'watching', currentProposal: null, votes: [], result: null }))
    addLog('Cerberus-Head-1 analyzing: ' + event.eventName + ' @ ' + event.txHash.slice(0, 10) + '...')

    const proposal = await analyzeEvent(event, apiKey)
    if (!proposal) {
      addLog('No threat detected. All clear.')
      setState(s => ({ ...s, status: 'idle' }))
      return
    }

    addLog('⚠️ THREAT: ' + proposal.severity + ' — ' + proposal.evidence)
    setState(s => ({ ...s, status: 'voting', currentProposal: proposal }))

    addLog('Sending to Cerberus-Head-2 and Head-3...')
    const votes = await runValidatorSwarm(proposal, apiKey)
    setState(s => ({ ...s, votes }))
    votes.forEach(v => addLog(v.agentId + ': ' + v.vote + ' — ' + v.reasoning.slice(0, 80)))

    setState(s => ({ ...s, status: 'executing' }))
    const result = await executeConsensus(proposal, votes)
    setState(s => ({ ...s, result, status: 'done' }))

    if (result.outcome === 'EXECUTE') {
      addLog('✅ EXECUTED — KeeperHub alerted, 0G audit written. ID: ' + proposal.id)
    } else {
      addLog('❌ DISCARDED — insufficient consensus (' + result.yesCount + '/' + votes.length + ' YES)')
    }
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle', currentProposal: null, votes: [], result: null, log: [] })
  }, [])

  return { state, runSwarm, reset }
}
