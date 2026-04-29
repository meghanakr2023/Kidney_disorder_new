import { useState } from 'react'
import { ArrowLeft, Download, Printer, User, Stethoscope, Globe } from 'lucide-react'
import { generateReport, translateReport } from '../utils/api'

function ReportPage({ reportData, analysisData, onBack }) {
  const [activeTab, setActiveTab] = useState('doctor')
  const [patientReport, setPatientReport] = useState(null)
  const [loadingPatient, setLoadingPatient] = useState(false)

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [translatedReport, setTranslatedReport] = useState(null)
  const [loadingTranslation, setLoadingTranslation] = useState(false)
  const [translationError, setTranslationError] = useState(null)

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
  ]

  const handleLoadPatientReport = async () => {
    if (patientReport) {
      setActiveTab('patient')
      setTranslatedReport(null)
      setSelectedLanguage('en')
      return
    }

    setLoadingPatient(true)
    try {
      const payload = {
        file_id: reportData.file_id,
        filename: reportData.filename,
        prediction: reportData.prediction,
        confidence: reportData.confidence,
        probabilities: analysisData.probabilities,
        patient_info: reportData.patient_info,
        mode: 'patient',
        api_key: null,
        measurements: analysisData.measurements || {},
      }
      const result = await generateReport(payload)
      setPatientReport(result)
      setActiveTab('patient')
      setTranslatedReport(null)
      setSelectedLanguage('en')
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPatient(false)
    }
  }

  const handleLanguageChange = async (langCode) => {
    setSelectedLanguage(langCode)
    setTranslationError(null)

    // English — show original report
    if (langCode === 'en') {
      setTranslatedReport(null)
      return
    }

    // Get current active report
    const currentReport = activeTab === 'doctor'
      ? reportData?.report
      : patientReport?.report

    if (!currentReport) return

    setLoadingTranslation(true)
    try {
      const result = await translateReport(currentReport, langCode, activeTab)
      setTranslatedReport(result.translated_report)
    } catch (err) {
      setTranslationError('Translation failed. Showing English report.')
      setTranslatedReport(null)
      console.error(err)
    } finally {
      setLoadingTranslation(false)
    }
  }

  // When tab changes reset translation
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setTranslatedReport(null)
    setSelectedLanguage('en')
    setTranslationError(null)
  }

  const handlePrint = () => window.print()

  const handleDownloadPDF = () => {
    import('../utils/pdfGenerator').then(({ generatePDF }) => {
      const activeReport = activeTab === 'doctor'
        ? { ...reportData, report: translatedReport || reportData?.report }
        : { ...patientReport, report: translatedReport || patientReport?.report }
      generatePDF(activeReport, analysisData, activeTab)
    })
  }

  // Which report to display
  const displayReport = translatedReport ||
    (activeTab === 'doctor' ? reportData?.report : patientReport?.report)

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
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => handleTabChange('doctor')}
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

      {/* Language Selector */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Globe size={16} />
            <span>Report Language:</span>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={loadingTranslation}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${selectedLanguage === lang.code
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }
                ${loadingTranslation ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {loadingTranslation && (
          <p className="text-purple-400 text-xs mt-3 flex items-center gap-2">
            <span className="animate-spin">⟳</span>
            Translating report... please wait
          </p>
        )}

        {translationError && (
          <p className="text-red-400 text-xs mt-3">{translationError}</p>
        )}

        {translatedReport && !loadingTranslation && (
          <p className="text-purple-400 text-xs mt-3">
            ✓ Report translated to {languages.find(l => l.code === selectedLanguage)?.name}
          </p>
        )}
      </div>

      {/* Doctor Mode Report */}
      {activeTab === 'doctor' && displayReport && (
        <div className="flex flex-col gap-4">

          {displayReport.scan_type && (
            <div className="bg-slate-800 rounded-xl p-5">
              <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Scan Type</h4>
              <p className="text-white text-sm">{displayReport.scan_type}</p>
            </div>
          )}

          {displayReport.technique && (
            <div className="bg-slate-800 rounded-xl p-5">
              <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Technique / Protocol</h4>
              <p className="text-white text-sm leading-relaxed">{displayReport.technique}</p>
            </div>
          )}

          {displayReport.indication && (
            <div className="bg-slate-800 rounded-xl p-5">
              <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Clinical Indication</h4>
              <p className="text-white text-sm leading-relaxed">{displayReport.indication}</p>
            </div>
          )}

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3">Findings</h4>
            <div className="flex flex-col gap-3">
              {[
                ["Liver & Biliary Tract", displayReport.findings_liver],
                ["Gall Bladder", displayReport.findings_gallbladder],
                ["Pancreas", displayReport.findings_pancreas],
                ["Spleen", displayReport.findings_spleen],
                ["Right Kidney", displayReport.findings_right_kidney],
                ["Left Kidney", displayReport.findings_left_kidney],
                ["Collecting System", displayReport.findings_collecting_system],
                ["Urinary Bladder", displayReport.findings_urinary_bladder],
                ["Adrenals", displayReport.findings_adrenals],
                ["Vessels & Lymph Nodes", displayReport.findings_vessels],
                ["Others", displayReport.findings_others],
              ].map(([label, value]) => value && (
                <div key={label} className="border-l-2 border-slate-600 pl-3">
                  <p className="text-green-400 text-xs font-semibold mb-1">{label}</p>
                  <p className="text-white text-sm leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Impression</h4>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{displayReport.impression}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Recommendations</h4>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{displayReport.recommendation}</p>
          </div>

          {displayReport.ai_confidence && (
            <div className="bg-slate-700 rounded-xl p-4">
              <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-1">AI Analysis</h4>
              <p className="text-blue-300 text-sm">{displayReport.ai_confidence}</p>
            </div>
          )}

        </div>
      )}

      {/* Patient Mode Report */}
      {activeTab === 'patient' && displayReport && (
        <div className="flex flex-col gap-4">

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-2">What Was Found</h4>
            <p className="text-white text-sm leading-relaxed">{displayReport.what_found}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-2">What This Means</h4>
            <p className="text-white text-sm leading-relaxed">{displayReport.what_it_means}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-2">Is It Serious?</h4>
            <p className="text-white text-sm leading-relaxed">{displayReport.is_it_serious}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-2">What To Do Next</h4>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{displayReport.what_to_do}</p>
          </div>

          {displayReport.reassurance && (
            <div className="bg-green-900/20 border border-green-600/40 rounded-xl p-5">
              <p className="text-green-300 text-sm leading-relaxed">{displayReport.reassurance}</p>
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