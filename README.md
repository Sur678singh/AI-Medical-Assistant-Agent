# 🏥 MediAssist AI — Intelligent Medical Assistant using LangGraph

MediAssist AI is an advanced AI-powered Medical Assistant built using **LangGraph, FastAPI, OCR, and LLMs**.  
The system can analyze symptoms, understand prescriptions, extract text from medical documents using OCR, and explain medical reports in simple language.

---

# 🚀 Features

## ✅ AI Symptom Checker
- Analyze user symptoms
- Suggest possible conditions
- Provide precautions and basic advice

## ✅ Prescription OCR Analyzer
- Upload prescription images
- Extract medicine text using OCR
- Explain medicine uses and precautions

## ✅ Medical Report Analyzer
- Upload medical reports
- Detect abnormal findings
- Explain reports in simple language

## ✅ Intelligent Routing using LangGraph
- Dynamic workflow routing
- State-based AI execution
- Modular agent architecture

## ✅ OCR Text Extraction
- Uses EasyOCR
- Extracts text from medical images

## ✅ FastAPI Backend
- REST API integration
- File upload support
- Frontend-ready architecture

---

# 🧠 Tech Stack

## AI / LLM
- LangGraph
- LangChain
- Groq LLM (Llama 3.3 70B)

## Backend
- FastAPI
- Python

## OCR
- Cloud SpaceAPI

## Frontend
- HTML
- CSS
- JavaScript

---

# 📂 Project Structure

```bash
MediAssist-AI/
│
├── uploads/
├── AIMedicalAgent.py
├── .env
├── requirements.txt
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/MediAssist-AI.git
cd MediAssist-AI
```

---

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / Mac

```bash
source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🔑 Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

---

# ▶️ Run Backend

```bash
uvicorn app:app --reload
```

Backend runs on:

```bash
http://127.0.0.1:8000
```

---

# 🌐 Run Frontend

Simply open:

```bash
index.html
```

or use Live Server in VS Code.

---

# 📡 API Endpoint

## POST `/MedicalChat`

### Form Data

| Key | Type |
|---|---|
| query | string |
| file | image file |

---

# 🖼️ Supported Uploads

- PNG
- JPG
- JPEG

---

# 🧠 LangGraph Workflow

```text
START
   ↓
Router Agent
   ↓
 ┌───────────────┬───────────────┬───────────────┐
 ↓               ↓               ↓
Symptoms      Prescription      General Chat
 ↓               ↓
AI Advice      OCR Extraction
                 ↓
          Report / Prescription Analysis
                 ↓
                END
```

---

# 💡 Example Queries

## Symptom Query

```text
I have fever and headache since yesterday
```

## Prescription Query

```text
Analyze this prescription
```

## Report Query

```text
Explain this medical report
```

# 🔮 Future Improvements

- PDF OCR Support
- RAG-based Medical Knowledge
- Voice Assistant
- Chat History
- Authentication System
- Streaming Responses
- Multi-language Support

---

# ⚠️ Disclaimer

This project is for **educational and research purposes only**.  
It does not replace professional medical advice, diagnosis, or treatment.

---

# 👨‍💻 Author

**Suryansh Singh**

AI & Data Science Enthusiast  
Passionate about building intelligent AI systems using LLMs, LangGraph, and Deep Learning.

---

# ⭐ If you like this project

Give this repository a ⭐ on GitHub!