# AI Tools Attribution

This document describes how AI tools were used in Cerberus Protocol,
as required by ETHGlobal submission guidelines.

## AI Tools Used

### Claude (Anthropic)
- Used as coding assistant throughout development
- Helped debug TypeScript errors and API integration issues
- Assisted with React component structure
- All architectural decisions made by the human developer

### Groq (llama-3.3-70b)
- Used as the AI inference engine INSIDE the product
- Powers the three agent heads for threat analysis and voting
- This is core product functionality, not development assistance

## What Was Built by the Developer

- Overall system architecture and design
- Security threat detection logic and patterns
  (based on real Code4rena audit experience)
- Agent consensus mechanism design
- KeeperHub webhook integration strategy
- 0G Storage audit log design
- On-chain monitoring approach
- All product decisions and trade-offs

## Code Distribution

- Agent prompts and security rules: human-designed
- React UI structure: human-designed, AI-assisted implementation
- API proxy logic: human-designed
- Consensus engine logic: human-designed
- Integration with Alchemy, KeeperHub, 0G: human-designed

## Note

The security expertise in this project (threat detection patterns,
DVN replay attack knowledge, smart contract vulnerability patterns)
comes from the developer real-world audit experience at Code4rena,
not from AI generation.
