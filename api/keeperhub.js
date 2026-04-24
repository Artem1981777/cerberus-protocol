export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  // TODO: KeeperHub execution
  return res.status(200).json({ status: 'ok', txHash: null, message: 'KeeperHub placeholder' })
}
