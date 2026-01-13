import express from 'express';
import { applyForJob, getMyApplications, getJobApplications } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/')
    .post(authorize('jobseeker'), applyForJob);

router.get('/me', authorize('jobseeker'), getMyApplications);

router.get('/job/:jobId', authorize('employer', 'admin'), getJobApplications);

export default router;
