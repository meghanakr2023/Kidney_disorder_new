import jsPDF from 'jspdf'

export const generatePDF = (reportData, analysisData, mode = 'doctor') => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const { patient_info, prediction, confidence, report } = reportData

  // ── Colors ──
  const white = [255, 255, 255]
  const dark = [15, 23, 42]
  const green = [34, 197, 94]
  const gray = [100, 116, 139]
  const lightGray = [241, 245, 249]
  const yellow = [234, 179, 8]

  // ── Header ──
  doc.setFillColor(...dark)
  doc.rect(0, 0, 210, 30, 'F')

  doc.setFillColor(...green)
  doc.rect(0, 28, 210, 2, 'F')

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
  doc.text(`${prediction.toUpperCase()}`, 210 - 15, 13, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...green)
  doc.text(`Confidence: ${confidence}%`, 210 - 15, 20, { align: 'right' })

  doc.setTextColor(180, 190, 210)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 210 - 15, 26, { align: 'right' })

  // ── Patient Info ──
  let y = 38

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

  // ── Report Sections ──
  const addSection = (title, content) => {
    if (!content) return

    doc.setFillColor(...dark)
    doc.roundedRect(12, y, 186, 7, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...green)
    doc.text(title.toUpperCase(), 16, y + 5)
    y += 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...dark)
    const lines = doc.splitTextToSize(content, 178)
    doc.text(lines, 16, y)
    y += lines.length * 4.5 + 5
  }

  if (mode === 'doctor') {
    if (report?.scan_type) addSection('Scan Type', report.scan_type)
    addSection('Findings', report?.findings)
    addSection('Impression', report?.impression)
    addSection('Recommendations', report?.recommendation)
  } else {
    addSection('What Was Found', report?.what_found)
    addSection('What This Means', report?.what_it_means)
    addSection('Is It Serious?', report?.is_it_serious)
    addSection('What To Do Next', report?.what_to_do)
    if (report?.reassurance) addSection('Note', report?.reassurance)
  }

  // ── Confidence Scores ──
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.text('AI CONFIDENCE SCORES', 15, y)
  y += 5

  if (analysisData?.probabilities) {
    Object.entries(analysisData.probabilities).forEach(([cls, prob]) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...dark)
      doc.text(cls, 16, y + 3)

      doc.setFillColor(226, 232, 240)
      doc.roundedRect(50, y, 100, 5, 1, 1, 'F')

      const barWidth = (prob / 100) * 100
      if (barWidth > 0) {
        const isMax = cls === prediction
        doc.setFillColor(...(isMax ? green : gray))
        doc.roundedRect(50, y, Math.max(barWidth, 0.5), 5, 1, 1, 'F')
      }

      doc.setTextColor(...gray)
      doc.text(`${prob}%`, 155, y + 4)
      y += 9
    })
  }

  // ── Disclaimer ──
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
    'Final diagnosis must be confirmed by a qualified radiologist or treating physician.'
  const dLines = doc.splitTextToSize(disclaimer, 178)
  doc.text(dLines, 16, y + 10)

  // ── Footer ──
  const pageH = doc.internal.pageSize.height
  doc.setFillColor(...dark)
  doc.rect(0, pageH - 10, 210, 10, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...gray)
  doc.text('AI Radiology Assistant · For Clinical Support Only · Not a substitute for professional diagnosis', 105, pageH - 4, { align: 'center' })

  // ── Save ──
  const filename = `Report_${patient_info?.name?.replace(/ /g, '_') || 'Patient'}_${mode}.pdf`
  doc.save(filename)
}