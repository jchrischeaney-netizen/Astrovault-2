import { useState, useEffect, useRef, useCallback } from 'react'
import { getCommonName } from '../data/celestialObjects.js'

export default function Lightbox({ list, startIndex, onClose, onDelete }) {
  const [idx, setIdx] = useState(startIndex)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const obs = list[idx]
  const commonName = getCommonName(obs?.object_name)
  const imageUrl = obs?.image_key ? `/api/image?key=${encodeURIComponent(obs.image_key)}` : null
  const hasPrev = idx > 0
  const hasNext = idx < list.length - 1

  const goTo = useCallback((newIdx) => {
    if (newIdx < 0 || newIdx >= list.length) return
    setImageLoaded(false)
    setIdx(newIdx)
    setFadeKey(k => k + 1)
  }, [list.length])

  const prev = useCallback(() => goTo(idx - 1), [goTo, idx])
  const next = useCallback(() => goTo(idx + 1), [goTo, idx])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchStartY.current = e.targetTouches[0].clientY
  }

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
      dx > 0 ? next() : prev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const handleDelete = () => {
    if (!confirm('Delete this observation? This cannot be undone.')) return
    onDelete(obs.id)
    if (list.length <= 1) { onClose(); return }
    const newIdx = idx >= list.length - 1 ? idx - 1 : idx
    setIdx(newIdx)
    setFadeKey(k => k + 1)
  }

  if (!obs) return null

  return (
    <div
      className="lightbox"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="lightbox-topbar">
        <div className="lightbox-counter">{idx + 1} / {list.length}</div>
        <div className="lightbox-name">
          <span className="lightbox-object">{obs.object_name}</span>
          {commonName && <span className="lightbox-common">{commonName}</span>}
          {obs.object_type && <span className="lightbox-type">{obs.object_type}</span>}
        </div>
        <button className="lightbox-close" onClick={onClose}>✕</button>
      </div>

      {/* Image */}
      <div className="lightbox-image-area">
        {imageUrl ? (
          <img
            key={fadeKey}
            className={`lightbox-img ${imageLoaded ? 'loaded' : ''}`}
            src={imageUrl}
            alt={commonName ? `${obs.object_name} – ${commonName}` : obs.object_name}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="lightbox-no-image" key={fadeKey}>
            <span>🌌</span>
            <p>No image for this observation</p>
          </div>
        )}

        {/* Nav buttons (desktop) */}
        {hasPrev && (
          <button className="lightbox-nav lightbox-nav-prev" onClick={prev} aria-label="Previous">
            ‹
          </button>
        )}
        {hasNext && (
          <button className="lightbox-nav lightbox-nav-next" onClick={next} aria-label="Next">
            ›
          </button>
        )}
      </div>

      {/* Bottom details strip */}
      <div className="lightbox-details">
        <div className="lightbox-detail-row">
          <div className="lightbox-detail">
            <span className="ld-label">Date</span>
            <span className="ld-value">{formatDate(obs.capture_date)}</span>
          </div>
          {obs.integration_time && (
            <div className="lightbox-detail">
              <span className="ld-label">Integration</span>
              <span className="ld-value">{obs.integration_time}</span>
            </div>
          )}
          {obs.telescope && (
            <div className="lightbox-detail">
              <span className="ld-label">Telescope</span>
              <span className="ld-value">{obs.telescope}</span>
            </div>
          )}
          {obs.camera && (
            <div className="lightbox-detail">
              <span className="ld-label">Camera</span>
              <span className="ld-value">{obs.camera}</span>
            </div>
          )}
          {obs.notes && (
            <div className="lightbox-detail lightbox-detail-notes">
              <span className="ld-label">Notes</span>
              <span className="ld-value">{obs.notes}</span>
            </div>
          )}
        </div>
        <div className="lightbox-actions">
          {imageUrl && (
            <a className="btn btn-ghost btn-sm" href={imageUrl} download={obs.image_filename || obs.object_name}>
              Download
            </a>
          )}
          <button className="btn btn-ghost btn-sm btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Dot pagination */}
      {list.length > 1 && list.length <= 30 && (
        <div className="lightbox-dots">
          {list.map((_, i) => (
            <button
              key={i}
              className={`lightbox-dot ${i === idx ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
