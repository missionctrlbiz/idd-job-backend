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
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    type: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract'],
        required: true
    },
    roleCategory: {
        type: String,
        enum: ['DSP', 'Caregiver', 'Nurse', 'Admin'],
        required: true
    },
    shifts: {
        type: [String],
        enum: ['Overnight', 'Weekend', 'Live-In', 'Day', 'Evening', 'Rotating'], // Added common shifts, user example included Overnight, Weekend, Live-In
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
            enum: ['Hourly', 'Monthly', 'Yearly'],
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
    }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
