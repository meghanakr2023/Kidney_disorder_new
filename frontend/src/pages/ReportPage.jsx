import { useState } from 'react'
import { ArrowLeft, Download, Printer, User, Stethoscope } from 'lucide-react'
import { generateReport } from '../utils/api'

function ReportPage({ reportData, analysisData, onBack }) {
  const [activeTab, setActiveTab] = useState('doctor')
  const [patientReport, setPatientReport] = useState(null)
  const [loadingPatient, setLoadingPatient] = useState(false)

  const handleLoadPatientReport = async () => {
    if (patientReport) {
      setActiveTab('patient')
      return
    }

    setLoadingPatient(true)
    try {
      const payload = {
        file_id: reportData.file_id,
        prediction: reportData.prediction,
        confidence: reportData.confidence,
        probabilities: analysisData.probabilities,
        patient_info: reportData.patient_info,
        mode: 'patient',
        api_key: null
      }
      const result = await generateReport(payload)
      setPatientReport(result)
      setActiveTab('patient')
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPatient(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    import('../utils/pdfGenerator').then(({ generatePDF }) => {
      const activeReport = activeTab === 'doctor' ? reportData : patientReport
      generatePDF(activeReport, analysisData, activeTab)
    })
  }

  const doctorReport = reportData?.report
  const patientReportData = patientReport?.report

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Medical Report</h2>
          <p className="text-slate-400">Generated for {reportData?.patient_info?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-slate-800 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Patient Name</p>
            <p className="text-white font-medium">{reportData?.patient_info?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Age / Gender</p>
            <p className="text-white font-medium">
              {reportData?.patient_info?.age} / {reportData?.patient_info?.gender}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Scan Date</p>
            <p className="text-white font-medium">{reportData?.patient_info?.scanDate}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Referring Doctor</p>
            <p className="text-white font-medium">
              {reportData?.patient_info?.referringDoctor || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="bg-slate-800 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">AI Diagnosis</p>
          <p className="text-white text-xl font-bold">{analysisData?.label}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm mb-1">Confidence</p>
          <p className="text-green-400 text-xl font-bold">{analysisData?.confidence}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('doctor')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'doctor'
              ? 'bg-green-500 text-white'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
        >
          <Stethoscope size={16} />
          Doctor Mode
        </button>
        <button
          onClick={handleLoadPatientReport}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'patient'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
        >
          <User size={16} />
          {loadingPatient ? 'Loading...' : 'Patient Mode'}
        </button>
      </div>

      {/* Doctor Mode Report */}
      {activeTab === 'doctor' && doctorReport && (
        <div className="flex flex-col gap-4">

          {doctorReport.scan_type && (
            <div className="bg-slate-800 rounded-xl p-5">
              <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Scan Type</h4>
              <p className="text-white text-sm">{doctorReport.scan_type}</p>
            </div>
          )}

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Findings</h4>
            <p className="text-white text-sm leading-relaxed">{doctorReport.findings}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Impression</h4>
            <p className="text-white text-sm leading-relaxed">{doctorReport.impression}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Recommendations</h4>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{doctorReport.recommendation}</p>
          </div>

        </div>
      )}

      {/* Patient Mode Report */}
      {activeTab === 'patient' && patientReportData && (
        <div className="flex flex-col gap-4">

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-2">What Was Found</h4>
            <p className="text-white text-sm leading-relaxed">{patientReportData.what_found}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-2">What This Means</h4>
            <p className="text-white text-sm leading-relaxed">{patientReportData.what_it_means}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-2">Is It Serious?</h4>
            <p className="text-white text-sm leading-relaxed">{patientReportData.is_it_serious}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-2">What To Do Next</h4>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{patientReportData.what_to_do}</p>
          </div>

          {patientReportData.reassurance && (
            <div className="bg-green-900/20 border border-green-600/40 rounded-xl p-5">
              <p className="text-green-300 text-sm leading-relaxed">{patientReportData.reassurance}</p>
            </div>
          )}

        </div>
      )}

      {/* AI Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-xl px-4 py-3 mt-6">
        <p className="text-yellow-300 text-xs">
          ⚠️ This report is AI-assisted and intended to support clinical decision-making only.
          Final diagnosis must be confirmed by a qualified radiologist or treating physician.
          Do not make any medical decisions based solely on this AI-generated report.
        </p>
      </div>

    </div>
  )
}

export default ReportPage