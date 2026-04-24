import { Indexer, MemData } from '@0gfoundation/0g-ts-sdk'
import { ethers } from 'ethers'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const RPC_URL = 'https://evmrpc-testnet.0g.ai'
  const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai'
  const PRIVATE_KEY = process.env.PRIVATE_KEY

  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: 'PRIVATE_KEY not set' })
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const signer = new ethers.Wallet(PRIVATE_KEY, provider)
    const indexer = new Indexer(INDEXER_RPC)

    const payload = JSON.stringify({
      type: req.body.type || 'CERBERUS_AUDIT',
      proposal: req.body.proposal,
      result: req.body.result,
      storedAt: new Date().toISOString(),
      version: '1.0',
    })

    const file = new MemData(new TextEncoder().encode(payload))
    const [rootHash, err] = await indexer.upload(file, RPC_URL, signer)

    if (err) {
      console.error('0G upload error:', err)
      return res.status(500).json({ error: '0G upload failed', details: String(err) })
    }

    console.log('0G root hash:', rootHash)
    return res.status(200).json({
      status: 'ok',
      rootHash,
      scanUrl: 'https://storagescan.0g.ai/?hash=' + rootHash,
    })
  } catch (err) {
    console.error('0G error:', err)
    return res.status(500).json({ error: '0G error', details: err.message })
  }
}
