import User from '../models/User.js';
import jwt from 'jsonwebtoken';



// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: user.getSignedJwtToken()
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: user.getSignedJwtToken()
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get user data
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {};

        // Helper to check if value exists
        const hasValue = (val) => val !== undefined && val !== null;

        if (hasValue(req.body.name)) fieldsToUpdate.name = req.body.name;
        if (hasValue(req.body.email)) fieldsToUpdate.email = req.body.email;
        if (hasValue(req.body.phone)) fieldsToUpdate.phone = req.body.phone;
        if (hasValue(req.body.avatar)) fieldsToUpdate.avatar = req.body.avatar;
        if (hasValue(req.body.bio)) fieldsToUpdate.bio = req.body.bio;
        if (hasValue(req.body.gender)) fieldsToUpdate.gender = req.body.gender;
        if (hasValue(req.body.dateOfBirth)) fieldsToUpdate.dateOfBirth = req.body.dateOfBirth;
        if (hasValue(req.body.languages)) fieldsToUpdate.languages = req.body.languages;

        // Employer specific
        if (hasValue(req.body.company)) fieldsToUpdate.company = req.body.company;

        // Profile fields
        if (hasValue(req.body.headline)) fieldsToUpdate['profile.headline'] = req.body.headline;
        if (hasValue(req.body.location)) fieldsToUpdate['profile.location'] = req.body.location;
        if (hasValue(req.body.isOpenToWork)) fieldsToUpdate['profile.isOpenToWork'] = req.body.isOpenToWork;
        if (hasValue(req.body.address)) fieldsToUpdate['profile.address'] = req.body.address;
        if (hasValue(req.body.socialLinks)) fieldsToUpdate['profile.socialLinks'] = req.body.socialLinks;
        if (hasValue(req.body.aboutMe)) fieldsToUpdate['profile.aboutMe'] = req.body.aboutMe;
        if (hasValue(req.body.currentJob)) fieldsToUpdate['profile.currentJob'] = req.body.currentJob;
        if (hasValue(req.body.qualificationLevel)) fieldsToUpdate['profile.qualificationLevel'] = req.body.qualificationLevel;
        if (hasValue(req.body.experienceYears)) fieldsToUpdate['profile.experienceYears'] = req.body.experienceYears;
        if (hasValue(req.body.highestEducation)) fieldsToUpdate['profile.highestEducation'] = req.body.highestEducation;
        if (hasValue(req.body.skills)) fieldsToUpdate['profile.skills'] = req.body.skills;
        if (hasValue(req.body.licenses)) fieldsToUpdate['profile.licenses'] = req.body.licenses;
        if (hasValue(req.body.workExperience)) fieldsToUpdate['profile.workExperience'] = req.body.workExperience;
        if (hasValue(req.body.education)) fieldsToUpdate['profile.education'] = req.body.education;
        if (hasValue(req.body.certifications)) fieldsToUpdate['profile.certifications'] = req.body.certifications;
        if (hasValue(req.body.desiredSalary)) fieldsToUpdate['profile.desiredSalary'] = req.body.desiredSalary;
        if (hasValue(req.body.availability)) fieldsToUpdate['profile.availability'] = req.body.availability;
        if (hasValue(req.body.preferredShifts)) fieldsToUpdate['profile.preferredShifts'] = req.body.preferredShifts;

        const user = await User.findByIdAndUpdate(req.user.id, { $set: fieldsToUpdate }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
