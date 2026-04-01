# 🎯 AI Interview Tracker

An AI-powered full-stack web application that helps users track job applications, save interview questions, take notes, and generate personalized interview questions from job descriptions using advanced AI models.

## ✨ Features

### 📋 Job Applications Tracker
- Add, update, and delete job applications
- Track application status: Applied / Interview / Rejected / Accepted
- Organized application dashboard with filtering
- Real-time status updates

### ❓ Interview Questions Manager
- Save interview questions by company
- Add personal notes and solutions
- View all saved questions in one place
- Categorize questions by difficulty level

### 📝 Notes System
- Save personal interview prep notes
- Timestamped entries for easy revision
- Organize notes by topic or company

### 🤖 AI Interview Question Generator
- Paste a job description and generate tailored questions
- AI analyzes job descriptions to provide:
  - Role analysis (tech stack, experience level, responsibilities)
  - 5 tailored interview questions specific to the role
- Generate questions using role name + company
- Powered by OpenRouter AI models

## 🏗️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Axios** - HTTP client for API requests
- **CSS** - Custom styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Lightweight, file-based database
- **UUID** - Unique ID generation

### AI Integration
- **OpenRouter** - LLM API provider for AI-powered question generation

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouter API key (for AI features)
- Git

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/sindhudandi11-cmd/Ai-Interview-tracker.git
cd Ai-Interview-tracker
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file and add your OpenRouter API key
echo "OPENROUTER_API_KEY=your_api_key_here" > .env
echo "PORT=5000" >> .env

# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with backend URL
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start the React development server
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
Ai-Interview-tracker/
├── backend/
│   ├���─ routes/
│   │   ├── applications.js
│   │   ├── questions.js
│   │   ├── notes.js
│   │   └── ai.js
│   ├── database/
│   │   └── db.sqlite
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── .env
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Job Applications
```
GET    /api/applications          - Get all applications
GET    /api/applications/:id      - Get application by ID
POST   /api/applications          - Create new application
PUT    /api/applications/:id      - Update application
DELETE /api/applications/:id      - Delete application
```

### Interview Questions
```
GET    /api/questions             - Get all questions
GET    /api/questions/:id         - Get question by ID
POST   /api/questions             - Save new question
PUT    /api/questions/:id         - Update question
DELETE /api/questions/:id         - Delete question
```

### Notes
```
GET    /api/notes                 - Get all notes
GET    /api/notes/:id             - Get note by ID
POST   /api/notes                 - Create new note
PUT    /api/notes/:id             - Update note
DELETE /api/notes/:id             - Delete note
```

### AI Features
```
POST   /api/ai/generate-questions - Generate questions from job description
POST   /api/ai/analyze-role       - Analyze job description for role details
```

## 💡 Usage Examples

### Generate Interview Questions from Job Description

```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Senior React Developer needed for fintech startup. Must have 5+ years experience with React, Node.js, and PostgreSQL..."
  }'
```

**Response:**
```json
{
  "roleAnalysis": {
    "techStack": ["React", "Node.js", "PostgreSQL"],
    "experienceLevel": "Senior",
    "responsibilities": ["Lead development", "Code reviews", "Architecture design"]
  },
  "questions": [
    "Describe your experience building scalable React applications...",
    "How do you approach performance optimization...",
    "Tell us about a challenging project...",
    "How do you stay updated with new technologies...",
    "Describe your experience with CI/CD pipelines..."
  ]
}
```

### Track a Job Application

```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "company": "TechCorp",
    "position": "Senior React Developer",
    "appliedDate": "2026-04-01",
    "status": "Applied",
    "jobDescription": "..."
  }'
```

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key
DATABASE_PATH=./database/db.sqlite
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## 🐳 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

- Use ES6+ JavaScript
- Follow ESLint configuration
- Format code with Prettier
- Add meaningful comments for complex logic

## 🐛 Troubleshooting

### CORS Issues
Ensure backend URL in frontend `.env` matches your backend server:
```
REACT_APP_API_URL=http://localhost:5000
```

### Database Errors
Delete `backend/database/db.sqlite` and restart backend to reinitialize:
```bash
rm backend/database/db.sqlite
npm start
```

### OpenRouter API Issues
- Verify API key is valid and has credits
- Check rate limits and quotas
- Ensure API key is in `.env` file

### Port Already in Use
Change port in backend `.env`:
```
PORT=5001
```

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [OpenRouter API Docs](https://openrouter.ai/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Sindhu Dandi** - [sindhudandi11-cmd](https://github.com/sindhudandi11-cmd)

## 💬 Support & Feedback

For issues, bug reports, or feature requests, please open an issue on the [GitHub repository](https://github.com/sindhudandi11-cmd/Ai-Interview-tracker/issues).

## 🚦 Roadmap

- [ ] User authentication and profiles
- [ ] Interview practice with recorded sessions
- [ ] Integration with job listing APIs
- [ ] Interview performance analytics
- [ ] Community question sharing
- [ ] Mobile app (React Native)
- [ ] Multiple language support

---

**Last Updated**: April 1, 2026  
**Version**: 1.0.0
