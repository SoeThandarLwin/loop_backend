import { Router } from 'express';
import { getChatHistory, getPeopleInConversation } from './chat.controller';
import authMiddleware from '../middlewares/auth.middleware';

export const chatRouter = Router();

chatRouter.use(authMiddleware);
chatRouter.get('/people', getPeopleInConversation);
chatRouter.get('/history', getChatHistory);
