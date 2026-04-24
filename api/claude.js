export const config = { api: { bodyParser: true } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userKey = req.body.apiKey || ''
  const isGroq = userKey.startsWith('gsk_')
  const isAnthropic = userKey.startsWith('sk-ant')
  const { apiKey, ...body } = req.body

  try {
    if (isGroq) {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: body.max_tokens || 1000,
          messages: [
            ...(body.system ? [{ role: 'system', content: body.system }] : []),
            ...(body.messages || []),
          ],
        }),
      })
      const data = await r.json()
      if (!r.ok) return res.status(r.status).json(data)
      const text = data.choices?.[0]?.message?.content || ''
      return res.status(200).json({ content: [{ type: 'text', text }] })
    }

    if (isAnthropic) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': userKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      return res.status(r.status).json(data)
    }

    return res.status(401).json({ error: 'Invalid key. Use sk-ant-... or gsk_...' })
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', details: err.message })
  }
}
