import { useState } from 'react'

function HeatmapViewer({ originalB64, heatmapB64, overlayB64 }) {
  const [activeView, setActiveView] = useState('overlay')

  const views = [
    { id: 'original', label: 'Original' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'overlay', label: 'Overlay' }
  ]

  const getImage = () => {
    if (activeView === 'original') return originalB64
    if (activeView === 'heatmap') return heatmapB64
    if (activeView === 'overlay') return overlayB64
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">

      <h3 className="text-white font-semibold mb-3">Scan Visualization</h3>

      {/* Toggle buttons */}
      <div className="flex gap-2 mb-4">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all
              ${activeView === view.id
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Image display */}
      <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '300px' }}>
        {getImage() ? (
          <img
            src={`data:image/png;base64,${getImage()}`}
            alt={activeView}
            className="max-w-full max-h-80 object-contain"
          />
        ) : (
          <p className="text-slate-500 text-sm">No image available</p>
        )}
      </div>

      {/* Label */}
      <p className="text-slate-400 text-xs mt-2 text-center">
        {activeView === 'original' && 'Original CT scan image'}
        {activeView === 'heatmap' && 'Grad-CAM heatmap — red areas are most suspicious'}
        {activeView === 'overlay' && 'Heatmap overlaid on original scan'}
      </p>

    </div>
  )
}

export default HeatmapViewer