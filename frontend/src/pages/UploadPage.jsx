import { useState } from 'react'
import { Upload, User, Calendar, Stethoscope } from 'lucide-react'
import { uploadScan, predictScan } from '../utils/api'

function UploadPage({ onAnalysisDone }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      setPreview(URL.createObjectURL(dropped))
      setError(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleInputChange = (e) => {
    setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a CT scan image first')
      return
    }
    if (!patientInfo.name || !patientInfo.age || !patientInfo.gender || !patientInfo.scanDate) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Upload the image
      const uploadResult = await uploadScan(file)

      // Step 2: Run AI prediction
      const analysisResult = await predictScan(uploadResult.file_id, uploadResult.filename)

      // Step 3: Pass data to App.jsx
      onAnalysisDone(
        { ...uploadResult, patientInfo },
        analysisResult
      )

    } catch (err) {
      setError('Something went wrong. Make sure Flask backend is running on port 8000.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Upload CT Scan</h2>
        <p className="text-slate-400">Upload a kidney CT scan image and fill in patient details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left — Image Upload */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Upload size={18} className="text-green-400" />
            CT Scan Image
          </h3>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 transition-colors"
            onClick={() => document.getElementById('fileInput').click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="CT Preview"
                className="max-h-48 mx-auto object-contain rounded-lg"
              />
            ) : (
              <div>
                <Upload size={40} className="text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Drag and drop or click to upload</p>
                <p className="text-slate-500 text-xs mt-1">Supports JPG, PNG</p>
              </div>
            )}
          </div>

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {file && (
            <p className="text-green-400 text-sm mt-2 text-center">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Right — Patient Info */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User size={18} className="text-green-400" />
            Patient Information
          </h3>

          <div className="flex flex-col gap-3">

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Patient Name *</label>
              <input
                type="text"
                name="name"
                value={patientInfo.name}
                onChange={handleInputChange}
                placeholder="Enter patient name"
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={patientInfo.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Gender *</label>
                <select
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-green-500"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Scan Date *</label>
              <input
                type="date"
                name="scanDate"
                value={patientInfo.scanDate}
                onChange={handleInputChange}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Referring Doctor</label>
              <input
                type="text"
                name="referringDoctor"
                value={patientInfo.referringDoctor}
                onChange={handleInputChange}
                placeholder="Doctor name"
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Clinical History</label>
              <textarea
                name="clinicalHistory"
                value={patientInfo.clinicalHistory}
                onChange={handleInputChange}
                placeholder="Any relevant medical history..."
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-green-500 resize-none"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-900/40 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold px-10 py-3 rounded-xl transition-all text-sm"
        >
          {loading ? 'Analyzing... Please wait' : 'Analyze CT Scan'}
        </button>
      </div>

    </div>
  )
}

export default UploadPage