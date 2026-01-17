import express from 'express';
import { updateProfileDetails, addWorkExperience, updatePrivacySettings } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.put('/profile/details', updateProfileDetails);
router.post('/profile/experience', addWorkExperience);
router.put('/profile/privacy', updatePrivacySettings);

export default router;
