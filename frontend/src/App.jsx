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
        position: 'fixed', inset: 0, opacity: 0.45, pointerEvents: 'none', zIndex: 0
      }} />

      {/* Soft blue glow top-left */}
      <div style={{
        position: 'fixed', top: '-150px', left: '-150px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(21,101,192,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      {/* Soft teal glow bottom-right */}
      <div style={{
        position: 'fixed', bottom: '-150px', right: '-150px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0,121,107,0.04) 0%, transparent 70%)',
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