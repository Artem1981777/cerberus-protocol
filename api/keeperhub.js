export default async function handler(req, res) {
  const KEEPERHUB_API_KEY = process.env.KEEPERHUB_API_KEY
  const WORKFLOW_ID = 'iud0in5svs4owmttzbgwv'
  const WEBHOOK_URL = `https://app.keeperhub.com/api/workflows/${WORKFLOW_ID}/webhook`

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      workflowId: WORKFLOW_ID,
      webhookUrl: WEBHOOK_URL,
      integration: 'KeeperHub REST API + Webhook',
      agentSwarm: {
        watcher: 'watcher.cerberusprotocol.eth',
        validatorA: 'validatora.cerberusprotocol.eth',
        validatorB: 'validatorb.cerberusprotocol.eth',
      }
    })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const payload = {
      event: 'CERBERUS_CONSENSUS_EXECUTED',
      severity: req.body.severity || 'CRITICAL',
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
      source: 'Cerberus Protocol — ETHGlobal Open Agents 2026'
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEEPERHUB_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    console.log('KeeperHub response:', response.status, text)

    return res.status(200).json({
      status: 'ok',
      webhookStatus: response.status,
      workflowId: WORKFLOW_ID,
      payload,
    })
  } catch (err) {
    return res.status(500).json({ error: 'KeeperHub error', details: err.message })
  }
}
