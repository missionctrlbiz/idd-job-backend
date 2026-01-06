import express from 'express';
import { getAllJobs, createJob, getJobById } from '../controllers/jobController.js';

const router = express.Router();

router.route('/')
    .get(getAllJobs)
    .post(createJob);

router.route('/:id')
    .get(getJobById);

export default router;
