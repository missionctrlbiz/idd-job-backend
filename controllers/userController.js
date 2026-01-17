import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';

// @desc    Update profile details (bio, headline, location, socialLinks)
// @route   PUT /api/v1/users/profile/details
// @access  Private
export const updateProfileDetails = async (req, res) => {
    try {
        const { bio, headline, location, socialLinks, isOpenToWork } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields
        if (bio !== undefined) user.bio = bio;

        // Update profile fields
        if (headline !== undefined) user.profile.headline = headline;
        if (location !== undefined) user.profile.location = location;
        if (isOpenToWork !== undefined) user.profile.isOpenToWork = isOpenToWork;

        if (socialLinks) {
            user.profile.socialLinks = {
                ...user.profile.socialLinks,
                ...socialLinks
            };
        }

        await user.save();

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

// @desc    Add work experience
// @route   POST /api/v1/users/profile/experience
// @access  Private
export const addWorkExperience = async (req, res) => {
    try {
        const { company, role, type, startDate, endDate, current, description, logo } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newExp = {
            company,
            role,
            type,
            startDate,
            endDate,
            current,
            description,
            logo
        };

        user.profile.workExperience.unshift(newExp);
        await user.save();

        res.status(200).json({
            success: true,
            data: user.profile.workExperience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Toggle privacy settings
// @route   PUT /api/v1/users/profile/privacy
// @access  Private
export const updatePrivacySettings = async (req, res) => {
    try {
        const { showProfile, showPhone, showLicense } = req.body;
        const userId = req.user.id;

        let settings = await UserSettings.findOne({ user: userId });

        if (!settings) {
            settings = await UserSettings.create({ user: userId });
        }

        if (showProfile !== undefined) settings.privacy.showProfile = showProfile;
        if (showPhone !== undefined) settings.privacy.showPhone = showPhone;
        if (showLicense !== undefined) settings.privacy.showLicense = showLicense;

        await settings.save();

        res.status(200).json({
            success: true,
            data: settings.privacy
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
