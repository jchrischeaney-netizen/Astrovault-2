import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import Gallery from './components/Gallery.jsx'
import ObservationForm from './components/ObservationForm.jsx'
import Lightbox from './components/Lightbox.jsx'
import Stats from './components/Stats.jsx'

export default function App() {
  const [tab, setTab] = useState('gallery')
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null) // { list, idx }

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
  }

  // Gallery passes (obs, filteredList, index) so lightbox navigates the visible set
  const handleSelect = (obs, filteredList, idx) => {
    setLightbox({ list: filteredList, idx })
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
            onSelect={handleSelect}
            onDelete={handleDelete}
            onAddNew={() => setTab('add')}
          />
        )}
        {tab === 'add' && (
          <ObservationForm onSaved={handleSaved} onCancel={() => setTab('gallery')} />
        )}
        {tab === 'stats' && (
          <Stats observations={observations} />
        )}
      </main>

      {lightbox && (
        <Lightbox
          list={lightbox.list}
          startIndex={lightbox.idx}
          onClose={() => setLightbox(null)}
          onDelete={(id) => {
            handleDelete(id)
            setLightbox(lb => {
              if (!lb) return null
              const newList = lb.list.filter(o => o.id !== id)
              if (newList.length === 0) return null
              const newIdx = Math.min(lb.idx, newList.length - 1)
              return { list: newList, idx: newIdx }
            })
          }}
        />
      )}
    </div>
  )
}
