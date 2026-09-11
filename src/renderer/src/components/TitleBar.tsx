import { useI18n } from '../i18n'
import heartLogo from '../assets/heart.png'

export function TitleBar() {
  const { t } = useI18n()
  return (
    <header className="titlebar">
      <div className="titlebar-brand">
        <img src={heartLogo} alt="" />
        <span>HEART</span>
      </div>
      <div className="titlebar-controls">
        <button type="button" title={t.window.minimize} onClick={() => window.heart.minimize()}>
          <svg width="10" height="10" viewBox="0 0 10 10"><rect y="4" width="10" height="1.5" fill="currentColor"/></svg>
        </button>
        <button type="button" title={t.window.maximize} onClick={() => window.heart.maximize()}>
          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>
        </button>
        <button type="button" className="close" title={t.window.close} onClick={() => window.heart.close()}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.3"/></svg>
        </button>
      </div>
    </header>
  )
}
