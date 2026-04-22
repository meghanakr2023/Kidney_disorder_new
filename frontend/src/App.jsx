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
    <div className="min-h-screen bg-slate-900">
      <Navbar currentPage={currentPage} />

      <main className="container mx-auto px-4 py-8">

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
  )
}

export default App