import express from 'express';
import { parseResume, checkQualification } from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // All AI routes require auth

// Parse a resume PDF → returns structured extracted data
router.post('/parse-resume', authorize('jobseeker'), upload.single('resume'), parseResume);

// Check candidate qualification against a job → returns score, skills match, cover letter
router.post('/check-qualification', authorize('jobseeker'), checkQualification);

export default router;
