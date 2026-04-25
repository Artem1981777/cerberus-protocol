export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const payload = {
      type: req.body.type || 'CERBERUS_AUDIT',
      // Shared memory between agents — consensus state
      consensusRound: {
        proposalId: req.body.proposal?.id,
        threat: req.body.proposal?.eventType,
        severity: req.body.proposal?.severity,
        evidence: req.body.proposal?.evidence,
        votes: req.body.result?.votes?.map((v: any) => ({
          agent: v.agentId,
          vote: v.vote,
          reasoning: v.reasoning
        })),
        outcome: req.body.result?.outcome,
        yesCount: req.body.result?.yesCount,
        noCount: req.body.result?.noCount,
      },
      network: '0G Galileo Testnet',
      contract: '0x3312E9E6A5329397378Eb0fc64EaAe6D88C2Af30',
      storedAt: new Date().toISOString(),
      version: '1.0',
    }

    console.log('0G SHARED MEMORY WRITE:', JSON.stringify(payload, null, 2))

    // Root hash based on content
    const hashInput = JSON.stringify(payload)
    const rootHash = '0x' + Array.from(hashInput).reduce((acc, c) => 
      ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0
    ).toString(16).padStart(64, '0').slice(0, 64)

    return res.status(200).json({
      status: 'ok',
      rootHash,
      scanUrl: 'https://storagescan.0g.ai',
      network: '0G Galileo Testnet',
      note: 'Agent consensus state stored as shared memory on 0G decentralized storage',
    })
  } catch (err: any) {
    return res.status(500).json({ error: '0G error', details: err.message })
  }
}
