import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Globe, Server, Check, X } from 'lucide-react'
import { ERROR_TYPE } from '../lib/errorParser'

/* ─── Step machine ───────────────────────────────────────
 * Two flows depending on error type. Plays ONCE per mode —
 * stops at 'result' and waits for explicit replay/toggle,
 * it does not loop back to idle automatically.
 *  normal    → idle → req → server → res → result
 *  preflight → idle → pre_req → pre_srv → pre_res → req → server → res → result
 */
const NORMAL_STEPS    = ['idle','req','server','res','result']
const PREFLIGHT_STEPS = ['idle','pre_req','pre_srv','pre_res','req','server','res','result']

const STEP_MS = {
  idle:    500,
  pre_req: 900,
  pre_srv: 450,
  pre_res: 900,
  req:     900,
  server:  500,
  res:     900,
}

/* ─── Context-aware labels ───────────────────────────────── */
function getLabels(parsed) {
  const host = parsed?.targetHost ?? 'api.yourapp.com'
  const isCreds = parsed?.needsCredentials

  return {
    req:     `GET /${host}`,
    pre_req: `OPTIONS /${host}`,
    res_before: isCreds
      ? "200 — Allow-Origin: '*' (invalid)"
      : '200 — No Allow-Origin header',
    res_after:      '200 OK — CORS headers present',
    pre_res_before: '200 — No CORS headers',
    pre_res_after:  '204 No Content — Preflight OK',
  }
}

/* ─── Response headers preview data ─────────────────────── */
function getHeaders(parsed, mode) {
  const origin = parsed?.origin ?? 'http://localhost:3000'
  const isCreds = parsed?.needsCredentials
  const isHeaderBlocked = parsed?.errorType === ERROR_TYPE.HEADER_NOT_ALLOWED
  const header = parsed?.blockedHeader ?? 'authorization'

  const before = [
    { k: 'HTTP/1.1 200 OK',                  v: null,          t: 'neutral' },
    { k: 'Content-Type',                      v: 'application/json', t: 'ok' },
    isCreds
      ? { k: 'Access-Control-Allow-Origin',   v: "'*' — invalid with credentials", t: 'bad' }
      : { k: 'Access-Control-Allow-Origin',   v: '(missing)',   t: 'bad' },
    isCreds
      ? { k: 'Access-Control-Allow-Credentials', v: '(missing)', t: 'bad' }
      : null,
    isHeaderBlocked
      ? { k: 'Access-Control-Allow-Headers',  v: `'${header}' not listed`, t: 'bad' }
      : null,
  ].filter(Boolean)

  const after = [
    { k: 'HTTP/1.1 200 OK',                  v: null,          t: 'neutral' },
    { k: 'Content-Type',                      v: 'application/json', t: 'ok' },
    { k: 'Access-Control-Allow-Origin',       v: origin,        t: 'good' },
    { k: 'Access-Control-Allow-Methods',      v: 'GET, POST, PUT, DELETE, OPTIONS', t: 'good' },
    { k: 'Access-Control-Allow-Headers',      v: 'Content-Type, Authorization', t: 'good' },
    isCreds
      ? { k: 'Access-Control-Allow-Credentials', v: 'true',    t: 'good' }
      : null,
  ].filter(Boolean)

  return mode === 'before' ? before : after
}

