import express from 'express';
import { getSettings, updatePreferences } from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.patch('/preferences', updatePreferences);

export default router;
