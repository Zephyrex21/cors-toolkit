import { useLayoutEffect } from 'react'

/**
 * AllowOrigin — Auto-resize Textarea
 * Grows a textarea's height to fit its content (up to maxHeight),
 * then switches to internal scrolling. Replaces the browser's
 * native drag-to-resize handle, which looks unfinished in a
 * production UI and lets users stretch the layout out of shape.
 *
 * @param {React.RefObject<HTMLTextAreaElement>} ref
 * @param {string} value      — current textarea value (re-measures on change)
 * @param {number} maxHeight  — px cap before internal scroll kicks in
 */
export function useAutoResizeTextarea(ref, value, maxHeight = 260) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const next = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [ref, value, maxHeight])
}
