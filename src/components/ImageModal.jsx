import { useEffect } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ImageModal({ observation: obs, onClose, onDelete }) {
  const imageUrl = obs.image_key ? `/api/image?key=${encodeURIComponent(obs.image_key)}` : null

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose() }

  const handleDelete = () => {
    if (confirm('Delete this observation? This cannot be undone.')) {
      onDelete(obs.id)
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <div className="modal-title">{obs.object_name}</div>
            <div className="modal-subtitle">{obs.object_category} · {obs.object_type || 'Deep Sky Object'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {imageUrl ? (
            <div className="modal-image-wrap">
              <img
                className="modal-image"
                src={imageUrl}
                alt={obs.object_name}
              />
            </div>
          ) : (
            <div className="modal-image-wrap" style={{ minHeight: 120, fontSize: '3rem', color: 'var(--text-muted)' }}>
              🌌
            </div>
          )}

          <div className="modal-details">
            <div className="modal-detail-item">
              <div className="modal-detail-label">Object</div>
              <div className="modal-detail-value">{obs.object_name}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Category</div>
              <div className="modal-detail-value">{obs.object_category}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Capture Date</div>
              <div className="modal-detail-value">{formatDate(obs.capture_date)}</div>
            </div>
            {obs.integration_time && (
              <div className="modal-detail-item">
                <div className="modal-detail-label">Integration Time</div>
                <div className="modal-detail-value">{obs.integration_time}</div>
              </div>
            )}
            {obs.telescope && (
              <div className="modal-detail-item">
                <div className="modal-detail-label">Telescope</div>
                <div className="modal-detail-value">{obs.telescope}</div>
              </div>
            )}
            {obs.camera && (
              <div className="modal-detail-item">
                <div className="modal-detail-label">Camera</div>
                <div className="modal-detail-value">{obs.camera}</div>
              </div>
            )}
          </div>

          {obs.notes && (
            <div className="modal-notes">
              <div className="modal-notes-label">Notes</div>
              <div className="modal-notes-text">{obs.notes}</div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" style={{ color: 'var(--danger)', borderColor: 'rgba(224,82,82,0.3)' }} onClick={handleDelete}>
            Delete
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {imageUrl && (
              <a
                className="btn btn-ghost"
                href={imageUrl}
                download={obs.image_filename || obs.object_name}
                onClick={e => e.stopPropagation()}
              >
                Download
              </a>
            )}
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
