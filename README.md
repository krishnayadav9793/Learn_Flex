# 🚀 Learn Flex

**Learn Flex** is a high-performance, AI-driven learning platform designed to help students master competitive exams with precision. Combining real-time competitive features, personalized AI assistance, and comprehensive progress tracking, Learn Flex makes exam preparation interactive, engaging, and data-driven.

---

## 🌟 Key Features

### 🧠 AI-Powered Learning
- **Personalized Assistance**: Integration with Google Gemini AI to provide context-aware explanations and study tips.
- **Dynamic Question Generation**: Intelligent question sets tailored to user performance levels.

### ⚔️ Real-Time 1v1 Competition
- **Battle Mode**: Challenge peers in real-time quiz battles using Socket.io integration.
- **Instant Feedback**: See live progress and final scores as you compete.

### 📊 Comprehensive Exam Prep
- **Practice Mode**: Focused practice sessions for major exams like NEET, with detailed performance breakdowns.
- **Weekly Quizzes**: Structured weekly assessments to test retention and speed.
- **Daily Challenges**: Consistency-building daily tasks to keep learners on track.

### 📈 Progress & Analytics
- **Activity Heatmaps**: Visual representation of your daily consistency and study streaks.
- **Global Leaderboard**: Track your rank against learners worldwide in real-time.
- **Detailed Profiles**: Manage your stats, achievements, and exam history.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite (for ultra-fast development and optimized builds)
- **Styling**: Tailwind CSS 4.0 (modern, utility-first design)
- **State Management**: React Router 7 (for advanced routing)
- **Real-time**: Socket.io-client
- **Visuals**: Framer Motion (animations), Lucide React (icons), React Heatmap

### Backend
- **Core**: Node.js + Express 5
- **Databases**: 
  - **PostgreSQL**: Hosted on Neon for relational data and stability.
  - **MongoDB**: For flexible document-based data storage.
- **AI**: Google Generative AI (@google/genai)
- **Communication**: Socket.io (real-time events), Nodemailer (email services)
- **Utilities**: Node-cron (scheduled tasks), Sharp (image processing), PDF-parse

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB
- [Neon PostgreSQL](https://neon.tech/) account
- [Google AI Studio API Key](https://aistudio.google.com/) (for Gemini features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DhirGoplani/Learn_Flex.git
   cd Learn_Flex
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Backend Setup**
   ```bash
   cd ../backend
   npm install
   ```
   Create a `.env` file in `backend/`:
   ```env
   PORT=3000
   DATABASE_URL=your_neon_postgresql_url
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_google_ai_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

### Running the Project

- **Start Backend**: 
  ```bash
  cd backend
  npm run dev
  ```
- **Start Frontend**: 
  ```bash
  cd frontend
  npm run dev
  ```

---

## 📁 Project Structure

```text
Learn_Flex/
├── backend/            # Express server & API routes
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── socket/         # Real-time event handlers
│   └── util/           # Database connections & helpers
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── Pages/      # Main layout views
│   │   └── config.js   # API configurations
└── README.md           # You are here!
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

*Built with ❤️ by the Learn Flex Team.*
