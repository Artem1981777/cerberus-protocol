
import { useState, useEffect, useRef } from 'react'
import { OnChainEvent } from '../agents/WatcherAgent'

const TOPICS: Record<string, string> = {
  '0x40922f8c881e62d6da07ec2839381f754d79179a6411959f2492e225db4b2ca5': 'SuspiciousActivity',
  '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c': 'Deposit',
  '0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364': 'Withdrawal',
}

export function useOnChainMonitor(onEvent: (event: OnChainEvent) => void) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastBlock, setLastBlock] = useState(0)
  const [error, setError] = useState('')
  const seenTxs = useRef<Set<string>>(new Set())
  const intervalRef = useRef<any>(null)
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''

  const pollEvents = async () => {
    try {
      const res = await fetch('/api/poll-events')
      const data = await res.json()
      if (data.error) { setError(data.error.message || 'RPC error'); return }
      setLastBlock(data.currentBlock)
      setError('')
      for (const log of (data.logs || [])) {
        if (seenTxs.current.has(log.transactionHash)) continue
        seenTxs.current.add(log.transactionHash)
        const eventName = TOPICS[log.topics[0]] || 'Unknown'
        onEvent({
          txHash: log.transactionHash,
          contractAddress: log.address,
          eventName,
          args: { topics: log.topics, data: log.data },
          blockNumber: parseInt(log.blockNumber, 16),
        })
      }
    } catch (e: any) { setError('Poll error: ' + e.message) }
  }

  const startMonitoring = () => {
    if (isMonitoring) return
    seenTxs.current.clear()
    setIsMonitoring(true)
    setError('')
    pollEvents()
    intervalRef.current = setInterval(pollEvents, 5000)
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  useEffect(() => { return () => stopMonitoring() }, [])

  return { isMonitoring, lastBlock, error, startMonitoring, stopMonitoring, CONTRACT_ADDRESS }
}
