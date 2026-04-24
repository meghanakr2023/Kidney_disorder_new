import jsPDF from 'jspdf'

export const generatePDF = (reportData, analysisData, mode = 'doctor') => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const { patient_info, prediction, confidence, report } = reportData

  const white = [255, 255, 255]
  const dark = [15, 23, 42]
  const green = [34, 197, 94]
  const gray = [100, 116, 139]
  const lightGray = [241, 245, 249]
  const yellow = [234, 179, 8]
  const pageW = 210

  let y = 0

  const checkNewPage = (needed = 20) => {
    if (y + needed > 270) {
      doc.addPage()
      y = 15
    }
  }

  const addSectionHeader = (title) => {
    checkNewPage(12)
    doc.setFillColor(...dark)
    doc.roundedRect(12, y, 186, 7, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...green)
    doc.text(title.toUpperCase(), 16, y + 5)
    y += 10
  }

  const addText = (text, indent = 16, fontSize = 8.5, color = dark) => {
    if (!text) return
    checkNewPage(10)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, 178 - (indent - 16))
    lines.forEach(line => {
      checkNewPage(6)
      doc.text(line, indent, y)
      y += 5
    })
    y += 2
  }

  const addSubSection = (label, text) => {
    if (!text) return
    checkNewPage(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(20, 180, 127)
    doc.text(label + ':', 16, y)
    y += 5
    addText(text, 18)
  }

  // ── Header ──
  doc.setFillColor(...dark)
  doc.rect(0, 0, pageW, 30, 'F')
  doc.setFillColor(...green)
  doc.rect(0, 28, pageW, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...green)
  doc.text('AI Radiology Assistant', 15, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...white)
  doc.text('CT Scan Analysis Report', 15, 20)
  doc.text('CONFIDENTIAL MEDICAL DOCUMENT', 15, 26)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...white)
  doc.text(`${prediction.toUpperCase()}`, pageW - 15, 13, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...green)
  doc.text(`Confidence: ${confidence}%`, pageW - 15, 20, { align: 'right' })
  doc.setTextColor(180, 190, 210)
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 15, 26, { align: 'right' })

  y = 38

  // ── Patient Info ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...gray)
  doc.text('PATIENT INFORMATION', 15, y)
  y += 4

  doc.setFillColor(...lightGray)
  doc.roundedRect(12, y, 186, 22, 2, 2, 'F')

  const fields = [
    ['Name', patient_info?.name],
    ['Age / Gender', `${patient_info?.age} / ${patient_info?.gender}`],
    ['Scan Date', patient_info?.scanDate],
    ['Referring Doctor', patient_info?.referringDoctor || 'N/A']
  ]

  fields.forEach((field, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const fx = 16 + col * 93
    const fy = y + 5 + row * 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...gray)
    doc.text(field[0].toUpperCase(), fx, fy)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...dark)
    doc.text(field[1] || 'N/A', fx, fy + 4)
  })

  y += 28

  if (mode === 'doctor') {

    // Scan Type
    if (report?.scan_type) {
      addSectionHeader('Scan Type')
      addText(report.scan_type)
    }

    // Technique
    if (report?.technique) {
      addSectionHeader('Technique / Protocol')
      addText(report.technique)
    }

    // Indication
    if (report?.indication) {
      addSectionHeader('Clinical Indication')
      addText(report.indication)
    }

    // Findings
    addSectionHeader('Findings')

    const findingsSections = [
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
    ]

    findingsSections.forEach(([label, text]) => {
      if (text) addSubSection(label, text)
    })

    // Impression
    if (report?.impression) {
      addSectionHeader('Impression')
      addText(report.impression)
    }

    // Recommendations
    if (report?.recommendation) {
      addSectionHeader('Recommendations')
      addText(report.recommendation)
    }

    // AI Confidence
    if (report?.ai_confidence) {
      checkNewPage(14)
      doc.setFillColor(20, 30, 60)
      doc.roundedRect(12, y, 186, 10, 1, 1, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...green)
      doc.text('AI ANALYSIS:', 16, y + 7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 200, 255)
      doc.text(report.ai_confidence, 50, y + 7)
      y += 14
    }

  } else {

    // Patient mode
    const patientSections = [
      ['What Was Found', report?.what_found],
      ['What This Means', report?.what_it_means],
      ['Is It Serious?', report?.is_it_serious],
      ['What To Do Next', report?.what_to_do],
    ]

    patientSections.forEach(([label, text]) => {
      if (text) {
        addSectionHeader(label)
        addText(text)
      }
    })

    if (report?.reassurance) {
      checkNewPage(14)
      doc.setFillColor(10, 50, 30)
      doc.roundedRect(12, y, 186, 8, 1, 1, 'F')
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(100, 220, 150)
      const rLines = doc.splitTextToSize(report.reassurance, 178)
      doc.text(rLines[0], 16, y + 5)
      y += 12
    }
  }

  // ── Confidence Bars ──
  checkNewPage(20)
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.text('AI CONFIDENCE SCORES', 15, y)
  y += 6

  if (analysisData?.probabilities) {
    Object.entries(analysisData.probabilities).forEach(([cls, prob]) => {
      checkNewPage(10)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...dark)
      doc.text(cls, 16, y + 3)
      doc.setFillColor(226, 232, 240)
      doc.roundedRect(50, y, 100, 5, 1, 1, 'F')
      const barWidth = (prob / 100) * 100
      if (barWidth > 0) {
        doc.setFillColor(...(cls === prediction ? green : gray))
        doc.roundedRect(50, y, Math.max(barWidth, 0.5), 5, 1, 1, 'F')
      }
      doc.setTextColor(...gray)
      doc.text(`${prob}%`, 155, y + 4)
      y += 9
    })
  }

  // ── Disclaimer ──
  checkNewPage(22)
  y += 5
  doc.setFillColor(254, 252, 232)
  doc.roundedRect(12, y, 186, 16, 2, 2, 'F')
  doc.setDrawColor(...yellow)
  doc.setLineWidth(0.3)
  doc.roundedRect(12, y, 186, 16, 2, 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(133, 77, 14)
  doc.text('AI DISCLAIMER', 16, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(120, 80, 20)
  const disclaimer =
    'This report is AI-assisted and intended to support clinical decision-making only. ' +
    'Final diagnosis must be confirmed by a qualified radiologist or treating physician. ' +
    'Do not make any medical decisions based solely on this AI-generated report.'
  const dLines = doc.splitTextToSize(disclaimer, 178)
  doc.text(dLines, 16, y + 10)
  y += 20

  // ── Footer on every page ──
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const pageH = doc.internal.pageSize.height
    doc.setFillColor(...dark)
    doc.rect(0, pageH - 10, pageW, 10, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...gray)
    doc.text(
      `AI Radiology Assistant · For Clinical Support Only · Page ${i} of ${totalPages}`,
      105, pageH - 4, { align: 'center' }
    )
  }

  const filename = `Report_${patient_info?.name?.replace(/ /g, '_') || 'Patient'}_${mode}.pdf`
  doc.save(filename)
}