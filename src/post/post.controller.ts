import { Request, Response } from "express";
import { Post } from "./post.model";
import { v4 as uuidv4 } from 'uuid';

export async function createPost(req: Request, res: Response) {
    const post = new Post({ _id: uuidv4(), description : 'Hello' });
    await post.save();
    res.send('create post');
}

export function requestPost(req: Request, res: Response) {
    res.send('request post');
}

export function updatePost(req: Request, res: Response){
    res.send('update post');
}

export function deletePost(req: Request, res: Response){
    res.send('delete post');
}