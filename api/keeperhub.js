export default async function handler(req, res) {
  const KEEPERHUB_API_KEY = process.env.KEEPERHUB_API_KEY
  const WORKFLOW_ID = 'iud0in5svs4owmttzbgwv'
  const WEBHOOK_URL = `https://app.keeperhub.com/api/workflows/${WORKFLOW_ID}/webhook`
  const SAFE_MODULE_ADDRESS = process.env.SAFE_MODULE_ADDRESS // Добавим в .env

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      workflowId: WORKFLOW_ID,
      integration: 'KeeperHub + Safe Protection',
      agentSwarm: { watcher: 'watcher.cerberusprotocol.eth', validatorA: 'validatora.cerberusprotocol.eth' }
    })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const severity = req.body.severity || 'CRITICAL';
    const reason = req.body.evidence || 'Suspicious activity detected by Cerberus AI';

    const payload = {
      event: 'CERBERUS_CONSENSUS_EXECUTED',
      severity: severity,
      contractAddress: req.body.contractAddress,
      evidence: reason,
      timestamp: new Date().toISOString(),
      source: 'Cerberus Protocol — ETHGlobal 2026'
    }

    // 1. Отправляем отчет в KeeperHub
    const khResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEEPERHUB_API_KEY}` },
      body: JSON.stringify(payload)
    })

    // 2. Если угроза критическая, автоматически блокируем Safe
    let safeStatus = 'NOT_TRIGGERED';
    if (severity === 'CRITICAL' && SAFE_MODULE_ADDRESS) {
      console.log('Cerberus AI: Critical threat! Locking Safe...');
      const protectionResponse = await fetch(`http://${req.headers.host}/api/safe-protection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity, reason, moduleAddress: SAFE_MODULE_ADDRESS })
      });
      const safeResult = await protectionResponse.json();
      safeStatus = safeResult.status;
    }

    return res.status(200).json({
      status: 'ok',
      keeperHubStatus: khResponse.status,
      safeProtectionStatus: safeStatus,
      payload
    })
  } catch (err) {
    return res.status(500).json({ error: 'Cerberus Orchestrator Error', details: err.message })
  }
}
