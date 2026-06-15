import express from 'express';
import {
  getChatHistory,
  sendMessage,
  clearChatHistory,
  getUserChatSessions,
} from '../controllers/chat.controller.js';

const router = express.Router();

// Public routes (no auth required for initial chat)
router.post('/message', sendMessage); // Send message and get bot response
router.get('/history/:sessionId', getChatHistory); // Get chat history
router.delete('/history/:sessionId', clearChatHistory); // Clear chat history

// Protected routes (optional - for logged-in users)
router.get('/sessions', getUserChatSessions); // Get user's previous sessions

export default router;
