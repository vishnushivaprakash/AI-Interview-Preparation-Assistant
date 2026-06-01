import express from 'express';
import { generateQuestions, evaluateAnswer, getAnalytics } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateQuestions);
router.post('/evaluate', protect, evaluateAnswer);
router.get('/analytics', protect, getAnalytics);

export default router;
