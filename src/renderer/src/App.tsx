import { useEffect, useMemo, useState } from 'react'
import { AnimatedBg } from './components/AnimatedBg'
import { TitleBar } from './components/TitleBar'
import { Sidebar, type PageId } from './components/Sidebar'
import { Splash } from './components/Splash'
import { Home } from './pages/Home'
import { Optimisation } from './pages/Optimisation'
import { Nettoyage } from './pages/Nettoyage'
import { Aide } from './pages/Aide'
import { I18nContext, getDict, pickLocale, type Locale } from './i18n'

export default function App() {
  const [locale, setLocale] = useState<Locale>('en')
  const [page, setPage] = useState<PageId>('home')
  const [splash, setSplash] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loc = await window.heart.getLocale()
        if (!cancelled) setLocale(pickLocale(loc || navigator.language || 'en'))
      } catch {
        if (!cancelled) setLocale(pickLocale(navigator.language || 'en'))
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    const t = setTimeout(() => setSplash(false), 2200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [])

  const t = useMemo(() => getDict(locale), [locale])
  const ctx = useMemo(() => ({ locale, t, setLocale }), [locale, t])

  return (
    <I18nContext.Provider value={ctx}>
      <AnimatedBg />
      <Splash visible={splash || !ready} />
      <div className="app-shell">
        <TitleBar />
        <div className="app-body">
          <Sidebar page={page} onNavigate={setPage} />
          <main className="main-content">
            {page === 'home' && <Home onNavigate={setPage} />}
            {page === 'optimisation' && <Optimisation />}
            {page === 'nettoyage' && <Nettoyage />}
            {page === 'aide' && <Aide />}
          </main>
        </div>
      </div>
    </I18nContext.Provider>
  )
}
