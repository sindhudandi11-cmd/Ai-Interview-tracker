const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Database error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize Database Tables
function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Applied',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        question TEXT NOT NULL,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized');
  });
}

// ==================== APPLICATIONS ENDPOINTS ====================

app.post('/applications', (req, res) => {
  const { company, role, status } = req.body;
  const id = uuidv4();

  if (!company || !role) {
    return res.status(400).json({ error: 'Company and role are required' });
  }

  db.run(
    'INSERT INTO applications (id, company, role, status) VALUES (?, ?, ?, ?)',
    [id, company, role, status || 'Applied'],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, company, role, status: status || 'Applied' });
    }
  );
});

app.get('/applications', (req, res) => {
  db.all('SELECT * FROM applications ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

app.put('/applications/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  db.run(
    'UPDATE applications SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
      res.json({ id, status });
    }
  );
});

app.delete('/applications/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM applications WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted', id });
  });
});

// ==================== QUESTIONS ENDPOINTS ====================

app.post('/questions', (req, res) => {
  const { company, question, notes } = req.body;
  const id = uuidv4();

  if (!company || !question) {
    return res.status(400).json({ error: 'Company and question are required' });
  }

  db.run(
    'INSERT INTO questions (id, company, question, notes) VALUES (?, ?, ?, ?)',
    [id, company, question, notes || ''],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, company, question, notes: notes || '' });
    }
  );
});

app.get('/questions', (req, res) => {
  db.all('SELECT * FROM questions ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// ==================== NOTES ENDPOINTS ====================

app.post('/notes', (req, res) => {
  const { content } = req.body;
  const id = uuidv4();

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  db.run(
    'INSERT INTO notes (id, content) VALUES (?, ?)',
    [id, content],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, content });
    }
  );
});

