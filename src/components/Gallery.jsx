import { useState, useMemo } from 'react'
import ObservationCard from './ObservationCard.jsx'
import { CATEGORIES } from '../data/celestialObjects.js'

const ALL_TYPES = [
  'Spiral Galaxy', 'Barred Spiral Galaxy', 'Elliptical Galaxy', 'Lenticular Galaxy',
  'Irregular Galaxy', 'Dwarf Elliptical Galaxy', 'Radio Galaxy', 'Seyfert Galaxy',
  'Globular Cluster', 'Open Cluster', 'Planetary Nebula', 'Emission Nebula',
  'Reflection Nebula', 'Supernova Remnant', 'Star Cloud', 'Asterism',
  'Planet', 'Dwarf Planet', 'Natural Satellite', 'Moon of Jupiter',
  'Moon of Saturn', 'Asteroid', 'Comet', 'Star',
]

export default function Gallery({ observations, loading, onSelect, onDelete, onAddNew }) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const presentTypes = useMemo(() => {
    const types = new Set(observations.map(o => o.object_type).filter(Boolean))
    return ALL_TYPES.filter(t => types.has(t))
  }, [observations])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return observations.filter(o => {
      if (catFilter && o.object_category !== catFilter) return false
      if (typeFilter && o.object_type !== typeFilter) return false
      if (q) {
        return (
          o.object_name.toLowerCase().includes(q) ||
          (o.object_type && o.object_type.toLowerCase().includes(q)) ||
          (o.notes && o.notes.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [observations, search, catFilter, typeFilter])

  const clearFilters = () => { setSearch(''); setCatFilter(''); setTypeFilter('') }
  const hasFilters = search || catFilter || typeFilter

  if (loading) {
    return (
      <div className="gallery-empty">
        <div className="gallery-empty-icon">✦</div>
        <h3>Loading observations…</h3>
      </div>
    )
  }

  if (observations.length === 0) {
    return (
      <div className="gallery-empty">
        <div className="gallery-empty-icon">🔭</div>
        <h3>No observations yet</h3>
        <p>Capture your first astrophotography session</p>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={onAddNew}>
          Add First Observation
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="gallery-filters">
        <div className="gallery-search-wrap">
          <span className="gallery-search-icon">⌕</span>
          <input
            className="gallery-search"
            placeholder="Search objects, types, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="gallery-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="gallery-filter-row">
          <div className="filter-pills">
            <button className={`filter-pill ${!catFilter ? 'active' : ''}`} onClick={() => setCatFilter('')}>All</button>
            {Object.values(CATEGORIES).map(c => (
              <button key={c} className={`filter-pill ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>
                {c}
              </button>
            ))}
          </div>

          {presentTypes.length > 0 && (
            <select
              className="form-select gallery-type-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              {presentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="gallery-header">
        <span className="gallery-title">
          {hasFilters ? `Filtered results` : 'Your sky journal'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasFilters && (
            <button className="btn-clear-filters" onClick={clearFilters}>Clear filters</button>
          )}
          <span className="gallery-count">
            {filtered.length}{hasFilters && observations.length !== filtered.length ? ` of ${observations.length}` : ''} observation{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gallery-empty" style={{ paddingTop: 40 }}>
          <div className="gallery-empty-icon">🔍</div>
          <h3>No matches</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="gallery-grid">
          {filtered.map((obs, i) => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              onClick={() => onSelect(obs, filtered, i)}
              onDelete={() => onDelete(obs.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
