export default async function handler(req, res) {
  const KEEPERHUB_API_KEY = process.env.KEEPERHUB_API_KEY
  const WORKFLOW_ID = 'iud0in5svs4owmttzbgwv'
  const BASE_URL = 'https://app.keeperhub.com/api'

  if (req.method === 'GET') {
    // Получаем runs через REST API
    try {
      const runsRes = await fetch(`${BASE_URL}/workflows/${WORKFLOW_ID}/runs`, {
        headers: { 'Authorization': `Bearer ${KEEPERHUB_API_KEY}` }
      })
      const runs = await runsRes.json()
      return res.status(200).json({ status: 'ok', runs, workflowId: WORKFLOW_ID })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Триггерим webhook с полным payload
    const WEBHOOK_URL = `${BASE_URL}/workflows/${WORKFLOW_ID}/webhook`

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
    console.log('KeeperHub webhook response:', response.status, text)

    // Также получаем список runs для подтверждения
    const runsRes = await fetch(`${BASE_URL}/workflows`, {
      headers: { 'Authorization': `Bearer ${KEEPERHUB_API_KEY}` }
    })
    const workflows = await runsRes.json()
    const ourWorkflow = Array.isArray(workflows) ? workflows.find(w => w.id === WORKFLOW_ID) : null

    return res.status(200).json({
      status: 'ok',
      webhookStatus: response.status,
      payload,
      workflowId: WORKFLOW_ID,
      workflowName: ourWorkflow?.name || 'Cerberus Alert Workflow',
    })
  } catch (err) {
    console.error('KeeperHub error:', err)
    return res.status(500).json({ error: 'KeeperHub error', details: err.message })
  }
}
