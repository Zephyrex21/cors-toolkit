import { useEffect, useRef } from 'react'

/**
 * AllowOrigin — Particle Canvas
 * Subtle ambient background, mouse-reactive. Rendered once at the
 * app shell level so it persists seamlessly across the homepage
 * and tool views instead of remounting (and flickering) on navigation.
 */
export default function ParticleCanvas({ theme }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const stateRef  = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width, height

    const resize = () => {
      width  = canvas.width  = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 70
    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.5,
      o:  Math.random() * 0.4 + 0.15,
    }))
    stateRef.current = { particles, mouse: { x: -999, y: -999 } }

    const onMove = (e) => {
      stateRef.current.mouse.x = e.clientX
      stateRef.current.mouse.y = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const { particles: ps, mouse } = stateRef.current
      const isDark    = theme === 'dark'
      const dotColor  = isDark ? '255,255,255' : '80,80,160'
      const lineColor = isDark ? '255,255,255' : '100,100,200'

      ps.forEach((p) => {
        const dx   = mouse.x - p.x
        const dy   = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 180) { p.vx += dx / dist * 0.012; p.vy += dy / dist * 0.012 }
        p.vx *= 0.98; p.vy *= 0.98
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = width;  if (p.x > width)  p.x = 0
        if (p.y < 0) p.y = height; if (p.y > height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dotColor},${p.o})`
        ctx.fill()
      })

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx   = ps[i].x - ps[j].x
          const dy   = ps[i].y - ps[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 90) {
            ctx.beginPath()
            ctx.moveTo(ps[i].x, ps[i].y)
            ctx.lineTo(ps[j].x, ps[j].y)
            ctx.strokeStyle = `rgba(${lineColor},${(1 - dist / 90) * 0.12})`
            ctx.lineWidth   = 0.8
            ctx.stroke()
          }
        }
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [theme])

  return <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true" />
}
