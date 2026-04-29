import { useState } from 'react'
import { ArrowLeft, Download, Printer, User, Stethoscope, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { generateReport, translateReport } from '../utils/api'

const C = {
  pageBg:      '#f0f2f5',
  white:       '#ffffff',
  headerBg:    '#1a2e4a',
  accentBlue:  '#1565c0',
  accentTeal:  '#00796b',
  accentRed:   '#c62828',
  accentAmber: '#f57c00',
  borderLight: '#d6dce4',
  borderMed:   '#b0bec5',
  textDark:    '#1a2332',
  textMed:     '#37474f',
  textLight:   '#607d8b',
  sectionHead: '#e8edf3',
  rowAlt:      '#f7f9fb',
  impressionBg:'#e3f2fd',
  impressionBorder: '#1565c0',
  recoBg:      '#e8f5e9',
  recoBorder:  '#2e7d32',
  aiBg:        '#ede7f6',
  aiBorder:    '#5e35b1',
  patientBg:   '#f5f8ff',
}

const s = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 0 60px',
    fontFamily: "'Crimson Text', 'Georgia', serif",
  },
  actionBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px', padding: '10px 16px',
    background: '#1a2e4a', borderRadius: '10px',
  },
  actionBarTitle: {
    color: '#ffffff', fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  actionBtns: { display: 'flex', gap: '8px' },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '7px',
    background: '#1565c0', color: '#fff', border: 'none', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '7px',
    background: 'rgba(255,255,255,0.12)', color: '#e0e7ff',
    border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500,
  },
  reportCard: {
    background: C.white, borderRadius: '12px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.10)', overflow: 'hidden', marginBottom: '16px',
  },
  hospitalHeader: {
    background: C.headerBg, padding: '20px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  hospitalName: {
    color: '#ffffff', fontSize: '22px',
    fontFamily: "'Crimson Text', Georgia, serif", fontWeight: 700, letterSpacing: '0.02em',
  },
  hospitalSub: {
    color: 'rgba(255,255,255,0.65)', fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif", marginTop: '3px',
    letterSpacing: '0.06em', textTransform: 'uppercase',
  },
  reportBadge: { textAlign: 'right' },
  reportBadgeTitle: {
    color: '#90caf9', fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  reportBadgeDate: {
    color: 'rgba(255,255,255,0.5)', fontSize: '11px',
    fontFamily: "'DM Mono', monospace", marginTop: '4px',
  },
  patientTable: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    background: C.patientBg, borderBottom: `2px solid ${C.borderLight}`,
  },
  patientCell: { padding: '14px 20px', borderRight: `1px solid ${C.borderLight}` },
  patientLabel: {
    color: C.textLight, fontSize: '10px', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px',
  },
  patientValue: {
    color: C.textDark, fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
  },
  diagnosisBar: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    borderBottom: `1px solid ${C.borderLight}`, background: '#fff',
  },
  diagCell: {
    padding: '12px 20px', borderRight: `1px solid ${C.borderLight}`,
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  diagLabel: {
    color: C.textLight, fontSize: '9px', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px',
  },
  diagValue: { color: C.accentBlue, fontSize: '15px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px', background: C.sectionHead,
    borderBottom: `1px solid ${C.borderLight}`, borderTop: `1px solid ${C.borderLight}`,
    cursor: 'pointer', userSelect: 'none',
  },
  sectionHeaderLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  sectionAccentBar: (color) => ({ width: '3px', height: '16px', borderRadius: '2px', background: color || C.accentBlue, flexShrink: 0 }),
  sectionTitle: {
    color: C.textDark, fontSize: '11px', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  sectionContent: { padding: '0 20px', background: C.white },
  findingRow: (alt) => ({
    display: 'grid', gridTemplateColumns: '180px 1fr',
    borderBottom: `1px solid ${C.borderLight}`,
    background: alt ? C.rowAlt : C.white, minHeight: '40px',
  }),
  findingLabel: {
    padding: '13px 16px 12px 0', color: C.accentTeal, fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: '0.04em',
    textTransform: 'uppercase', borderRight: `1px solid ${C.borderLight}`,
    display: 'flex', alignItems: 'flex-start',
  },
  findingValue: {
    padding: '12px 0 12px 16px', color: C.textMed, fontSize: '13.5px',
    fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.55,
  },
  impressionBox: { margin: '0', padding: '16px 20px', background: C.impressionBg, borderLeft: `4px solid ${C.impressionBorder}` },
  impressionText: { color: C.textDark, fontSize: '14px', fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.7, whiteSpace: 'pre-line' },
  recoBox: { margin: '0', padding: '16px 20px', background: C.recoBg, borderLeft: `4px solid ${C.recoBorder}` },
  recoText: { color: C.textMed, fontSize: '13.5px', fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.7, whiteSpace: 'pre-line' },
  aiBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: C.aiBg, borderLeft: `4px solid ${C.aiBorder}` },
  aiLabel: { color: '#5e35b1', fontSize: '10px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  aiValue: { color: '#4527a0', fontSize: '13px', fontFamily: "'DM Mono', monospace" },
  reportFooter: {
    padding: '16px 24px', background: C.sectionHead, borderTop: `2px solid ${C.borderLight}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  footerStamp: { color: C.textLight, fontSize: '11px', fontFamily: "'DM Sans', sans-serif" },
  footerSig: { textAlign: 'right', borderTop: `1px solid ${C.borderMed}`, paddingTop: '8px', minWidth: '160px' },
  footerSigTitle: { color: C.textDark, fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
  footerSigSub: { color: C.textLight, fontSize: '10px', fontFamily: "'DM Sans', sans-serif" },
  tabBar: {
    display: 'flex', gap: '6px', padding: '5px', background: '#1a2e4a',
    borderRadius: '10px', width: 'fit-content', marginBottom: '16px',
  },
  tab: (active, color) => ({
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 18px', borderRadius: '7px',
    border: active ? `2px solid ${color}` : '2px solid transparent',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
    transition: 'all 0.2s',
    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: active ? color : 'rgba(255,255,255,0.45)',
  }),
  patientCard: (accent) => ({
    background: C.white, borderRadius: '10px',
    border: `1px solid ${C.borderLight}`, borderLeft: `4px solid ${accent}`,
    marginBottom: '10px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  }),
  patientCardHeader: {
    padding: '10px 16px', background: C.sectionHead,
    borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', gap: '8px',
  },
  patientCardTitle: {
    color: C.textDark, fontSize: '10px', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  patientCardBody: {
    padding: '14px 16px', color: C.textMed, fontSize: '15px',
    fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.7, whiteSpace: 'pre-line',
  },
  disclaimer: {
    display: 'flex', gap: '10px', padding: '12px 16px',
    background: '#fff8e1', border: `1px solid #f9a825`,
    borderRadius: '8px', marginTop: '16px',
  },
  disclaimerText: { color: '#795548', fontSize: '11.5px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 },
}

function CollapsibleSection({ title, children, defaultOpen = true, accentColor }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <>
      <div style={s.sectionHeader} onClick={() => setOpen(o => !o)}>
        <div style={s.sectionHeaderLeft}>
          <div style={s.sectionAccentBar(accentColor)} />
          <span style={s.sectionTitle}>{title}</span>
        </div>
        {open ? <ChevronUp size={14} color={C.textLight} /> : <ChevronDown size={14} color={C.textLight} />}
      </div>
      {open && children}
    </>
  )
}

function FindingRow({ label, value, index }) {
  if (!value) return null
  return (
    <div style={s.findingRow(index % 2 === 1)}>
      <div style={s.findingLabel}>{label}</div>
      <div style={s.findingValue}>{value}</div>
    </div>
  )
}

function ReportPage({ reportData, analysisData, onBack }) {
  const [activeTab, setActiveTab] = useState('doctor')
  const [patientReport, setPatientReport] = useState(null)
  const [loadingPatient, setLoadingPatient] = useState(false)

  // Language state — patient mode only
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [translatedReport, setTranslatedReport] = useState(null)
  const [loadingTranslation, setLoadingTranslation] = useState(false)
  const [translationError, setTranslationError] = useState(null)

  const languages = [
    { code: 'en', flag: '🇬🇧', name: 'English'  },
    { code: 'kn', flag: '🇮🇳', name: 'ಕನ್ನಡ'    },
    { code: 'hi', flag: '🇮🇳', name: 'हिंदी'     },
    { code: 'ta', flag: '🇮🇳', name: 'தமிழ்'    },
    { code: 'te', flag: '🇮🇳', name: 'తెలుగు'  },
    { code: 'ml', flag: '🇮🇳', name: 'മലയാളം' },
    { code: 'mr', flag: '🇮🇳', name: 'मराठी'    },
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
        file_id: reportData.file_id, filename: reportData.filename,
        prediction: reportData.prediction, confidence: reportData.confidence,
        probabilities: analysisData.probabilities, patient_info: reportData.patient_info,
        mode: 'patient', api_key: null, measurements: analysisData.measurements || {},
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
    if (langCode === 'en') { setTranslatedReport(null); return }
    if (!patientReport?.report) return
    setLoadingTranslation(true)
    try {
      const result = await translateReport(patientReport.report, langCode, 'patient')
      setTranslatedReport(result.translated_report)
    } catch (err) {
      setTranslationError('Translation unavailable. Showing English.')
      setTranslatedReport(null)
    } finally {
      setLoadingTranslation(false)
    }
  }

  const handleDownloadPDF = () => {
    import('../utils/pdfGenerator').then(({ generatePDF }) => {
      const activeReport = activeTab === 'doctor'
        ? { ...reportData, report: reportData?.report }
        : { ...patientReport, report: translatedReport || patientReport?.report }
      generatePDF(activeReport, analysisData, activeTab)
    })
  }

  const doctorReport = reportData?.report
  const patientDisplayReport = translatedReport || patientReport?.report
  const pi = reportData?.patient_info || {}
  const today = pi.scanDate || new Date().toLocaleDateString('en-IN')
  const severityColor = { Tumor: C.accentRed, Stone: C.accentAmber, Cyst: C.accentBlue, Normal: C.accentTeal }[reportData?.prediction] || C.accentBlue

  return (
    <div style={s.page}>

      {/* Action bar */}
      <div style={s.actionBar}>
        <span style={s.actionBarTitle}>NeuroScan AI — Clinical Report</span>
        <div style={s.actionBtns}>
          <button style={s.btnSecondary} onClick={() => window.print()}><Printer size={13} /> Print</button>
          <button style={s.btnPrimary} onClick={handleDownloadPDF}><Download size={13} /> Download PDF</button>
          <button style={s.btnSecondary} onClick={onBack}><ArrowLeft size={13} /> Back</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        <button style={s.tab(activeTab === 'doctor', '#90caf9')} onClick={() => { setActiveTab('doctor'); setTranslatedReport(null); setSelectedLanguage('en') }}>
          <Stethoscope size={13} /> Doctor Mode
        </button>
        <button style={s.tab(activeTab === 'patient', '#80cbc4')} onClick={handleLoadPatientReport}>
          <User size={13} />{loadingPatient ? 'Loading...' : 'Patient Mode'}
        </button>
      </div>

      {/* ══ DOCTOR MODE — English only, no language picker ══ */}
      {activeTab === 'doctor' && doctorReport && (
        <div style={s.reportCard}>
          <div style={s.hospitalHeader}>
            <div>
              <div style={s.hospitalName}>NeuroScan AI Radiology</div>
              <div style={s.hospitalSub}>AI-Assisted CT Diagnostic Centre</div>
            </div>
            <div style={s.reportBadge}>
              <div style={s.reportBadgeTitle}>Radiological Report</div>
              <div style={s.reportBadgeDate}>Date: {today}</div>
              <div style={{ ...s.reportBadgeDate, marginTop: '2px' }}>ID: {reportData?.file_id?.slice(0,8)?.toUpperCase() || 'N/A'}</div>
            </div>
          </div>

          <div style={s.patientTable}>
            {[
              ['Patient Name', pi.name],
              ['Age / Gender', `${pi.age} Yrs / ${pi.gender}`],
              ['Referring Physician', pi.referringDoctor ? `Dr. ${pi.referringDoctor}` : 'N/A'],
              ['Clinical History', pi.clinicalHistory || 'Not provided'],
            ].map(([label, value], i) => (
              <div key={label} style={{ ...s.patientCell, borderRight: i < 3 ? `1px solid ${C.borderLight}` : 'none' }}>
                <div style={s.patientLabel}>{label}</div>
                <div style={s.patientValue}>{value}</div>
              </div>
            ))}
          </div>

          <div style={s.diagnosisBar}>
            <div style={s.diagCell}>
              <div style={s.diagLabel}>AI Diagnosis</div>
              <div style={{ ...s.diagValue, color: severityColor }}>{analysisData?.label || reportData?.prediction}</div>
            </div>
            <div style={s.diagCell}>
              <div style={s.diagLabel}>Confidence Score</div>
              <div style={{ ...s.diagValue, color: C.accentTeal }}>{analysisData?.confidence}%</div>
            </div>
            <div style={{ ...s.diagCell, borderRight: 'none' }}>
              <div style={s.diagLabel}>Scan Protocol</div>
              <div style={{ color: C.textMed, fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                {doctorReport.scan_type ? doctorReport.scan_type.split('(')[0].trim() : 'CT Abdomen & Pelvis'}
              </div>
            </div>
          </div>

          {(doctorReport.technique || doctorReport.indication) && (
            <CollapsibleSection title="Scan Details" accentColor={C.accentBlue}>
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {doctorReport.technique && (
                  <div>
                    <div style={{ ...s.patientLabel, marginBottom: '5px' }}>Technique / Protocol</div>
                    <div style={{ color: C.textMed, fontSize: '13.5px', fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.6 }}>{doctorReport.technique}</div>
                  </div>
                )}
                {doctorReport.indication && (
                  <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: '12px' }}>
                    <div style={{ ...s.patientLabel, marginBottom: '5px' }}>Clinical Indication</div>
                    <div style={{ color: C.textMed, fontSize: '13.5px', fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.6 }}>{doctorReport.indication}</div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          <CollapsibleSection title="Radiological Findings" accentColor={C.accentTeal}>
            <div style={s.sectionContent}>
              {[
                ['Liver & Biliary Tract', doctorReport.findings_liver],
                ['Gall Bladder',          doctorReport.findings_gallbladder],
                ['Pancreas',              doctorReport.findings_pancreas],
                ['Spleen',                doctorReport.findings_spleen],
                ['Right Kidney',          doctorReport.findings_right_kidney],
                ['Left Kidney',           doctorReport.findings_left_kidney],
                ['Collecting System',     doctorReport.findings_collecting_system],
                ['Urinary Bladder',       doctorReport.findings_urinary_bladder],
                ['Adrenals',              doctorReport.findings_adrenals],
                ['Vessels & Lymph Nodes', doctorReport.findings_vessels],
                ['Others',                doctorReport.findings_others],
              ].map(([label, value], i) => <FindingRow key={label} label={label} value={value} index={i} />)}
            </div>
          </CollapsibleSection>

          {doctorReport.impression && (
            <CollapsibleSection title="Impression" accentColor={C.accentBlue}>
              <div style={s.impressionBox}><p style={s.impressionText}>{doctorReport.impression}</p></div>
            </CollapsibleSection>
          )}

          {doctorReport.recommendation && (
            <CollapsibleSection title="Recommendations" accentColor={C.accentTeal}>
              <div style={s.recoBox}><p style={s.recoText}>{doctorReport.recommendation}</p></div>
            </CollapsibleSection>
          )}

          {doctorReport.ai_confidence && (
            <div style={s.aiBox}>
              <span style={s.aiLabel}>AI Analysis</span>
              <span style={s.aiValue}>{doctorReport.ai_confidence}</span>
            </div>
          )}

          <div style={s.reportFooter}>
            <div>
              <div style={s.footerStamp}>Generated by NeuroScan AI — EfficientNet-B3 + Grad-CAM</div>
              <div style={{ ...s.footerStamp, marginTop: '3px', fontSize: '10px' }}>Report Date: {today}</div>
            </div>
            <div style={s.footerSig}>
              <div style={s.footerSigTitle}>AI Radiologist System</div>
              <div style={s.footerSigSub}>NeuroScan AI — Verified Report</div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PATIENT MODE — English default + language picker ══ */}
      {activeTab === 'patient' && patientReport && (
        <div>
          {/* Header card with language picker inside */}
          <div style={s.reportCard}>
            <div style={s.hospitalHeader}>
              <div>
                <div style={s.hospitalName}>Your Scan Report</div>
                <div style={s.hospitalSub}>Simple explanation — {pi.name}</div>
              </div>
              <div style={s.reportBadge}>
                <div style={s.reportBadgeTitle}>Patient Summary</div>
                <div style={s.reportBadgeDate}>{today}</div>
              </div>
            </div>

            {/* Patient info strip */}
            <div style={{ padding: '12px 24px', background: C.patientBg, borderBottom: `1px solid ${C.borderLight}` }}>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {[['Name', pi.name], ['Age', `${pi.age} Yrs`], ['Gender', pi.gender]].map(([l, v]) => (
                  <div key={l}>
                    <div style={s.patientLabel}>{l}</div>
                    <div style={s.patientValue}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language picker — only here in patient mode */}
            <div style={{
              padding: '12px 24px', background: '#f8f9fb',
              borderBottom: `1px solid ${C.borderLight}`,
              display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Globe size={13} color={C.textLight} />
                <span style={{ ...s.patientLabel, margin: 0 }}>Read in your language:</span>
              </div>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={loadingTranslation}
                  style={{
                    padding: '5px 13px', borderRadius: '20px',
                    cursor: loadingTranslation ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
                    transition: 'all 0.18s',
                    background: selectedLanguage === lang.code ? C.accentBlue : C.white,
                    color: selectedLanguage === lang.code ? '#ffffff' : C.textLight,
                    border: selectedLanguage === lang.code ? `1px solid ${C.accentBlue}` : `1px solid ${C.borderMed}`,
                    opacity: loadingTranslation ? 0.6 : 1,
                  }}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
              {loadingTranslation && (
                <span style={{ color: C.accentBlue, fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>⟳ Translating...</span>
              )}
              {translationError && (
                <span style={{ color: C.accentRed, fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>{translationError}</span>
              )}
              {translatedReport && !loadingTranslation && (
                <span style={{ color: C.accentTeal, fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                  ✓ Showing in {languages.find(l => l.code === selectedLanguage)?.name}
                </span>
              )}
            </div>
          </div>

          {/* Content cards */}
          {[
            { key: 'what_found',    label: 'What Was Found',       accent: C.accentBlue  },
            { key: 'what_it_means', label: 'What This Means',      accent: C.accentTeal  },
            { key: 'is_it_serious', label: 'How Serious Is This?', accent: C.accentAmber },
            { key: 'what_to_do',    label: 'What To Do Next',      accent: C.accentBlue  },
          ].map(({ key, label, accent }) => patientDisplayReport?.[key] && (
            <div key={key} style={s.patientCard(accent)}>
              <div style={s.patientCardHeader}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, flexShrink: 0 }} />
                <span style={s.patientCardTitle}>{label}</span>
              </div>
              <div style={s.patientCardBody}>{patientDisplayReport[key]}</div>
            </div>
          ))}

          {patientDisplayReport?.reassurance && (
            <div style={{ ...s.patientCard(C.accentTeal), background: '#e8f5e9' }}>
              <div style={{ ...s.patientCardHeader, background: '#c8e6c9' }}>
                <span style={{ fontSize: '14px' }}>✦</span>
                <span style={s.patientCardTitle}>A Note For You</span>
              </div>
              <div style={{ ...s.patientCardBody, color: '#2e7d32', fontStyle: 'italic' }}>
                {patientDisplayReport.reassurance}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div style={s.disclaimer}>
        <span style={{ color: C.accentAmber, fontSize: '14px', flexShrink: 0 }}>⚠</span>
        <p style={s.disclaimerText}>
          This report is AI-assisted and intended to support clinical decision-making only.
          Final diagnosis must be confirmed by a qualified radiologist or treating physician.
          Do not make any medical decisions based solely on this AI-generated report.
        </p>
      </div>

    </div>
  )
}

export default ReportPage