# Cerberus Protocol — Architecture

## Overview

Cerberus Protocol is a decentralized AI security swarm for smart contract monitoring.
Three independent AI agents (three heads) monitor on-chain activity, reach peer consensus,
and execute protective actions without any central coordinator.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cerberus Protocol                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Dashboard (Vercel)               │   │
│  │         cerberus-protocol.vercel.app                │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                       │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │           Vercel Serverless API Layer               │   │
│  │  /api/claude.js  /api/keeperhub.js  /api/og-storage │   │
│  │  /api/poll-events.js                                │   │
│  └──────┬───────────────────┬──────────────────────────┘   │
│         │                   │                               │
│  ┌──────▼──────┐    ┌───────▼────────┐                     │
│  │  AI Agents  │    │  Blockchain    │                     │
│  │  (Groq/     │    │  (Sepolia via  │                     │
│  │  Anthropic) │    │  Alchemy RPC)  │                     │
│  └──────┬──────┘    └───────┬────────┘                     │
│         │                   │                               │
│  ┌──────▼───────────────────▼──────────────────────────┐   │
│  │              Partner Integrations                   │   │
│  │  KeeperHub (execution) │ 0G Labs (audit storage)   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Agent Architecture — Three Heads of Cerberus

### Head-1: WatcherAgent
- Role: Continuous on-chain event monitoring
- Polls Sepolia every 5 seconds via Alchemy RPC
- Analyzes events using AI (Groq llama-3.3-70b or Anthropic Claude)
- Proposes threats to the validator swarm
- Triggers: SuspiciousActivity, large Withdrawals, unknown callers

### Head-2: ValidatorAgent-A
- Role: Independent threat evaluation
- Receives proposal from Head-1
- Analyzes evidence independently (separate AI call)
- Votes YES / NO / ABSTAIN with reasoning

### Head-3: ValidatorAgent-B
- Role: Independent threat evaluation
- Same as Head-2 but completely separate execution
- No shared state with Head-2
- Final vote determines consensus outcome

### Consensus Engine
- Threshold: 2/3 of non-abstaining votes must be YES
- If threshold met: EXECUTE
- If threshold not met: DISCARD
- Each round has unique proposal ID (nonce)
- No single agent can execute alone

## Consensus Flow

```
On-chain Event Detected
        │
        ▼
Head-1 (Watcher) analyzes event
        │
        ├─── Not a threat ──► Log and continue monitoring
        │
        └─── Threat detected ──► Create ThreatProposal
                                        │
                                        ▼
                         Send to Head-2 and Head-3 (parallel)
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                         Head-2 votes         Head-3 votes
                         YES/NO/ABSTAIN       YES/NO/ABSTAIN
                              └─────────┬─────────┘
                                        ▼
                              Consensus Engine evaluates
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                           EXECUTE             DISCARD
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
             KeeperHub              0G Storage
             on-chain alert         audit log
```

## Data Structures

### ThreatProposal
```typescript
interface ThreatProposal {
  id: string            // unique nonce: prop_timestamp_random
  timestamp: number     // Unix ms
  contractAddress: string
  txHash: string
  eventType: string     // SuspiciousActivity | Withdrawal | Deposit
  severity: ThreatLevel // LOW | MEDIUM | HIGH | CRITICAL
  evidence: string      // AI-generated explanation
  proposedBy: string    // Cerberus-Head-1
}
```

### AgentVote
```typescript
interface AgentVote {
  agentId: string       // Cerberus-Head-2 | Cerberus-Head-3
  vote: Vote            // YES | NO | ABSTAIN
  reasoning: string     // AI-generated reasoning
  timestamp: number
}
```

### ConsensusResult
```typescript
interface ConsensusResult {
  proposalId: string
  votes: AgentVote[]
  outcome: EXECUTE | DISCARD
  yesCount: number
  noCount: number
  abstainCount: number
  executedAt?: number
}
```

## Partner Integrations

### Gensyn
Three independent AI agents operate without central coordinator.
Each agent makes independent AI calls with separate context.
No shared state between agents — true decentralized consensus.
Architecture inspired by Gensyn RL Swarm: propose, critique, validate, act.

### KeeperHub
When consensus reaches EXECUTE threshold:
- Cerberus sends POST to KeeperHub webhook
- KeeperHub workflow triggers on-chain notification
- Full execution log stored in KeeperHub Runs dashboard
- Webhook URL: app.keeperhub.com/api/workflows/...

### 0G Labs
Every consensus result is logged to 0G decentralized storage:
- Immutable audit trail of all agent decisions
- Verifiable on storagescan.0g.ai
- Network: 0G Testnet
- Indexer: indexer-storage-testnet-turbo.0g.ai

## On-Chain Monitoring

- Network: Ethereum Sepolia Testnet
- RPC: Alchemy (eth-sepolia.g.alchemy.com)
- Contract: 0x23d58937a7101d015e41525d00f6bfc3dd69a226
- Events monitored:
  - SuspiciousActivity (topic: 0x40922f...)
  - Withdrawal (topic: 0xe1fffc...)
  - Deposit (topic: 0x884eda...)
- Poll interval: 5 seconds
- Block range per query: 5 blocks (Alchemy free tier)

## Security Design

Based on real smart contract audit experience (Code4rena, LayerZero x Stellar):

1. No single agent decides — 2/3 consensus required
2. Agents are stateless — no shared memory between rounds
3. Audit log is immutable — stored on 0G, not mutable server
4. Replay-resistant — unique proposal ID per consensus round
5. Execution separated from decision — KeeperHub handles delivery

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript + Vite | Real-time dashboard |
| Deployment | Vercel (serverless) | Global CDN + API routes |
| AI Inference | Groq llama-3.3-70b | Agent reasoning |
| AI Inference (alt) | Anthropic Claude | Agent reasoning |
| On-chain Monitor | Ethers.js + Alchemy | Sepolia event polling |
| Execution Layer | KeeperHub Webhook | Guaranteed on-chain actions |
| Audit Storage | 0G Labs Testnet | Decentralized audit log |
| Test Contract | Solidity 0.8.20 | Demo target on Sepolia |

## Repository Structure

```
cerberus-protocol/
├── README.md
├── ARCHITECTURE.md
├── src/
│   ├── agents/
│   │   ├── WatcherAgent.ts      # Head-1: monitors and proposes
│   │   ├── ValidatorAgent.ts    # Head-2 and 3: vote on proposals
│   │   └── ExecutorAgent.ts     # Triggers KeeperHub and 0G
│   ├── consensus/
│   │   └── ConsensusEngine.ts   # Voting logic and threshold
│   ├── hooks/
│   │   ├── useSwarmState.ts     # Agent orchestration
│   │   └── useOnChainMonitor.ts # Sepolia polling
│   ├── lib/
│   │   └── constants.ts
│   └── App.tsx                  # Main dashboard
├── api/
│   ├── claude.js                # AI proxy (Groq + Anthropic)
│   ├── poll-events.js           # Sepolia RPC polling
│   ├── keeperhub.js             # KeeperHub webhook relay
│   └── og-storage.js            # 0G audit log
└── contracts/
    └── TestTarget.sol           # Demo contract on Sepolia
```

## Builder

Artem Kalashnik — Solo developer, Smart contract security auditor
Code4rena handle: shadowwarden
LayerZero x Stellar audit: High severity finding (DVN replay attack)

Built at ETHGlobal Open Agents 2026
April 24 – May 3, 2026
