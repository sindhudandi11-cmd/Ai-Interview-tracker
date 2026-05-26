# PrepMate AI

> A full-stack job application tracker and AI-powered interview prep tool — built with React, Node.js, Express, SQLite, and OpenRouter API.

📦 **[GitHub](https://github.com/sindhudandi11-cmd/Ai-Interview-tracker)**

---

## What is PrepMate AI?

PrepMate AI is a personal job search command centre. It lets you track every application, save interview questions by company, take prep notes, and generate tailored interview questions from any job description using AI — all in one place.

Built as a solo end-to-end project to practice full-stack development with real AI integration. The tracker was actively used during a personal job search managing 200+ applications.

> **Why not just use ChatGPT?**  
> You can — but PrepMate keeps everything in one place. Your applications, your saved questions per company, your notes, and your AI-generated prep are all linked and searchable. ChatGPT has no memory of what you applied to last week.

---

## Features

**Job Applications Tracker**
- Add, update, and delete applications
- Track status: Applied / Interview / Rejected / Accepted
- Filter and search across all applications

**Interview Questions Manager**
- Save questions per company with personal notes and solutions
- Categorise by difficulty level
- View all saved questions in one place

**Notes System**
- Timestamped prep notes organised by topic or company

**AI Interview Question Generator**
- Paste any job description and receive 5 tailored questions
- AI analyses tech stack, experience level, and responsibilities
- Powered by OpenRouter (supports multiple LLM models)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Axios, CSS |
| Backend | Node.js, Express.js |
| Database | SQLite (local), PostgreSQL-ready for production |
| AI | OpenRouter API (LLM integration) |
| Deployment | Docker (frontend + backend Dockerfiles included) |

---

## Getting Started

### Prerequisites
- Node.js v14 or higher
- npm or yarn
- OpenRouter API key — [get one free here](https://openrouter.ai)

### 1. Clone the repository

```bash
git clone https://github.com/sindhudandi11-cmd/Ai-Interview-tracker.git
cd Ai-Interview-tracker
```

### 2. Backend setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Add your OpenRouter API key to .env

npm start
# Backend runs at http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000" > .env

npm start
# Frontend runs at http://localhost:3000
```

---

## Environment Variables

**Backend** (`backend/.env`)
```
PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key
DATABASE_PATH=./database/db.sqlite
NODE_ENV=development
```

**Frontend** (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:5000
```

---

## Project Structure

```
Ai-Interview-tracker/
├── backend/
│   ├── routes/
│   │   ├── applications.js
│   │   ├── questions.js
│   │   ├── notes.js
│   │   └── ai.js
│   ├── database/
│   │   └── db.sqlite
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## API Reference

### Applications
```
GET    /api/applications        Get all applications
GET    /api/applications/:id    Get one application
POST   /api/applications        Create application
PUT    /api/applications/:id    Update application
DELETE /api/applications/:id    Delete application
```

### Interview Questions
```
GET    /api/questions           Get all questions
GET    /api/questions/:id       Get one question
POST   /api/questions           Save question
PUT    /api/questions/:id       Update question
DELETE /api/questions/:id       Delete question
```

### Notes
```
GET    /api/notes               Get all notes
GET    /api/notes/:id           Get one note
POST   /api/notes               Create note
PUT    /api/notes/:id           Update note
DELETE /api/notes/:id           Delete note
```

### AI
```
POST   /api/ai/generate-questions    Generate questions from job description
POST   /api/ai/analyze-role          Analyse role from job description
```

### Example — generate interview questions

```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Senior React Developer at a fintech startup. 5+ years React, Node.js, PostgreSQL required..."
  }'
```

Response:
```json
{
  "roleAnalysis": {
    "techStack": ["React", "Node.js", "PostgreSQL"],
    "experienceLevel": "Senior",
    "responsibilities": ["Lead development", "Code reviews", "Architecture design"]
  },
  "questions": [
    "Describe your experience building scalable React applications...",
    "How do you approach performance optimisation in a React app?",
    "Walk us through a technically challenging project you led.",
    "How do you handle state management at scale?",
    "Describe your experience with CI/CD pipelines."
  ]
}
```

---

## Docker Deployment

```bash
# Build and run both services
docker build -t prepmate-backend ./backend
docker build -t prepmate-frontend ./frontend

docker run -p 5000:5000 prepmate-backend
docker run -p 80:80 prepmate-frontend
```

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Frontend Dockerfile**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Known Limitations

- **No authentication in v1.0** — all data is stored locally per instance. Each user running the app has their own isolated database. JWT-based authentication is planned for v2.0.
- **SQLite for local development** — the data layer is designed to swap to PostgreSQL for production deployment with minimal changes to the service layer.

---

## Troubleshooting

**CORS errors** — ensure `REACT_APP_API_URL` in `frontend/.env` matches the backend port exactly.

**Database errors** — delete `backend/database/db.sqlite` and restart the backend to reinitialise the schema.

**OpenRouter API errors** — verify your API key has credits and is correctly set in `backend/.env`.

**Port conflict** — change `PORT` in `backend/.env` to any available port and update `REACT_APP_API_URL` to match.

---

## Roadmap

See [open issues](https://github.com/sindhudandi11-cmd/Ai-Interview-tracker/issues) for the full list. Planned for v2.0:

- [ ] JWT authentication and user profiles
- [ ] Interview performance analytics (question patterns by role/company)
- [ ] Integration with job listing APIs (LinkedIn, Indeed)
- [ ] Interview practice with session recording
- [ ] Mobile app (React Native)

---

## Author

**Sindhu Dandibhatla** — [github.com/sindhudandi11-cmd](https://github.com/sindhudandi11-cmd) · [LinkedIn](https://www.linkedin.com/in/sindhudandi2/)

For bugs or feature requests, [open an issue](https://github.com/sindhudandi11-cmd/Ai-Interview-tracker/issues).

---

*Licensed under the MIT License.*
