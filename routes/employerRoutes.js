import express from 'express';
import {
    getDashboardOverview,
    getJobStatistics,
    getApplicantSummary,
    getJobsOpenCount,
    getAllApplicants,
    getApplicantDetails,
    updateApplicantScore,
    updateHiringStage,
    addApplicantNote,
    updateInterview,
    assignTeamMembers,
    getEmployerJobs,
    scheduleInterview,
    addInterviewFeedback
} from '../controllers/employerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and employer role
router.use(protect);

// Dashboard routes
router.get('/dashboard/overview', getDashboardOverview);
router.get('/dashboard/job-stats', getJobStatistics);
router.get('/dashboard/applicant-summary', getApplicantSummary);
router.get('/dashboard/jobs-open', getJobsOpenCount);

// Job management routes
router.get('/jobs', getEmployerJobs);

// Applicant management routes
router.get('/applicants', getAllApplicants);
router.get('/applicants/:id', getApplicantDetails);
router.put('/applicants/:id/score', updateApplicantScore);
router.put('/applicants/:id/stage', updateHiringStage);
router.post('/applicants/:id/notes', addApplicantNote);

// Interview routes (updated & new)
router.put('/applicants/:id/interview/:interviewId', updateInterview); // Update specific interview
router.post('/applicants/:id/interviews', scheduleInterview); // Schedule new interview
router.post('/applicants/:id/interviews/:interviewId/feedback', addInterviewFeedback); // Add feedback

router.put('/applicants/:id/assign', assignTeamMembers);

export default router;

