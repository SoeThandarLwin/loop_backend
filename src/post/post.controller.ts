import { Request, Response } from "express";

export function createPost(req: Request, res: Response) {
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