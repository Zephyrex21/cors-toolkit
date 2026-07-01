import { motion } from 'framer-motion'

/**
 * AllowOrigin — Step Section
 * Wraps a stage of the diagnose → fix flow with a numbered badge
 * and consistent heading treatment, so the page reads as a guided
 * sequence rather than a stack of disconnected panels.
 */
export default function StepSection({ number, title, icon: Icon, trailing, delay = 0, children, style }) {
  return (
    <motion.section
      className="step-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      <div className="step-head">
        <span className="step-number" aria-hidden="true">{number}</span>
        <span className="step-title">
          {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
          {title}
        </span>
        {trailing && <span className="step-trailing">{trailing}</span>}
      </div>
      <div className="step-body">{children}</div>
    </motion.section>
  )
}
