export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const KEEPERHUB_API_KEY = process.env.KEEPERHUB_API_KEY
  const WEBHOOK_URL = 'https://app.keeperhub.com/api/workflows/iud0in5svs4owmttzbgwv/webhook'

  try {
    const payload = {
      event: 'CERBERUS_CONSENSUS_EXECUTED',
      severity: req.body.severity,
      contractAddress: req.body.contractAddress,
      txHash: req.body.txHash,
      evidence: req.body.evidence,
      proposalId: req.body.id,
      proposedBy: req.body.proposedBy,
      agentSwarm: {
        watcher: 'watcher.cerberusprotocol.eth',
        validatorA: 'validatora.cerberusprotocol.eth',
        validatorB: 'validatorb.cerberusprotocol.eth',
      },
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(KEEPERHUB_API_KEY ? { 'Authorization': `Bearer ${KEEPERHUB_API_KEY}` } : {})
      },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    console.log('KeeperHub response:', response.status, text)

    return res.status(200).json({
      status: 'ok',
      keeperStatus: response.status,
      payload,
    })
  } catch (err) {
    return res.status(500).json({ error: 'KeeperHub error', details: err.message })
  }
}
