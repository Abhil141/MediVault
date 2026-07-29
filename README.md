# MediVault

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg?logo=tailwind-css)

**MediVault** is an intelligent, secure, and comprehensive personal health record system powered by React, FastAPI, and Google's Gemini AI. It bridges the gap between complex medical systems and patient accessibility, giving you the power to own, understand, and easily manage your health data.

---

## 🌟 Features

- 🔒 **Secure Authentication**: Robust user registration and login system with JWT token-based security.
- 📁 **Intelligent Document Vault**: Drag and drop your medical records (PDFs, JPGs, PNGs).
- 🧠 **AI Insight Extraction**: Automatically processes uploaded documents using Google's Gemini AI to extract key clinical insights, medications, and important medical terms.
- 💬 **MediHelp AI Chatbot**: An intelligent, RAG-powered clinical assistant. Ask complex medical questions about your personal records or general health, referenced securely against public health data.
- ⚖️ **Clinical Comparison**: Select any two medical records and generate a side-by-side AI clinical comparison to track health progress over time.
- 📱 **Fully Responsive UI**: A beautifully crafted, modern glassmorphism interface that works seamlessly on desktop and mobile devices.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS (with glassmorphism and modern UI paradigms)
- **Icons**: Lucide React
- **State Management**: React Query & React Context

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **AI Integration**: LangChain & Google Gemini API
- **Authentication**: JWT (JSON Web Tokens) & Passlib (bcrypt)
- **File Handling**: Multipart form data with local secure storage

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.10 or higher)
- A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/Abhil141/MediVault.git
cd MediVault
```

### 2. Backend Setup
Navigate to the backend directory and set up your Python environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory and add your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secure_jwt_secret_key
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*The API will run at http://localhost:8000*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The app will run at http://localhost:5173*

---

## 📸 Usage

1. **Sign Up**: Create an account to securely access your vault.
2. **Upload Records**: Go to the **Vault** and drag-and-drop your medical reports.
3. **Compare**: Click "Compare Reports", select two documents, and get an instant AI analysis of changes.
4. **Chat**: Navigate to the **MediHelp AI** tab to ask detailed questions about your health records.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
