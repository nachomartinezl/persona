# Persona – AI Avatar Generator

**Persona** is a minimal, production-ready web app for generating ultra-realistic AI avatars from user photos and custom style prompts. Built with React (Next.js), FastAPI, Redis queue, Baseten ML API, and Firebase for seamless, modern full-stack experience.

---

## 🚀 Features

- **Instant AI Avatars:** Upload your photo, select a style or enter a custom prompt, and generate unique avatars.
- **Modern UX:** Clean interface, responsive, mobile-friendly, light/dark mode, email capture popup, and progress feedback.
- **History:** View and manage previous generations for your session.
- **Regenerate & Download:** Tweak prompts, rerun generations, and download results in one click.
- **Email Collection:** Secure, one-time email prompt per session (stored in Firebase).
- **Backend Queue:** FastAPI with Redis for async job processing and ML service integration.
- **ML-Powered:** Uses state-of-the-art image generation models (via Baseten).
- **Extensible:** Modular codebase ready for premium tiers, feedback, localization, and more.

---

## 🛠️ Tech Stack

- **Frontend:** React (Next.js), CSS Modules
- **Backend:** FastAPI, Redis, Firebase Firestore
- **Worker:** Python job processor, Baseten ML API
- **Hosting:** Vercel (frontend), Railway (backend/worker)
- **Other:** Environment-based config, Docker-ready, modular endpoints

---

## 🧑‍💻 Local Development

1. **Clone the repo**
2. **Setup Environment Variables**
   - `cp .env.example .env.local` and fill in your API keys, CORS, and config.
3. **Install dependencies**
   ```bash
   npm install           # For frontend
   pip install -r requirements.txt   # For backend/worker
   ```
4. **Run backend**
   ```bash
   uvicorn main:app --reload
   python worker.py      # Or worker_local.py for testing
   ```
5. **Run frontend**
   ```bash
   npm run dev
   ```
6. **Open [http://localhost:3000](http://localhost:3000)**

---

## 📝 Environment Setup

- All config (CORS, API URLs, Firebase, etc.) auto-switches via `ENV` vars for local, test, and prod.
- See `.env.example` for all required keys and secrets.

---

## 🏗️ Project Structure

```
/app           # Frontend (React/Next.js)
/middleware    # Backend (FastAPI, Redis, Firebase)
/worker.py     # ML job processor
/utils.py      # Helper functions (image resize, etc.)
```

---

## 🧠 TODO & Roadmap

- [ ] User authentication and persistent generation history
- [ ] In-app feedback and RLHF
- [ ] Multi-language support (EN/ES toggle)
- [ ] Premium credits/tiers and welcome emails
- [ ] Usage analytics, more controls

---

## 💡 License

MIT (see LICENSE file)

---

## 👤 Author

- [Nacho Martinez](https://github.com/nachomartinezls)  
- Open to contributions, feedback, and ideas! DM or open an issue.
