import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Moon, Sun, Copy, Check, ChevronRight, ChevronLeft,
  Zap, Globe, Lock, AlertTriangle, Info,
  Link2, RotateCcw, Sparkles, Search,
  Compass, Flame, HelpCircle,
} from 'lucide-react'
import { parseError, ERROR_TYPE_LABELS, ERROR_TYPE_COLORS } from '../lib/errorParser'
import { FRAMEWORKS } from '../lib/frameworkConfigs'
import { encodeState, decodeState, getShareUrl } from '../lib/urlState'
import { useAutoResizeTextarea } from '../lib/useAutoResizeTextarea'
import FlowVisualizer   from './FlowVisualizer'
import HeadersInspector from './HeadersInspector'
import ClientChecklist  from './ClientChecklist'
import Toast             from './Toast'
import StepSection       from './StepSection'
import LogoMark          from './LogoMark'
import FrameworkIcon     from './FrameworkIcon'

/* ─── Sample errors ──────────────────────────────────────── */
const SAMPLES = [
  `Access to fetch at 'https://api.myapp.com/v1/users' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
  `Access to fetch at 'https://api.myapp.com/v1/data' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
  `Access to fetch at 'https://api.myapp.com/v1/auth' from origin 'http://localhost:5173' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.`,
  `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://api.myapp.com/v1/posts. (Reason: CORS header 'Access-Control-Allow-Origin' missing).`,
]

