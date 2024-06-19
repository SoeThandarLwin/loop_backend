import { Router } from 'express';
import { createPost, requestPost, deletePost } from './post.controller';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export const postRouter = Router();

const mediaUpload = upload.fields([
  { name: 'before', maxCount: 1 },
  { name: 'reference', maxCount: 1 },
]);
postRouter.post('/', mediaUpload, createPost);
postRouter.get('/', requestPost);
postRouter.delete('/', deletePost);
//postRouter.get('/api/posts', getAllPosts);
