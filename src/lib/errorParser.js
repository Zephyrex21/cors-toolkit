/**
 * AllowOrigin — Error Parser
 * Parses raw CORS error strings from Chrome, Firefox, and Safari
 * into a structured object used throughout the app.
 */

// ─── Error type constants ────────────────────────────────
export const ERROR_TYPE = {
  MISSING_HEADER:      'missing_header',
  PREFLIGHT_FAILED:    'preflight_failed',
  CREDENTIALS:         'credentials',
  HEADER_NOT_ALLOWED:  'header_not_allowed',
  METHOD_NOT_ALLOWED:  'method_not_allowed',
  UNKNOWN:             'unknown',
}

// ─── Browser detection patterns ──────────────────────────
const IS_CHROME  = /Access to (?:fetch|XMLHttpRequest) at/i
const IS_FIREFOX = /Cross-Origin Request Blocked/i
const IS_SAFARI  = /Origin .+? is not allowed by Access-Control-Allow-Origin/i

// ─── Chrome/Edge extraction patterns ─────────────────────
// "Access to fetch at 'URL' from origin 'ORIGIN' has been blocked by CORS policy: DETAIL"
const CHROME_MAIN = /Access to (?:fetch|XMLHttpRequest) at ['"`](.+?)['"`] from origin ['"`](.+?)['"`] has been blocked by CORS policy[:\s]+(.+)/is

