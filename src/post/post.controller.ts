import { Request, Response } from 'express';
import { Post } from './post.model';
import { v4 as uuidv4 } from 'uuid';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../auth/auth_model';
import { Media } from '../media/media.model';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fss = fs.promises;
const regexPrice = new RegExp('[0-9]+\-[0-9]+');

export async function createPost(req: Request, res: Response) {
  const { artist_post, name, price, description } = req.body;
  var artistPost;

  if( artist_post == undefined || artist_post == null){
    return res.status(400).send({ message: 'Post status cannot be empty'});
  }

  switch (artist_post) {
    case 'true': artistPost = true; break;
    case 'false': artistPost = false; break;
    default: return res.status(400).send({ message: 'Invalid post status value'});
  }
  if (!name)
    return res.status(400).send({ message: 'Name cannot be empty.' });

  if (!price || !regexPrice.test(price))
    return res.status(400).send({ message: 'Price cannot be empty.' });

  if (!description)
    return res.status(400).send({ message: 'Description cannot be empty.' });

  if (req.files === undefined)
    return res
      .status(400)
      .send({ message: 'Before photo and reference photo must be included.' });

  console.log(req.files);

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const before = files['before'][0];
  const reference = files['reference'][0];

  const getHeader = req.headers.authorization;
  const token = getHeader?.split(' ')[1];
  const user: string | JwtPayload = jwt.verify(
    token!,
    process.env.JWT_KEY as string,
  ) as typeof User;
  if (!user) return res.json({ message: 'invalid token' }).send();

  const beforeMedia = await new Media({
    _id: uuidv4(),
    user: user.id,
    filename: before.originalname,
    mimetype: before.mimetype,
    path: before.path,
  }).save();

  const referenceMedia = await new Media({
    _id: uuidv4(),
    user: user.id,
    filename: reference.originalname,
    mimetype: reference.mimetype,
    path: reference.path,
  }).save();

  const post = new Post({
    _id: uuidv4(),
    user: user.id,
    artist_post: artistPost,
    name,
    price,
    description,
    original_photo: beforeMedia._id,
    reference_photo: referenceMedia._id,
  });

  const returnedPost = await post.save();
  return res.status(201).json(returnedPost).send();
}

export async function requestPost(req: Request, res: Response) {
  const postId = req.query.post_id;
  const findByQueryPost = await Post.findById(postId).exec();
  if (!findByQueryPost) return res.status(404).send();
  return res.json(findByQueryPost).send();
}

export async function deletePost(req: Request, res: Response) {
  const getHeader = req.headers.authorization;
  const token = getHeader?.split(' ')[1];
  const user: string | JwtPayload = jwt.verify(
    token!,
    process.env.JWT_KEY as string,
  ) as typeof User;
  if (!user) return res.json({ message: 'invalid token' }).send();

  const postId = req.query.post_id;
  const post = await Post.findOneAndDelete({
    _id: postId,
    user: user.id,
  }).exec();
  if (post) {
    const originalPhoto = await Media.findOneAndDelete({
      _id: post.original_photo,
    }).exec();
    const referencePhoto = await Media.findOneAndDelete({
      _id: post.reference_photo,
    }).exec();

    if (originalPhoto)
      await fss.unlink(path.join(__dirname, '../..', originalPhoto.path));
    if (referencePhoto)
      await fss.unlink(path.join(__dirname, '../..', referencePhoto.path));
  }

  return res.status(204).send();
}
