import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },

    // Role
    role: {
        type: String,
        enum: ['jobseeker', 'employer', 'admin'],
        default: 'jobseeker'
    },

    // Profile
    phone: String,
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    dateOfBirth: Date,
    languages: [String],

    // Job Seeker specific profile
    profile: {
        // Profile Header
        headline: String,
        location: String,
        isOpenToWork: {
            type: Boolean,
            default: false
        },
        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: String
        },
        socialLinks: {
            linkedin: String,
            twitter: String,
            website: String,
            instagram: String
        },

        // About/Bio
        aboutMe: {
            type: String,
            maxlength: [2000, 'About me cannot exceed 2000 characters']
        },
        currentJob: String,
        qualificationLevel: String,

        // Professional Data
        experienceYears: Number,
        highestEducation: String,
        skills: [String],
        licenses: [{
            name: String,
            status: {
                type: String,
                enum: ['Pending', 'Verified'],
                default: 'Pending'
            },
            documentUrl: String
        }],

        // Work Experience
        workExperience: [{
            company: String,
            role: String,
            type: {
                type: String,
                enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship']
            },
            startDate: Date,
            endDate: Date,
            current: Boolean,
            logo: String,
            description: String
        }],

        // Education
        education: [{
            school: String,
            degree: String,
            field: String,
            startYear: Number,
            endYear: Number,
            logo: String
        }],

        // Legacy/Other Fields
        certifications: [String],
        desiredSalary: {
            min: Number,
            max: Number
        },
        availability: {
            type: String,
            enum: ['Immediately', '2 Weeks', '1 Month', 'Not Looking']
        },
        preferredShifts: [String],
        resume: {
            url: String,
            filename: String,
            uploadedAt: Date
        }
    },

    // Employer specific
    company: {
        name: String,
        website: String,
        description: String,
        logo: String,
        size: String,
        industry: String,
        address: {
            street: String,
            city: String,
            state: String,
            zip: String
        }
    },

    // Account status
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Saved jobs (for job seekers)
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
