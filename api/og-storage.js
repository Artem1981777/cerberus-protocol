export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const payload = {
      type: req.body.type || 'CERBERUS_AUDIT',
      proposal: req.body.proposal,
      result: req.body.result,
      storedAt: new Date().toISOString(),
      network: '0G Testnet',
      indexer: 'https://indexer-storage-testnet-turbo.0g.ai',
    }

    // Log to console (Vercel logs) as audit trail
    console.log('0G AUDIT LOG:', JSON.stringify(payload))

    // Return mock rootHash for demo
    const mockHash = '0x' + Buffer.from(JSON.stringify(payload)).toString('hex').slice(0, 64)

    return res.status(200).json({
      status: 'ok',
      rootHash: mockHash,
      scanUrl: 'https://storagescan.0g.ai',
      note: 'Audit data logged — full 0G upload requires wallet signing',
    })
  } catch (err) {
    return res.status(500).json({ error: '0G error', details: err.message })
  }
}
