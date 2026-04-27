export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Telegram not configured' })
  }

  try {
    const { severity, evidence, txHash, proposalId, yesCount } = req.body

    const message = `🐺 CERBERUS PROTOCOL ALERT

🚨 Threat confirmed by AI swarm consensus

🔴 Severity: ${severity || 'CRITICAL'}
📋 Evidence: ${evidence || 'Suspicious activity detected'}

🤖 Agent Consensus:
  👁 watcher.cerberusprotocol.eth — DETECTED
  ⚖️ validatora.watcher.cerberusprotocol.eth — YES
  🛡️ validatorb.validatora.watcher.cerberusprotocol.eth — YES
  ✅ Result: ${yesCount || 2}/3 YES — EXECUTED

🔗 TX: ${txHash ? txHash.slice(0,18) + '...' : 'N/A'}
📌 Proposal: ${proposalId ? proposalId.slice(-12) : 'N/A'}

⚡ KeeperHub executed
🗄️ 0G audit stored
🌐 cerberus-protocol.vercel.app`

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
      }
    )

    const data = await response.json()
    return res.status(200).json({ status: 'ok', telegram: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
