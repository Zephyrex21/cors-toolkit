import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, Copy, Check, Info } from 'lucide-react'
import { parseRawHeaders, runCorsAudit, AUDIT_STATUS } from '../lib/headerParser'

/* ─── Status config ──────────────────────────────────────── */
const STATUS_CFG = {
  [AUDIT_STATUS.OK]:      { icon: '✓', label: 'OK',        cls: 'ok'      },
  [AUDIT_STATUS.WARN]:    { icon: '!', label: 'Wrong value',cls: 'warn'    },
  [AUDIT_STATUS.MISSING]: { icon: '✕', label: 'Missing',   cls: 'missing' },
  [AUDIT_STATUS.SUGGEST]: { icon: '·', label: 'Suggested', cls: 'suggest' },
}

/* ─── Inline copy button ─────────────────────────────────── */
function InlineCopy({ text }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800) } catch {}
  }
  return (
    <button className="hi-copy-inline" onClick={copy} aria-label="Copy fix">
      {done ? <Check size={10} /> : <Copy size={10} />}
    </button>
  )
}

/* ─── Single audit row ───────────────────────────────────── */
function AuditRow({ result, index }) {
  const [open, setOpen] = useState(result.status !== AUDIT_STATUS.OK)
  const cfg = STATUS_CFG[result.status]

  return (
    <motion.div
      className="hi-row"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {/* Header ─────────────────────────────────────────── */}
      <button
        className="hi-row-top"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={`hi-badge ${cfg.cls}`} aria-label={cfg.label}>
          {cfg.icon}
        </span>

        <span className="hi-key">{result.key}</span>

        {result.value && (
          <span className={`hi-val ${result.status === AUDIT_STATUS.WARN ? 'bad' : ''}`}>
            {result.value}
          </span>
        )}
        {!result.value && (
          <span className="hi-val absent">(not present)</span>
        )}

        <span className="hi-chevron">
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>

      {/* Detail ──────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="hi-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <p className="hi-msg">{result.message}</p>

            {result.fix && (
              <div className="hi-fix-wrap">
                <span className="hi-fix-label">Suggested fix</span>
                <div className="hi-fix-code">
                  <code>{result.fix}</code>
                  <InlineCopy text={result.fix} />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Summary bar ────────────────────────────────────────── */
function SummaryBar({ results }) {
  const counts = {
    [AUDIT_STATUS.OK]:      results.filter(r => r.status === AUDIT_STATUS.OK).length,
    [AUDIT_STATUS.WARN]:    results.filter(r => r.status === AUDIT_STATUS.WARN).length,
    [AUDIT_STATUS.MISSING]: results.filter(r => r.status === AUDIT_STATUS.MISSING).length,
    [AUDIT_STATUS.SUGGEST]: results.filter(r => r.status === AUDIT_STATUS.SUGGEST).length,
  }

  const hasErrors = counts[AUDIT_STATUS.MISSING] > 0 || counts[AUDIT_STATUS.WARN] > 0

  return (
    <div className={`hi-summary ${hasErrors ? 'has-errors' : 'clean'}`}>
      <span className="hi-summary-verdict">
        {hasErrors
          ? `${counts[AUDIT_STATUS.MISSING] + counts[AUDIT_STATUS.WARN]} issue${counts[AUDIT_STATUS.MISSING] + counts[AUDIT_STATUS.WARN] > 1 ? 's' : ''} found`
          : 'CORS headers look correct'}
      </span>
      <div className="hi-summary-pills">
        {counts[AUDIT_STATUS.OK]      > 0 && <span className="hi-pill ok">{counts[AUDIT_STATUS.OK]} OK</span>}
        {counts[AUDIT_STATUS.WARN]    > 0 && <span className="hi-pill warn">{counts[AUDIT_STATUS.WARN]} wrong</span>}
        {counts[AUDIT_STATUS.MISSING] > 0 && <span className="hi-pill missing">{counts[AUDIT_STATUS.MISSING]} missing</span>}
        {counts[AUDIT_STATUS.SUGGEST] > 0 && <span className="hi-pill suggest">{counts[AUDIT_STATUS.SUGGEST]} suggested</span>}
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function HeadersInspector({ parsed }) {
  const [expanded, setExpanded]   = useState(false)
  const [rawText,  setRawText]    = useState('')
  const [results,  setResults]    = useState(null)
  const [err,      setErr]        = useState('')

  const handleInspect = () => {
    if (!rawText.trim()) {
      setErr('Paste your response headers first.')
      return
    }
    const headers = parseRawHeaders(rawText)
    if (!Object.keys(headers).length) {
      setErr("Couldn't parse these headers — make sure you're pasting from the Network tab Response Headers section.")
      return
    }
    setErr('')
    setResults(runCorsAudit(headers, parsed))
  }

  const handleClear = () => {
    setRawText('')
    setResults(null)
    setErr('')
  }

  return (
    <div className="hi-wrap glass">

      {/* ── Toggle header ────────────────────────────────── */}
      <button
        className="hi-toggle"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <div className="hi-toggle-left">
          <Search size={14} aria-hidden="true" />
          <span className="hi-toggle-title">Inspect your response headers</span>
          <span className="hi-toggle-sub">Paste from DevTools → see exactly what's wrong</span>
        </div>
        <span className="hi-toggle-chevron">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {/* ── Expandable body ──────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="hi-body">

              {/* How-to hint */}
              <div className="hi-hint">
                <Info size={12} />
                Open DevTools → Network tab → click your failed request → Response Headers → copy all and paste below.
              </div>

              {/* Textarea */}
              <textarea
                className="hi-textarea"
                value={rawText}
                onChange={e => { setRawText(e.target.value); setErr('') }}
                placeholder={`HTTP/1.1 200 OK\nContent-Type: application/json\nX-Powered-By: Express\n\n(or just the headers block, without the status line)`}
                spellCheck={false}
                rows={6}
                aria-label="Paste response headers here"
              />

              {err && (
                <p className="hi-err" role="alert">{err}</p>
              )}

              {/* Action buttons */}
              <div className="hi-actions">
                {rawText && (
                  <button className="sample-btn" onClick={handleClear}>
                    Clear
                  </button>
                )}
                <button
                  className="parse-btn"
                  onClick={handleInspect}
                  disabled={!rawText.trim()}
                  style={{ marginLeft: 'auto' }}
                >
                  <Search size={14} />
                  Inspect headers
                </button>
              </div>

              {/* ── Audit results ─────────────────────────── */}
              <AnimatePresence>
                {results && (
                  <motion.div
                    className="hi-results"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <SummaryBar results={results} />

                    <div className="hi-rows">
                      {results.map((r, i) => (
                        <AuditRow key={r.key} result={r} index={i} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
