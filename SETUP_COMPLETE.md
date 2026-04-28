# 🚀 AI Threat Detection SOC - Setup Complete!

## ✅ All Components Installed

### Backend
- ✓ Python virtual environment configured
- ✓ All dependencies installed (Flask, scikit-learn, shap, google-generativeai, etc.)
- ✓ NSL-KDD dataset downloaded (19 MB)
- ✓ ML models trained and saved (.pkl files)
- ✓ `.env` file embedded with API keys

### Frontend
- ✓ Node modules installed (334 packages)
- ✓ React/Vite development environment ready
- ✓ Tailwind CSS & UI components configured

---

## ▶️ Quick Start

### Option 1: Using Batch Scripts (Easiest)
Double-click these files from Windows Explorer:

**Terminal 1:**
```
start_backend.bat
```

**Terminal 2 (new window):**
```
start_frontend.bat
```

Then open: `http://localhost:5173`

---

### Option 2: Manual PowerShell Commands

**Backend (Terminal 1):**
```powershell
cd "c:\Users\gunda\OneDrive\Desktop\ai-threat-detection-soc-master\ai-threat-detection-soc-master"
.\.venv\Scripts\Activate.ps1
python backend_final.py
```

**Frontend (Terminal 2):**
```powershell
cd "c:\Users\gunda\OneDrive\Desktop\ai-threat-detection-soc-master\ai-threat-detection-soc-master\frontend"
npm run dev
```

---

## 📊 What's Running

### Backend Server (http://localhost:5000)
- Flask API with CORS enabled
- 5 trained ML models:
  - Random Forest threat classifier (99.85% accuracy)
  - Logistic Regression threat classifier (96.01% accuracy)
  - 5-class attack category classifier (DoS, Probe, R2L, U2R, Normal)
  - Isolation Forest anomaly detector (Zero-day detection)
  - SHAP explainer (interpretability)

### Frontend Dashboard (http://localhost:5173)
- Real-time threat detection interface
- Live heatmaps and attack analysis
- Geographic threat mapping (IPStack API)
- AI-generated incident reports (Gemini API)
- Model comparison visualization

---

## ⚠️ Important Notes

1. **First time**: Backend will train all models on startup (~2-3 minutes). Models are cached as `.pkl` files.
2. **API Keys**: Your `.env` file contains:
   - `GEMINI_API_KEY` - for AI report generation
   - `IPSTACK_API_KEY` - for geolocation
3. **Dataset**: KDDTrain+ (NSL-KDD) is already downloaded
4. **npm warnings**: 2 vulnerabilities reported but non-blocking. Can run `npm audit fix` if needed.

---

## 🔧 Helper Scripts

- `download_dataset.py` - Download NSL-KDD if needed
- `test_backend.py` - Verify backend loads correctly
- `qr.py` - Generate QR code to view on mobile

---

## 📁 Project Structure
```
.
├── backend_final.py          # Flask API server
├── train_model.py            # Model training script
├── download_dataset.py       # Dataset downloader
├── KDDTrain+.txt            # Training data
├── *.pkl                     # Trained models (threat_model, scaler, label_encoder)
├── frontend/                 # React/Vite app
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── .env                      # API keys
└── README.md
```

---

All set! Run the batch scripts or manual commands above to start the SOC dashboard. 🎉