app.get('/notes', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// ==================== SIMPLE AI ENDPOINT ====================
app.post('/askAI', async (req, res) => {
  const { role, company } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env' 
    });
  }

  try {
    const prompt = `Generate a tough but fair technical interview question for someone interviewing for a ${role} position${
      company ? ` at ${company}` : ''
    }. Just give the question, nothing else. Keep it to 2-3 sentences max.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/auto',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Interview Prep Tracker',
        },
      }
    );

    const question = response.data.choices[0].message.content;
    res.json({ question });
  } catch (error) {
    console.error('OpenRouter Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate question',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// ==================== JD ANALYZER - EXTRACTS CONTENT INTELLIGENTLY ====================

app.post('/generateFromJD', async (req, res) => {
  const { jobDescription } = req.body;

  console.log('🔵 POST /generateFromJD called');
  console.log('📄 JD length:', jobDescription ? jobDescription.length : 0);

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.log('❌ API key not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // STEP 1: Get analysis from API (don't worry if it's not JSON)
    console.log('📊 Step 1: Asking AI to analyze JD...');
    
    const extractPrompt = `Read this job description and provide analysis in JSON format.

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY this JSON structure (no markdown, no code blocks):
{"roleTitle":"job title","companyName":"company or null","yearsOfExperience":3,"experienceLevel":"Junior|Mid|Senior|Very Senior","techStack":["tech1","tech2"],"keyResponsibilities":["resp1","resp2","resp3"],"focus_areas":["area1","area2"]}`;

    const extractResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: extractPrompt }],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Interview Prep Tracker',
        },
      }
    );

    console.log('✅ Analysis response received');
    let extractText = extractResponse.data.choices[0].message.content.trim();
    console.log('📝 Raw response:', extractText.substring(0, 300));
    
    // Clean up the response - remove markdown and extra text
    extractText = extractText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, '$1') // Extract JSON from anywhere
      .trim();
    
    console.log('🧹 Cleaned response:', extractText.substring(0, 300));
    
    let analysis;
    try {
      analysis = JSON.parse(extractText);
      console.log('✅ Analysis parsed successfully');
    } catch (e) {
      console.log('❌ Could not parse:', e.message);
      // Use defaults if parsing fails
      analysis = {
        roleTitle: 'Software Engineer',
        companyName: 'Unknown',
        yearsOfExperience: 3,
        experienceLevel: 'Mid-level (2-5 yrs)',
        techStack: ['Technology'],
        keyResponsibilities: ['Build software'],
        focus_areas: ['Development']
      };
    }

    // STEP 2: Generate questions
    console.log('🎯 Step 2: Generating interview questions...');
    
    const questionsPrompt = `Create 5 interview questions for this job:
Role: ${analysis.roleTitle}
Level: ${analysis.experienceLevel}
Tech: ${(analysis.techStack || []).join(', ')}
Responsibilities: ${(analysis.keyResponsibilities || []).join('; ')}

Respond with ONLY a JSON array (no markdown, no code blocks):
[{"question":"q1","level":"${analysis.experienceLevel}","topic":"topic","expectedAnswer":"answer","followUpQuestions":["f1","f2"],"whyAsked":"why","difficulty":"Medium"},{"question":"q2","level":"${analysis.experienceLevel}","topic":"topic","expectedAnswer":"answer","followUpQuestions":["f1"],"whyAsked":"why","difficulty":"Medium"},{"question":"q3","level":"${analysis.experienceLevel}","topic":"topic","expectedAnswer":"answer","followUpQuestions":["f1"],"whyAsked":"why","difficulty":"Medium"},{"question":"q4","level":"${analysis.experienceLevel}","topic":"topic","expectedAnswer":"answer","followUpQuestions":["f1"],"whyAsked":"why","difficulty":"Medium"},{"question":"q5","level":"${analysis.experienceLevel}","topic":"topic","expectedAnswer":"answer","followUpQuestions":["f1"],"whyAsked":"why","difficulty":"Medium"}]`;

    const questionsResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: questionsPrompt }],
        max_tokens: 2500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Interview Prep Tracker',
        },
      }
    );

    console.log('✅ Questions response received');
    let questionsText = questionsResponse.data.choices[0].message.content.trim();
    console.log('📝 Questions response:', questionsText.substring(0, 300));
    
    // Clean up questions response
    questionsText = questionsText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[\s\S]*?(\[[\s\S]*\])[\s\S]*$/, '$1') // Extract JSON array
      .trim();
    
    console.log('🧹 Cleaned questions:', questionsText.substring(0, 300));
    
    let questions;
    try {
      questions = JSON.parse(questionsText);
      console.log('✅ Questions parsed successfully');
    } catch (e) {
      console.log('❌ Could not parse questions:', e.message);
      // Create default questions
      questions = [
        { question: 'Tell me about your experience', level: analysis.experienceLevel, topic: 'Experience', expectedAnswer: 'Share relevant background', followUpQuestions: ['More details?'], whyAsked: 'Understand background', difficulty: 'Easy' },
        { question: 'What technologies have you used', level: analysis.experienceLevel, topic: 'Tech', expectedAnswer: 'Mention relevant tech', followUpQuestions: ['Deep dive?'], whyAsked: 'Test tech knowledge', difficulty: 'Medium' },
        { question: 'Describe a challenging project', level: analysis.experienceLevel, topic: 'Problem Solving', expectedAnswer: 'Share specific example', followUpQuestions: ['What was hard?'], whyAsked: 'Test problem solving', difficulty: 'Medium' },
        { question: 'How do you approach learning', level: analysis.experienceLevel, topic: 'Learning', expectedAnswer: 'Explain learning style', followUpQuestions: ['Recent example?'], whyAsked: 'Assess growth mindset', difficulty: 'Easy' },
        { question: 'Why are you interested in this role', level: analysis.experienceLevel, topic: 'Motivation', expectedAnswer: 'Show genuine interest', followUpQuestions: ['What attracts you?'], whyAsked: 'Test fit and motivation', difficulty: 'Easy' }
      ];
    }

    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    // Ensure 5 questions
    while (questions.length < 5) {
      questions.push({
        question: `Question ${questions.length + 1}: Tell me about your experience with the technologies mentioned in this role`,
        level: analysis.experienceLevel,
        topic: 'Technical',
        expectedAnswer: 'Share relevant project experience',
        followUpQuestions: ['What challenges?', 'Results?'],
        whyAsked: 'Testing technical proficiency',
        difficulty: 'Medium'
      });
    }

    console.log(`✅ SUCCESS: Generated ${questions.length} questions`);
    
    res.json({
      analysis: {
        roleTitle: analysis.roleTitle || 'Role',
        companyName: analysis.companyName || 'Company',
        yearsOfExperience: analysis.yearsOfExperience || 0,
        experienceLevel: analysis.experienceLevel || 'Mid-level',
        techStack: analysis.techStack || [],
        keyResponsibilities: analysis.keyResponsibilities || [],
        focus_areas: analysis.focus_areas || []
      },
      questions: questions.slice(0, 5)
    });

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response?.data) {
      console.error('API Error:', error.response.data);
    }

    res.status(500).json({
      error: error.message,
      details: error.response?.data?.error?.message || 'Unknown error'
    });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ status: '✅ Server is running' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 Make sure OPENROUTER_API_KEY is in your .env file`);
});