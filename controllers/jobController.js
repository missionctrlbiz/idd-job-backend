import Job from '../models/Job.js';

// @desc    Get all jobs
// @route   GET /api/v1/jobs
// @access  Public
export const getAllJobs = async (req, res) => {
    try {
        const { roleCategory, type, location, company } = req.query;
        const query = {};

        if (roleCategory) query.roleCategory = roleCategory;
        if (type) query.type = type;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (company) query.company = { $regex: company, $options: 'i' };

        const jobs = await Job.find(query).sort({ postedAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
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

// @desc    Create a new job
// @route   POST /api/v1/jobs
// @access  Public (for now)
export const createJob = async (req, res) => {
    try {
        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
