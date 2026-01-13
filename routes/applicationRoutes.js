import express from 'express';
import { applyForJob, getMyApplications, getJobApplications } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/')
    .post(authorize('candidate'), applyForJob);

router.get('/me', authorize('candidate'), getMyApplications);

router.get('/job/:jobId', authorize('employer', 'admin'), getJobApplications);

export default router;
