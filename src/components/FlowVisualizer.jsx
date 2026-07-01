import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Globe, Server, Check, X } from 'lucide-react'
import { ERROR_TYPE } from '../lib/errorParser'

/* ─── Step machine — plays once, stops at 'result' ──────────
 *  normal    → idle → req → server → res → result
 *  preflight → idle → pre_req → pre_srv → pre_res → req → server → res → result
 */
const NORMAL_STEPS    = ['idle','req','server','res','result']
const PREFLIGHT_STEPS = ['idle','pre_req','pre_srv','pre_res','req','server','res','result']

const STEP_MS = {
  idle: 400, pre_req: 950, pre_srv: 500,
  pre_res: 950, req: 950, server: 550, res: 950,
}

/* ─── Context-aware labels ───────────────────────────────── */
function getLabels(parsed) {
  const host   = parsed?.targetHost ?? 'api.yourapp.com'
  const isCred = parsed?.needsCredentials
  return {
    req:            `GET ${host}`,
    pre_req:        `OPTIONS ${host}`,
    res_before:     isCred ? "200 — Allow-Origin: '*' (invalid)" : '200 — No Allow-Origin header',
    res_after:      '200 OK — CORS headers ✓',
    pre_res_before: '200 — No CORS headers',
    pre_res_after:  '204 No Content — Preflight ✓',
  }
}

/* ─── Response headers preview ───────────────────────────── */
function getHeaders(parsed, mode) {
  const origin   = parsed?.origin          ?? 'http://localhost:3000'
  const isCred   = parsed?.needsCredentials
  const isHdrBlk = parsed?.errorType === ERROR_TYPE.HEADER_NOT_ALLOWED
  const header   = parsed?.blockedHeader   ?? 'authorization'

  const before = [
    { k: 'HTTP/1.1 200 OK',                 v: null,                                    t: 'neutral' },
    { k: 'Content-Type',                    v: 'application/json',                     t: 'ok'      },
    isCred
      ? { k: 'Access-Control-Allow-Origin', v: "'*' — invalid with credentials",       t: 'bad'     }
      : { k: 'Access-Control-Allow-Origin', v: '(missing)',                             t: 'bad'     },
    isCred  ? { k: 'Access-Control-Allow-Credentials', v: '(missing)',                 t: 'bad'  } : null,
    isHdrBlk? { k: 'Access-Control-Allow-Headers',     v: `'${header}' not listed`,   t: 'bad'  } : null,
  ].filter(Boolean)

  const after = [
    { k: 'HTTP/1.1 200 OK',                      v: null,                                t: 'neutral' },
    { k: 'Content-Type',                          v: 'application/json',                 t: 'ok'      },
    { k: 'Access-Control-Allow-Origin',           v: origin,                             t: 'good'    },
    { k: 'Access-Control-Allow-Methods',          v: 'GET, POST, PUT, DELETE, OPTIONS',  t: 'good'    },
    { k: 'Access-Control-Allow-Headers',          v: 'Content-Type, Authorization',      t: 'good'    },
    isCred ? { k: 'Access-Control-Allow-Credentials', v: 'true',                        t: 'good' } : null,
  ].filter(Boolean)

  return mode === 'before' ? before : after
}

/* ─── Arrow ──────────────────────────────────────────────── */
function FlowArrow({ show, direction, label, color }) {
  const isRight = direction === 'right'

  return (
    <div className="fa-wrap">
      <AnimatePresence>
        {show && (
          <motion.span className="fa-label" style={{ color }}
            initial={{ opacity: 0, y: isRight ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.18, duration: 0.32 }}
          >{label}</motion.span>
        )}
      </AnimatePresence>

      <div className="fa-track-wrap">
        {/* Left arrowhead */}
        {!isRight && (
          <motion.span className="fa-head" style={{ color }}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: show ? 1 : 0, x: show ? 0 : 5 }}
            transition={{ delay: 0.75, duration: 0.2 }}
          >◂</motion.span>
        )}

        <div className="fa-line-wrap">
          {/* The drawing line */}
          <motion.div
            className="fa-line"
            style={{ background: `linear-gradient(${isRight ? '90deg' : '270deg'}, transparent, ${color} 15%, ${color})`, originX: isRight ? 0 : 1 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: show ? 1 : 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* The glowing packet */}
          <AnimatePresence>
            {show && (
              <motion.div
                className="fa-packet"
                style={{ background: color }}
                initial={{ x: isRight ? '0%' : '95%', opacity: 0, scale: 0.6 }}
                animate={{ x: isRight ? '95%' : '0%', opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.88, ease: 'easeInOut', times: [0, 0.1, 0.85, 1] }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right arrowhead */}
        {isRight && (
          <motion.span className="fa-head" style={{ color }}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: show ? 1 : 0, x: show ? 0 : -5 }}
            transition={{ delay: 0.75, duration: 0.2 }}
          >▸</motion.span>
        )}
      </div>
    </div>
  )
}

