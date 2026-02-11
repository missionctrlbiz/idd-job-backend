import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get employer dashboard overview statistics
// @route   GET /api/v1/employer/dashboard/overview
// @access  Private (Employer)
export const getDashboardOverview = async (req, res) => {
    try {
        const employerId = req.user.id;

        // Get all jobs posted by this employer
        const jobs = await Job.find({ employerId });
        const jobIds = jobs.map(job => job._id);

        // Get all applications for employer's jobs
        const applications = await Application.find({ job: { $in: jobIds } });

        // Calculate statistics
        const stats = {
            jobPostCount: jobs.length,
            totalApplications: applications.length,
            pendingReviews: applications.filter(app => app.hiringStage === 'In-Review').length,
            shortlisted: applications.filter(app => app.hiringStage === 'Shortlisted').length
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get job statistics with date range (for charts)
// @route   GET /api/v1/employer/dashboard/job-stats
// @access  Private (Employer)
export const getJobStatistics = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { period = 'week' } = req.query; // week, month, year

        // Calculate date range
        const now = new Date();
        const startDate = new Date();

        if (period === 'week') {
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
            startDate.setDate(now.getDate() - 30);
        } else if (period === 'year') {
            startDate.setDate(now.getDate() - 365);
        }

        // Get jobs for this employer
        const jobs = await Job.find({ employerId });
        const jobIds = jobs.map(job => job._id);

        // Get applications within date range
        const applications = await Application.find({
            job: { $in: jobIds },
            createdAt: { $gte: startDate }
        });

        // Group by day
        const statsByDay = {};
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;

        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            statsByDay[dateKey] = { jobViews: 0, jobsApplied: 0 };
        }

        // Count applications per day
        applications.forEach(app => {
            const dateKey = app.createdAt.toISOString().split('T')[0];
            if (statsByDay[dateKey]) {
                statsByDay[dateKey].jobsApplied++;
            }
        });

        // Aggregate views from jobs (if viewsByDay exists)
        jobs.forEach(job => {
            if (job.viewsByDay && Array.isArray(job.viewsByDay)) {
                job.viewsByDay.forEach(view => {
                    const dateKey = new Date(view.date).toISOString().split('T')[0];
                    if (statsByDay[dateKey]) {
                        statsByDay[dateKey].jobViews += view.count || 0;
                    }
                });
            }
        });

        // Calculate totals and trends
        const totalViews = Object.values(statsByDay).reduce((sum, day) => sum + day.jobViews, 0);
        const totalApplications = applications.length;

        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate: now,
                statsByDay,
                totals: {
                    views: totalViews,
                    applications: totalApplications
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get applicant summary breakdown
// @route   GET /api/v1/employer/dashboard/applicant-summary
// @access  Private (Employer)
export const getApplicantSummary = async (req, res) => {
    try {
        const employerId = req.user.id;

        // Get all jobs for this employer
        const jobs = await Job.find({ employerId });
        const jobIds = jobs.map(job => job._id);

        // Get all applications and populate job details
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('job', 'type');

        // Count by job type
        const summary = {
            'Full-Time': 0,
            'Part-Time': 0,
            'Contract': 0,
            'PRN': 0,
            'Remote': 0, // This would need workMode check
            'Internship': 0
        };

        applications.forEach(app => {
            if (app.job && app.job.type) {
                summary[app.job.type] = (summary[app.job.type] || 0) + 1;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                total: applications.length,
                breakdown: summary
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get jobs open count
// @route   GET /api/v1/employer/dashboard/jobs-open
// @access  Private (Employer)
export const getJobsOpenCount = async (req, res) => {
    try {
        const employerId = req.user.id;
        const count = await Job.countDocuments({ employerId });

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all applicants with pagination, search, filter
// @route   GET /api/v1/employer/applicants
// @access  Private (Employer)
export const getAllApplicants = async (req, res) => {
    try {
        const employerId = req.user.id;
        const {
            page = 1,
            limit = 10,
            search = '',
            hiringStage = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Get employer's jobs
        const jobs = await Job.find({ employerId });
        const jobIds = jobs.map(job => job._id);

        // Build query
        let query = { job: { $in: jobIds } };

        // Add hiring stage filter
        if (hiringStage) {
            query.hiringStage = hiringStage;
        }

        // Get applications
        let applications = await Application.find(query)
            .populate({
                path: 'applicant',
                select: 'name email avatar profile phone gender dateOfBirth languages'
            })
            .populate('job', 'title company type roleCategory')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Apply search filter after population (searching in applicant name)
        if (search) {
            applications = applications.filter(app =>
                app.applicant && app.applicant.name &&
                app.applicant.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = await Application.countDocuments(query);

        res.status(200).json({
            success: true,
            count: applications.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
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

// @desc    Get single applicant details
// @route   GET /api/v1/employer/applicants/:id
// @access  Private (Employer)
export const getApplicantDetails = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate({
                path: 'applicant',
                select: '-password -resetPasswordToken -resetPasswordExpire'
            })
            .populate('job')
            .populate('notes.addedBy', 'name avatar')
            .populate('notes.replies.addedBy', 'name avatar')
            .populate('interviews.interviewers', 'name avatar')
            .populate('interviews.feedback.submittedBy', 'name avatar')
            .populate('assignedTo.user', 'name avatar');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Verify this application belongs to employer's job
        const job = await Job.findById(application.job._id);
        if (job.employerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this applicant'
            });
        }

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

// @desc    Update applicant score/rating
// @route   PUT /api/v1/employer/applicants/:id/score
// @access  Private (Employer)
export const updateApplicantScore = async (req, res) => {
    try {
        const { score } = req.body;

        if (score < 0 || score > 5) {
            return res.status(400).json({
                success: false,
                message: 'Score must be between 0 and 5'
            });
        }

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { score },
            { new: true, runValidators: true }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

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

// @desc    Update applicant hiring stage
// @route   PUT /api/v1/employer/applicants/:id/stage
// @access  Private (Employer)
export const updateHiringStage = async (req, res) => {
    try {
        const { hiringStage } = req.body;

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { hiringStage },
            { new: true, runValidators: true }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

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

// @desc    Add note to applicant
// @route   POST /api/v1/employer/applicants/:id/notes
// @access  Private (Employer)
export const addApplicantNote = async (req, res) => {
    try {
        const { text, replyToNoteId } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Note text is required' });
        }

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const userSnapshot = {
            addedBy: req.user.id,
            authorName: req.user.name,
            authorAvatar: req.user.avatar,
            addedAt: new Date()
        };

        if (replyToNoteId) {
            const note = application.notes.id(replyToNoteId);
            if (!note) return res.status(404).json({ success: false, message: 'Parent note not found' });
            note.replies.push({ text, ...userSnapshot });
        } else {
            application.notes.push({ text, ...userSnapshot, replies: [] });
        }

        await application.save();

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update interview details (Specific Interview)
// @route   PUT /api/v1/employer/applicants/:id/interview/:interviewId
// @access  Private (Employer)
export const updateInterview = async (req, res) => {
    try {
        const { scheduledAt, type, location, notes, status } = req.body;
        const { id, interviewId } = req.params;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const interview = application.interviews.id(interviewId);
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        if (scheduledAt) interview.scheduledAt = scheduledAt;
        if (type) interview.type = type;
        if (location) interview.location = location;
        if (notes) interview.notes = notes;
        if (status) interview.status = status;

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Schedule an interview
// @route   POST /api/v1/employer/applicants/:id/interviews
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

        if (application.hiringStage !== 'Interview') {
            application.hiringStage = 'Interview';
        }

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Add feedback to an interview
// @route   POST /api/v1/employer/applicants/:id/interviews/:interviewId/feedback
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

        if (interview.status !== 'Completed') {
            interview.status = 'Completed';
        }

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Assign team members to applicant
// @route   PUT /api/v1/employer/applicants/:id/assign
// @access  Private (Employer)
export const assignTeamMembers = async (req, res) => {
    try {
        const { teamMembers } = req.body; // Array of user IDs

        if (!Array.isArray(teamMembers)) {
            return res.status(400).json({
                success: false,
                message: 'teamMembers must be an array'
            });
        }

        // Fetch user details for snapshots
        const users = await User.find({ _id: { $in: teamMembers } }).select('name avatar');

        const assignedTo = users.map(user => ({
            user: user._id,
            name: user.name,
            avatar: user.avatar
        }));

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true, runValidators: true }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

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

// @desc    Get employer's jobs with pagination
// @route   GET /api/v1/employer/jobs
// @access  Private (Employer)
export const getEmployerJobs = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { page = 1, limit = 10, status, search } = req.query;

        let query = { employerId };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            count: jobs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
