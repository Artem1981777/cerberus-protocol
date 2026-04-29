export default async function handler(req, res) {
  const agentProfiles = {
    'watcher.cerberusprotocol.eth': {
      address: '0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD',
      role: 'WatcherAgent — Cerberus Head-1',
      description: 'Cerberus Head-1: threat detection agent — monitors on-chain events and proposes security threats to validator swarm',
      capabilities: 'threat-detection,consensus-proposal,on-chain-monitoring',
      url: 'https://cerberus-protocol.vercel.app',
      network: 'Sepolia Testnet',
      contract: '0x6eb6fde2d2462b0afa9f169372677fd69955bad8',
      textRecords: 'on-chain verified',
    },
    'validatora.watcher.cerberusprotocol.eth': {
      address: '0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD',
      role: 'ValidatorAgent-A — Cerberus Head-2',
      description: 'Cerberus Head-2: independent validator agent — evaluates threat proposals and casts consensus vote',
      capabilities: 'threat-validation,consensus-voting,independent-analysis',
      url: 'https://cerberus-protocol.vercel.app',
      network: 'Sepolia Testnet',
      textRecords: 'on-chain verified',
    },
    'validatorb.validatora.watcher.cerberusprotocol.eth': {
      address: '0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD',
      role: 'ValidatorAgent-B — Cerberus Head-3',
      description: 'Cerberus Head-3: independent validator agent — evaluates threat proposals and casts consensus vote',
      capabilities: 'threat-validation,consensus-voting,independent-analysis',
      url: 'https://cerberus-protocol.vercel.app',
      network: 'Sepolia Testnet',
      textRecords: 'on-chain verified',
    },
    'cerberusprotocol.eth': {
      address: '0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD',
      role: 'CerberusProtocol — Root Identity',
      description: 'Three-headed AI security swarm for smart contract monitoring',
      capabilities: 'multi-agent-consensus,threat-detection,on-chain-execution',
      url: 'https://cerberus-protocol.vercel.app',
      github: 'https://github.com/Artem1981777/cerberus-protocol',
      network: 'Sepolia Testnet',
      textRecords: 'on-chain verified',
    }
  }

  const { name } = req.query || {}
  
  if (name && agentProfiles[name]) {
    return res.status(200).json({
      ensName: name,
      resolved: agentProfiles[name],
      registry: 'sepolia.app.ens.domains',
      note: 'Text records stored on-chain — ENS provides verifiable identity for each Cerberus agent'
    })
  }

  return res.status(200).json({
    protocol: 'cerberusprotocol.eth',
    agents: agentProfiles,
    registry: 'sepolia.app.ens.domains',
    note: 'Each agent verified by ENS identity before consensus participation',
    verifyAt: 'https://sepolia.app.ens.domains/cerberusprotocol.eth'
  })
}
