import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    privacy: {
        showProfile: {
            type: Boolean,
            default: true
        },
        showPhone: {
            type: Boolean,
            default: false
        },
        showLicense: {
            type: Boolean,
            default: true
        }
    },
    alerts: {
        applications: {
            type: Boolean,
            default: true
        },
        newJobs: {
            type: Boolean,
            default: true
        },
        recommendations: {
            type: Boolean,
            default: true
        }
    },
    security: {
        twoFactor: {
            type: Boolean,
            default: false
        },
        lastPasswordChange: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
