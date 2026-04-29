import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export const uploadScan = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const predictScan = async (fileId, filename) => {
  const response = await api.post('/predict', {
    file_id: fileId,
    filename: filename
  })
  return response.data
}

export const generateReport = async (payload) => {
  const response = await api.post('/generate-report', payload)
  return response.data
}

// NEW
export const translateReport = async (report, targetLanguage, mode) => {
  const response = await api.post('/translate-report', {
    report: report,
    target_language: targetLanguage,
    mode: mode,
  })
  return response.data
}