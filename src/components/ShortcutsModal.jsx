import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'

const isMac = typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.platform)

const MOD = isMac ? '⌘' : 'Ctrl'

const SHORTCUTS = [
  { keys: [`${MOD}`, 'K'],       action: 'Focus the error input' },
  { keys: [`${MOD}`, '↵'],       action: 'Diagnose the error' },
  { keys: [`${MOD}`, 'D'],       action: 'Toggle dark / light mode' },
  { keys: ['Esc'],               action: 'Clear input and reset' },
  { keys: ['?'],                 action: 'Show this shortcuts panel' },
]

export default function ShortcutsModal({ open, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className="shortcuts-modal glass"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: 8  }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="sm-header">
              <span className="sm-title">
                <Keyboard size={15} aria-hidden="true" />
                Keyboard shortcuts
              </span>
              <button className="btn-icon" onClick={onClose} aria-label="Close shortcuts panel">
                <X size={15} />
              </button>
            </div>

            {/* Shortcut rows */}
            <div className="sm-body">
              {SHORTCUTS.map(({ keys, action }) => (
                <div key={action} className="sm-row">
                  <span className="sm-action">{action}</span>
                  <span className="sm-keys">
                    {keys.map((k, i) => (
                      <span key={i}>
                        <kbd className="sm-kbd">{k}</kbd>
                        {i < keys.length - 1 && (
                          <span className="sm-plus">+</span>
                        )}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>

            <div className="sm-footer">
              Press <kbd className="sm-kbd">?</kbd> anytime to open this panel
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
