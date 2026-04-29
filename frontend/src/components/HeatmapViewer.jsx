import { useState } from 'react'

function HeatmapViewer({ originalB64, heatmapB64, overlayB64 }) {
  const [activeView, setActiveView] = useState('overlay')

  const views = [
    { id: 'original', label: 'Original', desc: 'Raw CT scan' },
    { id: 'heatmap', label: 'Heatmap', desc: 'Activation map' },
    { id: 'overlay', label: 'Overlay', desc: 'Combined view' }
  ]

  const getImage = () => {
    if (activeView === 'original') return originalB64
    if (activeView === 'heatmap') return heatmapB64
    if (activeView === 'overlay') return overlayB64
  }

  const getDesc = () => {
    if (activeView === 'original') return 'Original CT scan image — unprocessed'
    if (activeView === 'heatmap') return 'Grad-CAM activation — red regions indicate highest AI attention'
    if (activeView === 'overlay') return 'Activation map overlaid on original scan for clinical review'
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="label">Scan Visualization</p>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}>
            Grad-CAM Analysis
          </h3>
        </div>
        <div style={{
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--accent-cyan)'
        }}>XAI Active</div>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px' }}>
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            style={{
              flex: 1, padding: '7px 12px', borderRadius: '8px', border: 'none',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'DM Sans, sans-serif',
              background: activeView === view.id ? 'var(--bg-card-hover)' : 'transparent',
              color: activeView === view.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: activeView === view.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            }}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Image */}
      <div style={{
        background: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        minHeight: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '1px solid var(--border)'
      }}>
        {getImage() ? (
          <img
            src={`data:image/png;base64,${getImage()}`}
            alt={activeView}
            style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No image available</div>
        )}

        {/* Corner label */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          background: 'rgba(6,9,15,0.8)',
          border: '1px solid var(--border)',
          borderRadius: '6px', padding: '3px 8px',
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: 'DM Mono, monospace'
        }}>
          {activeView}
        </div>
      </div>

      {/* Description */}
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
        {getDesc()}
      </p>
    </div>
  )
}

export default HeatmapViewer