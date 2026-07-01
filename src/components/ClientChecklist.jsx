import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { ERROR_TYPE } from '../lib/errorParser'

/* ─── Build checklist items based on parsed error ────────── */
function buildItems(parsed) {
  const type        = parsed?.errorType
  const needsCreds  = parsed?.needsCredentials
  const blockedHdr  = parsed?.blockedHeader
  const blockedMeth = parsed?.blockedMethod

  const items = []

  /* ── Always shown ────────────────────────────────────── */
  items.push({
    id:    'url-check',
    group: 'fetch',
    label: 'Verify the API URL is exactly correct',
    desc:  'A typo in the domain, protocol, or port is the most common culprit. http:// and https:// are different origins.',
    code:  null,
  })

  items.push({
    id:    'no-cors-mode',
    group: 'fetch',
    label: "Don't use mode: 'no-cors' to silence the error",
    desc:  "Setting mode: 'no-cors' hides the error but returns an opaque response — you can't read the data. It's not a fix.",
    code:  `// Wrong — opaque response, can't read body\nfetch(url, { mode: 'no-cors' })\n\n// Correct — fix the server, keep default mode\nfetch(url)`,
  })

  /* ── Credentials errors ──────────────────────────────── */
  if (needsCreds || type === ERROR_TYPE.CREDENTIALS) {
    items.push({
      id:    'credentials-include',
      group: 'fetch',
      label: "Add credentials: 'include' to your fetch call",
      desc:  'If you need to send cookies or Authorization headers cross-origin, you must explicitly opt in on the client too.',
      code:  `// fetch\nfetch('https://api.example.com/data', {\n  credentials: 'include',\n})\n\n// axios\naxios.get('https://api.example.com/data', {\n  withCredentials: true,\n})`,
    })

    items.push({
      id:    'no-wildcard-creds',
      group: 'fetch',
      label: 'Server must use an exact origin, not a wildcard',
      desc:  "When credentials are involved, Access-Control-Allow-Origin: * is rejected by the browser. The server must echo back the exact requesting origin.",
      code:  `// Wrong\nAccess-Control-Allow-Origin: *\n\n// Correct\nAccess-Control-Allow-Origin: http://localhost:3000`,
    })
  }

  /* ── Blocked header ──────────────────────────────────── */
  if (blockedHdr || type === ERROR_TYPE.HEADER_NOT_ALLOWED) {
    items.push({
      id:    'custom-header',
      group: 'fetch',
      label: `Add '${blockedHdr ?? 'your custom header'}' to the server's allowed headers`,
      desc:  'The preflight OPTIONS check failed because your request sends a header the server hasn\'t whitelisted. Any header beyond the CORS-safelisted ones (Content-Type, Accept, etc.) triggers this.',
      code:  blockedHdr
        ? `// In your server config:\nAccess-Control-Allow-Headers: Content-Type, Authorization, ${blockedHdr}`
        : `Access-Control-Allow-Headers: Content-Type, Authorization`,
    })
  }

  /* ── Blocked method ──────────────────────────────────── */
  if (blockedMeth || type === ERROR_TYPE.METHOD_NOT_ALLOWED) {
    items.push({
      id:    'method-allowed',
      group: 'fetch',
      label: `Add '${blockedMeth ?? 'your HTTP method'}' to Access-Control-Allow-Methods`,
      desc:  `The server's CORS config doesn't list this method as allowed. Add it to the allowed methods list.`,
      code:  `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS${blockedMeth ? `, ${blockedMeth}` : ''}`,
    })
  }

  /* ── Preflight ───────────────────────────────────────── */
  if (type === ERROR_TYPE.PREFLIGHT_FAILED || parsed?.isPreflight) {
    items.push({
      id:    'options-route',
      group: 'server',
      label: 'Ensure your server responds to OPTIONS requests',
      desc:  'The browser sends a preflight OPTIONS request before any non-simple request. If your server returns 404 or doesn\'t handle OPTIONS at all, the preflight fails.',
      code:  `// Express — the cors() middleware handles this automatically\napp.use(cors(config))\n\n// Manual fallback\napp.options('*', cors(config))`,
    })
  }

  /* ── Middleware order (always shown) ─────────────────── */
  items.push({
    id:    'middleware-order',
    group: 'server',
    label: 'CORS middleware must come before your route handlers',
    desc:  'If you register routes before the CORS middleware, requests handled by those routes won\'t get CORS headers.',
    code:  `// Wrong order\napp.get('/api/data', handler)\napp.use(cors(config))  // too late\n\n// Correct order\napp.use(cors(config))  // first\napp.get('/api/data', handler)`,
  })

  /* ── Dev proxy ───────────────────────────────────────── */
  items.push({
    id:    'dev-proxy',
    group: 'dev',
    label: 'In development, use a proxy instead of CORS',
    desc:  'Vite and CRA both support a built-in proxy that routes API calls through the same origin — no CORS needed in dev. This is the cleanest dev setup.',
    code:  `// vite.config.js\nexport default {\n  server: {\n    proxy: {\n      '/api': 'http://localhost:8000',\n    },\n  },\n}`,
  })

  items.push({
    id:    'env-url',
    group: 'dev',
    label: 'Check your API base URL in environment variables',
    desc:  'A mismatch between VITE_API_URL in .env.development vs .env.production is a common source of CORS errors in staging/prod that work fine locally.',
    code:  `// .env.development\nVITE_API_URL=http://localhost:8000\n\n// .env.production\nVITE_API_URL=https://api.myapp.com`,
  })

  return items
}

