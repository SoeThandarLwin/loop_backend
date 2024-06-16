import { Message } from './message.model';
import { v4 as uuidv4 } from 'uuid';
import { string, z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Media } from '../media/media.model';
import { timeStamp } from 'console';

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
    filename: z.string(),
    mimetype: z.string(),
})

export function sendMessage({ io, socket, user }: any) {
  return async (payload: string, callback: Function) => {
    const message = JSON.parse(payload);
    const validated = msgSchema.safeParse(message);
    if (validated.success) {
      await new Message({
        _id: uuidv4(),
        from: user.id,
        to: message.to,
        type: 'text',
        content: message.content,
      }).save();

      socket.to(`user:${message.to}`).emit('receive:message', {
        from: user.id,
        content: message.content,
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
        await fss.writeFile(path.join(__dirname, '../../uploads/' + file_name), message.content, {encoding: 'base64'});
        const newMedia = await new Media({
            _id: file_name,
            user: user.id,
            filename: message.filename,
            mimetype: message.mimetype,
            path: `uploads/${file_name}`,
        }).save()

      const msgResponse = await new Message({
        _id: uuidv4(),
        from: user.id,
        to: message.to,
        type: 'media',
        media: message.media,
      }).save();

      socket.to(`user:${message.to}`).emit('receive:media_message', {
        from: user.id,
        content: file_name,
        timestamp: msgResponse.timestamp,
      });
    }
  };
}
