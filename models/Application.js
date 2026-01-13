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
        maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    resume: {
        url: String,
        filename: String
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

    // Employer notes (private)
    notes: [{
        text: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now }
    }],

    // Interview scheduling
    interview: {
        scheduledAt: Date,
        type: { type: String, enum: ['Phone', 'Video', 'In-Person'] },
        location: String,
        notes: String
    },

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
