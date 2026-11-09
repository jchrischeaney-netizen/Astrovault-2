import { getCommonName } from '../data/celestialObjects.js'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ObservationCard({ observation: obs, onClick, onDelete }) {
  const commonName = getCommonName(obs.object_name)
  const imageUrl = obs.image_key ? `/api/image?key=${encodeURIComponent(obs.image_key)}` : null

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <div className="obs-card" onClick={onClick}>
      {imageUrl ? (
        <img className="obs-card-image" src={imageUrl} alt={obs.object_name} loading="lazy" />
      ) : (
        <div className="obs-card-no-image">🌌</div>
      )}
      <div className="obs-card-body">
        <div className="obs-card-object">{obs.object_name}</div>
        {commonName && <div className="obs-card-common">{commonName}</div>}
        <div className="obs-card-meta">
          <span className="obs-badge category">{obs.object_category}</span>
          {obs.object_type && <span className="obs-badge">{obs.object_type}</span>}
        </div>
        <div className="obs-card-date">📅 {formatDate(obs.capture_date)}</div>
        {obs.integration_time && (
          <div className="obs-card-integration">⏱ {obs.integration_time}</div>
        )}
      </div>
      <div className="obs-card-footer">
        <button className="btn-icon" onClick={handleDelete} title="Delete">Delete</button>
      </div>
    </div>
  )
}