const BROWSER_ICONS = {
  chrome:  { Icon: Globe,       label: 'Chrome / Edge' },
  firefox: { Icon: Flame,       label: 'Firefox' },
  safari:  { Icon: Compass,     label: 'Safari' },
  unknown: { Icon: HelpCircle,  label: 'Unknown browser' },
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

/* ─── Main Tool ──────────────────────────────────────────── */
export default function ToolApp({ theme, onToggleTheme, onGoHome }) {
  const [errorText,  setErrorText]  = useState('')
  const [parsed,     setParsed]     = useState(null)
  const [parseErr,   setParseErr]   = useState('')
  const [selectedFw, setSelectedFw] = useState(null)
  const [configTab,  setConfigTab]  = useState('config')
  const [shared,     setShared]     = useState(false)
  const [toast,      setToast]      = useState(null)

  const textareaRef = useRef(null)
  const resultsRef  = useRef(null)
  const sampleIdx   = useRef(0)

  useAutoResizeTextarea(textareaRef, errorText, 240)

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() })
  }, [])

  /* Restore state from URL (supports shared fix links) */
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

  /* Theme toggle feedback */
  const handleToggleTheme = useCallback(() => {
    onToggleTheme()
    showToast(`${theme === 'dark' ? 'Light' : 'Dark'} mode`, 'info')
  }, [onToggleTheme, theme, showToast])

  /* Clear */
  const handleClear = useCallback(() => {
    setErrorText(''); setParsed(null); setParseErr(''); setSelectedFw(null)
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

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
      showToast('Fix link copied', 'success')
      setTimeout(() => setShared(false), 2500)
    } catch {}
  }

  const activeConfig = selectedFw ? selectedFw.config(parsed) : ''
  const errorTypeLbl = parsed ? ERROR_TYPE_LABELS[parsed.errorType] : ''
  const errorTypeClr = parsed ? ERROR_TYPE_COLORS[parsed.errorType] : 'error'
  const browserInfo  = parsed ? (BROWSER_ICONS[parsed.browser] ?? BROWSER_ICONS.unknown) : null

  return (
    <div className="app-wrapper">

      {/* ── Header ────────────────────────────────────── */}
      <header className="header">
        <button className="logo logo-btn" onClick={onGoHome} aria-label="Back to homepage">
          <ChevronLeft size={15} className="logo-back" aria-hidden="true" />
          <LogoMark size={24} />
          <span className="logo-name">Allow<span className="logo-tld">Origin</span></span>
        </button>

        <div className="header-actions">
          {parsed?.isValid && (
            <motion.button className="btn-icon" onClick={handleShare}
              title="Copy shareable link" initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
              aria-label="Copy shareable fix link"
            >
              {shared ? <Check size={15} /> : <Link2 size={15} />}
            </motion.button>
          )}
          <button className="btn-icon" onClick={handleToggleTheme}
            aria-label="Toggle dark/light mode" title="Toggle theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero">
        <motion.div className="hero-eyebrow"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        >
          <Zap size={11} aria-hidden="true" />
          Zero backend · Instant fix
        </motion.div>

        <motion.h1 className="hero-title"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
        >
          Paste your <span>CORS error.</span><br />Get the exact fix.
        </motion.h1>

        <motion.p className="hero-sub"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }}
        >
          Supports Express, Nginx, FastAPI, Django, Spring Boot, Laravel, Go&nbsp;Gin, and ASP.NET — with your origin pre-filled.
        </motion.p>
      </section>

      {/* ── Main ──────────────────────────────────────── */}
      <main>
        <div className="container">

          {/* Error input */}
          <motion.div className="input-section"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label className="section-label" htmlFor="error-input">
              <Globe size={13} aria-hidden="true" />
              Paste your CORS error
            </label>

            <textarea
              id="error-input"
              ref={textareaRef}
              className="error-textarea"
              value={errorText}
              onChange={e => { setErrorText(e.target.value); setParseErr('') }}
              placeholder={`Paste the full error from your browser console — e.g.\n\nAccess to fetch at 'https://api.example.com/data' from origin 'http://localhost:3000' has been blocked by CORS policy...`}
              spellCheck={false}
              rows={4}
              aria-describedby={parseErr ? 'parse-error-msg' : undefined}
            />

            {parseErr && (
              <motion.div id="parse-error-msg" className="parse-error" role="alert"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                {parseErr}
              </motion.div>
            )}

            <div className="input-actions">
              <div style={{ display: 'flex', gap: '12px' }}>
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
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >

                  {/* Step 1 — Error DNA */}
                  <StepSection number="1" title="Error DNA" icon={Zap}
                    trailing={browserInfo && (
                      <span className="browser-badge">
                        <browserInfo.Icon size={11} aria-hidden="true" />
                        {browserInfo.label}
                      </span>
                    )}
                  >
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
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <Info size={13} style={{ verticalAlign: -2, marginRight: 8, color: 'var(--text-muted)' }} aria-hidden="true" />
                      {parsed.explanation}
                    </motion.div>
                  </StepSection>

                  {/* Step 2 — Flow Visualizer */}
                  <StepSection number="2" title="Request flow" icon={Zap} delay={0.06}>
                    <FlowVisualizer parsed={parsed} />
                  </StepSection>

                  {/* Step 3 — Headers Inspector */}
                  <StepSection number="3" title="Headers audit" icon={Search} delay={0.1}>
                    <HeadersInspector parsed={parsed} />
                  </StepSection>

                  {/* Step 4 — Framework Picker */}
                  <StepSection number="4" title="Select your server framework" icon={Lock} delay={0.14}>
                    <div className="fw-grid" role="listbox" aria-label="Choose server framework">
                      {FRAMEWORKS.map((fw, i) => (
                        <motion.button key={fw.id}
                          className={`fw-btn ${selectedFw?.id === fw.id ? 'selected' : ''}`}
                          onClick={() => { setSelectedFw(fw); setConfigTab('config') }}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.18 + i * 0.03, duration: 0.3 }}
                          whileTap={{ scale: 0.96 }}
                          role="option" aria-selected={selectedFw?.id === fw.id}
                        >
                          <div className="fw-badge" aria-hidden="true">
                            <FrameworkIcon id={fw.badge} size={18} />
                          </div>
                          <span className="fw-name">{fw.name}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Config Output */}
                    <AnimatePresence>
                      {selectedFw && (
                        <motion.div className="config-section" key={selectedFw.id}
                          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="section-label" style={{ marginBottom: '12px' }}>
                            <ChevronRight size={13} aria-hidden="true" />
                            Your fix — {selectedFw.name}
                            {parsed.needsCredentials && (
                              <span style={{ fontSize: 11, background: 'var(--warning-dim)', border: '1px solid var(--warning-border)', color: 'var(--warning)', borderRadius: 20, padding: '2px 8px', marginLeft: 8 }}>
                                <AlertTriangle size={10} style={{ verticalAlign: -1 }} aria-hidden="true" /> credentials mode
                              </span>
                            )}
                          </div>

                          <div className="glass config-card">
                            <div className="config-tab-bar" role="tablist">
                              <button className={`config-tab ${configTab === 'config' ? 'active' : ''}`} onClick={() => setConfigTab('config')} role="tab" aria-selected={configTab === 'config'}>Config</button>
                              {selectedFw.install && (
                                <button className={`config-tab ${configTab === 'install' ? 'active' : ''}`} onClick={() => setConfigTab('install')} role="tab" aria-selected={configTab === 'install'}>Install</button>
                              )}
                            </div>

                            <AnimatePresence mode="wait">
                              {configTab === 'config' && (
                                <motion.div key="cfg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
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
                                <motion.div key="ins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
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
                  </StepSection>

                  {/* Step 5 — Client Checklist */}
                  <AnimatePresence>
                    {selectedFw && (
                      <motion.div key="checklist"
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <StepSection number="5" title="Also verify on the client" icon={Check}>
                          <ClientChecklist parsed={parsed} />
                        </StepSection>
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
          style={{ color: 'var(--accent)', textDecoration: 'none' }}>Zephyrex</a>
        <span> · Zero backend · 100% client-side</span>
      </footer>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
