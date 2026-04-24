export default async function handler(req, res) {
  const RPC_URL = process.env.VITE_RPC_URL
  const CONTRACT = process.env.VITE_CONTRACT_ADDRESS

  try {
    const blockRes = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'eth_blockNumber' })
    })
    const blockData = await blockRes.json()
    const currentBlock = parseInt(blockData.result, 16)

    const logsRes = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 2, jsonrpc: '2.0', method: 'eth_getLogs',
        params: [{ address: CONTRACT, fromBlock: '0x' + (currentBlock - 5).toString(16), toBlock: '0x' + currentBlock.toString(16) }]
      })
    })
    const logsData = await logsRes.json()
    return res.status(200).json({ currentBlock, logs: logsData.result || [], error: logsData.error || null })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
