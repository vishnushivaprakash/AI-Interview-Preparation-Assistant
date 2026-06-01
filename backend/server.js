import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import interviewRoutes from './routes/interview.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
