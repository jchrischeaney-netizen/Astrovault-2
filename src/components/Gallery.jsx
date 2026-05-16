import ObservationCard from './ObservationCard.jsx'

export default function Gallery({ observations, loading, onSelect, onDelete, onAddNew }) {
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
      <div className="gallery-header">
        <span className="gallery-title">Your sky journal</span>
        <span className="gallery-count">{observations.length} observation{observations.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="gallery-grid">
        {observations.map(obs => (
          <ObservationCard
            key={obs.id}
            observation={obs}
            onClick={() => onSelect(obs)}
            onDelete={() => onDelete(obs.id)}
          />
        ))}
      </div>
    </div>
  )
}
