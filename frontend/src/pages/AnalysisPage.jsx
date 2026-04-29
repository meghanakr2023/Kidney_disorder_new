import { useState } from 'react'
import { ArrowLeft, ChevronRight, AlertTriangle, ShieldAlert, Activity, User } from 'lucide-react'
import HeatmapViewer from '../components/HeatmapViewer'
import ConfidenceChart from '../components/ConfidenceChart'
import { generateReport } from '../utils/api'

function AnalysisPage({ uploadData, analysisData, onReportDone, onBack }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isAnomaly = analysisData?.anomaly?.is_anomaly || false

  const getSeverityConfig = (prediction) => {
    const configs = {
      'Tumor': { label: 'High Severity', sublabel: 'Urgent Attention Required', cssClass: 'severity-tumor', dot: '#ff4757' },
      'Stone': { label: 'Moderate Severity', sublabel: 'Medical Attention Needed', cssClass: 'severity-stone', dot: '#ffd32a' },
      'Cyst': { label: 'Low Severity', sublabel: 'Routine Follow-up', cssClass: 'severity-cyst', dot: '#00d4ff' },
      'Normal': { label: 'No Pathology', sublabel: 'No Abnormality Detected', cssClass: 'severity-normal', dot: '#00e5a0' },
    }
    return configs[prediction] || configs['Normal']
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        file_id: uploadData.file_id,
        filename: uploadData.filename,
        prediction: analysisData.prediction,
        confidence: analysisData.confidence,
        probabilities: analysisData.probabilities,
        patient_info: uploadData.patientInfo,
        mode: 'doctor',
        api_key: null,
        measurements: analysisData.measurements || {},
        is_anomaly: isAnomaly,
      }
      const result = await generateReport(payload)
      onReportDone(result)
    } catch (err) {
      setError('Report generation failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sev = getSeverityConfig(analysisData?.prediction)

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" style={{ padding: '40px 0' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <p className="label" style={{ marginBottom: '8px' }}>Step 02</p>
          <h2 className="font-display" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            AI Analysis Results
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            EfficientNet-B3 classification with Grad-CAM explainability
          </p>
        </div>
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* ANOMALY BLOCK */}
      {isAnomaly ? (
        <div style={{
          padding: '28px',
          borderRadius: '16px',
          background: 'rgba(255,71,87,0.06)',
          border: '1px solid rgba(255,71,87,0.25)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'rgba(255,71,87,0.15)',
              border: '1px solid rgba(255,71,87,0.3)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldAlert size={22} color="var(--accent-red)" />
            </div>
            <div>
              <h3 style={{ color: 'var(--accent-red)', fontSize: '16px', fontWeight: 700 }}>
                Unknown Scan Pattern Detected
              </h3>
              <p style={{ color: 'rgba(255,71,87,0.7)', fontSize: '12px', marginTop: '2px' }}>
                Anomaly Score: {analysisData.anomaly.score}/100 — Out-of-distribution input
              </p>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
            This image does not match the distribution of kidney CT scans used to train this model.
            The scan may represent a different organ, imaging modality, or an unusual renal condition
            not present in the training dataset.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)'
            }}>
              <p style={{ color: 'var(--accent-red)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                ✕ Classification Hidden
              </p>
              <p style={{ color: 'rgba(255,71,87,0.7)', fontSize: '12px' }}>
                Displaying a kidney classification for this scan would be clinically misleading.
              </p>
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)'
            }}>
              <p style={{ color: 'var(--accent-red)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                ⚕ Action Required
              </p>
              <p style={{ color: 'rgba(255,71,87,0.7)', fontSize: '12px' }}>
                Upload a proper kidney CT scan or consult a specialist for evaluation.
              </p>
            </div>
          </div>
        </div>

      ) : (
        <>
          {/* Confidence strip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '8px',
            background: 'rgba(0,229,160,0.06)',
            border: '1px solid rgba(0,229,160,0.2)',
            marginBottom: '20px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} />
            <p style={{ color: 'var(--accent-green)', fontSize: '12px', fontWeight: 500 }}>
              {analysisData?.anomaly?.message || 'Scan within expected distribution'}
            </p>
          </div>

          {/* Prediction banner */}
          <div className={`card ${sev.cssClass}`} style={{
            padding: '20px 24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Activity size={22} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px' }}>
                  AI Prediction
                </p>
                <p style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>
                  {analysisData?.label}
                </p>
                <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>{sev.sublabel}</p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px' }}>
                Confidence
              </p>
              <p style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>
                {analysisData?.confidence}%
              </p>
            </div>
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <HeatmapViewer
              originalB64={analysisData?.original_b64}
              heatmapB64={analysisData?.heatmap_b64}
              overlayB64={analysisData?.overlay_b64}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ConfidenceChart
                probabilities={analysisData?.probabilities || {}}
                prediction={analysisData?.prediction}
              />

              {/* Patient summary card */}
              <div className="card p-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <User size={14} color="var(--text-muted)" />
                  <p className="label" style={{ margin: 0 }}>Patient Summary</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    ['Name', uploadData?.patientInfo?.name],
                    ['Age', uploadData?.patientInfo?.age + ' years'],
                    ['Gender', uploadData?.patientInfo?.gender],
                    ['Scan Date', uploadData?.patientInfo?.scanDate],
                    ['Referring Dr.', uploadData?.patientInfo?.referringDoctor || 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</p>
                      <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(255,211,42,0.06)',
            border: '1px solid rgba(255,211,42,0.2)',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={14} color="var(--accent-yellow)" style={{ marginTop: '1px', flexShrink: 0 }} />
            <p style={{ color: 'rgba(255,211,42,0.8)', fontSize: '12px', lineHeight: 1.5 }}>
              This analysis is AI-assisted and intended to support clinical decision-making only.
              Final diagnosis must be confirmed by a qualified radiologist.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.3)',
              display: 'flex', gap: '10px', marginBottom: '16px'
            }}>
              <AlertTriangle size={14} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ color: 'var(--accent-red)', fontSize: '13px' }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={handleGenerateReport} disabled={loading}>
              {loading ? (
                <><div className="spinner" /> Generating Report...</>
              ) : (
                <>Generate Clinical Report <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default AnalysisPage