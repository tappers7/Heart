import { useCallback, useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n'

type Filter = 'all' | 'telemetry' | 'performance' | 'visual' | 'latency' | 'network'

type TweakMeta = {
  id: string
  categories: Filter[]
  recommended: boolean
}

const META: TweakMeta[] = [
  { id: 'disable-telemetry', categories: ['telemetry'], recommended: true },
  { id: 'remove-bloatware', categories: ['performance'], recommended: false },
  { id: 'classic-context-menu', categories: ['visual'], recommended: true },
  { id: 'disable-bing-search', categories: ['telemetry', 'network'], recommended: true },
  { id: 'security-only-updates', categories: ['telemetry'], recommended: false },
  { id: 'services-manual', categories: ['performance'], recommended: false },
  { id: 'ultimate-performance', categories: ['performance'], recommended: true },
  { id: 'remove-edge', categories: ['performance'], recommended: false },
  { id: 'tcp-nagle-off', categories: ['network', 'latency'], recommended: true },
  { id: 'ram-standby-purge', categories: ['performance', 'latency'], recommended: false },
  { id: 'disable-core-parking', categories: ['performance', 'latency'], recommended: true },
  { id: 'disable-transparency', categories: ['visual'], recommended: true },
  { id: 'disable-animations', categories: ['visual'], recommended: false },
  { id: 'remove-gallery', categories: ['visual'], recommended: true },
  { id: 'remove-home-quickaccess', categories: ['visual'], recommended: false }
]

type State = {
  id: string
  applied: boolean
  detail?: string
  oneShot?: boolean
  highRisk?: boolean
  experimental?: boolean
}

export function Optimisation() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [states, setStates] = useState<State[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const load = useCallback(async () => {
    try {
      const s = await window.heart.getTweakStates()
      setStates(s)
    } catch (e) {
      setToast({ msg: String(e), ok: false })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(id)
  }, [toast])

  const stateMap = useMemo(() => {
    const m = new Map<string, State>()
    states.forEach((s) => m.set(s.id, s))
    return m
  }, [states])

  const appliedCount = states.filter((s) => s.applied).length

  const visible = META.filter((m) => {
    if (filter !== 'all' && !m.categories.includes(filter)) return false
    const tw = t.tweaks[m.id as keyof typeof t.tweaks]
    if (!tw) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return tw.title.toLowerCase().includes(q) || tw.desc.toLowerCase().includes(q)
    }
    return true
  })

  async function toggle(id: string) {
    const st = stateMap.get(id)
    if (id === 'remove-edge' && !st?.applied) {
      const ok = await window.heart.confirm({
        title: t.optimisation.confirmEdgeTitle,
        message: t.optimisation.confirmEdgeMessage
      })
      if (!ok) return
    }

    setBusyId(id)
    try {
      let res: { ok: boolean; message: string }
      if (st?.applied && !st.oneShot) {
        res = await window.heart.revertTweak(id)
      } else {
        res = await window.heart.applyTweak(id)
      }
      setToast({ msg: res.message || (res.ok ? 'OK' : 'Failed'), ok: res.ok })
      await load()
    } catch (e) {
      setToast({ msg: String(e), ok: false })
    } finally {
      setBusyId(null)
    }
  }

  async function applyAll() {
    setBusyId('__all__')
    for (const m of META.filter((x) => x.recommended)) {
      const st = stateMap.get(m.id)
      if (st?.applied) continue
      if (m.id === 'remove-edge') continue
      await window.heart.applyTweak(m.id)
    }
    await load()
    setBusyId(null)
    setToast({ msg: 'OK', ok: true })
  }

  async function revertAll() {
    setBusyId('__all__')
    for (const m of META) {
      const st = stateMap.get(m.id)
      if (!st?.applied || st.oneShot) continue
      await window.heart.revertTweak(m.id)
    }
    await load()
    setBusyId(null)
  }

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t.optimisation.filters.all },
    { id: 'telemetry', label: t.optimisation.filters.telemetry },
    { id: 'performance', label: t.optimisation.filters.performance },
    { id: 'visual', label: t.optimisation.filters.visual },
    { id: 'latency', label: t.optimisation.filters.latency },
    { id: 'network', label: t.optimisation.filters.network }
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.optimisation.title}</h1>
          <p>{t.optimisation.subtitle}</p>
        </div>
        <button type="button" className="upgrade-btn">Upgrade</button>
      </div>

      <div className="filter-row">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`pill${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
        <div className="meta-actions">
          <span>
            {t.optimisation.applied.replace('{n}', String(appliedCount)).replace('{total}', String(META.length))}
          </span>
          <button type="button" className="btn btn-accent" disabled={busyId !== null} onClick={applyAll}>
            {t.optimisation.applyAll}
          </button>
          <button type="button" className="btn" disabled={busyId !== null} onClick={revertAll}>
            {t.optimisation.revertAll}
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder={t.optimisation.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn" onClick={load} disabled={busyId !== null}>
          {t.optimisation.refresh}
        </button>
      </div>

      <div className="tweak-grid">
        {visible.map((m) => {
          const tw = t.tweaks[m.id as keyof typeof t.tweaks]
          const st = stateMap.get(m.id)
          const on = !!st?.applied
          const busy = busyId === m.id || busyId === '__all__'
          return (
            <div
              key={m.id}
              className={`glass tweak-card${on ? ' applied' : ''}${m.recommended ? ' recommended-glow' : ''}`}
            >
              <div className="tweak-top">
                <div className="tweak-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <h3>{tw.title}</h3>
              </div>
              <p className="desc">{tw.desc}</p>
              {st?.detail && (
                <p className="desc" style={{ fontSize: 11, opacity: 0.8 }}>
                  {st.detail}
                </p>
              )}
              <div className="tweak-footer">
                <div className="badges">
                  <span className={`badge ${m.recommended ? 'rec' : 'opt'}`}>
                    {m.recommended ? t.optimisation.badge.recommended : t.optimisation.badge.optional}
                  </span>
                  {st?.highRisk && <span className="badge risk">{t.optimisation.badge.highRisk}</span>}
                  {st?.experimental && <span className="badge exp">{t.optimisation.badge.experimental}</span>}
                  {st?.oneShot && <span className="badge opt">{t.optimisation.badge.oneShot}</span>}
                </div>
                {st?.oneShot && !on ? (
                  <button
                    type="button"
                    className="btn btn-green"
                    disabled={busy}
                    onClick={() => toggle(m.id)}
                  >
                    {busy ? t.optimisation.running : t.optimisation.apply}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`toggle${on ? ' on' : ''}`}
                    disabled={busy || (st?.oneShot && on)}
                    aria-pressed={on}
                    title={on ? t.optimisation.revert : t.optimisation.apply}
                    onClick={() => toggle(m.id)}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {toast && <div className={`toast ${toast.ok ? 'ok' : 'err'}`}>{toast.msg}</div>}
    </div>
  )
}
