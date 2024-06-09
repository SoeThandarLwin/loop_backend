import { Request, Response } from "express";
import { Post } from "./post.model";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../auth/auth_model';
import useId from "@mui/material/utils/useId";


export async function createPost(req: Request, res: Response) {
  const getHeader = req.headers.authorization;
  const token = getHeader?.split(' ') [1];
  const user: string | JwtPayload = jwt.verify(token!, process.env.JWT_KEY as string) as typeof User;
  if (!user) return res.json({message: 'invalid token'}).send();
  const post = new Post({ _id: uuidv4(),  user: user.id, description: "Hello" });
  const returnedPost = await post.save();
  return res.status(201).json(returnedPost).send();
}

export async function requestPost(req: Request, res: Response) {
  const postId = req.query.post_id;
  const findByQueryPost = await Post.findById(postId).exec();
  if (!findByQueryPost) return res.status(404).send();
  return res.json(findByQueryPost).send();
}

export function deletePost(req: Request, res: Response) {
  const getHeader = req.headers.authorization;
  const token = getHeader?.split(' ') [1];
  const user: string | JwtPayload = jwt.verify(token!, process.env.JWT_KEY as string) as typeof User;
  if (!user) return res.json({message: 'invalid token'}).send();

  const postId = req.query.post_id;
  Post.deleteOne({ _id : postId, user: user.id })
  return res.status(204).send();
}
