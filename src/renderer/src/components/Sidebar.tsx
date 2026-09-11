import type { ReactElement } from 'react'
import { useI18n } from '../i18n'
import animationLogo from '../assets/animation.png'

export type PageId = 'home' | 'optimisation' | 'nettoyage' | 'aide'

const icons: Record<PageId, ReactElement> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  ),
  optimisation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2L3 14h8l-1 8 11-14h-8l1-6z" />
    </svg>
  ),
  nettoyage: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z" />
    </svg>
  ),
  aide: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.25c-.7.4-1.1.9-1.1 1.75V14" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Sidebar({ page, onNavigate }: { page: PageId; onNavigate: (p: PageId) => void }) {
  const { t } = useI18n()
  const items: { id: PageId; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'optimisation', label: t.nav.optimisation },
    { id: 'nettoyage', label: t.nav.nettoyage },
    { id: 'aide', label: t.nav.aide }
  ]
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={animationLogo} alt="Heart" />
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item${page === item.id ? ' active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          {icons[item.id]}
          {item.label}
        </button>
      ))}
    </aside>
  )
}
