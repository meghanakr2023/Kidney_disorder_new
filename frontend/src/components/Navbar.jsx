import { Activity } from 'lucide-react'

function Navbar({ currentPage }) {
  const steps = [
    { id: 'upload', label: 'Upload Scan' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'report', label: 'Report' }
  ]

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Activity className="text-green-400" size={28} />
          <div>
            <h1 className="text-white font-bold text-xl">AI Radiology Assistant</h1>
            <p className="text-slate-400 text-xs">CT Scan Analyzer</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">

              {/* Step bubble */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${currentPage === step.id
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-400'
                }`}>
                <span>{index + 1}</span>
                <span>{step.label}</span>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <span className="text-slate-600">→</span>
              )}

            </div>
          ))}
        </div>

      </div>
    </nav>
  )
}

export default Navbar