/**
 * AllowOrigin — URL State
 * Encodes app state into URL search params so fixes are shareable.
 * Keeps URL readable — encodes only what's needed.
 */

const PARAM_ERROR  = 'e'
const PARAM_FW     = 'fw'
const MAX_ERROR_LEN = 800  // keep URLs reasonable

/**
 * Write current state into the URL bar (no page reload).
 */
export function encodeState({ errorText = '', frameworkId = '' } = {}) {
  const params = new URLSearchParams()

  if (errorText.trim()) {
    params.set(PARAM_ERROR, errorText.trim().slice(0, MAX_ERROR_LEN))
  }
  if (frameworkId) {
    params.set(PARAM_FW, frameworkId)
  }

  const newSearch = params.toString()
  const newUrl    = newSearch
    ? `${window.location.pathname}?${newSearch}`
    : window.location.pathname

  window.history.replaceState(null, '', newUrl)
}

/**
 * Read initial state from the URL on first load.
 * @returns {{ errorText: string, frameworkId: string }}
 */
export function decodeState() {
  const params = new URLSearchParams(window.location.search)

  return {
    errorText:   params.get(PARAM_ERROR) ?? '',
    frameworkId: params.get(PARAM_FW)    ?? '',
  }
}

/**
 * Returns the full shareable URL for the current fix.
 */
export function getShareUrl() {
  return window.location.href
}
