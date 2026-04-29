import { useState } from 'react'
import Navbar from './components/Navbar'
import UploadPage from './pages/UploadPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportPage from './pages/ReportPage'

function App() {
  const [currentPage, setCurrentPage] = useState('upload')
  const [uploadData, setUploadData] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [reportData, setReportData] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>

      {/* Subtle grid background */}
      <div className="grid-bg" style={{
        position: 'fixed', inset: 0, opacity: 0.35, pointerEvents: 'none', zIndex: 0
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'fixed', top: '-200px', left: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-200px', right: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(0,229,160,0.03) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar currentPage={currentPage} />

        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>

          {currentPage === 'upload' && (
            <UploadPage
              onAnalysisDone={(upload, analysis) => {
                setUploadData(upload)
                setAnalysisData(analysis)
                setCurrentPage('analysis')
              }}
            />
          )}

          {currentPage === 'analysis' && (
            <AnalysisPage
              uploadData={uploadData}
              analysisData={analysisData}
              onReportDone={(report) => {
                setReportData(report)
                setCurrentPage('report')
              }}
              onBack={() => setCurrentPage('upload')}
            />
          )}

          {currentPage === 'report' && (
            <ReportPage
              reportData={reportData}
              analysisData={analysisData}
              onBack={() => setCurrentPage('analysis')}
            />
          )}

        </main>
      </div>
    </div>
  )
}

export default App