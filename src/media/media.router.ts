import { Router } from "express";
import { createMedia, deleteMedia, requestMedia } from "./media.controller";

export const mediaRouter = Router();

mediaRouter.post('/', createMedia);
mediaRouter.get('/', requestMedia);
mediaRouter.delete('/', deleteMedia);