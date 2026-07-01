import { useState, useEffect, useCallback } from 'react'
import ParticleCanvas from './components/ParticleCanvas'
import Homepage from './components/Homepage'
import ToolApp from './components/ToolApp'
import { decodeState } from './lib/urlState'

/**
 * AllowOrigin — App Shell
 * Gates the tool behind the homepage. The particle background and
 * theme persist across both views so switching feels seamless rather
 * than like a page reload. Shared fix links (URL has an encoded error)
 * skip the homepage and open straight into the tool.
 */
export default function App() {
  const [theme, setTheme] = useState('dark')
  const [view,  setView]  = useState('home') // 'home' | 'tool'

  /* Apply theme to <html> for CSS custom properties */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  /* Shared links open straight into the tool, bypassing the homepage */
  useEffect(() => {
    const { errorText } = decodeState()
    if (errorText) setView('tool')
  }, [])

  /* Support the browser back button between home and tool */
  useEffect(() => {
    const onPop = (e) => setView(e.state?.view ?? 'home')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goToTool = useCallback(() => {
    setView('tool')
    window.history.pushState({ view: 'tool' }, '', window.location.search)
  }, [])

  const goHome = useCallback(() => {
    setView('home')
    window.history.pushState({ view: 'home' }, '', window.location.pathname)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <>
      <ParticleCanvas theme={theme} />
      {view === 'home'
        ? <Homepage theme={theme} onToggleTheme={toggleTheme} onGetStarted={goToTool} />
        : <ToolApp  theme={theme} onToggleTheme={toggleTheme} onGoHome={goHome} />
      }
    </>
  )
}
