# Cerberus Protocol — Demo Script

## Video Requirements
- Length: 2-3 minutes (max 3 min for 0G prize)
- Resolution: minimum 720p
- Live voice narration (no AI voiceover)
- Show real on-chain transactions

## Script

### 0:00-0:20 — Hook
"Smart contracts lost 2.1 billion dollars to exploits in 2024-2025.
Every security tool today runs on a single server — one point of failure.
What if your security layer could never be taken down?"

### 0:20-0:40 — Solution
"Cerberus Protocol is a three-headed AI security swarm.
Three independent agents. No central coordinator.
Consensus before any action. Unstoppable by design."

### 0:40-1:00 — Show Dashboard
- Open cerberus-protocol.vercel.app
- Show stats bar: agents on standby
- Show three heads: Head-1 Watcher, Head-2 Validator A, Head-3 Validator B
- Show live monitor connected to Sepolia

### 1:00-1:45 — Live Demo
- Enter API key
- Click START LIVE MONITOR — show Block number updating
- Go to Remix IDE — call triggerAlert on TestTarget contract
- Show MetaMask confirmation
- Return to dashboard — show agent cycle:
  * Head-1 detects SuspiciousActivity
  * Head-2 and Head-3 vote YES
  * EXECUTED — consensus reached
- Click TX hash — show real Etherscan transaction

### 1:45-2:15 — Partner Integrations
"When consensus is reached:
KeeperHub receives the webhook — show KeeperHub Runs dashboard with confirmed executions.
0G Labs stores the immutable audit log — every decision is permanent and verifiable.
Gensyn architecture: three heads, no coordinator, pure peer consensus."

### 2:15-2:45 — Why This Wins
"Built on real security expertise.
I found a High severity vulnerability in LayerZero x Stellar at Code4rena.
That experience is baked into every threat detection rule in Cerberus.
This is not a demo — this is production-ready security infrastructure."

### 2:45-3:00 — Close
"Cerberus Protocol. Three heads. One consensus. Zero single points of failure.
Live at cerberus-protocol.vercel.app
GitHub: Artem1981777/cerberus-protocol"

## Key Points to Emphasize
1. Real on-chain transaction visible on Etherscan
2. KeeperHub shows actual run count (not mocked)
3. Three SEPARATE AI calls — not one model pretending to be three
4. Security expertise is REAL — Code4rena audit history
5. No central coordinator — agents are truly independent

## Technical Setup for Recording
- Browser: Chrome desktop
- Screen: Show dashboard + KeeperHub side by side if possible
- Audio: Clear microphone, no background noise
- Resolution: 1080p recommended
