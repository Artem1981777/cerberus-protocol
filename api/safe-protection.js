import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { severity, reason, moduleAddress } = req.body;

  // Блокируем Safe только при критической угрозе
  if (severity !== 'CRITICAL') {
    return res.status(200).json({ status: 'ignored', reason: 'Severity not high enough' });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // ABI нашего нового модуля (только нужная функция)
    const abi = ["function triggerEmergencyLock(string calldata reason) external"];
    const safeModule = new ethers.Contract(moduleAddress, abi, wallet);

    console.log('Cerberus: Initiating Safe Emergency Lock...');
    const tx = await safeModule.triggerEmergencyLock(reason || "AI detected suspicious activity");
    await tx.wait();

    return res.status(200).json({
      status: 'SAFE_LOCKED',
      txHash: tx.hash,
      reason: reason
    });
  } catch (err) {
    console.error('Safe protection error:', err);
    return res.status(500).json({ error: 'Failed to lock Safe', details: err.message });
  }
}
