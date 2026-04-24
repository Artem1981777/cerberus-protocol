import React, { useState } from 'react'
import { useSwarmState } from './hooks/useSwarmState'
import { useOnChainMonitor } from './hooks/useOnChainMonitor'
import { OnChainEvent } from './agents/WatcherAgent'

const DEMO_EVENTS: OnChainEvent[] = [
  {
    txHash: '0xabc123def456789abcdef1234567890abcdef1234567890abcdef1234567890ab',
    contractAddress: '0xc4a1367dbaf887387598991bfcf54d9cfdd10a9e',
    eventName: 'SuspiciousActivity',
    args: { actor: '0xDeadBeef', reason: 'Unauthorized withdrawal attempt' },
    blockNumber: 10684521,
  },
  {
    txHash: '0x999aaabbbccc111222333444555666777888999aaabbbccc111222333444555666',
    contractAddress: '0xc4a1367dbaf887387598991bfcf54d9cfdd10a9e',
    eventName: 'Withdrawal',
    args: { to: '0xUnknown999', amount: '99000000000000000000' },
    blockNumber: 10684599,
  },
  {
    txHash: '0x111aaa222bbb333ccc444ddd555eee666fff777888999000aaa111bbb222ccc33',
    contractAddress: '0xc4a1367dbaf887387598991bfcf54d9cfdd10a9e',
    eventName: 'Deposit',
    args: { from: '0xRegularUser', amount: '1000000000000000000' },
    blockNumber: 10684610,
  },
]

const STATUS_COLOR: Record<string, string> = {
  idle: '#888', watching: '#ff6600', voting: '#ffaa00', executing: '#ff3300', done: '#00ff88',
}
const STATUS_LABEL: Record<string, string> = {
  idle: '● IDLE', watching: '⟳ ANALYZING', voting: '⚡ VOTING', executing: '🔴 EXECUTING', done: '✓ DONE',
}

const HEADS = ['Cerberus-Head-1', 'Cerberus-Head-2', 'Cerberus-Head-3']

