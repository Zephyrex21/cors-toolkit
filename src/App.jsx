import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Moon, Sun, Copy, Check, ChevronRight,
  Zap, Globe, Lock, AlertTriangle, Info,
  Link2, RotateCcw, Sparkles, Search, Keyboard
} from 'lucide-react'
import { parseError, ERROR_TYPE_LABELS, ERROR_TYPE_COLORS } from './lib/errorParser'
import { FRAMEWORKS } from './lib/frameworkConfigs'
import { encodeState, decodeState, getShareUrl } from './lib/urlState'
import { useKeyboardShortcuts } from './lib/useKeyboardShortcuts'
import FlowVisualizer   from './components/FlowVisualizer'
import HeadersInspector from './components/HeadersInspector'
import ClientChecklist  from './components/ClientChecklist'
import ShortcutsModal   from './components/ShortcutsModal'
import Toast            from './components/Toast'

/* ─── Sample errors ──────────────────────────────────────── */
const SAMPLES = [
  `Access to fetch at 'https://api.myapp.com/v1/users' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
  `Access to fetch at 'https://api.myapp.com/v1/data' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
  `Access to fetch at 'https://api.myapp.com/v1/auth' from origin 'http://localhost:5173' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.`,
  `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://api.myapp.com/v1/posts. (Reason: CORS header 'Access-Control-Allow-Origin' missing).`,
]

/* ─── Feature pills ──────────────────────────────────────── */
const FEATURES = [
  { icon: '🔍', text: 'Chrome, Firefox & Safari' },
  { icon: '⚡', text: '9 framework configs'       },
  { icon: '🔗', text: 'Shareable fix links'       },
  { icon: '🛡️', text: '100% client-side'          },
]

/* ─── Particle canvas ────────────────────────────────────── */
function ParticleCanvas({ theme }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const stateRef  = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width, height

    const resize = () => {
      width  = canvas.width  = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 70
    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.5,
      o:  Math.random() * 0.4 + 0.15,
    }))
    stateRef.current = { particles, mouse: { x: -999, y: -999 } }

    const onMove = (e) => {
      stateRef.current.mouse.x = e.clientX
      stateRef.current.mouse.y = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const { particles: ps, mouse } = stateRef.current
      const isDark    = theme === 'dark'
      const dotColor  = isDark ? '255,255,255' : '80,80,160'
      const lineColor = isDark ? '255,255,255' : '100,100,200'

      ps.forEach((p) => {
        const dx   = mouse.x - p.x
        const dy   = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 180) { p.vx += dx / dist * 0.012; p.vy += dy / dist * 0.012 }
        p.vx *= 0.98; p.vy *= 0.98
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = width;  if (p.x > width)  p.x = 0
        if (p.y < 0) p.y = height; if (p.y > height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dotColor},${p.o})`
        ctx.fill()
      })

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx   = ps[i].x - ps[j].x
          const dy   = ps[i].y - ps[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 90) {
            ctx.beginPath()
            ctx.moveTo(ps[i].x, ps[i].y)
            ctx.lineTo(ps[j].x, ps[j].y)
            ctx.strokeStyle = `rgba(${lineColor},${(1 - dist / 90) * 0.12})`
            ctx.lineWidth   = 0.8
            ctx.stroke()
          }
        }
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [theme])

  return <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true" />
}

/* ─── DNA Card ───────────────────────────────────────────── */
function DnaCard({ label, value, variant = 'default', delay = 0 }) {
  return (
    <motion.div
      className={`dna-card ${variant}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dna-label">{label}</div>
      <div className="dna-value">{value || <span style={{ opacity: 0.4 }}>—</span>}</div>
    </motion.div>
  )
}

/* ─── Copy button ────────────────────────────────────────── */
function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handle} aria-label={copied ? 'Copied!' : `Copy ${label}`}>
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> {label}</>}
    </button>
  )
}

