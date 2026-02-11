import Application from '../models/Application.js';
import Job from '../models/Job.js';
import logger from '../utils/logger.js';

// @desc    Apply for a job
// @route   POST /api/v1/applications
// @access  Private (Candidate)
// @desc    Apply for a job
// @route   POST /api/v1/applications
// @access  Private (Candidate)
export const applyForJob = async (req, res) => {
    try {
        const { jobId, coverLetter, fullName, email, phone, linkedin, portfolio, jobTitle } = req.body;

        // Validate basic fields
        if (!jobId) {
            return res.status(400).json({ success: false, message: 'Job ID is required' });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if already applied
        const alreadyApplied = await Application.findOne({
            job: jobId,
            applicant: req.user.id
        });

        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }

        // Handle Resume File
        let resumeData = null;
        if (req.file) {
            const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            resumeData = {
                url: resumeUrl,
                filename: req.file.originalname
            };
        } else if (req.body.resume) {
            // Fallback if resume is sent as a URL string (not file)
            resumeData = {
                url: req.body.resume,
                filename: 'External Resume'
            };
        }

        // Create Application
        const application = await Application.create({
            job: jobId,
            applicant: req.user.id,
            resume: resumeData,
            coverLetter,
            applicantInfo: {
                name: fullName || req.user.name,
                email: email || req.user.email,
                phone: phone,
                linkedIn: linkedin,
                portfolio: portfolio,
                currentTitle: jobTitle
            }
        });

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        logger.error(`Apply Error: ${error.message}`, { stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get my applications
// @route   GET /api/v1/applications/me
// @access  Private (Candidate)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate('job', 'title company location type roleCategory');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get applications for a job (Employer/Admin)
// @route   GET /api/v1/applications/job/:jobId
// @access  Private (Employer/Admin)
export const getJobApplications = async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.jobId })
            .populate('applicant', 'name email profile');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update application status
// @route   PUT /api/v1/applications/:id
// @access  Private (Employer)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, hiringStage } = req.body;

        let application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Verify employer owns the job
        if (application.job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        if (status) application.status = status;
        if (hiringStage) application.hiringStage = hiringStage;

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Add a note to application
// @route   POST /api/v1/applications/:id/notes
// @access  Private (Employer)
export const addApplicationNote = async (req, res) => {
    try {
        const { text, replyToNoteId } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const userSnapshot = {
            addedBy: req.user.id,
            authorName: req.user.name,
            authorAvatar: req.user.profile?.avatar || null,
            addedAt: Date.now()
        };

        if (replyToNoteId) {
            // Add reply to existing note
            const note = application.notes.id(replyToNoteId);
            if (!note) {
                return res.status(404).json({ success: false, message: 'Parent note not found' });
            }
            note.replies.push({
                text,
                ...userSnapshot
            });
        } else {
            // Add new top-level note
            application.notes.push({
                text,
                ...userSnapshot,
                replies: []
            });
        }

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error("Add Note Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Schedule an interview
// @route   POST /api/v1/applications/:id/interviews
// @access  Private (Employer)
export const scheduleInterview = async (req, res) => {
    try {
        const { scheduledAt, duration, type, location, notes, interviewers } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        application.interviews.push({
            scheduledAt,
            duration,
            type,
            location,
            notes,
            interviewers: interviewers || [req.user.id],
            status: 'Scheduled'
        });

        // Optionally update status to 'Interview' if not already
        if (application.hiringStage !== 'Interview') {
            application.hiringStage = 'Interview';
            application.status = 'Interview';
        }

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error("Schedule Interview Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Add feedback to an interview
// @route   POST /api/v1/applications/:id/interviews/:interviewId/feedback
// @access  Private (Employer)
export const addInterviewFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { id, interviewId } = req.params;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const interview = application.interviews.id(interviewId);
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        interview.feedback.push({
            rating,
            comment,
            submittedBy: req.user.id,
            submittedAt: Date.now()
        });

        // Optionally mark interview as completed if feedback is added
        if (interview.status !== 'Completed') {
            interview.status = 'Completed';
        }

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error("Add Feedback Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
