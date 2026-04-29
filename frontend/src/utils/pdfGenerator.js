import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const generatePDF = async (reportData, analysisData, mode = 'doctor') => {
  const { patient_info, prediction, confidence, report } = reportData

  // Build a temporary hidden div with the full report HTML
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 900px;
    background: #ffffff;
    font-family: 'Crimson Text', Georgia, serif;
    z-index: -1;
  `

  const severityColor = {
    Tumor: '#c62828', Stone: '#f57c00', Cyst: '#1565c0', Normal: '#00796b'
  }[prediction] || '#1565c0'

  const today = patient_info?.scanDate || new Date().toLocaleDateString('en-IN')

  const buildDoctorHTML = () => `
    <div style="background:#1a2e4a; padding:20px 32px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="color:#fff; font-size:22px; font-weight:700;">NeuroScan AI Radiology</div>
        <div style="color:rgba(255,255,255,0.6); font-size:11px; margin-top:3px; text-transform:uppercase; letter-spacing:0.06em;">AI-Assisted CT Diagnostic Centre</div>
      </div>
      <div style="text-align:right;">
        <div style="color:#90caf9; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Radiological Report</div>
        <div style="color:rgba(255,255,255,0.5); font-size:11px; margin-top:4px;">Date: ${today}</div>
        <div style="color:rgba(255,255,255,0.5); font-size:11px; margin-top:2px;">ID: ${reportData?.file_id?.slice(0,8)?.toUpperCase() || 'N/A'}</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(4,1fr); background:#f5f8ff; border-bottom:2px solid #d6dce4;">
      ${[
        ['Patient Name', patient_info?.name],
        ['Age / Gender', `${patient_info?.age} Yrs / ${patient_info?.gender}`],
        ['Referring Physician', patient_info?.referringDoctor ? `Dr. ${patient_info.referringDoctor}` : 'N/A'],
        ['Clinical History', patient_info?.clinicalHistory || 'Not provided'],
      ].map(([l,v], i) => `
        <div style="padding:14px 20px; ${i<3?'border-right:1px solid #d6dce4;':''}">
          <div style="color:#607d8b; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:4px;">${l}</div>
          <div style="color:#1a2332; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif;">${v}</div>
        </div>
      `).join('')}
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; border-bottom:1px solid #d6dce4;">
      <div style="padding:12px 20px; border-right:1px solid #d6dce4;">
        <div style="color:#607d8b; font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px;">AI Diagnosis</div>
        <div style="color:${severityColor}; font-size:15px; font-weight:700; font-family:'DM Sans',sans-serif;">${prediction}</div>
      </div>
      <div style="padding:12px 20px; border-right:1px solid #d6dce4;">
        <div style="color:#607d8b; font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px;">Confidence Score</div>
        <div style="color:#00796b; font-size:15px; font-weight:700; font-family:'DM Sans',sans-serif;">${confidence}%</div>
      </div>
      <div style="padding:12px 20px;">
        <div style="color:#607d8b; font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px;">Scan Protocol</div>
        <div style="color:#37474f; font-size:12px; font-weight:500; font-family:'DM Sans',sans-serif;">${report?.scan_type?.split('(')[0]?.trim() || 'CT Abdomen & Pelvis'}</div>
      </div>
    </div>

    ${report?.technique || report?.indication ? `
    <div style="background:#e8edf3; padding:10px 20px; border-top:1px solid #d6dce4; border-bottom:1px solid #d6dce4; display:flex; align-items:center; gap:10px;">
      <div style="width:3px; height:16px; border-radius:2px; background:#1565c0;"></div>
      <span style="color:#1a2332; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-family:'DM Sans',sans-serif;">Scan Details</span>
    </div>
    <div style="padding:14px 20px; background:#fff;">
      ${report?.technique ? `
        <div style="color:#607d8b; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:5px; font-family:'DM Sans',sans-serif;">Technique / Protocol</div>
        <div style="color:#37474f; font-size:13px; line-height:1.6;">${report.technique}</div>
      ` : ''}
      ${report?.indication ? `
        <div style="border-top:1px solid #d6dce4; margin-top:12px; padding-top:12px;">
          <div style="color:#607d8b; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:5px; font-family:'DM Sans',sans-serif;">Clinical Indication</div>
          <div style="color:#37474f; font-size:13px; line-height:1.6;">${report.indication}</div>
        </div>
      ` : ''}
    </div>
    ` : ''}

    <div style="background:#e8edf3; padding:10px 20px; border-top:1px solid #d6dce4; border-bottom:1px solid #d6dce4; display:flex; align-items:center; gap:10px;">
      <div style="width:3px; height:16px; border-radius:2px; background:#00796b;"></div>
      <span style="color:#1a2332; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-family:'DM Sans',sans-serif;">Radiological Findings</span>
    </div>
    <div style="background:#fff;">
      ${[
        ['Liver & Biliary Tract', report?.findings_liver],
        ['Gall Bladder', report?.findings_gallbladder],
        ['Pancreas', report?.findings_pancreas],
        ['Spleen', report?.findings_spleen],
        ['Right Kidney', report?.findings_right_kidney],
        ['Left Kidney', report?.findings_left_kidney],
        ['Collecting System', report?.findings_collecting_system],
        ['Urinary Bladder', report?.findings_urinary_bladder],
        ['Adrenals', report?.findings_adrenals],
        ['Vessels & Lymph Nodes', report?.findings_vessels],
        ['Others', report?.findings_others],
      ].filter(([,v]) => v).map(([l,v], i) => `
        <div style="display:grid; grid-template-columns:180px 1fr; border-bottom:1px solid #d6dce4; background:${i%2===1?'#f7f9fb':'#fff'};">
          <div style="padding:12px 16px 12px 20px; color:#00796b; font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; border-right:1px solid #d6dce4; font-family:'DM Sans',sans-serif;">${l}</div>
          <div style="padding:12px 20px 12px 16px; color:#37474f; font-size:13px; line-height:1.55;">${v}</div>
        </div>
      `).join('')}
    </div>

    ${report?.impression ? `
    <div style="background:#e8edf3; padding:10px 20px; border-top:1px solid #d6dce4; border-bottom:1px solid #d6dce4; display:flex; align-items:center; gap:10px;">
      <div style="width:3px; height:16px; border-radius:2px; background:#1565c0;"></div>
      <span style="color:#1a2332; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-family:'DM Sans',sans-serif;">Impression</span>
    </div>
    <div style="padding:16px 20px; background:#e3f2fd; border-left:4px solid #1565c0;">
      <div style="color:#1a2332; font-size:14px; line-height:1.7; white-space:pre-line;">${report.impression}</div>
    </div>
    ` : ''}

    ${report?.recommendation ? `
    <div style="background:#e8edf3; padding:10px 20px; border-top:1px solid #d6dce4; border-bottom:1px solid #d6dce4; display:flex; align-items:center; gap:10px;">
      <div style="width:3px; height:16px; border-radius:2px; background:#00796b;"></div>
      <span style="color:#1a2332; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-family:'DM Sans',sans-serif;">Recommendations</span>
    </div>
    <div style="padding:16px 20px; background:#e8f5e9; border-left:4px solid #2e7d32;">
      <div style="color:#37474f; font-size:13px; line-height:1.7; white-space:pre-line;">${report.recommendation}</div>
    </div>
    ` : ''}

    ${report?.ai_confidence ? `
    <div style="padding:12px 20px; background:#ede7f6; border-left:4px solid #5e35b1; display:flex; align-items:center; gap:12px;">
      <span style="color:#5e35b1; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-family:'DM Sans',sans-serif;">AI Analysis</span>
      <span style="color:#4527a0; font-size:13px; font-family:'DM Mono',monospace;">${report.ai_confidence}</span>
    </div>
    ` : ''}

    <div style="padding:16px 24px; background:#e8edf3; border-top:2px solid #d6dce4; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="color:#607d8b; font-size:11px; font-family:'DM Sans',sans-serif;">Generated by NeuroScan AI — EfficientNet-B3 + Grad-CAM</div>
        <div style="color:#607d8b; font-size:10px; font-family:'DM Sans',sans-serif; margin-top:3px;">Report Date: ${today}</div>
      </div>
      <div style="text-align:right; border-top:1px solid #b0bec5; padding-top:8px; min-width:160px;">
        <div style="color:#1a2332; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif;">AI Radiologist System</div>
        <div style="color:#607d8b; font-size:10px; font-family:'DM Sans',sans-serif;">NeuroScan AI — Verified Report</div>
      </div>
    </div>
  `

  const buildPatientHTML = () => `
    <div style="background:#1a2e4a; padding:20px 32px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="color:#fff; font-size:22px; font-weight:700;">Your Scan Report</div>
        <div style="color:rgba(255,255,255,0.6); font-size:11px; margin-top:3px; text-transform:uppercase; letter-spacing:0.06em;">Simple explanation — ${patient_info?.name}</div>
      </div>
      <div style="text-align:right;">
        <div style="color:#90caf9; font-size:12px; font-weight:700; text-transform:uppercase;">Patient Summary</div>
        <div style="color:rgba(255,255,255,0.5); font-size:11px; margin-top:4px;">${today}</div>
      </div>
    </div>

    <div style="padding:12px 24px; background:#f5f8ff; border-bottom:1px solid #d6dce4; display:flex; gap:32px;">
      ${[['Name', patient_info?.name], ['Age', `${patient_info?.age} Yrs`], ['Gender', patient_info?.gender]].map(([l,v]) => `
        <div>
          <div style="color:#607d8b; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:4px; font-family:'DM Sans',sans-serif;">${l}</div>
          <div style="color:#1a2332; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif;">${v}</div>
        </div>
      `).join('')}
    </div>

    ${[
      ['What Was Found', report?.what_found, '#1565c0'],
      ['What This Means', report?.what_it_means, '#00796b'],
      ['How Serious Is This?', report?.is_it_serious, '#f57c00'],
      ['What To Do Next', report?.what_to_do, '#1565c0'],
    ].filter(([,v]) => v).map(([l,v,accent]) => `
      <div style="border-left:4px solid ${accent}; margin:10px 0 0; background:#fff; border:1px solid #d6dce4; border-left:4px solid ${accent};">
        <div style="padding:10px 16px; background:#e8edf3; border-bottom:1px solid #d6dce4; display:flex; align-items:center; gap:8px;">
          <div style="width:8px; height:8px; border-radius:50%; background:${accent};"></div>
          <span style="color:#1a2332; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-family:'DM Sans',sans-serif;">${l}</span>
        </div>
        <div style="padding:14px 16px; color:#37474f; font-size:15px; line-height:1.7; white-space:pre-line;">${v}</div>
      </div>
    `).join('')}

    ${report?.reassurance ? `
      <div style="border-left:4px solid #00796b; margin-top:10px; background:#e8f5e9; border:1px solid #d6dce4;">
        <div style="padding:10px 16px; background:#c8e6c9; border-bottom:1px solid #d6dce4; display:flex; align-items:center; gap:8px;">
          <span style="font-size:14px;">✦</span>
          <span style="color:#1a2332; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-family:'DM Sans',sans-serif;">A Note For You</span>
        </div>
        <div style="padding:14px 16px; color:#2e7d32; font-size:15px; line-height:1.7; font-style:italic;">${report.reassurance}</div>
      </div>
    ` : ''}

    <div style="margin-top:16px; padding:12px 16px; background:#fff8e1; border:1px solid #f9a825; display:flex; gap:10px; align-items:flex-start;">
      <span style="color:#f57c00; font-size:14px;">⚠</span>
      <p style="color:#795548; font-size:11px; line-height:1.5; font-family:'DM Sans',sans-serif; margin:0;">
        This report is AI-assisted and intended to support clinical decision-making only.
        Final diagnosis must be confirmed by a qualified radiologist or treating physician.
      </p>
    </div>
  `

  container.innerHTML = mode === 'doctor' ? buildDoctorHTML() : buildPatientHTML()
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 900,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = 210
    const pageH = 297
    const imgW = pageW
    const imgH = (canvas.height * pageW) / canvas.width

    let heightLeft = imgH
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
    heightLeft -= pageH

    while (heightLeft > 0) {
      position -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
      heightLeft -= pageH
    }

    const filename = `Report_${patient_info?.name?.replace(/ /g, '_') || 'Patient'}_${mode}.pdf`
    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}