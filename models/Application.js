import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Application content
    coverLetter: {
        type: String,
        maxlength: [5000, 'Cover letter cannot exceed 5000 characters']
    },
    resume: {
        url: String,
        filename: String
    },

    // AI-Powered Fields (populated at application time via Gemini)
    aiQualificationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    aiMatchedSkills: {
        type: [String],
        default: []
    },
    aiMissingSkills: {
        type: [String],
        default: []
    },
    aiStrengths: {
        type: [String],
        default: []
    },
    aiAssessmentSummary: {
        type: String,
        default: null
    },
    aiCoverLetter: {
        type: String,
        default: null
    },
    resumeParsedData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    // Applicant details (snapshot at time of application)
    applicantInfo: {
        name: String,
        email: String,
        phone: String,
        linkedIn: String
    },

    // Status tracking
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Shortlisted', 'Interview', 'Offered', 'Hired', 'Rejected', 'Withdrawn'],
        default: 'Pending'
    },

    // Employer rating/scoring
    score: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },

    // Hiring stage (for UI stepper/progress)
    hiringStage: {
        type: String,
        enum: ['In-Review', 'Shortlisted', 'Interview', 'Hired', 'Declined'],
        default: 'In-Review'
    },

    // Employer notes (private) - enhanced with threading
    notes: [{
        text: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: String,
        authorAvatar: String,
        addedAt: { type: Date, default: Date.now },
        replies: [{
            text: String,
            addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            authorName: String,
            authorAvatar: String,
            addedAt: { type: Date, default: Date.now }
        }]
    }],

    // Assigned team members (for interview coordination)
    assignedTo: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        avatar: String
    }],

    // Interview scheduling (Multiple rounds)
    interviews: [{
        scheduledAt: Date,
        duration: { type: Number, default: 60 }, // in minutes
        type: { type: String, enum: ['Phone', 'Video', 'In-Person', 'Written Test', 'Skill Test'] },
        location: String, // URL or Physical address
        notes: String, // Instructions/Agenda
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
            default: 'Scheduled'
        },
        interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Who is interviewing
        feedback: [{
            rating: { type: Number, min: 1, max: 5 },
            comment: String,
            submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            submittedAt: { type: Date, default: Date.now }
        }]
    }],

    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Update job applications count when application is created
applicationSchema.post('save', async function () {
    const Job = mongoose.model('Job');
    const count = await mongoose.model('Application').countDocuments({ job: this.job });
    await Job.findByIdAndUpdate(this.job, { applicationsCount: count });
});

// Update job applications count when application is deleted
applicationSchema.post('deleteOne', { document: true, query: false }, async function () {
    const Job = mongoose.model('Job');
    const count = await mongoose.model('Application').countDocuments({ job: this.job });
    await Job.findByIdAndUpdate(this.job, { applicationsCount: count });
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
