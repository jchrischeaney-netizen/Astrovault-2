export default function Header({ tab, onTabChange, count }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" stroke="#4a7af0" strokeWidth="1.5" fill="#0a0e1a"/>
            <circle cx="16" cy="16" r="6" fill="none" stroke="#c8d8ff" strokeWidth="1" strokeDasharray="2 3"/>
            <circle cx="16" cy="16" r="2" fill="#4a7af0"/>
            <circle cx="24" cy="10" r="1.5" fill="#c8d8ff" opacity="0.8"/>
            <circle cx="8" cy="22" r="1" fill="#c8d8ff" opacity="0.5"/>
            <circle cx="26" cy="20" r="0.8" fill="#c8d8ff" opacity="0.4"/>
            <circle cx="10" cy="9" r="0.8" fill="#4a7af0" opacity="0.7"/>
            <line x1="16" y1="4" x2="16" y2="8" stroke="#4a7af0" strokeWidth="1" strokeLinecap="round"/>
            <line x1="28" y1="16" x2="24" y2="16" stroke="#4a7af0" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="header-title">Astrovault</div>
            <div className="header-subtitle">Astrophotography Journal</div>
          </div>
        </div>
      </div>
      <div className="tabs">
        <button className={`tab-btn ${tab === 'gallery' ? 'active' : ''}`} onClick={() => onTabChange('gallery')}>
          Gallery {count > 0 && `(${count})`}
        </button>
        <button className={`tab-btn ${tab === 'add' ? 'active' : ''}`} onClick={() => onTabChange('add')}>
          + Add Observation
        </button>
      </div>
    </header>
  )
}
