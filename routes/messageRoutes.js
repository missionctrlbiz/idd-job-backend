import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming you have an auth middleware

const router = express.Router();

router.use(protect); // All message routes are protected

router.get('/conversations', getConversations);
router.route('/')
    .post(sendMessage);

router.route('/:userId')
    .get(getMessages);

export default router;
