import { useState } from 'react'
import { Upload, User, ChevronRight, FileImage, Calendar, Stethoscope, ClipboardList, AlertTriangle } from 'lucide-react'
import { uploadScan, predictScan } from '../utils/api'

function UploadPage({ onAnalysisDone }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    scanDate: '',
    referringDoctor: '',
    clinicalHistory: ''
  })

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
      setError(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      setPreview(URL.createObjectURL(dropped))
      setError(null)
    }
  }

  const handleInputChange = (e) => {
    setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!file) { setError('Please upload a CT scan image'); return }
    if (!patientInfo.name || !patientInfo.age || !patientInfo.gender || !patientInfo.scanDate) {
      setError('Please fill in all required patient fields'); return
    }

    setLoading(true)
    setError(null)

    try {
      setLoadingStep('Uploading scan...')
      const uploadResult = await uploadScan(file)

      setLoadingStep('Running AI analysis...')
      const analysisResult = await predictScan(uploadResult.file_id, uploadResult.filename)

      onAnalysisDone({ ...uploadResult, patientInfo }, analysisResult)
    } catch (err) {
      setError('Connection failed. Ensure the backend is running on port 8000.')
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" style={{ padding: '40px 0' }}>

      {/* Page header */}
      <div style={{ marginBottom: '36px' }}>
        <p className="label" style={{ marginBottom: '8px' }}>Step 01</p>
        <h2 className="font-display" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Patient Registration & Scan Upload
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px' }}>
          Upload a kidney CT scan image and provide patient information to begin AI-assisted analysis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* LEFT — Scan Upload */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div style={{ background: 'rgba(0,212,255,0.1)', borderRadius: '8px', padding: '8px' }}>
              <FileImage size={16} color="var(--accent-cyan)" />
            </div>
            <div>
              <p className="label" style={{ margin: 0 }}>CT Scan Image</p>
              <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>Upload Imaging File</p>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className="upload-zone"
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              padding: '24px',
              textAlign: 'center',
              minHeight: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              borderColor: dragOver ? 'var(--accent-cyan)' : undefined,
              background: dragOver ? 'rgba(0,212,255,0.04)' : undefined,
              marginBottom: '12px'
            }}
          >
            {preview ? (
              <div style={{ width: '100%' }}>
                <img
                  src={preview}
                  alt="CT Preview"
                  style={{ maxHeight: '180px', margin: '0 auto', objectFit: 'contain', display: 'block', borderRadius: '8px' }}
                />
              </div>
            ) : (
              <>
                <div style={{
                  width: '52px', height: '52px',
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Upload size={22} color="var(--accent-cyan)" />
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                  Drop CT scan here
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px' }}>
                  or click to browse files
                </p>
                <div style={{
                  display: 'flex', gap: '6px', justifyContent: 'center'
                }}>
                  {['JPEG', 'PNG', 'DCM'].map(fmt => (
                    <span key={fmt} style={{
                      padding: '2px 8px', borderRadius: '4px',
                      fontSize: '10px', fontWeight: 600,
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      fontFamily: 'DM Mono, monospace',
                      letterSpacing: '0.04em'
                    }}>{fmt}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <input id="fileInput" type="file" accept="image/*,.dcm" onChange={handleFileChange} style={{ display: 'none' }} />

          {file && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px',
              background: 'rgba(0,229,160,0.08)',
              border: '1px solid rgba(0,229,160,0.2)'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', flexShrink: 0 }} />
              <p style={{ color: 'var(--accent-green)', fontSize: '12px', fontWeight: 500 }}>
                {file.name}
              </p>
            </div>
          )}

          {/* Info boxes */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {[
              { label: 'Max Size', value: '20 MB' },
              { label: 'Format', value: 'JPG / PNG / DCM' },
            ].map(item => (
              <div key={item.label} style={{
                flex: 1, padding: '10px 12px', borderRadius: '8px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)'
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>{item.label}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Patient Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div style={{ background: 'rgba(0,229,160,0.1)', borderRadius: '8px', padding: '8px' }}>
              <User size={16} color="var(--accent-green)" />
            </div>
            <div>
              <p className="label" style={{ margin: 0 }}>Patient Data</p>
              <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>Clinical Information</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <label className="label">Full Name <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <input className="input-field" type="text" name="name" value={patientInfo.name}
                onChange={handleInputChange} placeholder="Patient full name" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="label">Age <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                <input className="input-field" type="number" name="age" value={patientInfo.age}
                  onChange={handleInputChange} placeholder="Years" min="1" max="120" />
              </div>
              <div>
                <label className="label">Gender <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                <select className="input-field" name="gender" value={patientInfo.gender} onChange={handleInputChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">
                <Calendar size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Scan Date <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <input className="input-field" type="date" name="scanDate" value={patientInfo.scanDate}
                onChange={handleInputChange} />
            </div>

            <div>
              <label className="label">
                <Stethoscope size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Referring Physician
              </label>
              <input className="input-field" type="text" name="referringDoctor" value={patientInfo.referringDoctor}
                onChange={handleInputChange} placeholder="Dr. Name" />
            </div>

            <div>
              <label className="label">
                <ClipboardList size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Clinical History
              </label>
              <textarea className="input-field" name="clinicalHistory" value={patientInfo.clinicalHistory}
                onChange={handleInputChange}
                placeholder="Symptoms, prior conditions, medications..."
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(255,71,87,0.08)',
          border: '1px solid rgba(255,71,87,0.3)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <AlertTriangle size={16} color="var(--accent-red)" />
          <p style={{ color: 'var(--accent-red)', fontSize: '13px' }}>{error}</p>
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <div className="spinner" />
              {loadingStep || 'Processing...'}
            </>
          ) : (
            <>
              Begin AI Analysis
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

    </div>
  )
}

export default UploadPage