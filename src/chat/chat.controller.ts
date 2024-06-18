import { Message } from './message.model';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Media } from '../media/media.model';
import User from '../auth/auth_model';

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
      });
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
        filename: uuidv4(),
        mimetype: message.mimetype,
        path: `uploads/${file_name}`,
      }).save();

      const msgResponse = await new Message({
        _id: uuidv4(),
        from: user.id,
        to: message.to,
        type: 'media',
        media: newMedia._id,
      }).save();

      socket.to(`user:${message.to}`).emit('receive:media_message', {
        from: user.id,
        from_user: user.username,
        to: message.to,
        media: file_name,
        timestamp: msgResponse.timestamp,
      });
    }
  };
}
