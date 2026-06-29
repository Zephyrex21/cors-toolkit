import { useEffect } from 'react'

/**
 * AllowOrigin — Keyboard Shortcuts
 * Registers global keyboard shortcuts and calls the provided handlers.
 *
 * Shortcuts:
 *  Cmd/Ctrl + K     → focus the error textarea
 *  Cmd/Ctrl + Enter → diagnose / parse the error
 *  Cmd/Ctrl + D     → toggle dark/light theme
 *  Escape           → clear input and reset
 *  ?                → open shortcuts modal (when not typing)
 */
export function useKeyboardShortcuts({
  onFocusInput,
  onParse,
  onToggleTheme,
  onClear,
  onShowShortcuts,
}) {
  useEffect(() => {
    const handler = (e) => {
      const ctrlOrCmd = e.metaKey || e.ctrlKey
      const tag = document.activeElement?.tagName?.toLowerCase()
      const isTyping = tag === 'textarea' || tag === 'input'

      // ── Cmd/Ctrl + K — focus input ───────────────────────
      if (ctrlOrCmd && e.key === 'k') {
        e.preventDefault()
        onFocusInput?.()
        return
      }

      // ── Cmd/Ctrl + Enter — parse ─────────────────────────
      if (ctrlOrCmd && e.key === 'Enter') {
        e.preventDefault()
        onParse?.()
        return
      }

      // ── Cmd/Ctrl + D — toggle theme ──────────────────────
      if (ctrlOrCmd && e.key === 'd') {
        e.preventDefault()
        onToggleTheme?.()
        return
      }

      // ── Escape — clear (only when not typing in a field) ─
      if (e.key === 'Escape' && !isTyping) {
        onClear?.()
        return
      }

      // ── ? — show shortcuts modal (when not typing) ───────
      if (e.key === '?' && !isTyping) {
        onShowShortcuts?.()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onFocusInput, onParse, onToggleTheme, onClear, onShowShortcuts])
}
