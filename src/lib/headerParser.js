/**
 * AllowOrigin — Header Parser
 * Parses raw HTTP response headers (pasted from DevTools Network tab)
 * and runs a CORS audit to show what's correct, wrong, or missing.
 */

/* ─── Parse raw header string → { key: value } ──────────── */
export function parseRawHeaders(raw) {
  if (!raw?.trim()) return {}
  const result = {}

  for (const line of raw.trim().split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Skip HTTP status lines like "HTTP/1.1 200 OK"
    if (/^HTTP\//i.test(trimmed)) continue

    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue

    const key = trimmed.slice(0, colonIdx).trim().toLowerCase()
    const val = trimmed.slice(colonIdx + 1).trim()
    if (key) result[key] = val
  }

  return result
}

/* ─── Audit result statuses ──────────────────────────────── */
export const AUDIT_STATUS = {
  OK:      'ok',       // ✅ present and correct
  WARN:    'warn',     // ⚠️  present but wrong value
  MISSING: 'missing',  // ❌ absent but required
  SUGGEST: 'suggest',  // 💡 absent but recommended
}

/* ─── Run the full CORS audit ────────────────────────────── */
export function runCorsAudit(headers = {}, parsedError = null) {
  const origin     = parsedError?.origin ?? null
  const needsCreds = parsedError?.needsCredentials ?? false
  const results    = []

  /* 1. Access-Control-Allow-Origin ────────────────────────── */
  const acao = headers['access-control-allow-origin']
  if (!acao) {
    results.push({
      key:     'Access-Control-Allow-Origin',
      value:   null,
      status:  AUDIT_STATUS.MISSING,
      message: 'This header is required. Without it, the browser blocks every cross-origin response.',
      fix:     `Access-Control-Allow-Origin: ${origin ?? 'https://your-frontend.com'}`,
    })
  } else if (acao === '*' && needsCreds) {
    results.push({
      key:     'Access-Control-Allow-Origin',
      value:   acao,
      status:  AUDIT_STATUS.WARN,
      message: "Wildcard '*' cannot be used when the request includes credentials. Specify the exact origin.",
      fix:     `Access-Control-Allow-Origin: ${origin ?? 'https://your-frontend.com'}`,
    })
  } else if (origin && acao !== '*' && acao !== origin) {
    results.push({
      key:     'Access-Control-Allow-Origin',
      value:   acao,
      status:  AUDIT_STATUS.WARN,
      message: `This value doesn't match the requesting origin (${origin}). The browser compares them exactly.`,
      fix:     `Access-Control-Allow-Origin: ${origin}`,
    })
  } else {
    results.push({
      key:     'Access-Control-Allow-Origin',
      value:   acao,
      status:  AUDIT_STATUS.OK,
      message: acao === '*'
        ? 'Wildcard — allows all origins (fine for public APIs without credentials).'
        : `Correctly set to the requesting origin.`,
    })
  }

  /* 2. Access-Control-Allow-Credentials ───────────────────── */
  const acac = headers['access-control-allow-credentials']
  if (needsCreds) {
    if (!acac) {
      results.push({
        key:     'Access-Control-Allow-Credentials',
        value:   null,
        status:  AUDIT_STATUS.MISSING,
        message: 'Required when the request uses credentials (cookies / Authorization header).',
        fix:     'Access-Control-Allow-Credentials: true',
      })
    } else if (acac.toLowerCase() !== 'true') {
      results.push({
        key:     'Access-Control-Allow-Credentials',
        value:   acac,
        status:  AUDIT_STATUS.WARN,
        message: "Value must be exactly 'true' — any other string is ignored by browsers.",
        fix:     'Access-Control-Allow-Credentials: true',
      })
    } else {
      results.push({
        key:     'Access-Control-Allow-Credentials',
        value:   acac,
        status:  AUDIT_STATUS.OK,
        message: 'Correctly set. Credentials (cookies / auth headers) will be accepted.',
      })
    }
  } else if (acac) {
    results.push({
      key:     'Access-Control-Allow-Credentials',
      value:   acac,
      status:  AUDIT_STATUS.OK,
      message: 'Present — note this only matters when the client sends credentials.',
    })
  }

  /* 3. Access-Control-Allow-Methods ───────────────────────── */
  const acam = headers['access-control-allow-methods']
  const blockedMethod = parsedError?.blockedMethod
  if (!acam) {
    results.push({
      key:     'Access-Control-Allow-Methods',
      value:   null,
      status:  AUDIT_STATUS.SUGGEST,
      message: 'Recommended — explicitly list allowed HTTP methods to avoid ambiguity during preflight.',
      fix:     'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS',
    })
  } else if (blockedMethod && !acam.toUpperCase().includes(blockedMethod.toUpperCase())) {
    results.push({
      key:     'Access-Control-Allow-Methods',
      value:   acam,
      status:  AUDIT_STATUS.WARN,
      message: `Method ${blockedMethod} is not listed. Add it to allow this request type.`,
      fix:     `Access-Control-Allow-Methods: ${acam}, ${blockedMethod}`,
    })
  } else {
    results.push({
      key:     'Access-Control-Allow-Methods',
      value:   acam,
      status:  AUDIT_STATUS.OK,
      message: 'Allowed methods are specified.',
    })
  }

  /* 4. Access-Control-Allow-Headers ───────────────────────── */
  const acah = headers['access-control-allow-headers']
  const blockedHeader = parsedError?.blockedHeader
  if (!acah) {
    const msg = blockedHeader
      ? `Required — the request sends a '${blockedHeader}' header that must be explicitly allowed.`
      : 'Recommended — list all custom headers your client sends (e.g. Authorization, Content-Type).'
    results.push({
      key:     'Access-Control-Allow-Headers',
      value:   null,
      status:  blockedHeader ? AUDIT_STATUS.MISSING : AUDIT_STATUS.SUGGEST,
      message: msg,
      fix:     `Access-Control-Allow-Headers: Content-Type, Authorization${blockedHeader ? `, ${blockedHeader}` : ''}`,
    })
  } else if (blockedHeader && !acah.toLowerCase().includes(blockedHeader.toLowerCase())) {
    results.push({
      key:     'Access-Control-Allow-Headers',
      value:   acah,
      status:  AUDIT_STATUS.WARN,
      message: `'${blockedHeader}' is not listed in allowed headers. Add it.`,
      fix:     `Access-Control-Allow-Headers: ${acah}, ${blockedHeader}`,
    })
  } else {
    results.push({
      key:     'Access-Control-Allow-Headers',
      value:   acah,
      status:  AUDIT_STATUS.OK,
      message: 'Custom headers are whitelisted.',
    })
  }

  /* 5. Access-Control-Max-Age (optional perf tip) ─────────── */
  const maxAge = headers['access-control-max-age']
  if (!maxAge) {
    results.push({
      key:     'Access-Control-Max-Age',
      value:   null,
      status:  AUDIT_STATUS.SUGGEST,
      message: 'Optional but recommended — caches the preflight response so the browser skips the OPTIONS request on repeat calls.',
      fix:     'Access-Control-Max-Age: 86400',
    })
  } else {
    results.push({
      key:     'Access-Control-Max-Age',
      value:   maxAge,
      status:  AUDIT_STATUS.OK,
      message: `Preflight response cached for ${Math.round(Number(maxAge) / 3600)}h — reduces OPTIONS round trips.`,
    })
  }

  /* 6. Vary: Origin (proxy cache tip) ─────────────────────── */
  const vary = headers['vary']
  if (acao && acao !== '*') {
    if (!vary || !vary.toLowerCase().includes('origin')) {
      results.push({
        key:     'Vary',
        value:   vary ?? null,
        status:  AUDIT_STATUS.SUGGEST,
        message: 'When using a dynamic origin (not wildcard), add Vary: Origin to prevent CDNs/proxies from serving a cached response with the wrong ACAO header to different origins.',
        fix:     vary ? `Vary: ${vary}, Origin` : 'Vary: Origin',
      })
    } else {
      results.push({
        key:     'Vary',
        value:   vary,
        status:  AUDIT_STATUS.OK,
        message: 'Good — includes Origin, preventing proxy cache collisions.',
      })
    }
  }

  return results
}
