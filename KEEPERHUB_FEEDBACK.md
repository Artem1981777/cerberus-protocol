# KeeperHub Integration Feedback

Honest feedback from integrating KeeperHub into Cerberus Protocol
during ETHGlobal Open Agents 2026 hackathon.

## What We Built

Used KeeperHub webhook trigger as the execution layer for Cerberus Protocol.
When three AI agents reach consensus on a security threat, Cerberus sends
a POST request to KeeperHub webhook which triggers on-chain notification workflow.

Confirmed runs: 8+ successful executions during development and testing.

## What Worked Well

1. Webhook trigger setup was fast — under 5 minutes from account creation to first run
2. Visual workflow builder is intuitive — no code needed for basic flows
3. Run logs are detailed — easy to verify executions happened
4. Discord notification integration worked out of the box
5. Free tier is generous enough for hackathon development

## UX and UI Friction

1. AI workflow generation failed repeatedly with generic prompts
   - Tried: Webhook trigger with Discord notification
   - Result: Failed to generate workflow
   - Fix: More specific prompt examples in documentation would help

2. Webhook URL is not visible until workflow is saved
   - Had to save first, then find the URL buried in node settings
   - Fix: Show webhook URL immediately after selecting Webhook trigger

3. No way to test webhook from the builder UI
   - Had to use external curl to test
   - Fix: Add Test button that sends sample payload

4. Mobile browser experience is poor
   - Canvas is hard to manipulate on touchscreen
   - Fix: Responsive design improvements

## Documentation Gaps

1. No example of webhook payload format in docs
   - Had to guess what JSON structure KeeperHub expects
   - Fix: Add payload schema documentation

2. MCP server setup not documented for non-Claude-Code users
   - We use Vercel serverless, not Claude Code
   - Fix: REST API integration guide for serverless environments

3. No TypeScript types for API responses
   - Had to use any types in our integration
   - Fix: Publish @keeperhub/types npm package

## Feature Requests

1. Programmatic workflow creation via REST API
   - We wanted to create workflows dynamically when new contracts are added
   - Currently only possible through UI

2. Webhook authentication
   - No HMAC signature verification on incoming webhooks
   - Security concern for production use

3. Multi-chain event triggers in single workflow
   - We monitor both Sepolia and 0G Galileo Testnet
   - Had to create separate workflows per chain

4. Agent-to-agent webhook chaining
   - Would be powerful for multi-agent systems like ours
   - Currently each webhook is independent

## Overall Assessment

KeeperHub solved a real problem for us: reliable execution confirmation.
Knowing that our consensus decisions actually landed on-chain (with proof)
is exactly what AI agent infrastructure needs.

The webhook approach works well for hackathon scope.
For production, we would want the MCP integration for tighter agent control.

Rating: 4/5 — Solid foundation, polish needed for developer experience.

## Submitted by

Artem Kalashnik
Cerberus Protocol — ETHGlobal Open Agents 2026
GitHub: Artem1981777
Twitter: ArtemGromov777
