import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Info } from 'lucide-react'

/**
 * Toast notification — appears at bottom-center, auto-dismisses.
 *
 * Usage in App.jsx:
 *   const [toast, setToast] = useState(null)
 *   const showToast = (msg, type = 'info') => {
 *     setToast({ msg, type, id: Date.now() })
 *   }
 *   <Toast toast={toast} onDismiss={() => setToast(null)} />
 */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 2200)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  const isSuccess = toast?.type === 'success'

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className={`toast-wrap ${isSuccess ? 'success' : 'info'}`}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{   opacity: 0, y: 8,   scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="toast-icon">
            {isSuccess ? <Check size={13} /> : <Info size={13} />}
          </span>
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
