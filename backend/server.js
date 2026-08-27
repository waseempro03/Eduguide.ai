import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, isMongoActive } from './config/db.js';
import { isOpenAIConfigured } from './config/openai.js';
import { isGeminiConfigured } from './config/gemini.js';

import chatRoutes from './routes/chatRoutes.js';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import universityRoutes from './routes/universityRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import examRoutes from './routes/examRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import unansweredRoutes from './routes/unansweredRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import toolsRoutes from './routes/toolsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EduGuide AI — Global Education & Career Engine',
    timestamp: new Date().toISOString(),
    openaiConfigured: isOpenAIConfigured(),
    mongoActive: isMongoActive(),
    mode: isOpenAIConfigured() ? 'OpenAI Live Assistant' : 'EduGuide AI Local Engine'
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/unanswered', unansweredRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolsRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint '${req.method} ${req.originalUrl}' not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GlobalErrorHandler]', err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🌍 EduGuide AI Backend Server running!`);
      console.log(`📍 Local Server: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      const aiStatus = isGeminiConfigured() ? 'Google Gemini AI Active' : isOpenAIConfigured() ? 'OpenAI GPT Active' : 'Local EduGuide Synthesizer Active';
      console.log(`🤖 AI Engine: ${aiStatus}`);
      console.log(`💾 Storage: ${isMongoActive() ? 'MongoDB Connected' : 'Local In-Memory/JSON Storage Active'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
