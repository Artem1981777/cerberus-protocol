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
  const [threatCount, setThreatCount] = useState(0)
  const [totalScanned, setTotalScanned] = useState(0)

  const { isMonitoring, lastBlock, error: rpcError, startMonitoring, stopMonitoring, CONTRACT_ADDRESS } =
    useOnChainMonitor((event) => {
      setTotalScanned(n => n + 1)
      if (apiKey) runSwarm(event, apiKey).then(() => {
        if (event.eventName === 'SuspiciousActivity') setThreatCount(n => n + 1)
      })
    })

  const handleEvent = async (event: OnChainEvent) => {
    if (!apiKey.trim()) { alert('Enter your API key first'); return }
    setTotalScanned(n => n + 1)
    setLoading(true)
    await runSwarm(event, apiKey)
    if (event.eventName === 'SuspiciousActivity') setThreatCount(n => n + 1)
    setLoading(false)
  }

  const etherscanBase = 'https://sepolia.etherscan.io'

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

      {/* Stats Bar */}
      <div style={s.statsBar}>
        <div style={s.statBox}>
          <div style={s.statNum}>{threatCount}</div>
          <div style={s.statLabel}>THREATS DETECTED</div>
        </div>
        <div style={s.statBox}>
          <div style={s.statNum}>{totalScanned}</div>
          <div style={s.statLabel}>EVENTS SCANNED</div>
        </div>
        <div style={s.statBox}>
          <div style={{...s.statNum, color: '#00ff88'}}>{state.result?.outcome === 'EXECUTE' ? '1' : '0'}</div>
          <div style={s.statLabel}>ACTIONS EXECUTED</div>
        </div>
        <div style={s.statBox}>
          <div style={{...s.statNum, color: '#00aaff'}}>{isMonitoring ? 'LIVE' : 'OFF'}</div>
          <div style={s.statLabel}>MONITOR STATUS</div>
        </div>
      </div>

      {/* API Key */}
      <div style={s.section}>
        <div style={s.label}>AI PROVIDER API KEY</div>
        <input
          type="password"
          placeholder="sk-ant-... (Anthropic) or gsk_... (Groq — free at console.groq.com)"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={s.input}
        />
        {apiKey && <div style={{color:'#00ff88', fontSize:'0.7rem', marginTop:'0.3rem'}}>✓ Key set — ready to run</div>}
      </div>

      {/* Cerberus Visual */}
      <div style={{textAlign:'center' as const, marginBottom:'1.5rem', padding:'1rem', background:'#0d0d0d', borderRadius:'8px', border:'1px solid #1a1a1a'}}>
        <div style={{fontSize:'0.65rem', color:'#333', letterSpacing:'0.3em', marginBottom:'0.5rem'}}>CERBERUS THREAT DETECTION SWARM</div>
        <div style={{display:'flex', justifyContent:'center', alignItems:'flex-end', gap:'0.5rem', fontFamily:'monospace', fontSize:'0.7rem', color:'#ff6600', lineHeight:1.3}}>
          <div style={{textAlign:'center' as const}}>
            <div style={{color: state.status !== 'idle' ? '#ff6600' : '#333'}}>  /\_/\  </div>
            <div style={{color: state.status !== 'idle' ? '#ff6600' : '#333'}}> ( o.o ) </div>
            <div style={{color: state.status !== 'idle' ? '#ff4400' : '#333'}}> {">"} HEAD1 {"<"}</div>
            <div style={{color:'#555', fontSize:'0.6rem'}}>👁 Watcher</div>
          </div>
          <div style={{textAlign:'center' as const, marginBottom:'0.5rem', color:'#333'}}>
            <div>───────</div>
            <div style={{color: state.status === 'voting' || state.status === 'done' ? '#ffaa00' : '#222', fontSize:'1.5rem'}}>🐺</div>
            <div>───────</div>
          </div>
          <div style={{textAlign:'center' as const}}>
            <div style={{color: state.votes.find(v=>v.agentId==='Cerberus-Head-2') ? '#00ff88' : '#333'}}>  /\_/\  </div>
            <div style={{color: state.votes.find(v=>v.agentId==='Cerberus-Head-2') ? '#00ff88' : '#333'}}> ( o.o ) </div>
            <div style={{color: state.votes.find(v=>v.agentId==='Cerberus-Head-2') ? '#00ff44' : '#333'}}> {">"} HEAD2 {"<"}</div>
            <div style={{color:'#555', fontSize:'0.6rem'}}>⚖️ Validator A</div>
          </div>
          <div style={{textAlign:'center' as const, color:'#222', fontSize:'0.8rem', paddingBottom:'1rem'}}>│</div>
          <div style={{textAlign:'center' as const}}>
            <div style={{color: state.votes.find(v=>v.agentId==='Cerberus-Head-3') ? '#00ff88' : '#333'}}>  /\_/\  </div>
            <div style={{color: state.votes.find(v=>v.agentId==='Cerberus-Head-3') ? '#00ff88' : '#333'}}> ( o.o ) </div>
            <div style={{color: state.votes.find(v=>v.agentId==='Cerberus-Head-3') ? '#00ff44' : '#333'}}> {">"} HEAD3 {"<"}</div>
            <div style={{color:'#555', fontSize:'0.6rem'}}>🛡️ Validator B</div>
          </div>
        </div>
        <div style={{color:'#222', fontSize:'0.7rem', marginTop:'0.5rem'}}>
          ══════════════ CONSENSUS ENGINE ══════════════
        </div>
        {state.result && (
          <div style={{color: state.result.outcome==='EXECUTE'?'#00ff88':'#ff4444', fontSize:'0.8rem', fontWeight:700, marginTop:'0.25rem', letterSpacing:'0.2em'}}>
            {state.result.outcome==='EXECUTE' ? '[ THREAT CONFIRMED — EXECUTING ]' : '[ THREAT DISCARDED ]'}
          </div>
        )}
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
            const pulse = (isWatcher && state.status === 'watching') || (state.status === 'voting' && !isWatcher)
            return (
              <div key={id} style={{...s.card, borderColor: color, boxShadow: pulse ? '0 0 12px ' + color + '44' : 'none'}}>
                <div style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>{i === 0 ? '👁' : i === 1 ? '⚖️' : '🛡️'}</div>
                <div style={{fontSize:'0.8rem', color:'#fff', fontWeight:700, marginBottom:'0.25rem'}}>{id}</div>
                <div style={{fontSize:'0.7rem', color, letterSpacing:'0.1em', marginBottom:'0.25rem',
                  animation: pulse ? 'none' : undefined}}>{lbl}</div>
                <div style={{fontSize:'0.65rem', color:'#555'}}>{i === 0 ? 'Watcher' : i === 1 ? 'Validator A' : 'Validator B'}</div>
                {vote && <div style={{fontSize:'0.6rem', color:'#666', marginTop:'0.4rem', lineHeight:1.4}}>{vote.reasoning.slice(0, 80)}...</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Proposal */}
      {state.currentProposal && (
        <div style={s.section}>
          <div style={s.label}>ACTIVE THREAT PROPOSAL</div>
          <div style={{...s.box, borderColor:'#ff660044'}}>
            {[
              ['PROPOSAL ID', state.currentProposal.id],
              ['SEVERITY', state.currentProposal.severity],
              ['EVENT TYPE', state.currentProposal.eventType],
              ['EVIDENCE', state.currentProposal.evidence],
              ['PROPOSED BY', state.currentProposal.proposedBy],
            ].map(([k, v]) => (
              <div key={k} style={{display:'flex', gap:'1rem', marginBottom:'0.5rem', alignItems:'flex-start'}}>
                <span style={{fontSize:'0.65rem', color:'#444', minWidth:100, paddingTop:2}}>{k}</span>
                <span style={{fontSize:'0.8rem', color: k === 'SEVERITY' ? (v === 'CRITICAL' ? '#ff3300' : v === 'HIGH' ? '#ff6600' : '#ffaa00') : '#ccc'}}>{v}</span>
              </div>
            ))}
            <div style={{display:'flex', gap:'1rem', marginBottom:'0.5rem', alignItems:'center'}}>
              <span style={{fontSize:'0.65rem', color:'#444', minWidth:100}}>TX HASH</span>
              <a href={etherscanBase + '/tx/' + state.currentProposal.txHash}
                target="_blank" rel="noopener noreferrer"
                style={{fontSize:'0.75rem', color:'#00aaff', textDecoration:'none'}}>
                {state.currentProposal.txHash.slice(0,20)}... ↗
              </a>
            </div>
            <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
              <span style={{fontSize:'0.65rem', color:'#444', minWidth:100}}>CONTRACT</span>
              <a href={etherscanBase + '/address/' + state.currentProposal.contractAddress}
                target="_blank" rel="noopener noreferrer"
                style={{fontSize:'0.75rem', color:'#00aaff', textDecoration:'none'}}>
                {state.currentProposal.contractAddress.slice(0,20)}... ↗
              </a>
            </div>
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
            <div style={{marginTop:'0.75rem', fontSize:'0.9rem', fontWeight:700}}>
              <span style={{color:'#00ff88'}}>YES: {state.result.yesCount}</span>
              <span style={{color:'#ff4444', marginLeft:'1rem'}}>NO: {state.result.noCount}</span>
              <span style={{color:'#888', marginLeft:'1rem'}}>ABSTAIN: {state.result.abstainCount}</span>
            </div>
            {state.result.outcome === 'EXECUTE' && (
              <div style={{marginTop:'0.75rem'}}>
                <div style={{color:'#555', fontSize:'0.7rem'}}>
                  ⚡ KeeperHub alerted · 🗄️ 0G audit written
                </div>
                <div style={{color:'#555', fontSize:'0.7rem', marginTop:'0.25rem'}}>
                  {new Date(state.result.executedAt!).toISOString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Monitor */}
      <div style={s.section}>
        <div style={s.label}>LIVE ON-CHAIN MONITOR · ETHEREUM SEPOLIA</div>
        <div style={{display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' as const, marginBottom:'0.5rem'}}>
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            style={{...s.btn, borderColor: isMonitoring ? '#00ff88' : '#333', color: isMonitoring ? '#00ff88' : '#888', padding:'0.5rem 1.25rem', fontWeight:700}}>
            {isMonitoring ? '⏹ STOP MONITOR' : '▶ START LIVE MONITOR'}
          </button>
          {isMonitoring && <span style={{fontSize:'0.75rem', color:'#00ff88'}}>⟳ Polling every 5s · Block #{lastBlock}</span>}
          {rpcError && <span style={{fontSize:'0.75rem', color:'#ff4444'}}>{rpcError}</span>}
        </div>
        <div style={{fontSize:'0.65rem', color:'#444'}}>
          Monitoring:{' '}
          <a href={etherscanBase + '/address/' + CONTRACT_ADDRESS} target="_blank" rel="noopener noreferrer"
            style={{color:'#555', textDecoration:'none'}}>
            {CONTRACT_ADDRESS} ↗
          </a>
        </div>
      </div>

      {/* Simulate */}
      <div style={s.section}>
        <div style={s.label}>SIMULATE ON-CHAIN EVENT</div>
        <div style={s.grid3}>
          {DEMO_EVENTS.map((ev, i) => (
            <button key={i} disabled={loading} onClick={() => handleEvent(ev)}
              style={{...s.btn, opacity: loading ? 0.5 : 1, borderColor: ev.eventName === 'SuspiciousActivity' ? '#ff330033' : '#222'}}>
              <div style={{fontSize:'0.85rem', fontWeight:700,
                color: ev.eventName === 'SuspiciousActivity' ? '#ff3300' : ev.eventName === 'Withdrawal' ? '#ffaa00' : '#00ff88',
                marginBottom:'0.25rem'}}>
                {ev.eventName === 'SuspiciousActivity' ? '🚨' : ev.eventName === 'Withdrawal' ? '⚠️' : '✅'} {ev.eventName}
              </div>
              <div style={{fontSize:'0.7rem', color:'#555'}}>Block #{ev.blockNumber}</div>
              <div style={{fontSize:'0.7rem', color:'#555', fontFamily:'monospace'}}>{ev.txHash.slice(0,16)}...</div>
            </button>
          ))}
        </div>
        {state.status !== 'idle' && (
          <button onClick={() => { reset(); }} style={{...s.btn, marginTop:'1rem', color:'#555', padding:'0.4rem 1rem'}}>
            ↺ RESET SWARM
          </button>
        )}
      </div>

      {/* Log */}
      <div style={s.section}>
        <div style={s.label}>CERBERUS SWARM LOG</div>
        <div style={s.log}>
          {state.log.length === 0
            ? <div style={{color:'#333', fontSize:'0.75rem'}}>[ Awaiting threats... ]</div>
            : state.log.map((line, i) => (
              <div key={i} style={{fontSize:'0.75rem', lineHeight:1.7, fontFamily:'monospace',
                color: line.includes('✅') ? '#00ff88' : line.includes('⚠️') ? '#ffaa00' : line.includes('❌') ? '#ff4444' : line.includes('THREAT') ? '#ff6600' : '#666'}}>
                {line}
              </div>
            ))
          }
        </div>
      </div>

      {/* Partner badges */}
      <div style={s.section}>
        <div style={s.label}>POWERED BY</div>
        <div style={{display:'flex', gap:'1rem', flexWrap:'wrap' as const}}>
          {[
            ['🔵', 'Gensyn', 'Decentralized Agent Network'],
            ['🟣', 'KeeperHub', 'On-chain Execution'],
            ['🟡', '0G Labs', 'Decentralized Storage'],
            ['⚡', 'Groq', 'AI Inference'],
            ['🔷', 'Alchemy', 'Blockchain RPC'],
          ].map(([emoji, name, desc]) => (
            <div key={name} style={{background:'#111', border:'1px solid #1a1a1a', borderRadius:'4px', padding:'0.5rem 0.75rem', fontSize:'0.7rem'}}>
              <span>{emoji}</span>
              <span style={{color:'#fff', fontWeight:700, marginLeft:'0.4rem'}}>{name}</span>
              <span style={{color:'#444', marginLeft:'0.4rem'}}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{textAlign:'center' as const, fontSize:'0.7rem', color:'#333', borderTop:'1px solid #1a1a1a', paddingTop:'1rem', marginTop:'2rem'}}>
        Cerberus Protocol · ETHGlobal Open Agents 2026 ·{' '}
        <a href="https://github.com/Artem1981777/cerberus-protocol" style={{color:'#ff6600'}}>GitHub</a>
        {' '}·{' '}
        <a href="https://twitter.com/ArtemGromov777" style={{color:'#ff6600'}}>@ArtemGromov777</a>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {background:'#0a0a0a', color:'#e0e0e0', minHeight:'100vh', fontFamily:'monospace', padding:'1.5rem', maxWidth:'960px', margin:'0 auto'},
  header: {display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e1e1e', paddingBottom:'1rem', marginBottom:'1.5rem'},
  headerLeft: {display:'flex', alignItems:'center', gap:'1rem'},
  title: {fontSize:'1.5rem', fontWeight:900, color:'#fff', letterSpacing:'0.05em'},
  sub: {fontSize:'0.65rem', color:'#555', marginTop:'0.2rem'},
  statsBar: {display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.75rem', marginBottom:'2rem'},
  statBox: {background:'#111', border:'1px solid #1a1a1a', borderRadius:'4px', padding:'0.75rem', textAlign:'center' as const},
  statNum: {fontSize:'1.5rem', fontWeight:900, color:'#ff6600'},
  statLabel: {fontSize:'0.6rem', color:'#444', letterSpacing:'0.15em', marginTop:'0.25rem'},
  section: {marginBottom:'2rem'},
  label: {fontSize:'0.7rem', color:'#444', letterSpacing:'0.2em', marginBottom:'0.75rem', borderBottom:'1px solid #1a1a1a', paddingBottom:'0.25rem'},
  input: {background:'#111', border:'1px solid #333', color:'#ff6600', padding:'0.5rem 0.75rem', fontFamily:'monospace', fontSize:'0.8rem', width:'100%', borderRadius:'4px', outline:'none', boxSizing:'border-box' as const},
  grid3: {display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.75rem'},
  card: {background:'#111', border:'1px solid #222', borderRadius:'4px', padding:'0.75rem', textAlign:'center' as const, transition:'all 0.3s'},
  box: {background:'#111', border:'1px solid #333', borderRadius:'4px', padding:'1rem'},
  btn: {background:'#111', border:'1px solid #222', borderRadius:'4px', padding:'0.75rem', cursor:'pointer', textAlign:'left' as const, color:'#e0e0e0', fontFamily:'monospace', display:'block', width:'100%', transition:'border-color 0.2s'},
  log: {background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:'4px', padding:'1rem', height:'220px', overflowY:'auto' as const, display:'flex', flexDirection:'column-reverse' as const},
}
