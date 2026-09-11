import { useCallback, useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { Modal } from '../components/Modal'

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

type BloatApp = {
  name: string
  displayName?: string
  packageFullName: string
  installed: boolean
  selectedByDefault: boolean
  iconDataUrl?: string
}

const CACHE_KEY = 'heart-tweak-states-v1'

function readCache(): State[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCache(states: State[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(states))
  } catch {
    /* ignore quota */
  }
}

function friendlyMessage(msg: string, fallbackOk: string, fallbackErr: string, ok: boolean): string {
  const m = (msg || '').trim()
  if (!m) return ok ? fallbackOk : fallbackErr
  if (m.includes('#< CLIXML') || m.includes('<Objs') || m.includes('<S S="Error">')) {
    return ok ? fallbackOk : fallbackErr
  }
  return m.length > 220 ? m.slice(0, 220) + '…' : m
}

function BloatIcon({ app }: { app: BloatApp }) {
  const [broken, setBroken] = useState(false)
  if (!app.iconDataUrl || broken) {
    const letter = (app.displayName || app.name || '?').trim().charAt(0).toUpperCase()
    return (
      <span className="bloat-icon fallback" aria-hidden>
        {letter || '?'}
      </span>
    )
  }
  return (
    <img
      className="bloat-icon"
      src={app.iconDataUrl}
      alt=""
      onError={() => setBroken(true)}
    />
  )
}

export function Optimisation() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [states, setStates] = useState<State[]>(() => readCache())
  const [loading, setLoading] = useState(() => readCache().length === 0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [edgeOpen, setEdgeOpen] = useState(false)
  const [bloatOpen, setBloatOpen] = useState(false)
  const [bloatApps, setBloatApps] = useState<BloatApp[]>([])
  const [bloatSelected, setBloatSelected] = useState<Set<string>>(new Set())
  const [bloatLoading, setBloatLoading] = useState(false)
  const [bloatProgress, setBloatProgress] = useState<string | null>(null)
  const [bloatFilter, setBloatFilter] = useState('')

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent && states.length === 0) setLoading(true)
    try {
      const s = await window.heart.getTweakStates()
      setStates(s)
      writeCache(s)
    } catch (e) {
      setToast({ msg: String(e), ok: false })
    } finally {
      setLoading(false)
    }
  }, [states.length])

  useEffect(() => {
    load({ silent: states.length > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const showSkeleton = loading && states.length === 0

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

  async function openBloatPicker() {
    setBloatOpen(true)
    setBloatLoading(true)
    setBloatProgress(null)
    setBloatFilter('')
    setBloatSelected(new Set()) // nothing checked by default — user must opt-in
    try {
      const apps = await window.heart.listBloatware()
      setBloatApps(apps)
      setBloatSelected(new Set())
    } catch (e) {
      setToast({ msg: String(e), ok: false })
      setBloatOpen(false)
    } finally {
      setBloatLoading(false)
    }
  }

  async function confirmBloatUninstall() {
    const names = [...bloatSelected]
    if (names.length === 0) {
      setToast({ msg: t.bloatware.noneSelected, ok: false })
      return
    }
    setBloatProgress(t.bloatware.progress)
    setBusyId('remove-bloatware')
    try {
      const res = await window.heart.removeBloatware(names)
      setToast({
        msg: friendlyMessage(res.message, t.optimisation.success, t.optimisation.failed, res.ok),
        ok: res.ok
      })
      setBloatOpen(false)
      await load({ silent: true })
    } catch (e) {
      setToast({ msg: String(e), ok: false })
    } finally {
      setBloatProgress(null)
      setBusyId(null)
    }
  }

  async function runToggle(id: string) {
    const st = stateMap.get(id)
    setBusyId(id)
    try {
      let res: { ok: boolean; message: string }
      if (st?.applied && !st.oneShot) {
        res = await window.heart.revertTweak(id)
      } else {
        res = await window.heart.applyTweak(id)
      }
      setToast({
        msg: friendlyMessage(res.message, t.optimisation.success, t.optimisation.failed, res.ok),
        ok: res.ok
      })
      await load({ silent: true })
    } catch (e) {
      setToast({ msg: String(e), ok: false })
    } finally {
      setBusyId(null)
    }
  }

  async function toggle(id: string) {
    if (id === 'remove-bloatware') {
      await openBloatPicker()
      return
    }
    if (id === 'remove-edge' && !stateMap.get(id)?.applied) {
      setEdgeOpen(true)
      return
    }
    await runToggle(id)
  }

  async function applyAll() {
    setBusyId('__all__')
    for (const m of META.filter((x) => x.recommended)) {
      const st = stateMap.get(m.id)
      if (st?.applied) continue
      if (m.id === 'remove-edge' || m.id === 'remove-bloatware') continue
      await window.heart.applyTweak(m.id)
    }
    await load({ silent: true })
    setBusyId(null)
    setToast({ msg: t.optimisation.success, ok: true })
  }

  async function revertAll() {
    setBusyId('__all__')
    for (const m of META) {
      const st = stateMap.get(m.id)
      if (!st?.applied || st.oneShot) continue
      await window.heart.revertTweak(m.id)
    }
    await load({ silent: true })
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

  const installedBloat = bloatApps.filter((a) => a.installed)
  const listedApps = installedBloat.length > 0 ? installedBloat : bloatApps
  const bloatQ = bloatFilter.trim().toLowerCase()
  const filteredBloat = !bloatQ
    ? listedApps
    : listedApps.filter((a) => {
        const dn = (a.displayName || '').toLowerCase()
        const n = (a.name || '').toLowerCase()
        return dn.includes(bloatQ) || n.includes(bloatQ)
      })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.optimisation.title}</h1>
          <p>{t.optimisation.subtitle}</p>
        </div>
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
            {showSkeleton
              ? t.optimisation.detecting
              : t.optimisation.applied
                  .replace('{n}', String(appliedCount))
                  .replace('{total}', String(META.length))}
          </span>
          <button type="button" className="btn btn-accent" disabled={busyId !== null || showSkeleton} onClick={applyAll}>
            {t.optimisation.applyAll}
          </button>
          <button type="button" className="btn" disabled={busyId !== null || showSkeleton} onClick={revertAll}>
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
        <button type="button" className="btn" onClick={() => load()} disabled={busyId !== null}>
          {t.optimisation.refresh}
        </button>
      </div>

      {showSkeleton ? (
        <div className="tweak-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="glass tweak-card skeleton-card">
              <div className="skel-line w60" />
              <div className="skel-line w90" />
              <div className="skel-line w40" />
            </div>
          ))}
        </div>
      ) : (
        <div className={`tweak-grid${loading ? ' is-reconciling' : ''}`}>
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
      )}

      <Modal
        open={edgeOpen}
        title={t.optimisation.confirmEdgeTitle}
        onClose={() => setEdgeOpen(false)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setEdgeOpen(false)}>
              {t.common.cancel}
            </button>
            <button
              type="button"
              className="btn btn-accent"
              onClick={async () => {
                setEdgeOpen(false)
                await runToggle('remove-edge')
              }}
            >
              {t.common.confirm}
            </button>
          </>
        }
      >
        <p className="modal-text">{t.optimisation.confirmEdgeMessage}</p>
      </Modal>

      <Modal
        open={bloatOpen}
        title={t.bloatware.title}
        onClose={() => !bloatProgress && setBloatOpen(false)}
        wide
        footer={
          <>
            <button
              type="button"
              className="btn"
              disabled={!!bloatProgress}
              onClick={() => setBloatOpen(false)}
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              className="btn btn-accent"
              disabled={!!bloatProgress || bloatLoading || bloatSelected.size === 0}
              onClick={confirmBloatUninstall}
            >
              {bloatProgress ? t.bloatware.progress : t.bloatware.confirm}
            </button>
          </>
        }
      >
        <p className="modal-text">{t.bloatware.subtitle}</p>
        <input
          className="bloat-search"
          type="search"
          placeholder={t.bloatware.search}
          value={bloatFilter}
          disabled={bloatLoading || !!bloatProgress}
          onChange={(e) => setBloatFilter(e.target.value)}
        />
        <div className="bloat-toolbar">
          <button
            type="button"
            className="btn"
            disabled={bloatLoading || !!bloatProgress}
            onClick={() => setBloatSelected(new Set(filteredBloat.map((a) => a.name)))}
          >
            {t.bloatware.selectAll}
          </button>
          <button
            type="button"
            className="btn"
            disabled={bloatLoading || !!bloatProgress}
            onClick={() => setBloatSelected(new Set())}
          >
            {t.bloatware.selectNone}
          </button>
          <span className="bloat-count">
            {t.bloatware.selectedCount.replace('{n}', String(bloatSelected.size))}
          </span>
        </div>
        {bloatLoading ? (
          <div className="bloat-loading">{t.bloatware.loading}</div>
        ) : (
          <div className="bloat-list">
            {filteredBloat.length === 0 ? (
              <div className="bloat-loading">{t.bloatware.empty}</div>
            ) : (
              filteredBloat.map((app) => (
                <label key={app.name} className={`bloat-item${app.installed ? '' : ' muted'}`}>
                  <input
                    type="checkbox"
                    checked={bloatSelected.has(app.name)}
                    disabled={!!bloatProgress}
                    onChange={(e) => {
                      setBloatSelected((prev) => {
                        const next = new Set(prev)
                        if (e.target.checked) next.add(app.name)
                        else next.delete(app.name)
                        return next
                      })
                    }}
                  />
                  <BloatIcon app={app} />
                  <span className="bloat-meta">
                    <span className="bloat-name">{app.displayName || app.name}</span>
                    {app.displayName && app.displayName !== app.name ? (
                      <span className="bloat-pkg">{app.name}</span>
                    ) : null}
                  </span>
                  <span className={`badge ${app.installed ? 'opt' : ''}`}>
                    {app.installed ? t.bloatware.installed : t.bloatware.notInstalled}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
        {bloatProgress && <p className="modal-text bloat-progress">{bloatProgress}</p>}
      </Modal>

      {toast && <div className={`toast ${toast.ok ? 'ok' : 'err'}`}>{toast.msg}</div>}
    </div>
  )
}