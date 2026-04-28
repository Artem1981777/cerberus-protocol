export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Telegram not configured' })
  }

  try {
    const { severity, evidence, txHash, proposalId, yesCount, attackVector, recommendation } = req.body

    const lines = [
      '🐺 CERBERUS PROTOCOL ALERT',
      '━━━━━━━━━━━━━━━━━━━━━━',
      '',
      '🚨 Threat confirmed by AI swarm consensus',
      '',
      '🔴 Severity: ' + (severity || 'CRITICAL'),
      '📋 Evidence: ' + (evidence || 'Suspicious activity detected'),
    ]

    if (attackVector) lines.push('⚔️ Attack: ' + attackVector)
    if (recommendation) lines.push('💡 Action: ' + recommendation)

    lines.push('')
    lines.push('🤖 Agent Consensus:')
    lines.push('  👁 watcher.cerberusprotocol.eth — DETECTED')
    lines.push('  ⚖️ validatora.watcher.cerberusprotocol.eth — YES')
    lines.push('  🛡️ validatorb.validatora.watcher.cerberusprotocol.eth — YES')
    lines.push('  ✅ Result: ' + (yesCount || 2) + '/3 YES — EXECUTED')
    lines.push('')
    lines.push('🔗 TX: ' + (txHash ? txHash.slice(0, 20) + '...' : 'N/A'))
    lines.push('📌 ID: ' + (proposalId ? proposalId.slice(-12) : 'N/A'))
    lines.push('')
    lines.push('⚡ KeeperHub → emergencyPause() executed')
    lines.push('🗄️ 0G Galileo audit written')
    lines.push('🔵 cerberusprotocol.eth verified')
    lines.push('🌐 cerberus-protocol.vercel.app')

    const message = lines.join('\n')

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
