import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import Gallery from './components/Gallery.jsx'
import ObservationForm from './components/ObservationForm.jsx'
import ImageModal from './components/ImageModal.jsx'

export default function App() {
  const [tab, setTab] = useState('gallery')
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedObs, setSelectedObs] = useState(null)

  const fetchObservations = useCallback(async () => {
    try {
      const res = await fetch('/api/observations')
      if (res.ok) setObservations(await res.json())
    } catch (e) {
      console.error('Failed to fetch observations', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchObservations() }, [fetchObservations])

  const handleSaved = () => {
    fetchObservations()
    setTab('gallery')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this observation?')) return
    await fetch(`/api/observations/${id}`, { method: 'DELETE' })
    setObservations(prev => prev.filter(o => o.id !== id))
    if (selectedObs?.id === id) setSelectedObs(null)
  }

  return (
    <div className="app">
      <Header
        tab={tab}
        onTabChange={setTab}
        count={observations.length}
      />
      <main className="main">
        {tab === 'gallery' && (
          <Gallery
            observations={observations}
            loading={loading}
            onSelect={setSelectedObs}
            onDelete={handleDelete}
            onAddNew={() => setTab('add')}
          />
        )}
        {tab === 'add' && (
          <ObservationForm onSaved={handleSaved} onCancel={() => setTab('gallery')} />
        )}
      </main>
      {selectedObs && (
        <ImageModal
          observation={selectedObs}
          onClose={() => setSelectedObs(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
