import { useI18n } from '../i18n'
import { useState } from 'react'

export function Nettoyage() {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  async function clean() {
    setBusy(true)
    setSummary(null)
    try {
      const res = await window.heart.runCleanup()
      setSummary(res.summary + '\n\n' + res.cleared.map((c) => `${c.path}: ${c.files} files, ${(c.bytes / 1048576).toFixed(2)} MB${c.error ? ' (' + c.error + ')' : ''}`).join('\n'))
    } catch (e) {
      setSummary(String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.nettoyage.title}</h1>
          <p>{t.nettoyage.subtitle}</p>
        </div>
      </div>
      <div className="glass clean-panel">
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{t.nettoyage.description}</p>
        <div className="warn">{t.nettoyage.neverDocs}</div>
        <button type="button" className="btn btn-accent" style={{ alignSelf: 'flex-start', padding: '10px 22px' }} disabled={busy} onClick={clean}>
          {busy ? t.nettoyage.cleaning : t.nettoyage.clean}
        </button>
        {summary && (
          <div>
            <h3 style={{ fontSize: 13, marginBottom: 8 }}>{t.nettoyage.result}</h3>
            <div className="clean-result">{summary}</div>
          </div>
        )}
      </div>
    </div>
  )
}
