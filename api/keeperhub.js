export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const WEBHOOK_URL = 'https://app.keeperhub.com/api/workflows/iud0in5svs4owmttzbgwv/webhook'

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'CERBERUS_ALERT',
        severity: req.body.severity,
        contract: req.body.contractAddress,
        txHash: req.body.txHash,
        evidence: req.body.evidence,
        proposalId: req.body.id,
        timestamp: new Date().toISOString(),
      })
    })

    const text = await response.text()
    console.log('KeeperHub response:', response.status, text)

    return res.status(200).json({
      status: 'ok',
      keeperStatus: response.status,
      webhookUrl: WEBHOOK_URL,
    })
  } catch (err) {
    return res.status(500).json({ error: 'KeeperHub error', details: err.message })
  }
}
