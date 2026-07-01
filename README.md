# 🔬 KidneyScan AI

## AI-Powered Kidney CT Scan Analysis and Clinical Report Generation

KidneyScan AI is an end-to-end AI-assisted diagnostic platform designed to automate the analysis of kidney CT scans. The system performs multiclass kidney disorder classification, generates explainable visualizations, measures lesions quantitatively, produces multilingual clinical reports, and provides an AI-powered conversational assistant.

> **Disclaimer:** This project is a research prototype developed for academic purposes and is not intended for direct clinical use without radiologist validation.

## 🚀 Features

- Multiclass kidney disorder classification (Cyst, Normal, Stone, Tumor)
- DICOM-native CT scan processing
- Grad-CAM explainability heatmaps
- Automated lesion measurement (mm, cm², HU statistics)
- AI-generated doctor and patient reports
- Multilingual translation support (6 Indian languages)
- Context-aware AI chat assistant
- MongoDB Atlas-based history management
- Multi-provider LLM fallback architecture

## 🏗️ System Architecture

```text
Patient Upload
      ↓
DICOM Loading
      ↓
HU Conversion + Windowing
      ↓
EfficientNet-B3 Classification
      ↓
Grad-CAM Heatmap Generation
      ↓
Lesion Measurement
      ↓
LLM Report Generation
      ↓
Translation + AI Chat
      ↓
MongoDB Atlas Storage
```

## 🤖 Model Details

| Parameter | Value |
|-----------|-------|
| Model | EfficientNet-B3 |
| Optimizer | AdamW |
| Learning Rate | 1e-4 |
| Loss Function | CrossEntropyLoss |
| Scheduler | CosineAnnealingLR |
| Batch Size | 32 |
| Epochs | 20 |
| Dropout | 0.3 |

## 📊 Model Performance

| Metric | Value |
|---------|-------|
| Train Accuracy | 100.00% |
| Validation Accuracy | 97.25% |
| Precision | 0.97 |
| Recall | 0.97 |
| F1-Score | 0.97 |
| ROC-AUC | 1.00 |
| Average Inference Time | 79.92 ms |
| Model Size | 41.35 MB |

## 🛠️ Tech Stack

- Flask
- PyTorch
- MongoDB Atlas
- HTML/CSS/JavaScript
- Google Gemini
- OpenAI GPT-4o
- OpenRouter
- Groq LLaMA

## 📁 Project Structure

```text
KidneyScanAI/
├── train.py
├── dicom_dataset.py
├── convert_jpg_to_dicom.py
├── app.py
├── report_generator.py
├── models/
├── backend/
├── static/
├── templates/
├── requirements.txt
└── README.md
```

## ⚙️ Installation

```bash
git clone <repository-url>
cd KidneyScanAI
pip install -r requirements.txt
python app.py
```

## 🔑 Environment Variables

```env
GEMINI_API_KEY=
OPENAI_API_KEY=
OPENROUTER_API_KEY=
GROQ_API_KEY=
MONGODB_URI=
```

## ⚠️ Limitations

- Supports only four kidney conditions
- Uses single 2D CT slices
- No authentication system
- Validation set is used as test set

## 🔮 Future Enhancements

- 3D volumetric CT analysis
- PACS/HL7-FHIR integration
- Federated learning
- Multi-organ support
- Role-based access control

## 👩‍💻 Author

**Meghana K R**