// ─── Firefox extraction patterns ─────────────────────────
// "Cross-Origin Request Blocked: ... at URL. (Reason: REASON)"
const FIREFOX_MAIN  = /Cross-Origin Request Blocked:.+?at (.+?)\.\s*\(Reason:\s*(.+?)\)\.?/is
const FIREFOX_MATCH = /does not match ['"`](.+?)['"`]/i

// ─── Safari extraction pattern ───────────────────────────
// "Origin ORIGIN is not allowed by Access-Control-Allow-Origin. Status code: N"
const SAFARI_MAIN = /Origin (.+?) is not allowed by Access-Control-Allow-Origin/i

// ─── Error classification ─────────────────────────────────
function classifyError(text) {
  if (!text) return ERROR_TYPE.UNKNOWN
  const t = text.toLowerCase()

  if (
    (t.includes('wildcard') && t.includes('credentials')) ||
    t.includes("credentials mode is 'include'") ||
    t.includes('allow-credentials')
  ) return ERROR_TYPE.CREDENTIALS

  if (
    t.includes('header field') &&
    t.includes('not allowed by access-control-allow-headers')
  ) return ERROR_TYPE.HEADER_NOT_ALLOWED

  if (t.includes('not allowed by access-control-allow-methods')) {
    return ERROR_TYPE.METHOD_NOT_ALLOWED
  }

  if (t.includes('preflight')) return ERROR_TYPE.PREFLIGHT_FAILED

  if (
    t.includes("no 'access-control-allow-origin'") ||
    t.includes("missing") ||
    t.includes("does not match") ||
    t.includes("access-control-allow-origin")
  ) return ERROR_TYPE.MISSING_HEADER

  return ERROR_TYPE.UNKNOWN
}

// ─── Extract specific blocked header name ────────────────
function extractBlockedHeader(text) {
  const m = text?.match(/header field ['"`]?([a-zA-Z\-_]+)['"`]? is not allowed/i)
  return m?.[1] ?? null
}

// ─── Extract specific blocked method ─────────────────────
function extractBlockedMethod(text) {
  const m = text?.match(/Method\s+([A-Z]+)\s+is not allowed/i)
  return m?.[1] ?? null
}

// ─── Safe URL → origin ───────────────────────────────────
function safeOrigin(url) {
  try { return new URL(url).origin } catch { return null }
}

function safeHost(url) {
  try { return new URL(url).host } catch { return null }
}

// ─── Human-readable explanations ─────────────────────────
const EXPLANATIONS = {
  [ERROR_TYPE.MISSING_HEADER]: `Your server's response is missing the Access-Control-Allow-Origin header. The browser received a response but blocked it because there's no CORS permission declared.`,
  [ERROR_TYPE.PREFLIGHT_FAILED]: `Before the real request, the browser sent a preflight OPTIONS check — and your server didn't respond correctly to it. Your server needs to handle OPTIONS requests and return the correct CORS headers.`,
  [ERROR_TYPE.CREDENTIALS]: `You're sending credentials (cookies or Authorization headers) with the request, but your server is returning Access-Control-Allow-Origin: * — the wildcard cannot be used when credentials are involved. You must specify the exact origin and set Allow-Credentials: true.`,
  [ERROR_TYPE.HEADER_NOT_ALLOWED]: `Your request includes a custom header that your server hasn't whitelisted in Access-Control-Allow-Headers. This is caught during the preflight OPTIONS check.`,
  [ERROR_TYPE.METHOD_NOT_ALLOWED]: `The HTTP method you're using isn't listed in the server's Access-Control-Allow-Methods header. Add it to the allowed list.`,
  [ERROR_TYPE.UNKNOWN]: `A CORS policy violation was detected. The exact cause couldn't be determined — check your server's CORS configuration and ensure it returns the correct headers.`,
}

// ─── Main parse function ──────────────────────────────────
/**
 * @param {string} rawError  — raw error text from browser console
 * @returns {ParsedError | null}
 */
export function parseError(rawError) {
  if (!rawError?.trim()) return null

  const text = rawError.trim()
  let origin    = null
  let blockedUrl = null
  let detail     = null
  let browser    = 'unknown'

  // ── Chrome / Edge ──────────────────────────────────────
  if (IS_CHROME.test(text)) {
    browser = 'chrome'
    const m = text.match(CHROME_MAIN)
    if (m) {
      blockedUrl = m[1].trim()
      origin     = m[2].trim()
      detail     = m[3].trim()
    }
  }

  // ── Firefox ────────────────────────────────────────────
  else if (IS_FIREFOX.test(text)) {
    browser = 'firefox'
    const m = text.match(FIREFOX_MAIN)
    if (m) {
      blockedUrl = m[1].trim()
      detail     = m[2].trim()
    }
    // Firefox doesn't always include the requesting origin in the message,
    // so derive it from the blocked URL as a fallback
    if (!origin && blockedUrl) origin = safeOrigin(blockedUrl)
  }

  // ── Safari ─────────────────────────────────────────────
  else if (IS_SAFARI.test(text)) {
    browser = 'safari'
    const m = text.match(SAFARI_MAIN)
    if (m) origin = m[1].trim()
  }

  // ── Generic fallback (handles partial pastes) ──────────
  if (!origin) {
    const om = text.match(/origin ['"`](.+?)['"`]/i)
    if (om) origin = om[1].trim()
  }
  if (!blockedUrl) {
    const um = text.match(/at ['"`](.+?)['"`]/i)
    if (um) blockedUrl = um[1].trim()
  }

  const isValid    = !!(origin || blockedUrl)
  const errorType  = classifyError(detail ?? text)
  const targetHost = safeHost(blockedUrl ?? '')

  return {
    isValid,
    raw:           text,
    origin,
    blockedUrl,
    targetHost,
    detail,
    errorType,
    browser,
    blockedHeader:    extractBlockedHeader(detail ?? text),
    blockedMethod:    extractBlockedMethod(detail ?? text),
    needsCredentials: errorType === ERROR_TYPE.CREDENTIALS,
    isPreflight:      errorType === ERROR_TYPE.PREFLIGHT_FAILED || errorType === ERROR_TYPE.HEADER_NOT_ALLOWED,
    explanation:      EXPLANATIONS[errorType],
  }
}

// ─── Error type labels (for UI display) ──────────────────
export const ERROR_TYPE_LABELS = {
  [ERROR_TYPE.MISSING_HEADER]:     'Missing ACAO header',
  [ERROR_TYPE.PREFLIGHT_FAILED]:   'Preflight failed',
  [ERROR_TYPE.CREDENTIALS]:        'Credentials conflict',
  [ERROR_TYPE.HEADER_NOT_ALLOWED]: 'Header not allowed',
  [ERROR_TYPE.METHOD_NOT_ALLOWED]: 'Method not allowed',
  [ERROR_TYPE.UNKNOWN]:            'CORS violation',
}

export const ERROR_TYPE_COLORS = {
  [ERROR_TYPE.MISSING_HEADER]:     'error',
  [ERROR_TYPE.PREFLIGHT_FAILED]:   'warning',
  [ERROR_TYPE.CREDENTIALS]:        'warning',
  [ERROR_TYPE.HEADER_NOT_ALLOWED]: 'warning',
  [ERROR_TYPE.METHOD_NOT_ALLOWED]: 'warning',
  [ERROR_TYPE.UNKNOWN]:            'error',
}
