import { useI18n } from '../i18n'

export function Aide() {
  const { t } = useI18n()
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.aide.title}</h1>
          <p>{t.aide.subtitle}</p>
        </div>
        <button type="button" className="upgrade-btn">✦ Upgrade</button>
      </div>
      <div className="fix-grid">
        {t.aide.cards.map((card) => (
          <div key={card.title} className="glass fix-card">
            <div className="icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h3>{card.title}</h3>
            <div className="sep" />
            <p>{card.desc}</p>
            <div className="footer">
              <span className="soon">{t.aide.comingSoon}</span>
              <button type="button" className="btn-outline-accent" disabled>
                {t.aide.runFix}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
