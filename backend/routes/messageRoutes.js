import express from 'express';
import { getMessages, getConversationMessages } from '../controllers/messageController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/conversation/:conversationId', protect, getConversationMessages);
router.get('/:receiverId', protect, getMessages);

export default router;
