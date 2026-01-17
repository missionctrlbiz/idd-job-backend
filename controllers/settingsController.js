import UserSettings from '../models/UserSettings.js';

// @desc    Get all user settings
// @route   GET /api/v1/settings
// @access  Private
export const getSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        let settings = await UserSettings.findOne({ user: userId });

        if (!settings) {
            settings = await UserSettings.create({ user: userId });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update specific preferences
// @route   PATCH /api/v1/settings/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
    try {
        const { alerts, security } = req.body;
        const userId = req.user.id;

        let settings = await UserSettings.findOne({ user: userId });

        if (!settings) {
            settings = await UserSettings.create({ user: userId });
        }

        if (alerts) {
            settings.alerts = { ...settings.alerts, ...alerts };
        }

        if (security) {
            settings.security = { ...settings.security, ...security };
        }

        await settings.save();

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