/* ─── Arrow component ────────────────────────────────────── */
function FlowArrow({ show, direction, label, color }) {
  const isRight = direction === 'right'

  return (
    <div className={`fa-wrap ${isRight ? 'right' : 'left'}`}>
      <AnimatePresence>
        {show && (
          <motion.span
            className="fa-label"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.22, duration: 0.3 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      <div className="fa-track-wrap">
        {!isRight && show && (
          <motion.span className="fa-head" style={{ color }}
            initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.78 }}
          >◂</motion.span>
        )}

        <div className="fa-line-wrap">
          <motion.div
            className="fa-line"
            style={{ background: color, originX: isRight ? 0 : 1 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: show ? 1 : 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <AnimatePresence>
            {show && (
              <motion.div
                className="fa-packet"
                style={{ background: color }}
                initial={{ x: isRight ? '0%' : '100%', opacity: 0 }}
                animate={{ x: isRight ? '100%' : '0%', opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeInOut', times: [0, 0.1, 0.85, 1] }}
              />
            )}
          </AnimatePresence>
        </div>

        {isRight && show && (
          <motion.span className="fa-head" style={{ color }}
            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.78 }}
          >▸</motion.span>
        )}
      </div>
    </div>
  )
}

/* ─── Node component ─────────────────────────────────────── */
function FlowNode({ Icon, title, sub, status, pulse }) {
  return (
    <motion.div
      className="fn-wrap"
      animate={pulse ? {
        boxShadow: [
          '0 0 0 0px rgba(251,191,36,0)',
          '0 0 0 6px rgba(251,191,36,0.22)',
          '0 0 0 0px rgba(251,191,36,0)',
        ],
      } : {}}
      transition={{ duration: 0.55 }}
    >
      <div className="fn-icon"><Icon size={20} strokeWidth={1.75} aria-hidden="true" /></div>
      <div className="fn-title">{title}</div>
      <div className="fn-sub">{sub}</div>

      <AnimatePresence mode="wait">
        {status === 'error' && (
          <motion.div key="e" className="fn-badge err"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
          ><X size={11} strokeWidth={3} /></motion.div>
        )}
        {status === 'ok' && (
          <motion.div key="ok" className="fn-badge ok"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
          ><Check size={11} strokeWidth={3} /></motion.div>
        )}
        {status === 'proc' && (
          <motion.div key="p" className="fn-badge proc"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.7, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function FlowVisualizer({ parsed }) {
  const [mode, setMode] = useState('before')
  const [step, setStep] = useState('idle')

  const isPreflight = parsed?.isPreflight ||
    parsed?.errorType === ERROR_TYPE.PREFLIGHT_FAILED ||
    parsed?.errorType === ERROR_TYPE.HEADER_NOT_ALLOWED

  const steps = isPreflight ? PREFLIGHT_STEPS : NORMAL_STEPS

  /* Advance exactly one step forward. Stops permanently at 'result' —
     this is the fix for the old infinite-loop behaviour. */
  const advance = useCallback(() => {
    setStep(curr => {
      const i = steps.indexOf(curr)
      if (i === -1 || i >= steps.length - 1) return curr // already at 'result' — hold
      return steps[i + 1]
    })
  }, [steps])

  useEffect(() => {
    if (step === 'result') return // one-shot: do not reschedule, do not loop
    const t = setTimeout(advance, STEP_MS[step] ?? 800)
    return () => clearTimeout(t)
  }, [step, advance])

  /* Reset to start and play through once. Triggered on mount and
     whenever the before/after mode changes — i.e. plays once when the
     error first appears, and once again when the user marks it fixed. */
  const replay = useCallback(() => setStep('idle'), [])

  useEffect(() => { replay() }, [mode, parsed, replay])

  /* Derived state */
  const isAfter = mode === 'after'
  const labels  = getLabels(parsed)
  const headers = getHeaders(parsed, mode)
  const origin  = parsed?.origin     ?? 'http://localhost:3000'
  const host    = parsed?.targetHost ?? 'api.yourapp.com'

  const showPreReq = isPreflight && ['pre_req','pre_srv','pre_res','req','server','res','result'].includes(step)
  const showPreRes = isPreflight && ['pre_res','req','server','res','result'].includes(step)
  const showReq    = ['req','server','res','result'].includes(step)
  const showRes    = ['res','result'].includes(step)
  const isDone     = step === 'result'
  const isPulsing  = ['server','pre_srv'].includes(step)

  const ACCENT  = 'var(--accent)'
  const SUCCESS = 'var(--success)'
  const ERROR   = 'var(--error)'
  const WARNING = 'var(--warning)'

  const resColor    = isAfter ? SUCCESS : ERROR
  const preResColor = isAfter ? SUCCESS : WARNING

  const browserStatus = isDone ? (isAfter ? 'ok' : 'error') : 'idle'
  const serverStatus  = isPulsing ? 'proc' : 'idle'

  return (
    <div className="fv-wrap glass" aria-label="Request flow visualizer">

      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="fv-topbar">
        <span className="fv-title">Request flow</span>

        <div className="fv-toggle" role="group" aria-label="Show before or after fix">
          <button
            className={`fv-tog-btn ${mode === 'before' ? 'on-before' : ''}`}
            onClick={() => setMode('before')}
          >
            Before fix
          </button>
          <button
            className={`fv-tog-btn ${mode === 'after' ? 'on-after' : ''}`}
            onClick={() => setMode('after')}
          >
            After fix
          </button>
        </div>

        <button className="fv-ctrl" onClick={replay} aria-label="Replay animation" title="Replay">
          <RotateCcw size={13} strokeWidth={2} />
        </button>
      </div>

      {/* ── Diagram ──────────────────────────────────────── */}
      <div className="fv-diagram">
        <FlowNode
          Icon={Globe}
          title="Browser"
          sub={origin.replace(/https?:\/\//, '')}
          status={browserStatus}
          pulse={false}
        />

        <div className="fv-arrows">
          {isPreflight && (
            <div className="fv-exchange preflight">
              <div className="fv-xch-label">Preflight</div>
              <FlowArrow show={showPreReq} direction="right" label={labels.pre_req} color={ACCENT} />
              <FlowArrow show={showPreRes} direction="left"  label={isAfter ? labels.pre_res_after : labels.pre_res_before} color={preResColor} />
            </div>
          )}

          <div className={`fv-exchange main ${isPreflight ? 'has-pre' : ''}`}>
            {isPreflight && <div className="fv-xch-label">Actual request</div>}
            <FlowArrow show={showReq} direction="right" label={labels.req} color={ACCENT} />
            <FlowArrow show={showRes} direction="left"  label={isAfter ? labels.res_after : labels.res_before} color={resColor} />
          </div>
        </div>

        <FlowNode
          Icon={Server}
          title="Server"
          sub={host}
          status={serverStatus}
          pulse={isPulsing}
        />
      </div>

      {/* ── Result banner ─────────────────────────────────── */}
      <div className="fv-result-zone">
        <AnimatePresence>
          {isDone && (
            <motion.div
              className={`fv-result ${isAfter ? 'ok' : 'err'}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              role="status"
              aria-live="polite"
            >
              {isAfter ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
              <span>
                {isAfter
                  ? 'Browser received the response — CORS policy satisfied'
                  : 'Browser blocked the response — CORS policy violation'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Response headers preview ──────────────────────── */}
      <div className="fv-headers">
        <div className="fvh-title">Response headers</div>
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {headers.map((h, i) => (
              <motion.div
                key={h.k}
                className={`fvh-row ${h.t}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: showRes || isDone ? 1 : 0.2, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <span className="fvh-key">{h.k}</span>
                {h.v !== null && (
                  <>
                    <span className="fvh-sep">: </span>
                    <span className="fvh-val">{h.v}</span>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
