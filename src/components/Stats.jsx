import { useState, useMemo } from 'react'
import { MESSIER, NGC, SOLAR_SYSTEM, CATEGORIES, getObjectLabel } from '../data/celestialObjects.js'

const MESSIER_TOTAL = MESSIER.length  // 110
const NGC_LIST = NGC
const SS_LIST = SOLAR_SYSTEM

export default function Stats({ observations }) {
  const [unimageFilter, setUnimageFilter] = useState('Messier')
  const [typeFilter, setTypeFilter] = useState('')

  const imagedNames = useMemo(() => new Set(observations.map(o => o.object_name)), [observations])

  // Counts per category
  const counts = useMemo(() => ({
    total: observations.length,
    messier: observations.filter(o => o.object_category === CATEGORIES.MESSIER).length,
    ngc: observations.filter(o => o.object_category === CATEGORIES.NGC).length,
    solar: observations.filter(o => o.object_category === CATEGORIES.SOLAR_SYSTEM).length,
  }), [observations])

  // Unique objects imaged (one obs per object)
  const imagedMessier = useMemo(() =>
    new Set(observations.filter(o => o.object_category === CATEGORIES.MESSIER).map(o => o.object_name)),
    [observations])
  const imagedNGC = useMemo(() =>
    new Set(observations.filter(o => o.object_category === CATEGORIES.NGC).map(o => o.object_name)),
    [observations])
  const imagedSolar = useMemo(() =>
    new Set(observations.filter(o => o.object_category === CATEGORIES.SOLAR_SYSTEM).map(o => o.object_name)),
    [observations])

  // Not yet imaged
  const notImaged = useMemo(() => {
    let list
    if (unimageFilter === 'Messier') list = MESSIER.map(o => ({ ...o, category: CATEGORIES.MESSIER }))
    else if (unimageFilter === 'NGC') list = NGC_LIST.map(o => ({ ...o, category: CATEGORIES.NGC }))
    else list = SS_LIST.map(o => ({ ...o, category: CATEGORIES.SOLAR_SYSTEM }))

    const filtered = list.filter(o => !imagedNames.has(o.name))
    if (typeFilter) return filtered.filter(o => o.type === typeFilter)
    return filtered
  }, [unimageFilter, typeFilter, imagedNames])

  const availableTypes = useMemo(() => {
    let list
    if (unimageFilter === 'Messier') list = MESSIER
    else if (unimageFilter === 'NGC') list = NGC_LIST
    else list = SS_LIST
    return [...new Set(list.map(o => o.type))].sort()
  }, [unimageFilter])

  // Messier grid data
  const messierGrid = useMemo(() =>
    MESSIER.map(o => ({ ...o, imaged: imagedMessier.has(o.name) })),
    [imagedMessier])

  return (
    <div className="stats-page">

      {/* Summary cards */}
      <div className="stats-cards">
        <div className="stats-card stats-card-total">
          <div className="stats-card-value">{counts.total}</div>
          <div className="stats-card-label">Total Observations</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-value">{imagedMessier.size}<span className="stats-card-denom">/{MESSIER_TOTAL}</span></div>
          <div className="stats-card-label">Messier Objects</div>
          <div className="stats-progress">
            <div className="stats-progress-fill" style={{ width: `${(imagedMessier.size / MESSIER_TOTAL) * 100}%` }} />
          </div>
          <div className="stats-card-pct">{Math.round((imagedMessier.size / MESSIER_TOTAL) * 100)}% complete</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-value">{imagedNGC.size}<span className="stats-card-denom">/{NGC_LIST.length}</span></div>
          <div className="stats-card-label">NGC Objects</div>
          <div className="stats-progress">
            <div className="stats-progress-fill" style={{ width: `${(imagedNGC.size / NGC_LIST.length) * 100}%` }} />
          </div>
          <div className="stats-card-pct">{Math.round((imagedNGC.size / NGC_LIST.length) * 100)}% complete</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-value">{imagedSolar.size}<span className="stats-card-denom">/{SS_LIST.length}</span></div>
          <div className="stats-card-label">Solar System</div>
          <div className="stats-progress">
            <div className="stats-progress-fill" style={{ width: `${(imagedSolar.size / SS_LIST.length) * 100}%` }} />
          </div>
          <div className="stats-card-pct">{Math.round((imagedSolar.size / SS_LIST.length) * 100)}% complete</div>
        </div>
      </div>

      {/* Messier checklist grid */}
      <div className="stats-section">
        <h2 className="stats-section-title">Messier Checklist</h2>
        <div className="messier-legend">
          <span className="ml-dot ml-dot-done" /> Imaged &nbsp;
          <span className="ml-dot ml-dot-todo" /> Not yet imaged
        </div>
        <div className="messier-grid">
          {messierGrid.map(obj => (
            <div
              key={obj.name}
              className={`m-chip ${obj.imaged ? 'imaged' : 'todo'}`}
              title={`${obj.name}${obj.common ? ` – ${obj.common}` : ''} (${obj.type})`}
            >
              <span className="m-chip-num">{obj.name.replace('M', '')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Not yet imaged */}
      <div className="stats-section">
        <h2 className="stats-section-title">Not Yet Imaged</h2>
        <div className="unimaged-controls">
          <div className="filter-pills">
            {['Messier', 'NGC', 'Solar System'].map(cat => (
              <button
                key={cat}
                className={`filter-pill ${unimageFilter === cat ? 'active' : ''}`}
                onClick={() => { setUnimageFilter(cat); setTypeFilter('') }}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            className="form-select unimaged-type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {notImaged.length === 0 ? (
          <div className="unimaged-empty">
            <span>🏆</span>
            <p>You have imaged all {unimageFilter} objects{typeFilter ? ` of type "${typeFilter}"` : ''}!</p>
          </div>
        ) : (
          <div className="unimaged-count">
            {notImaged.length} object{notImaged.length !== 1 ? 's' : ''} remaining
          </div>
        )}

        <div className="unimaged-grid">
          {notImaged.map(obj => (
            <div key={obj.name} className="unimaged-item">
              <div className="unimaged-name">{getObjectLabel(obj)}</div>
              <div className="unimaged-type">{obj.type}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