/* ─── Groups config ──────────────────────────────────────── */
const GROUPS = {
  fetch:  { label: 'Fetch / client options', color: 'accent' },
  server: { label: 'Server configuration',   color: 'warning' },
  dev:    { label: 'Dev environment',         color: 'success' },
}

/* ─── Code snippet block ─────────────────────────────────── */
function CodeSnippet({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }
  return (
    <div className="cc-code-wrap">
      <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy} aria-label="Copy code">
        {copied ? <><Check size={11} /> Copied</> : 'Copy'}
      </button>
      <pre className="cc-code">{code}</pre>
    </div>
  )
}

/* ─── Single checklist item ──────────────────────────────── */
function CheckItem({ item, checked, onToggle }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className={`cc-item ${checked ? 'done' : ''}`}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="cc-item-top">
        {/* Checkbox */}
        <button
          className={`cc-check ${checked ? 'on' : ''}`}
          onClick={onToggle}
          role="checkbox"
          aria-checked={checked}
          aria-label={`Mark "${item.label}" as ${checked ? 'unchecked' : 'checked'}`}
        >
          {checked && <Check size={11} />}
        </button>

        {/* Label */}
        <span
          className="cc-label"
          onClick={() => setOpen(o => !o)}
          style={{ cursor: 'pointer' }}
        >
          {item.label}
        </span>

        {/* Expand toggle */}
        <button
          className="cc-expand"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-label="Toggle details"
        >
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="cc-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <p className="cc-desc">{item.desc}</p>
            {item.code && <CodeSnippet code={item.code} />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function ClientChecklist({ parsed }) {
  const items   = buildItems(parsed)
  const [checked, setChecked] = useState(new Set())

  const toggle = (id) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const total = items.length
  const done  = checked.size
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  // Group items
  const grouped = Object.entries(GROUPS).map(([key, cfg]) => ({
    key,
    ...cfg,
    items: items.filter(i => i.group === key),
  })).filter(g => g.items.length > 0)

  return (
    <div className="cc-wrap glass">

      {/* Header */}
      <div className="cc-header">
        <div className="cc-header-left">
          <span className="cc-title">Client-side checklist</span>
          <span className="cc-sub">Also verify on your frontend — CORS errors often have two causes</span>
        </div>
        <div className="cc-progress" aria-label={`${done} of ${total} checked`}>
          <div className="cc-prog-bar">
            <motion.div
              className="cc-prog-fill"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="cc-prog-label">{done}/{total}</span>
        </div>
      </div>

      {/* Groups */}
      <div className="cc-body">
        {grouped.map(group => (
          <div key={group.key} className="cc-group">
            <div className={`cc-group-label ${group.color}`}>
              {group.label}
            </div>
            <div className="cc-group-items">
              {group.items.map(item => (
                <CheckItem
                  key={item.id}
                  item={item}
                  checked={checked.has(item.id)}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* All done banner */}
      <AnimatePresence>
        {done === total && total > 0 && (
          <motion.div
            className="cc-done-banner"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check size={14} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 6 }} />
            All checked — if the issue persists, the problem is server-side. Review the config above.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
