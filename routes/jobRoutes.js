import express from 'express';
import { getAllJobs, createJob, getJobById, getJobStats } from '../controllers/jobController.js';

const router = express.Router();

router.route('/')
    .get(getAllJobs)
    .post(createJob);

router.get('/stats', getJobStats);

router.route('/:id')
    .get(getJobById);

export default router;