/* ─── Main App ───────────────────────────────────────────── */
export default function App() {
  const [theme,          setTheme]          = useState('dark')
  const [errorText,      setErrorText]      = useState('')
  const [parsed,         setParsed]         = useState(null)
  const [parseErr,       setParseErr]       = useState('')
  const [selectedFw,     setSelectedFw]     = useState(null)
  const [configTab,      setConfigTab]      = useState('config')
  const [shared,         setShared]         = useState(false)
  const [toast,          setToast]          = useState(null)
  const [showShortcuts,  setShowShortcuts]  = useState(false)

  const textareaRef = useRef(null)
  const resultsRef  = useRef(null)
  const sampleIdx   = useRef(0)

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() })
  }, [])

  /* Restore state from URL */
  useEffect(() => {
    const { errorText: e, frameworkId: fw } = decodeState()
    if (e) {
      setErrorText(e)
      const p = parseError(e)
      if (p?.isValid) {
        setParsed(p)
        if (fw) {
          const found = FRAMEWORKS.find(f => f.id === fw)
          if (found) setSelectedFw(found)
        }
      }
    }
  }, [])

  /* Apply theme */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  /* Sync URL */
  useEffect(() => {
    encodeState({ errorText, frameworkId: selectedFw?.id ?? '' })
  }, [errorText, selectedFw])

  /* Parse */
  const handleParse = useCallback(() => {
    if (!errorText.trim()) {
      setParseErr('Paste a CORS error from your browser console first.')
      return
    }
    const result = parseError(errorText)
    if (!result?.isValid) {
      setParseErr("Couldn't extract CORS details — paste the full error message from the browser console.")
      return
    }
    setParseErr('')
    setParsed(result)
    setSelectedFw(null)
    setConfigTab('config')
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }, [errorText])

  /* Toggle theme */
  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      showToast(`${next === 'dark' ? 'Dark' : 'Light'} mode`, 'info')
      return next
    })
  }, [showToast])

  /* Clear */
  const handleClear = useCallback(() => {
    setErrorText(''); setParsed(null); setParseErr(''); setSelectedFw(null)
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  /* Keyboard shortcuts */
  useKeyboardShortcuts({
    onFocusInput:    () => { textareaRef.current?.focus(); showToast('Error input focused') },
    onParse:         handleParse,
    onToggleTheme:   toggleTheme,
    onClear:         handleClear,
    onShowShortcuts: () => setShowShortcuts(true),
  })

  /* Sample */
  const loadSample = () => {
    setErrorText(SAMPLES[sampleIdx.current % SAMPLES.length])
    sampleIdx.current += 1
    setParsed(null); setParseErr(''); setSelectedFw(null)
  }

  /* Share */
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      setShared(true)
      showToast('Fix link copied!', 'success')
      setTimeout(() => setShared(false), 2500)
    } catch {}
  }

  const activeConfig = selectedFw ? selectedFw.config(parsed) : ''
  const errorTypeLbl = parsed ? ERROR_TYPE_LABELS[parsed.errorType] : ''
  const errorTypeClr = parsed ? ERROR_TYPE_COLORS[parsed.errorType] : 'error'

  const FADE_UP = {
    initial:    { opacity: 0, y: 18 },
    animate:    { opacity: 1, y: 0 },
    exit:       { opacity: 0, y: -8 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }

  return (
    <>
      <ParticleCanvas theme={theme} />

      <div className="app-wrapper">

        {/* ── Header ────────────────────────────────────── */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon" aria-hidden="true">⛓</div>
            <span className="logo-name">Allow<span className="logo-tld">Origin</span></span>
          </div>

          <div className="header-actions">
            {parsed?.isValid && (
              <motion.button className="btn-icon" onClick={handleShare}
                title="Copy shareable link" initial={{ opacity:0, scale:0.8 }}
                animate={{ opacity:1, scale:1 }} transition={{ duration:0.2 }}
                aria-label="Copy shareable fix link"
              >
                {shared ? <Check size={15} /> : <Link2 size={15} />}
              </motion.button>
            )}
            <button className="btn-icon" onClick={() => setShowShortcuts(true)}
              title="Keyboard shortcuts (?)" aria-label="Show keyboard shortcuts">
              <Keyboard size={15} />
            </button>
            <button className="btn-icon" onClick={toggleTheme}
              aria-label="Toggle dark/light mode" title="Toggle theme (⌘D)">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="hero">
          <motion.div className="hero-eyebrow"
            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5 }}
          >
            <Zap size={11} aria-hidden="true" />
            Zero backend · Instant fix
          </motion.div>

          <motion.h1 className="hero-title"
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.08 }}
          >
            Paste your <span>CORS error.</span><br />Get the exact fix.
          </motion.h1>

          <motion.p className="hero-sub"
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.14 }}
          >
            Supports Express, Nginx, FastAPI, Django, Spring Boot, Laravel, Go&nbsp;Gin, and ASP.NET — with your origin pre-filled.
          </motion.p>

          {/* Feature pills */}
          <motion.div className="feature-pills"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.22 }}
            aria-label="Key features"
          >
            {FEATURES.map((f, i) => (
              <motion.span key={f.text} className="feature-pill"
                initial={{ opacity:0, scale:0.9 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.28 + i * 0.06 }}
              >
                <span aria-hidden="true">{f.icon}</span> {f.text}
              </motion.span>
            ))}
          </motion.div>
        </section>

        {/* ── Main ──────────────────────────────────────── */}
        <main>
          <div className="container">

            {/* Error input */}
            <motion.div className="input-section"
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.5, delay:0.2 }}
            >
              <label className="section-label" htmlFor="error-input">
                <Globe size={13} aria-hidden="true" />
                Paste your CORS error
                <span className="kbd-hint">⌘↵ to diagnose</span>
              </label>

              <textarea
                id="error-input"
                ref={textareaRef}
                className="error-textarea"
                value={errorText}
                onChange={e => { setErrorText(e.target.value); setParseErr('') }}
                onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleParse() }}
                placeholder={`Paste the full error from your browser console — e.g.\n\nAccess to fetch at 'https://api.example.com/data' from origin 'http://localhost:3000' has been blocked by CORS policy...`}
                spellCheck={false}
                aria-describedby={parseErr ? 'parse-error-msg' : undefined}
              />

              {parseErr && (
                <motion.div id="parse-error-msg" className="parse-error" role="alert"
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                >
                  {parseErr}
                </motion.div>
              )}

              <div className="input-actions">
                <div style={{ display:'flex', gap:'12px' }}>
                  <button className="sample-btn" onClick={loadSample} type="button">
                    <Sparkles size={12} aria-hidden="true" /> Try an example
                  </button>
                  {errorText && (
                    <button className="sample-btn" onClick={handleClear} type="button">
                      <RotateCcw size={12} aria-hidden="true" /> Clear
                    </button>
                  )}
                </div>
                <button className="parse-btn" onClick={handleParse}
                  disabled={!errorText.trim()} type="button"
                  aria-label="Diagnose the CORS error"
                >
                  Diagnose error <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>
            </motion.div>

            {/* ── Results ────────────────────────────────── */}
            <div ref={resultsRef}>
              <AnimatePresence mode="wait">
                {parsed?.isValid && (
                  <motion.div key="results" {...FADE_UP}>

                    {/* Error DNA */}
                    <div className="dna-section">
                      <div className="section-label" style={{ marginBottom:'12px' }}>
                        <Zap size={13} aria-hidden="true" />
                        Error DNA
                        <span className="browser-badge">
                          {parsed.browser === 'chrome'  && '🌐 Chrome / Edge'}
                          {parsed.browser === 'firefox' && '🦊 Firefox'}
                          {parsed.browser === 'safari'  && '🧭 Safari'}
                          {parsed.browser === 'unknown' && '🔍 Unknown'}
                        </span>
                      </div>

                      <div className="dna-grid">
                        <DnaCard label="Your origin"  value={parsed.origin}      variant="accent"       delay={0} />
                        <DnaCard label="Blocked URL"  value={parsed.blockedUrl}  variant="warning"      delay={0.07} />
                        <DnaCard label="Error type"   value={errorTypeLbl}       variant={errorTypeClr} delay={0.14} />
                        {parsed.blockedHeader && (
                          <DnaCard label="Blocked header" value={parsed.blockedHeader} variant="warning" delay={0.21} />
                        )}
                        {parsed.blockedMethod && (
                          <DnaCard label="Blocked method" value={parsed.blockedMethod} variant="warning" delay={0.21} />
                        )}
                      </div>

                      <motion.div className="dna-explanation"
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        transition={{ delay:0.3, duration:0.4 }}
                      >
                        <Info size={13} style={{ verticalAlign:-2, marginRight:8, color:'var(--text-muted)' }} aria-hidden="true" />
                        {parsed.explanation}
                      </motion.div>
                    </div>

                    <div className="section-divider" />

                    {/* Flow Visualizer */}
                    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:0.35, duration:0.45, ease:[0.22,1,0.36,1] }}
                    >
                      <div className="section-label" style={{ marginBottom:'12px' }}>
                        <Zap size={13} aria-hidden="true" /> Request flow
                      </div>
                      <FlowVisualizer parsed={parsed} />
                    </motion.div>

                    <div className="section-divider" />

                    {/* Headers Inspector */}
                    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:0.42, duration:0.4, ease:[0.22,1,0.36,1] }}
                      style={{ marginBottom:'20px' }}
                    >
                      <div className="section-label" style={{ marginBottom:'12px' }}>
                        <Search size={13} aria-hidden="true" /> Headers audit
                      </div>
                      <HeadersInspector parsed={parsed} />
                    </motion.div>

                    <div className="section-divider" />

                    {/* Framework Picker */}
                    <motion.div className="fw-section"
                      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:0.25, duration:0.4 }}
                    >
                      <div className="section-label" style={{ marginBottom:'12px' }}>
                        <Lock size={13} aria-hidden="true" /> Select your server framework
                      </div>
                      <div className="fw-grid" role="listbox" aria-label="Choose server framework">
                        {FRAMEWORKS.map((fw, i) => (
                          <motion.button key={fw.id}
                            className={`fw-btn ${selectedFw?.id === fw.id ? 'selected' : ''}`}
                            onClick={() => { setSelectedFw(fw); setConfigTab('config') }}
                            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                            transition={{ delay:0.3 + i * 0.04, duration:0.3 }}
                            whileTap={{ scale:0.96 }}
                            role="option" aria-selected={selectedFw?.id === fw.id}
                          >
                            <div className="fw-badge" aria-hidden="true">{fw.badge}</div>
                            <span className="fw-name">{fw.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Config Output */}
                    <AnimatePresence>
                      {selectedFw && (
                        <motion.div className="config-section" key={selectedFw.id}
                          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                          exit={{ opacity:0, y:-8 }}
                          transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
                        >
                          <div className="section-label" style={{ marginBottom:'12px' }}>
                            <ChevronRight size={13} aria-hidden="true" />
                            Your fix — {selectedFw.name}
                            {parsed.needsCredentials && (
                              <span style={{ fontSize:11, background:'var(--warning-dim)', border:'1px solid var(--warning-border)', color:'var(--warning)', borderRadius:20, padding:'2px 8px', marginLeft:8 }}>
                                <AlertTriangle size={10} style={{ verticalAlign:-1 }} aria-hidden="true" /> credentials mode
                              </span>
                            )}
                          </div>

                          <div className="glass config-card">
                            <div className="config-tab-bar" role="tablist">
                              <button className={`config-tab ${configTab==='config'  ? 'active':''}`} onClick={() => setConfigTab('config')}  role="tab" aria-selected={configTab==='config'}>Config</button>
                              {selectedFw.install && (
                                <button className={`config-tab ${configTab==='install' ? 'active':''}`} onClick={() => setConfigTab('install')} role="tab" aria-selected={configTab==='install'}>Install</button>
                              )}
                            </div>

                            <AnimatePresence mode="wait">
                              {configTab === 'config' && (
                                <motion.div key="cfg" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                                  <div className="code-header">
                                    <span className="code-lang">{selectedFw.language}</span>
                                    <CopyButton text={activeConfig} label="config" />
                                  </div>
                                  <pre className="code-block" aria-label={`${selectedFw.name} CORS config`}>{activeConfig}</pre>
                                  <div className="config-note">
                                    <Info size={12} aria-hidden="true" /> {selectedFw.note}
                                  </div>
                                </motion.div>
                              )}
                              {configTab === 'install' && selectedFw.install && (
                                <motion.div key="ins" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                                  <div className="install-block">
                                    <code className="install-cmd">{selectedFw.install}</code>
                                    <CopyButton text={selectedFw.install} label="command" />
                                  </div>
                                  <div className="config-note">
                                    <Info size={12} aria-hidden="true" /> Run in your project root before adding the config
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Client Checklist */}
                    <AnimatePresence>
                      {selectedFw && (
                        <motion.div key="checklist"
                          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                          exit={{ opacity:0 }}
                          transition={{ delay:0.15, duration:0.38, ease:[0.22,1,0.36,1] }}
                        >
                          <div className="section-label" style={{ marginBottom:'12px' }}>
                            <Check size={13} aria-hidden="true" /> Also verify on the client
                          </div>
                          <ClientChecklist parsed={parsed} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </main>

        {/* ── Footer ────────────────────────────────────── */}
        <footer className="footer">
          <span>AllowOrigin — built by </span>
          <a href="https://github.com/Zephyrex21" target="_blank" rel="noopener noreferrer"
            style={{ color:'var(--accent)', textDecoration:'none' }}>Zephyrex</a>
          <span> · Zero backend · Press </span>
          <kbd className="sm-kbd" style={{ fontSize:10 }}>?</kbd>
          <span> for shortcuts</span>
        </footer>

      </div>

      {/* ── Overlays ──────────────────────────────────── */}
      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
