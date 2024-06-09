import { Router } from "express";
import { createPost, requestPost, updatePost, deletePost } from "./post.controller";

export const postRouter = Router();

postRouter.post('/', createPost);
postRouter.get('/', requestPost);
postRouter.put('/', updatePost);
postRouter.delete('/', deletePost);
