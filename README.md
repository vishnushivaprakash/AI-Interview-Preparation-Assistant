# AI Interview Preparation Assistant

A full-stack AI-powered Interview Preparation Platform built with React, Node.js, Express, MongoDB, and LangChain.

## Features

- 🔐 **JWT Authentication** — Register & Login securely
- 🤖 **AI Question Generator** — Generates questions dynamically from your resume skills and projects
- 🎤 **Voice Input** — Answer questions using your microphone (Web Speech API)
- 📄 **Resume Upload** — Upload PDF/DOCX and get tailored questions
- 📊 **Performance Analytics** — Track scores over time with charts
- 🧠 **AI Answer Evaluation** — Get scored on your answers with strengths and weaknesses

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, Framer Motion, Chart.js |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI | LangChain, OpenAI GPT-3.5 |
| Speech | Web Speech API (browser-native) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Parsing | pdf-parse, mammoth |

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB running locally or Atlas URI

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY and MONGO_URI
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

Create `backend/.env` with:

```
MONGO_URI=mongodb://localhost:27017/interview_prep
PORT=5000
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

> **Note:** The app works without an OpenAI API key using a smart local evaluator and question generator.

## Project Structure

```
interview/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Auth, Interview, Resume logic
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # User, Interview schemas
│   ├── routes/         # API routes
│   └── server.js       # Express entry point
└── frontend/
    └── src/
        └── pages/      # Home, Login, Register, Dashboard, Interview, Analytics
```
