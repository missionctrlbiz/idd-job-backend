import express from 'express';
import { getAllJobs, createJob, getJobById, getJobStats, getMyJobs } from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getAllJobs)
    .post(protect, authorize('employer'), createJob);

router.get('/my-jobs', protect, authorize('employer'), getMyJobs);
router.get('/stats', getJobStats);

router.route('/:id')
    .get(getJobById);

export default router;
