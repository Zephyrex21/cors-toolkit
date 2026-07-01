import { motion } from 'framer-motion'
import {
  ArrowRight, Github, Moon, Sun,
  ClipboardPaste, ScanSearch, Wrench,
  Fingerprint, Workflow, Boxes, ListChecks, ClipboardCheck, Link2,
} from 'lucide-react'
import LogoMark from './LogoMark'
import FrameworkIcon from './FrameworkIcon'
import { FRAMEWORKS } from '../lib/frameworkConfigs'

/* ─── Content ─────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    Icon: ClipboardPaste,
    title: 'Paste the error',
    desc: 'Drop the raw CORS error straight from your browser console — Chrome, Firefox, or Safari.',
  },
  {
    Icon: ScanSearch,
    title: 'We diagnose it',
    desc: 'Origin, blocked URL, and root cause are extracted automatically — no manual reading required.',
  },
  {
    Icon: Wrench,
    title: 'Get the exact fix',
    desc: 'Framework-specific config, a visual request flow, and a full headers audit — copy-paste ready.',
  },
]

const FEATURES = [
  { Icon: Fingerprint,    title: 'Error DNA parser',       desc: 'Chrome, Firefox, and Safari error formats decoded automatically into origin, method, and header.' },
  { Icon: Workflow,       title: 'Animated request flow',  desc: 'Watch exactly where the request gets blocked, then watch it succeed once the fix is applied.' },
  { Icon: Boxes,          title: '9 framework configs',    desc: 'Express, Fastify, Nginx, FastAPI, Django, Spring, Laravel, Gin, and ASP.NET — pre-filled with your origin.' },
  { Icon: ListChecks,     title: 'Headers audit',          desc: 'Paste your response headers and get a full CORS diff — what\u2019s correct, wrong, or missing.' },
  { Icon: ClipboardCheck, title: 'Client-side checklist',  desc: 'Context-aware checks for fetch options, middleware order, and local dev proxy setup.' },
  { Icon: Link2,          title: 'Shareable fix links',    desc: 'Every diagnosis encodes into a URL — share the exact fix with your team in one click.' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

/* ─── Component ───────────────────────────────────────────── */
export default function Homepage({ theme, onToggleTheme, onGetStarted }) {
  return (
    <div className="home-wrapper">

      {/* ── Nav ───────────────────────────────────────────── */}
      <header className="home-nav">
        <div className="home-nav-inner">
          <div className="logo">
            <LogoMark size={26} />
            <span className="logo-name">Allow<span className="logo-tld">Origin</span></span>
          </div>

          <div className="home-nav-actions">
            <a
              className="btn-icon"
              href="https://github.com/Zephyrex21/alloworigin"
              target="_blank" rel="noopener noreferrer"
              aria-label="View source on GitHub"
              title="View on GitHub"
            >
              <Github size={15} strokeWidth={1.9} />
            </a>
            <button className="btn-icon" onClick={onToggleTheme} aria-label="Toggle dark/light mode" title="Toggle theme">
              {theme === 'dark' ? <Sun size={15} strokeWidth={1.9} /> : <Moon size={15} strokeWidth={1.9} />}
            </button>
            <button className="home-nav-cta" onClick={onGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="home-hero">
        <motion.div className="hero-eyebrow"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        >
          Zero backend · Built for developers
        </motion.div>

        <motion.h1 className="home-hero-title"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
        >
          CORS errors,<br /><span>solved in seconds.</span>
        </motion.h1>

        <motion.p className="home-hero-sub"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }}
        >
          Paste the error. Pick your framework. Get a production-ready fix —
          with the exact lines, pre-filled with your origin.
        </motion.p>

        <motion.div className="home-hero-ctas"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.24 }}
        >
          <button className="cta-primary" onClick={onGetStarted}>
            Get Started
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>
          <a
            className="cta-secondary"
            href="https://github.com/Zephyrex21/alloworigin"
            target="_blank" rel="noopener noreferrer"
          >
            <Github size={16} strokeWidth={2} />
            View on GitHub
          </a>
        </motion.div>

        {/* ── Floating preview mockup ─────────────────────── */}
        <motion.div
          className="hero-mockup-zone"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="hero-mockup glass"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="mockup-bar">
              <span className="mockup-dot" />
              <span className="mockup-dot" />
              <span className="mockup-dot" />
              <span className="mockup-url">alloworigin.dev</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-dna">
                <div className="mockup-dna-card accent">
                  <span className="mockup-dna-label">Your origin</span>
                  <span className="mockup-dna-value">localhost:3000</span>
                </div>
                <div className="mockup-dna-card error">
                  <span className="mockup-dna-label">Error type</span>
                  <span className="mockup-dna-value">Missing ACAO header</span>
                </div>
              </div>
              <div className="mockup-flow">
                <div className="mockup-node">
                  <ScanSearch size={14} strokeWidth={1.8} />
                </div>
                <div className="mockup-flow-line">
                  <motion.div
                    className="mockup-flow-pulse"
                    animate={{ x: ['0%', '100%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
                <div className="mockup-node">
                  <Boxes size={14} strokeWidth={1.8} />
                </div>
              </div>
              <div className="mockup-code">
                <span className="mockup-code-line dim">app.use(cors({'{'}</span>
                <span className="mockup-code-line accent">&nbsp;&nbsp;origin: 'localhost:3000',</span>
                <span className="mockup-code-line dim">{'}'}));</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="home-section">
        <motion.div className="home-section-head" {...fadeUp(0)}>
          <span className="home-kicker">How it works</span>
          <h2 className="home-section-title">Three steps. No guessing.</h2>
        </motion.div>

        <div className="how-grid">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={step.title} className="how-card" {...fadeUp(0.1 + i * 0.1)}>
              <div className="how-num">{i + 1}</div>
              <div className="how-icon"><step.Icon size={20} strokeWidth={1.7} /></div>
              <h3 className="how-title">{step.title}</h3>
              <p className="how-desc">{step.desc}</p>
              {i < HOW_IT_WORKS.length - 1 && <div className="how-connector" aria-hidden="true" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ──────────────────────────────────── */}
      <section className="home-section">
        <motion.div className="home-section-head" {...fadeUp(0)}>
          <span className="home-kicker">Everything included</span>
          <h2 className="home-section-title">Built deeper than a snippet generator.</h2>
        </motion.div>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="feature-card glass" {...fadeUp((i % 3) * 0.08)}>
              <div className="feature-card-icon"><f.Icon size={19} strokeWidth={1.7} /></div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Framework strip ───────────────────────────────── */}
      <section className="home-section">
        <motion.div className="home-section-head" {...fadeUp(0)}>
          <span className="home-kicker">Works with your stack</span>
          <h2 className="home-section-title">9 frameworks, one source of truth.</h2>
        </motion.div>

        <motion.div className="fw-strip" {...fadeUp(0.1)}>
          {FRAMEWORKS.map((fw) => (
            <div key={fw.id} className="fw-strip-item">
              <FrameworkIcon id={fw.badge} size={18} />
              <span>{fw.name}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="home-final-cta">
        <motion.div {...fadeUp(0)}>
          <h2 className="home-final-title">Stop guessing. Start fixing.</h2>
          <p className="home-final-sub">Free, open-source, and runs entirely in your browser.</p>
          <button className="cta-primary large" onClick={onGetStarted}>
            Get Started
            <ArrowRight size={17} strokeWidth={2.2} />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="footer">
        <span>AllowOrigin — built by </span>
        <a href="https://github.com/Zephyrex21" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}>Zephyrex</a>
        <span> · Zero backend · 100% client-side</span>
      </footer>
    </div>
  )
}
