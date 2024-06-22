import User from '../auth/auth_model';
import admin from 'firebase-admin';
import fs from 'fs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import { Media } from '../media/media.model';
import { Message } from './message.model';
import { Request, Response } from 'express';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Schema } from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fss = fs.promises;

const msgSchema = z.object({
  to: z.string().uuid({ message: 'Must be uuid' }),
  content: z.string(),
});

const mediaMsgSchema = z.object({
  to: z.string().uuid({ message: 'Must be uuid' }),
  content: z.string(),
  mimetype: z.string(),
});

export function sendMessage({ io, socket, user }: any) {
  return async (payload: string, callback: Function) => {
    const message = JSON.parse(payload);
    const validated = msgSchema.safeParse(message);
    if (validated.success) {
      const msgResponse = await new Message({
        _id: uuidv4(),
        from: user.id,
        from_user: user.username,
        to: message.to,
        type: 'text',
        content: message.content,
      }).save();

      const fromUser = await User.findById(user.id);

      if (!fromUser) {
        return;
      }

      socket.to(`user:${message.to}`).emit('receive:message', {
        from: user.id,
        from_user: user.username,
        to: message.to,
        content: message.content,
        timestamp: msgResponse.timestamp,
        type: 'text',
      });

      const recipient = await User.findById(message.to).exec();

      if (recipient && !!recipient.fcm_token) {
        const msg = {
          token: recipient.fcm_token,
          data: {
            title: `Message from ${user.username}`,
            body: message.content,
          },
        };

        const resp = await admin.messaging().send(msg);
      }
    }
  };
}

export function sendMediaMessage({ io, socket, user }: any) {
  return async (payload: string, callback: Function) => {
    const message = JSON.parse(payload);
    const validated = mediaMsgSchema.safeParse(message);
    if (validated.success) {
      const file_name = uuidv4();
      await fss.writeFile(
        path.join(__dirname, '../../uploads/' + file_name),
        message.content,
        { encoding: 'base64' },
      );
      const newMedia = await new Media({
        _id: file_name,
        user: user.id,
        filename: message.filename,
        mimetype: message.mimetype,
        path: `uploads/${file_name}`,
      }).save();

      const msgResponse = await new Message({
        _id: uuidv4(),
        from: user.id,
        to: message.to,
        type: 'media',
        media: file_name,
      }).save();

      socket.to(`user:${message.to}`).emit('receive:media_message', {
        from: user.id,
        content: file_name,
        type: 'media',
        timestamp: msgResponse.timestamp,
        from_user: user.username,
        to: message.to,
      });

      const recipient = await User.findById(message.to).exec();

      if (recipient && !!recipient.fcm_token) {
        const msg = {
          token: recipient.fcm_token,
          data: {
            title: `Message from ${user.username}`,
            body: `http://10.0.2.2:3000/media?media_id=${file_name}`,
          },
        };

        const resp = await admin.messaging().send(msg);
      }
    }
  };
}

export async function getChatHistory(req: Request, res: Response) {
  const messages = await Message.find({
    $or: [
      { from: req.query.user_id, to: req.user!.id },
      { to: req.query.user_id, from: req.user!.id },
    ],
  }).sort({ timestamp: 1}).exec();

  return res.json({ data: messages }).send();
}

export async function getPeopleInConversation(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const user: string | JwtPayload = jwt.verify(
    token!,
    process.env.JWT_KEY as string,
  ) as typeof User;
  if (!user) return res.json({ message: 'invalid token' }).send();

  const people = await Message.aggregate([
    { $project: { _id: 0, to: 1, from: 1 } },
    {
      $group: {
        _id: null,
        to: { $addToSet: '$to' },
        from: { $addToSet: '$from' },
      },
    },
  ]).exec();

  const uuids = Array.from(
    new Set([
      ...people[0].to.map((p: any) => p.toString()),
      ...people[0].from.map((p: any) => p.toString()),
    ]),
  ).filter((uuid) => uuid !== user.id);

  const users = await User.find({
    _id: { $in: uuids },
  })
    .select('id username')
    .exec();

  return res
    .status(200)
    .json({
      data: users.map((user) => ({ username: user.username, id: user.id })),
    })
    .send();
}
