import { Router } from "express";
import { createPost, requestPost, deletePost } from "./post.controller";

export const postRouter = Router();

postRouter.post('/', createPost);
postRouter.get('/', requestPost);
postRouter.delete('/', deletePost);
