import { Scan, Clock } from 'lucide-react'

function Navbar({ currentPage }) {
  const steps = [
    { id: 'upload',   label: 'Patient & Scan', num: '01' },
    { id: 'analysis', label: 'AI Analysis',    num: '02' },
    { id: 'report',   label: 'Clinical Report',num: '03' }
  ]

  const getStepClass = (stepId) => {
    const ids = steps.map(s => s.id)
    const currentIdx = ids.indexOf(currentPage)
    const stepIdx = ids.indexOf(stepId)
    if (stepId === currentPage) return 'step-active'
    if (stepIdx < currentIdx) return 'step-done'
    return 'step-inactive'
  }

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #dce4ed',
      boxShadow: '0 1px 6px rgba(21,101,192,0.07)'
    }}
      className="px-8 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div style={{
            background: 'linear-gradient(135deg, #1565c0, #1976d2)',
            borderRadius: '10px',
            padding: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(21,101,192,0.25)'
          }}>
            <Scan size={20} color="#ffffff" />
          </div>
          <div>
            <h1 className="font-display text-lg leading-none" style={{ color: '#1a2332' }}>
              NeuroScan<span style={{ color: '#1565c0' }}>AI</span>
            </h1>
            <p style={{ color: '#7a93b5', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
              Renal CT Analysis
            </p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${getStepClass(step.id)}`}
                style={{ letterSpacing: '0.02em' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', opacity: 0.7 }}>{step.num}</span>
                <span>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <svg width="16" height="2" viewBox="0 0 16 2">
                  <line x1="0" y1="1" x2="16" y2="1" stroke="#dce4ed" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <button
  onClick={() => window.dispatchEvent(new CustomEvent('goto-history'))}
  style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '8px',
    background: '#f0f4f8', border: '1px solid #dce4ed',
    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
    color: '#3d5278', fontFamily: "'DM Sans', sans-serif",
  }}
>
  <Clock size={13} /> History
</button>

        {/* Status badge */}
        <div className="badge-live">System Online</div>

      </div>
    </nav>
  )
}

export default Navbar