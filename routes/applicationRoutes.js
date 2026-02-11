import express from 'express';
import { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus, addApplicationNote, scheduleInterview, addInterviewFeedback } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes are protected

// Re-organize imports if needed, but keeping it simple for now
import upload from '../middleware/uploadMiddleware.js';

router.route('/')
    .post(authorize('jobseeker'), upload.single('resume'), applyForJob);

router.get('/me', authorize('jobseeker'), getMyApplications);

router.get('/job/:jobId', authorize('employer', 'admin'), getJobApplications);

router.route('/:id')
    .put(authorize('employer', 'admin'), updateApplicationStatus);

router.route('/:id/notes')
    .post(authorize('employer', 'admin'), addApplicationNote);

router.route('/:id/interviews')
    .post(authorize('employer', 'admin'), scheduleInterview);

router.route('/:id/interviews/:interviewId/feedback')
    .post(authorize('employer', 'admin'), addInterviewFeedback);

export default router;
