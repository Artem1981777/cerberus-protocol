export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  // TODO: 0G decentralized storage
  return res.status(200).json({ status: 'ok', cid: null, message: '0G storage placeholder' })
}