export default function App() {
  const { state, runSwarm, reset } = useSwarmState()
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const { isMonitoring, lastBlock, error: rpcError, startMonitoring, stopMonitoring, CONTRACT_ADDRESS } =
    useOnChainMonitor((event) => { if (apiKey) runSwarm(event, apiKey) })

  const handleEvent = async (event: OnChainEvent) => {
    if (!apiKey.trim()) { alert('Enter your API key first'); return }
    setLoading(true)
    await runSwarm(event, apiKey)
    setLoading(false)
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{fontSize:'2.5rem'}}>🐺</span>
          <div>
            <div style={s.title}>Cerberus Protocol</div>
            <div style={s.sub}>Three-Headed AI Security Swarm · ETHGlobal Open Agents 2026</div>
          </div>
        </div>
        <div style={{fontSize:'0.85rem', fontWeight:700, letterSpacing:'0.1em', color: STATUS_COLOR[state.status]}}>
          {STATUS_LABEL[state.status]}
        </div>
      </div>

      {/* API Key */}
      <div style={s.section}>
        <div style={s.label}>AI PROVIDER API KEY</div>
        <input
          type="password"
          placeholder="sk-ant-... or gsk_... (Groq)"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={s.input}
        />
        {apiKey && <div style={{color:'#00ff88', fontSize:'0.7rem', marginTop:'0.3rem'}}>✓ Key set — ready to run</div>}
        <div style={{color:'#444', fontSize:'0.65rem', marginTop:'0.25rem'}}>Used directly in browser, never stored. Supports Anthropic or Groq.</div>
      </div>

      {/* Three Heads */}
      <div style={s.section}>
        <div style={s.label}>THREE HEADS OF CERBERUS</div>
        <div style={s.grid3}>
          {HEADS.map((id, i) => {
            const vote = state.votes.find(v => v.agentId === id)
            const isWatcher = i === 0
            let color = '#333', lbl = 'STANDBY'
            if (isWatcher && state.status !== 'idle') { color = '#ff6600'; lbl = 'WATCHING' }
            if (vote) {
              color = vote.vote === 'YES' ? '#00ff88' : vote.vote === 'NO' ? '#ff4444' : '#888'
              lbl = vote.vote
            }
            if (isWatcher && state.currentProposal && state.status === 'voting') { color = '#ffaa00'; lbl = 'PROPOSED' }
            return (
              <div key={id} style={{...s.card, borderColor: color}}>
                <div style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>
                  {i === 0 ? '👁' : i === 1 ? '⚖️' : '🛡️'}
                </div>
                <div style={{fontSize:'0.8rem', color:'#fff', fontWeight:700, marginBottom:'0.25rem'}}>{id}</div>
                <div style={{fontSize:'0.7rem', color, letterSpacing:'0.1em', marginBottom:'0.25rem'}}>{lbl}</div>
                <div style={{fontSize:'0.65rem', color:'#555'}}>
                  {i === 0 ? 'Watcher' : i === 1 ? 'Validator A' : 'Validator B'}
                </div>
                {vote && <div style={{fontSize:'0.6rem', color:'#666', marginTop:'0.4rem', lineHeight:1.4}}>{vote.reasoning.slice(0, 70)}...</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Proposal */}
      {state.currentProposal && (
        <div style={s.section}>
          <div style={s.label}>ACTIVE THREAT PROPOSAL</div>
          <div style={{...s.box, borderColor:'#ff660033'}}>
            {[
              ['ID', state.currentProposal.id],
              ['SEVERITY', state.currentProposal.severity],
              ['EVENT', state.currentProposal.eventType],
              ['TX', state.currentProposal.txHash.slice(0,20) + '...'],
              ['EVIDENCE', state.currentProposal.evidence],
              ['PROPOSED BY', state.currentProposal.proposedBy],
            ].map(([k, v]) => (
              <div key={k} style={{display:'flex', gap:'1rem', marginBottom:'0.4rem'}}>
                <span style={{fontSize:'0.65rem', color:'#444', minWidth:90}}>{k}</span>
                <span style={{fontSize:'0.8rem', color: k === 'SEVERITY' ? (v === 'CRITICAL' ? '#ff3300' : '#ffaa00') : '#ccc'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {state.result && (
        <div style={s.section}>
          <div style={s.label}>CONSENSUS RESULT</div>
          <div style={{...s.box, borderColor: state.result.outcome === 'EXECUTE' ? '#00ff88' : '#ff4444', borderWidth:2}}>
            <div style={{fontSize:'2rem', fontWeight:900, color: state.result.outcome === 'EXECUTE' ? '#00ff88' : '#ff4444'}}>
              {state.result.outcome === 'EXECUTE' ? '✅ EXECUTED' : '❌ DISCARDED'}
            </div>
            <div style={{marginTop:'0.75rem', fontSize:'0.85rem', fontWeight:700}}>
              <span style={{color:'#00ff88'}}>YES: {state.result.yesCount}</span>
              <span style={{color:'#ff4444', marginLeft:'1rem'}}>NO: {state.result.noCount}</span>
              <span style={{color:'#888', marginLeft:'1rem'}}>ABSTAIN: {state.result.abstainCount}</span>
            </div>
            {state.result.outcome === 'EXECUTE' && (
              <div style={{color:'#555', fontSize:'0.7rem', marginTop:'0.5rem'}}>
                KeeperHub alerted · 0G audit written · {new Date(state.result.executedAt!).toISOString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Monitor */}
      <div style={s.section}>
        <div style={s.label}>LIVE ON-CHAIN MONITOR · SEPOLIA</div>
        <div style={{display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' as const}}>
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            style={{...s.btn, borderColor: isMonitoring ? '#00ff88' : '#333', color: isMonitoring ? '#00ff88' : '#888', padding:'0.5rem 1rem'}}>
            {isMonitoring ? '⏹ STOP MONITOR' : '▶ START LIVE MONITOR'}
          </button>
          {isMonitoring && <span style={{fontSize:'0.75rem', color:'#00ff88'}}>⟳ Polling every 5s · Block #{lastBlock}</span>}
          {rpcError && <span style={{fontSize:'0.75rem', color:'#ff4444'}}>{rpcError}</span>}
        </div>
        <div style={{fontSize:'0.65rem', color:'#444', marginTop:'0.4rem'}}>
          Contract: {CONTRACT_ADDRESS}
        </div>
      </div>

      {/* Simulate */}
      <div style={s.section}>
        <div style={s.label}>SIMULATE ON-CHAIN EVENT</div>
        <div style={s.grid3}>
          {DEMO_EVENTS.map((ev, i) => (
            <button key={i} disabled={loading} onClick={() => handleEvent(ev)}
              style={{...s.btn, opacity: loading ? 0.5 : 1}}>
              <div style={{fontSize:'0.85rem', fontWeight:700, color:'#ff6600', marginBottom:'0.25rem'}}>{ev.eventName}</div>
              <div style={{fontSize:'0.7rem', color:'#555'}}>Block #{ev.blockNumber}</div>
              <div style={{fontSize:'0.7rem', color:'#555'}}>{ev.txHash.slice(0,16)}...</div>
            </button>
          ))}
        </div>
        {state.status !== 'idle' && (
          <button onClick={reset} style={{...s.btn, marginTop:'1rem', color:'#555'}}>RESET</button>
        )}
      </div>

      {/* Log */}
      <div style={s.section}>
        <div style={s.label}>CERBERUS LOG</div>
        <div style={s.log}>
          {state.log.length === 0
            ? <div style={{color:'#333'}}>Awaiting threats...</div>
            : state.log.map((line, i) => (
              <div key={i} style={{fontSize:'0.75rem', lineHeight:1.6,
                color: line.includes('✅') ? '#00ff88' : line.includes('⚠️') ? '#ffaa00' : line.includes('❌') ? '#ff4444' : '#777'}}>
                {line}
              </div>
            ))
          }
        </div>
      </div>

      {/* Footer */}
      <div style={{textAlign:'center', fontSize:'0.7rem', color:'#333', borderTop:'1px solid #1a1a1a', paddingTop:'1rem', marginTop:'2rem'}}>
        Cerberus Protocol · ETHGlobal Open Agents 2026 ·{' '}
        <a href="https://github.com/Artem1981777/cerberus-protocol" style={{color:'#ff6600'}}>GitHub</a>
        {' '}· Powered by Gensyn · KeeperHub · 0G Labs
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {background:'#0a0a0a', color:'#e0e0e0', minHeight:'100vh', fontFamily:'monospace', padding:'1.5rem', maxWidth:'900px', margin:'0 auto'},
  header: {display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e1e1e', paddingBottom:'1rem', marginBottom:'2rem'},
  headerLeft: {display:'flex', alignItems:'center', gap:'1rem'},
  title: {fontSize:'1.5rem', fontWeight:900, color:'#fff', letterSpacing:'0.05em'},
  sub: {fontSize:'0.65rem', color:'#555'},
  section: {marginBottom:'2rem'},
  label: {fontSize:'0.7rem', color:'#444', letterSpacing:'0.2em', marginBottom:'0.75rem', borderBottom:'1px solid #1a1a1a', paddingBottom:'0.25rem'},
  input: {background:'#111', border:'1px solid #333', color:'#ff6600', padding:'0.5rem 0.75rem', fontFamily:'monospace', fontSize:'0.8rem', width:'100%', borderRadius:'4px', outline:'none', boxSizing:'border-box' as const},
  grid3: {display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.75rem'},
  card: {background:'#111', border:'1px solid #222', borderRadius:'4px', padding:'0.75rem', textAlign:'center' as const, transition:'border-color 0.3s'},
  box: {background:'#111', border:'1px solid #333', borderRadius:'4px', padding:'1rem'},
  btn: {background:'#111', border:'1px solid #222', borderRadius:'4px', padding:'0.75rem', cursor:'pointer', textAlign:'left' as const, color:'#e0e0e0', fontFamily:'monospace', display:'block', width:'100%'},
  log: {background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:'4px', padding:'1rem', height:'200px', overflowY:'auto' as const, display:'flex', flexDirection:'column-reverse' as const},
}
