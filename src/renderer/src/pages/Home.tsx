import heartLogo from '../assets/heart.png'
import { useI18n } from '../i18n'
import type { PageId } from '../components/Sidebar'

export function Home({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const { t } = useI18n()
  return (
    <div className="home-center">
      <img className="home-logo" src={heartLogo} alt="Heart" />
      <h1>{t.home.welcome}</h1>
      <p>{t.home.subtitle}</p>
      <p style={{ fontSize: 13 }}>{t.tagline}</p>
      <button type="button" className="btn btn-accent" onClick={() => onNavigate('optimisation')}>
        {t.home.cta}
      </button>
    </div>
  )
}
