# 🛡️ AI Threat Detection SOC Dashboard

A complete, full-stack Security Operations Center (SOC) dashboard powered by Machine Learning and AI. This system analyzes network traffic in real-time to detect, classify, and explain cyber threats using advanced data science.

![SOC Dashboard Preview](https://via.placeholder.com/1000x500.png?text=AI+Threat+Detection+SOC+Dashboard)

## ✨ Core Features
*   **Real-Time Threat Detection**: Uses a Random Forest classifier trained on the NSL-KDD dataset to detect attacks (DoS, Probe, R2L, U2R).
*   **Zero-Day Anomaly Engine**: Employs an Isolation Forest to flag "Zero-Day" novel attacks that don't match known signatures.
*   **Explainable AI (SHAP)**: Instantly breaks down exactly *why* an attack was flagged (e.g., showing high source bytes or strange flags).
*   **Global Geolocation Map**: Real-time pulsing world map showing the geographical origin of attacks using the IPStack API.
*   **Automated AI Reporting**: Uses Gemini 1.5 Flash to generate professional executive summaries and incident response actions for detected threats.
*   **Simulation Runner**: Test the dashboard using real historical network data.

---

## 🚀 How to Install and Run on a New Laptop

Since this project contains sensitive API keys and massive trained models, those files are not on GitHub. Follow these steps to deploy it on a new machine.

### Step 1: Clone the Repository
```bash
git clone https://github.com/Adarsh-09/ai-threat-detection-soc.git
cd ai-threat-detection-soc
```

### Step 2: Set up the Backend (Python)
1. Ensure Python 3.10+ is installed.
2. Install the required libraries:
   ```bash
   pip install flask flask-cors pandas numpy scikit-learn joblib shap google-generativeai python-dotenv requests qrcode pillow
   ```
3. **IMPORTANT**: Copy your `.env` file from your old laptop and paste it directly into this folder (`ai-threat-detection-soc/.env`). It should contain:
   ```env
   GEMINI_API_KEY=your_key
   IPSTACK_API_KEY=your_key
   ```
4. Start the backend:
   ```bash
   python backend_final.py
   ```
   *(Note: The first time you run this, it will automatically download the dataset, train the AI models, and save the `.pkl` files locally. This may take 2-3 minutes).*

### Step 3: Set up the Frontend (React)
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the dashboard:
   ```bash
   npm run dev
   ```

### Step 4: Access the Dashboard
*   Open your browser to: `http://localhost:5173` (or the port Vite provides).
*   Alternatively, run `python qr.py` in the root folder to generate a QR code so you can view the dashboard on your mobile phone!

---

## 🧠 Technology Stack
*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Recharts, Framer Motion
*   **Backend**: Python, Flask, Scikit-Learn (Random Forest, Isolation Forest)
*   **APIs**: Google Gemini (NLP Reports), IPStack (Geolocation)
