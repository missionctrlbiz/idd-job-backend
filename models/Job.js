import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    workMode: {
        type: String,
        enum: ['On-site', 'Hybrid', 'Remote'],
        default: 'On-site'
    },
    type: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'PRN'],
        required: true
    },
    roleCategory: {
        type: String,
        enum: ['DSP', 'Caregiver', 'Nurse', 'Admin', 'Behavioral'],
        required: true
    },
    shifts: {
        type: [String],
        enum: ['Overnight', 'Weekend', 'Live-In', 'Day', 'Evening', 'Rotating', 'Flexible'], // Added common shifts, user example included Overnight, Weekend, Live-In
        default: []
    },
    certifications: {
        type: [String],
        default: []
    },
    salary: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        },
        period: {
            type: String,
            enum: ['Hourly', 'Weekly', 'Monthly', 'Yearly'],
            default: 'Hourly'
        }
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
    responsibilities: {
        type: [String],
        default: []
    },
    qualifications: {
        type: [String],
        default: []
    },
    requirements: {
        type: [String],
        default: []
    },
    perks: [{
        title: String,
        description: String,
        icon: String
    }],
    benefits: {
        type: [String],
        default: []
    },

    // Analytics and tracking
    viewsCount: {
        type: Number,
        default: 0
    },
    viewsByDay: [{
        date: Date,
        count: Number
    }],
    applicationsCount: {
        type: Number,
        default: 0
    },

    officeImages: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
