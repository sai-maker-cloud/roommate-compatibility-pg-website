import express from 'express';
import { getConversations, getOrCreateConversation } from '../controllers/conversationController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getConversations);
router.post('/', protect, getOrCreateConversation);

export default router;
