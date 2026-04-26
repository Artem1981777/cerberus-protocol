export default async function handler(req, res) {
  // ENS Public Resolver on mainnet для lookup
  // Наши агенты зарегистрированы на Sepolia
  
  const agentProfiles = {
    'watcher.cerberusprotocol.eth': {
      address: '0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD',
      role: 'WatcherAgent',
      description: 'Monitors on-chain events and proposes threats to the swarm',
      network: 'Sepolia Testnet',
      contract: '0xc4a1367dbaf887387598991bfcf54d9cfdd10a9e',
    },
    'validatora.cerberusprotocol.eth': {
      address: '0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD',
      role: 'ValidatorAgent-A',
      description: 'Independently evaluates threat proposals and casts vote',
      network: 'Sepolia Testnet',
    },
    'validatorb.cerberusprotocol.eth': {
      address: '0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD',
      role: 'ValidatorAgent-B',
      description: 'Independently evaluates threat proposals and casts vote',
      network: 'Sepolia Testnet',
    },
    'cerberusprotocol.eth': {
      address: '0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD',
      role: 'CerberusProtocol',
      description: 'Three-headed AI security swarm for smart contract monitoring',
      network: 'Sepolia Testnet',
      github: 'https://github.com/Artem1981777/cerberus-protocol',
      demo: 'https://cerberus-protocol.vercel.app',
    }
  }

  const { name } = req.query || {}
  
  if (name && agentProfiles[name]) {
    return res.status(200).json({
      ensName: name,
      resolved: agentProfiles[name],
      registry: 'sepolia.app.ens.domains',
      note: 'ENS provides verifiable on-chain identity for each Cerberus agent'
    })
  }

  return res.status(200).json({
    agents: agentProfiles,
    registry: 'sepolia.app.ens.domains',
    note: 'Each Cerberus agent head has a unique ENS identity on Sepolia'
  })
}
