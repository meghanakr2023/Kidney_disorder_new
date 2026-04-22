import { useState } from 'react'
import { ArrowLeft, ArrowRight, Brain, AlertCircle } from 'lucide-react'
import HeatmapViewer from '../components/HeatmapViewer'
import ConfidenceChart from '../components/ConfidenceChart'
import { generateReport } from '../utils/api'

function AnalysisPage({ uploadData, analysisData, onReportDone, onBack }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiKey, setApiKey] = useState('')

  const getSeverityColor = (prediction) => {
    if (prediction === 'Tumor') return 'text-red-400 bg-red-900/30 border-red-500'
    if (prediction === 'Stone') return 'text-yellow-400 bg-yellow-900/30 border-yellow-500'
    if (prediction === 'Cyst') return 'text-blue-400 bg-blue-900/30 border-blue-500'
    if (prediction === 'Normal') return 'text-green-400 bg-green-900/30 border-green-500'
    return 'text-slate-400 bg-slate-800 border-slate-600'
  }

  const getSeverityLabel = (prediction) => {
    if (prediction === 'Tumor') return 'High Severity — Urgent Attention Required'
    if (prediction === 'Stone') return 'Moderate Severity — Medical Attention Needed'
    if (prediction === 'Cyst') return 'Low Severity — Routine Follow-up'
    if (prediction === 'Normal') return 'No Abnormality Detected'
    return ''
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        file_id: uploadData.file_id,
        prediction: analysisData.prediction,
        confidence: analysisData.confidence,
        probabilities: analysisData.probabilities,
        patient_info: uploadData.patientInfo,
        mode: 'doctor',
        api_key: apiKey || null
      }

      const result = await generateReport(payload)
      onReportDone(result)

    } catch (err) {
      setError('Failed to generate report. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Analysis Results</h2>
          <p className="text-slate-400">AI prediction for {uploadData?.patientInfo?.name}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Prediction Banner */}
      <div className={`border rounded-xl px-6 py-4 mb-6 flex items-center justify-between ${getSeverityColor(analysisData?.prediction)}`}>
        <div className="flex items-center gap-3">
          <Brain size={28} />
          <div>
            <p className="text-sm opacity-70">AI Prediction</p>
            <p className="text-2xl font-bold">{analysisData?.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-70">Confidence</p>
          <p className="text-2xl font-bold">{analysisData?.confidence}%</p>
        </div>
      </div>

      {/* Severity label */}
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle size={16} className="text-slate-400" />
        <p className="text-slate-400 text-sm">{getSeverityLabel(analysisData?.prediction)}</p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Heatmap */}
        <HeatmapViewer
          originalB64={analysisData?.original_b64}
          heatmapB64={analysisData?.heatmap_b64}
          overlayB64={analysisData?.overlay_b64}
        />

        {/* Chart + Patient Info */}
        <div className="flex flex-col gap-4">

          <ConfidenceChart
            probabilities={analysisData?.probabilities || {}}
            prediction={analysisData?.prediction}
          />

          {/* Patient summary */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Patient Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Name</p>
                <p className="text-white">{uploadData?.patientInfo?.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Age</p>
                <p className="text-white">{uploadData?.patientInfo?.age}</p>
              </div>
              <div>
                <p className="text-slate-500">Gender</p>
                <p className="text-white">{uploadData?.patientInfo?.gender}</p>
              </div>
              <div>
                <p className="text-slate-500">Scan Date</p>
                <p className="text-white">{uploadData?.patientInfo?.scanDate}</p>
              </div>
              <div>
                <p className="text-slate-500">Referring Doctor</p>
                <p className="text-white">{uploadData?.patientInfo?.referringDoctor || 'N/A'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* API Key input */}
      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        <h3 className="text-white font-semibold mb-2">Anthropic API Key (Optional)</h3>
        <p className="text-slate-400 text-xs mb-3">
          Provide your Claude API key for AI-powered report generation.
          Without it, a template-based report will be generated instead.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-green-500"
        />
      </div>

      {/* AI Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-xl px-4 py-3 mb-6">
        <p className="text-yellow-300 text-xs">
          ⚠️ This analysis is AI-assisted and intended to support clinical decision-making only.
          Final diagnosis must be confirmed by a qualified radiologist.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Generate Report Button */}
      <div className="text-center">
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold px-10 py-3 rounded-xl transition-all text-sm flex items-center gap-2 mx-auto"
        >
          {loading ? 'Generating Report...' : (
            <>
              Generate Medical Report
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

    </div>
  )
}

export default AnalysisPage