import { Request, Response } from "express";
import { Post } from "./post.model";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../auth/auth_model';


export async function createPost(req: Request, res: Response) {
  const getHeader = req.headers.authorization;
  const token = getHeader?.split(' ') [1];
  const user: string | JwtPayload = jwt.verify(token!, process.env.JWT_KEY as string) as typeof User;
  if (!user) return res.json({message: 'invalid token'}).send();
  const post = new Post({ _id: uuidv4(),  user: user.id, description: "Hello" });
  const returnedPost = await post.save();
  return res.status(201).json(returnedPost).send();
}

export function requestPost(req: Request, res: Response) {
  res.send("request post");
}

export function updatePost(req: Request, res: Response) {
  res.send("update post");
}

export function deletePost(req: Request, res: Response) {
  res.send("delete post");
}
