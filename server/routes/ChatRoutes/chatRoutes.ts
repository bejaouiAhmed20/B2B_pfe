import express from 'express';
import { RequestHandler, Router } from 'express';
import { handleChat } from '../../controllers/ChatController/chatController';

const router = Router();

// Chatbot endpoint to handle user messages
router.post('/', handleChat as unknown as RequestHandler);

export default router;
