import { useState, useEffect } from 'react'
import { Clock, Search, Trash2, Eye, User, Calendar, ChevronRight, X } from 'lucide-react'
import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 30000 })

const severityColor = {
  Tumor:  { color: '#c62828', bg: 'rgba(198,40,40,0.08)',  border: 'rgba(198,40,40,0.2)'  },
  Stone:  { color: '#e65100', bg: 'rgba(230,81,0,0.08)',   border: 'rgba(230,81,0,0.2)'   },
  Cyst:   { color: '#1565c0', bg: 'rgba(21,101,192,0.08)', border: 'rgba(21,101,192,0.2)' },
  Normal: { color: '#00796b', bg: 'rgba(0,121,107,0.08)',  border: 'rgba(0,121,107,0.2)'  },
}

function formatDate(iso) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function ScanDetailModal({ scan, onClose }) {
  const [activeTab, setActiveTab] = useState('report')
  const report = scan.doctor_report || scan.patient_report || {}
  const sev = severityColor[scan.prediction] || severityColor.Normal

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(26,35,50,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: '750px', maxHeight: '85vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(21,101,192,0.18)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ background: '#1a2e4a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
              {scan.patient_info?.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px', fontFamily: "'DM Sans', sans-serif" }}>
              {formatDate(scan.created_at)} · {scan.prediction}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="#fff" />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #dce4ed', background: '#f7fafd' }}>
          {['report', 'patient_report', 'chat'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
              color: activeTab === tab ? '#1565c0' : '#7a93b5',
              borderBottom: activeTab === tab ? '2px solid #1565c0' : '2px solid transparent',
            }}>
              {tab === 'report' ? 'Doctor Report' : tab === 'patient_report' ? 'Patient Report' : 'Chat History'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {activeTab === 'report' && (
            <div>
              {scan.doctor_report ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    ['Scan Type', report.scan_type],
                    ['Indication', report.indication],
                    ['Right Kidney', report.findings_right_kidney],
                    ['Left Kidney', report.findings_left_kidney],
                    ['Impression', report.impression],
                    ['Recommendation', report.recommendation],
                  ].map(([label, value]) => value && (
                    <div key={label} style={{ borderLeft: '3px solid #1565c0', paddingLeft: '14px' }}>
                      <div style={{ color: '#7a93b5', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                      <div style={{ color: '#37474f', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#7a93b5', fontSize: '13px', textAlign: 'center', padding: '32px' }}>No doctor report saved for this scan.</p>
              )}
            </div>
          )}

          {activeTab === 'patient_report' && (
            <div>
              {scan.patient_report ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    ['What Was Found', scan.patient_report.what_found],
                    ['What This Means', scan.patient_report.what_it_means],
                    ['How Serious', scan.patient_report.is_it_serious],
                    ['What To Do', scan.patient_report.what_to_do],
                    ['Reassurance', scan.patient_report.reassurance],
                  ].map(([label, value]) => value && (
                    <div key={label} style={{ borderLeft: '3px solid #00796b', paddingLeft: '14px' }}>
                      <div style={{ color: '#7a93b5', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                      <div style={{ color: '#37474f', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#7a93b5', fontSize: '13px', textAlign: 'center', padding: '32px' }}>No patient report saved for this scan.</p>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scan.chat_history?.length > 0 ? scan.chat_history.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: '12px',
                    background: msg.role === 'user' ? '#1565c0' : '#f0f4f8',
                    color: msg.role === 'user' ? '#fff' : '#37474f',
                    fontSize: '13px', lineHeight: 1.55,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {msg.content}
                  </div>
                </div>
              )) : (
                <p style={{ color: '#7a93b5', fontSize: '13px', textAlign: 'center', padding: '32px' }}>No chat history for this scan.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HistoryPage({ onBack }) {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedScan, setSelectedScan] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/history')
      setScans(res.data.scans)
    } catch (err) {
      setError('Failed to load history. Check if MongoDB is connected.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scanId, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this scan record permanently?')) return
    setDeletingId(scanId)
    try {
      await api.delete(`/history/${scanId}`)
      setScans(prev => prev.filter(s => s._id !== scanId))
    } catch (err) {
      alert('Delete failed. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = scans.filter(s => {
    const q = search.toLowerCase()
    return (
      s.patient_info?.name?.toLowerCase().includes(q) ||
      s.prediction?.toLowerCase().includes(q) ||
      s.patient_info?.referringDoctor?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" style={{ padding: '40px 0' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <p className="label" style={{ marginBottom: '8px' }}>Scan Records</p>
          <h2 className="font-display" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Patient History
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {scans.length} scan{scans.length !== 1 ? 's' : ''} stored in MongoDB Atlas
          </p>
        </div>
        <button className="btn-secondary" onClick={onBack}>← Back</button>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={15} color="#7a93b5" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="input-field"
          style={{ paddingLeft: '38px' }}
          placeholder="Search by patient name, prediction, or doctor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading scan history...
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(198,40,40,0.06)', border: '1px solid rgba(198,40,40,0.2)', color: '#c62828', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Clock size={40} color="#b0c4d8" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {search ? 'No scans match your search.' : 'No scans stored yet. Run a scan to see history here.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(scan => {
            const sev = severityColor[scan.prediction] || severityColor.Normal
            return (
              <div
                key={scan._id}
                className="card"
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                onClick={() => setSelectedScan(scan)}
              >
                <div style={{
                  minWidth: '80px', padding: '6px 12px', borderRadius: '8px', textAlign: 'center',
                  background: sev.bg, border: `1px solid ${sev.border}`,
                }}>
                  <div style={{ color: sev.color, fontSize: '12px', fontWeight: 700 }}>{scan.prediction}</div>
                  <div style={{ color: sev.color, fontSize: '10px', opacity: 0.8 }}>{scan.confidence}%</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <User size={12} color="#7a93b5" />
                    <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                      {scan.patient_info?.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {scan.patient_info?.age} yrs · {scan.patient_info?.gender}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={10} /> {formatDate(scan.created_at)}
                    </span>
                    {scan.patient_info?.referringDoctor && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        Dr. {scan.patient_info.referringDoctor}
                      </span>
                    )}
                    {scan.chat_history?.length > 0 && (
                      <span style={{ color: '#1565c0', fontSize: '11px', fontWeight: 600 }}>
                        {Math.floor(scan.chat_history.length / 2)} chat Q&As
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={e => handleDelete(scan._id, e)}
                    disabled={deletingId === scan._id}
                    style={{
                      background: 'rgba(198,40,40,0.06)', border: '1px solid rgba(198,40,40,0.2)',
                      borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', display: 'flex',
                      opacity: deletingId === scan._id ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={14} color="#c62828" />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1565c0', fontSize: '12px', fontWeight: 600 }}>
                    <Eye size={13} /> View <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedScan && (
        <ScanDetailModal scan={selectedScan} onClose={() => setSelectedScan(null)} />
      )}
    </div>
  )
}

export default HistoryPage