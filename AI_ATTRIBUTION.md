# AI Tools Attribution

As required by ETHGlobal submission guidelines.

## AI Tools Used in Development

### Claude (Anthropic)
- Coding assistant throughout development
- Helped debug TypeScript errors and API integrations
- Assisted with React component structure
- All architectural decisions made by the human developer

### Groq llama-3.3-70b
- Core product functionality — powers the three agent heads
- Used for threat analysis and consensus voting inside the app
- This is the product itself, not development assistance

## Built by the Developer

- System architecture and security threat detection logic
- Agent consensus mechanism (2/3 threshold design)
- KeeperHub webhook integration
- 0G Storage audit log design
- On-chain monitoring via Alchemy RPC
- All product decisions based on real Code4rena audit experience
  (LayerZero x Stellar — High severity DVN replay attack finding)

## Code Distribution

- Agent prompts and security rules: human-designed
- Consensus engine logic: human-designed
- API integrations: human-designed, AI-assisted implementation
- React UI: human-designed, AI-assisted implementation
