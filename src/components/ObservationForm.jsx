import { useState, useRef, useEffect } from 'react'
import { getAllObjects, getObjectLabel, CATEGORIES, OBJECT_TYPES } from '../data/celestialObjects.js'

const ALL_OBJECTS = getAllObjects()

const INITIAL = {
  category: '',
  objectSearch: '',
  selectedObject: null,
  customType: '',
  capture_date: new Date().toISOString().slice(0, 10),
  integration_time: '',
  telescope: '',
  camera: '',
  notes: '',
}

export default function ObservationForm({ onSaved, onCancel }) {
  const [form, setForm] = useState(INITIAL)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownIdx, setDropdownIdx] = useState(0)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  const typedName = form.objectSearch.trim()
  const exactMatch = typedName
    ? ALL_OBJECTS.find(o =>
        o.name.toLowerCase() === typedName.toLowerCase() ||
        getObjectLabel(o).toLowerCase() === typedName.toLowerCase())
    : null
  const showCustomOption = typedName && !exactMatch && !form.selectedObject

  const filteredObjects = (() => {
    const q = form.objectSearch.trim().toLowerCase()
    let list = ALL_OBJECTS
    if (form.category) list = list.filter(o => o.category === form.category)
    if (!q) return list.slice(0, 80)
    return list.filter(o =>
      o.name.toLowerCase().includes(q) ||
      (o.common && o.common.toLowerCase().includes(q)) ||
      o.type.toLowerCase().includes(q)
    ).slice(0, 80)
  })()

  useEffect(() => {
    if (dropdownOpen && dropdownRef.current) {
      const active = dropdownRef.current.querySelector('.active')
      active?.scrollIntoView({ block: 'nearest' })
    }
  }, [dropdownIdx, dropdownOpen])

  useEffect(() => {
    const close = (e) => {
      if (!inputRef.current?.parentElement?.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const selectCustom = () => {
    if (!typedName) return
    setForm(f => ({
      ...f,
      selectedObject: { name: typedName, category: CATEGORIES.OTHER, type: '', custom: true },
      objectSearch: typedName,
    }))
    setDropdownOpen(false)
  }

  const selectObject = (obj) => {
    setForm(f => ({
      ...f,
      selectedObject: obj,
      objectSearch: getObjectLabel(obj),
      category: obj.category,
    }))
    setDropdownOpen(false)
  }

  const handleSearchKey = (e) => {
    if (!dropdownOpen) { setDropdownOpen(true); setDropdownIdx(0); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setDropdownIdx(i => Math.min(i + 1, filteredObjects.length - (showCustomOption ? 0 : 1))) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setDropdownIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredObjects[dropdownIdx]) selectObject(filteredObjects[dropdownIdx])
      else if (showCustomOption) selectCustom()
    }
    else if (e.key === 'Escape') setDropdownOpen(false)
  }

  const handleImageFile = (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB. Please resize or compress it first.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Typed a name but didn't pick from the list: use the catalog match if
    // there is one, otherwise save it as a custom object.
    let obj = form.selectedObject
    if (!obj && exactMatch) obj = exactMatch
    if (!obj && typedName) obj = { name: typedName, category: CATEGORIES.OTHER, type: '', custom: true }
    if (!obj) { setError('Please select a celestial object or type its name.'); return }
    if (!form.capture_date) { setError('Please enter the capture date.'); return }

    setUploading(true)
    setProgress(10)

    try {
      let imageKey = null
      let imageFilename = null
      let imageContentType = null

      if (imageFile) {
        setProgress(20)
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': imageFile.type || 'application/octet-stream',
            'x-filename': imageFile.name,
          },
          body: imageFile,
        })
        setProgress(70)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Image upload failed')
        }
        const data = await res.json()
        imageKey = data.key
        imageFilename = data.filename
        imageContentType = data.contentType
      }

      setProgress(80)

      const objectType = obj.custom ? (form.customType.trim() || null) : obj.type
      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_name: obj.name,
          object_category: obj.category,
          object_type: objectType,
          capture_date: form.capture_date,
          integration_time: form.integration_time || null,
          telescope: form.telescope || null,
          camera: form.camera || null,
          notes: form.notes || null,
          image_key: imageKey,
          image_filename: imageFilename,
          image_content_type: imageContentType,
        }),
      })

      setProgress(100)

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save observation')
      }

      setSuccess(true)
      setTimeout(() => onSaved(), 800)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-title">New Observation</div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Saved! Returning to gallery…</div>}

      <div className="form-grid">

        {/* Category filter */}
        <div className="form-group">
          <label className="form-label">Filter by Category</label>
          <select
            className="form-select"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value, selectedObject: null, objectSearch: '' }))}
          >
            <option value="">All Categories</option>
            {Object.values(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Object search */}
        <div className="form-group">
          <label className="form-label">Celestial Object <span className="required">*</span></label>
          <div className="object-search-wrap">
            <input
              ref={inputRef}
              className="form-input"
              placeholder="Search: M42, Orion, IC 1805… or type any name"
              value={form.objectSearch}
              onChange={e => {
                setForm(f => ({ ...f, objectSearch: e.target.value, selectedObject: null }))
                setDropdownOpen(true)
                setDropdownIdx(0)
              }}
              onFocus={() => setDropdownOpen(true)}
              onKeyDown={handleSearchKey}
              autoComplete="off"
            />
            {dropdownOpen && (
              <div className="object-dropdown" ref={dropdownRef}>
                {filteredObjects.length === 0 ? (
                  !showCustomOption && <div className="object-no-results">No objects found</div>
                ) : filteredObjects.map((obj, i) => (
                  <div
                    key={`${obj.category}-${obj.name}`}
                    className={`object-option ${i === dropdownIdx ? 'active' : ''}`}
                    onMouseDown={() => selectObject(obj)}
                    onMouseEnter={() => setDropdownIdx(i)}
                  >
                    <div className="object-option-name">{getObjectLabel(obj)}</div>
                    <div className="object-option-sub">{obj.category} · {obj.type}</div>
                  </div>
                ))}
                {showCustomOption && (
                  <div
                    className={`object-option object-option-custom ${dropdownIdx === filteredObjects.length ? 'active' : ''}`}
                    onMouseDown={selectCustom}
                    onMouseEnter={() => setDropdownIdx(filteredObjects.length)}
                  >
                    <div className="object-option-name">+ Use “{typedName}”</div>
                    <div className="object-option-sub">Not in the list? Save it as a custom object</div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="form-hint">Can't find it? Type any name, e.g. “Sh2-115” or “Comet C/2023 A3”.</div>
        </div>

        {/* Type for custom objects */}
        {(form.selectedObject?.custom || showCustomOption) && (
          <div className="form-group">
            <label className="form-label">Object Type</label>
            <input
              className="form-input"
              list="object-type-options"
              placeholder="e.g. Emission Nebula, Comet…"
              value={form.customType}
              onChange={e => setForm(f => ({ ...f, customType: e.target.value }))}
            />
            <datalist id="object-type-options">
              {OBJECT_TYPES.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
        )}

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Capture Date <span className="required">*</span></label>
          <input
            type="date"
            className="form-input"
            value={form.capture_date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setForm(f => ({ ...f, capture_date: e.target.value }))}
            required
          />
        </div>

        {/* Integration time */}
        <div className="form-group">
          <label className="form-label">Integration Time</label>
          <input
            className="form-input"
            placeholder="e.g. 3h 20m or 100 × 120s"
            value={form.integration_time}
            onChange={e => setForm(f => ({ ...f, integration_time: e.target.value }))}
          />
        </div>

        {/* Telescope */}
        <div className="form-group">
          <label className="form-label">Telescope / Optics</label>
          <input
            className="form-input"
            placeholder="e.g. Celestron 8 inch SCT"
            value={form.telescope}
            onChange={e => setForm(f => ({ ...f, telescope: e.target.value }))}
          />
        </div>

        {/* Camera */}
        <div className="form-group">
          <label className="form-label">Camera</label>
          <input
            className="form-input"
            placeholder="e.g. ZWO ASI294MC Pro"
            value={form.camera}
            onChange={e => setForm(f => ({ ...f, camera: e.target.value }))}
          />
        </div>

        {/* Notes */}
        <div className="form-group full">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Seeing conditions, filter used, bortle class, processing notes…"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>

        {/* Image upload */}
        <div className="form-group full">
          <label className="form-label">Image (max 10 MB)</label>
          {!imagePreview ? (
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageFile(e.target.files[0])}
              />
              <div className="upload-zone-icon">📷</div>
              <div className="upload-zone-text">Tap to choose or drag & drop an image</div>
              <div className="upload-zone-hint">JPEG, PNG, TIFF — max 10 MB</div>
            </div>
          ) : (
            <div className="upload-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="upload-preview-remove"
                onClick={() => { setImageFile(null); setImagePreview(null) }}
              >✕</button>
            </div>
          )}
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <div className="progress-label">
                {progress < 70 ? 'Uploading image…' : progress < 90 ? 'Saving observation…' : 'Done!'}
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? <><span className="spinner" /> Saving…</> : 'Save Observation'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={uploading}>
          Cancel
        </button>
      </div>
    </form>
  )
}