/* ─── Node ───────────────────────────────────────────────── */
function FlowNode({ Icon, title, sub, status }) {
  const statusClass = status !== 'idle' ? `status-${status}` : ''

  return (
    <div className={`fn-wrap ${statusClass}`}>
      <div className="fn-icon">
        <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <div className="fn-title">{title}</div>
      <div className="fn-sub">{sub}</div>

      <AnimatePresence mode="wait">
        {status === 'error' && (
          <motion.div key="e" className="fn-badge err"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          ><X size={11} strokeWidth={3} /></motion.div>
        )}
        {status === 'ok' && (
          <motion.div key="ok" className="fn-badge ok"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          ><Check size={11} strokeWidth={3} /></motion.div>
        )}
        {status === 'proc' && (
          <motion.div key="p" className="fn-badge proc"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────── */
export default function FlowVisualizer({ parsed }) {
  const [mode, setMode] = useState('before')
  const [step, setStep] = useState('idle')

  const isPreflight = parsed?.isPreflight ||
    parsed?.errorType === ERROR_TYPE.PREFLIGHT_FAILED ||
    parsed?.errorType === ERROR_TYPE.HEADER_NOT_ALLOWED

  const steps = isPreflight ? PREFLIGHT_STEPS : NORMAL_STEPS

  const advance = useCallback(() => {
    setStep(curr => {
      const i = steps.indexOf(curr)
      if (i === -1 || i >= steps.length - 1) return curr // hold at 'result'
      return steps[i + 1]
    })
  }, [steps])

  useEffect(() => {
    if (step === 'result') return
    const t = setTimeout(advance, STEP_MS[step] ?? 800)
    return () => clearTimeout(t)
  }, [step, advance])

  const replay = useCallback(() => setStep('idle'), [])
  useEffect(() => { replay() }, [mode, parsed, replay])

  /* ── Derived ───────────────────────────────────────────── */
  const isAfter  = mode === 'after'
  const labels   = getLabels(parsed)
  const headers  = getHeaders(parsed, mode)
  const origin   = parsed?.origin     ?? 'http://localhost:3000'
  const host     = parsed?.targetHost ?? 'api.yourapp.com'
  const isDone   = step === 'result'

  const showPreReq = isPreflight && ['pre_req','pre_srv','pre_res','req','server','res','result'].includes(step)
  const showPreRes = isPreflight && ['pre_res','req','server','res','result'].includes(step)
  const showReq    = ['req','server','res','result'].includes(step)
  const showRes    = ['res','result'].includes(step)
  const isPulsing  = ['server','pre_srv'].includes(step)

  const ACCENT  = 'var(--accent)'
  const SUCCESS = 'var(--success)'
  const ERROR   = 'var(--error)'
  const WARNING = 'var(--warning)'

  const browserStatus = isDone ? (isAfter ? 'ok' : 'error') : 'idle'
  const serverStatus  = isPulsing ? 'proc' : isDone ? (isAfter ? 'ok' : 'idle') : 'idle'

  return (
    <div className="fv-wrap glass" aria-label="CORS request flow visualizer">

      {/* Top bar */}
      <div className="fv-topbar">
        <span className="fv-title">Request flow</span>

        <div className="fv-toggle" role="group" aria-label="View before or after fix">
          <button className={`fv-tog-btn ${mode === 'before' ? 'on-before' : ''}`} onClick={() => setMode('before')}>
            Before fix
          </button>
          <button className={`fv-tog-btn ${mode === 'after' ? 'on-after' : ''}`} onClick={() => setMode('after')}>
            After fix
          </button>
        </div>

        <button className="fv-ctrl" onClick={replay} aria-label="Replay animation" title="Replay">
          <RotateCcw size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Diagram */}
      <div className="fv-diagram">
        <FlowNode Icon={Globe} title="Browser" sub={origin.replace(/https?:\/\//, '')} status={browserStatus} />

        <div className="fv-arrows">
          {isPreflight && (
            <div className="fv-exchange preflight">
              <div className="fv-xch-label">Preflight</div>
              <FlowArrow show={showPreReq} direction="right" label={labels.pre_req}                                              color={ACCENT}                        />
              <FlowArrow show={showPreRes} direction="left"  label={isAfter ? labels.pre_res_after : labels.pre_res_before}      color={isAfter ? SUCCESS : WARNING}   />
            </div>
          )}
          <div className={`fv-exchange main ${isPreflight ? 'has-pre' : ''}`}>
            {isPreflight && <div className="fv-xch-label">Actual request</div>}
            <FlowArrow show={showReq} direction="right" label={labels.req}                                  color={ACCENT}                     />
            <FlowArrow show={showRes} direction="left"  label={isAfter ? labels.res_after : labels.res_before} color={isAfter ? SUCCESS : ERROR}  />
          </div>
        </div>

        <FlowNode Icon={Server} title="Server" sub={host} status={serverStatus} />
      </div>

      {/* Result banner */}
      <div className="fv-result-zone">
        <AnimatePresence>
          {isDone && (
            <motion.div
              className={`fv-result ${isAfter ? 'ok' : 'err'}`}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              role="status" aria-live="polite"
            >
              {isAfter ? <Check size={15} strokeWidth={2.5} /> : <X size={15} strokeWidth={2.5} />}
              <span>
                {isAfter
                  ? 'Browser received the response — CORS policy satisfied'
                  : 'Browser blocked the response — CORS policy violation'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Response headers preview */}
      <div className="fv-headers">
        <div className="fvh-title">Response headers</div>
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            {headers.map((h, i) => (
              <motion.div
                key={h.k}
                className={`fvh-row ${h.t}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: showRes || isDone ? 1 : 0.18, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.32, ease: [0.22,1,0.36,1] }}
              >
                <span className="fvh-key">{h.k}</span>
                {h.v !== null && <><span className="fvh-sep">: </span><span className="fvh-val">{h.v}</span></>}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
