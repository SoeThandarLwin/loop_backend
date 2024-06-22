import { Router } from "express";
import { getPeopleInConversation } from "./chat.controller";

export const chatRouter = Router();

chatRouter.get('/people', getPeopleInConversation);