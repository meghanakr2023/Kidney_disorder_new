import { Scan } from 'lucide-react'

function Navbar({ currentPage }) {
  const steps = [
    { id: 'upload', label: 'Patient & Scan', num: '01' },
    { id: 'analysis', label: 'AI Analysis', num: '02' },
    { id: 'report', label: 'Clinical Report', num: '03' }
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
    <nav style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
      className="px-8 py-4 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div style={{
              background: 'linear-gradient(135deg, #00d4ff22, #00d4ff11)',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Scan size={20} color="var(--accent-cyan)" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-lg leading-none" style={{ color: 'var(--text-primary)' }}>
              NeuroScan<span style={{ color: 'var(--accent-cyan)' }}>AI</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
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
                  <line x1="0" y1="1" x2="16" y2="1" stroke="var(--border-light)" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="badge-live">System Online</div>

      </div>
    </nav>
  )
}

export default Navbar