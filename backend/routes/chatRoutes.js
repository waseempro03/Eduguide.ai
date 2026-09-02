import { Router } from 'express';
import { handleChatMessage, getUserChats, saveUserChats } from '../controllers/chatController.js';

const router = Router();

router.post('/', handleChatMessage);
router.get('/user/:userId', getUserChats);
router.post('/user/sync', saveUserChats);

export default router;
