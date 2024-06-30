import { Request, Response } from 'express';
import { Media } from './media.model';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function createMedia(req: Request, res: Response) {
  res.send('Create');
}

export async function requestMedia(req: Request, res: Response) {
  const mediaId = req.query.media_id;

  if (mediaId === '') return res.status(404).send();

  const media = await Media.findById(mediaId);

  if (!media) return res.status(404).send();

  res.set('Content-Type', media.mimetype).sendFile(media.path, {
    root: path.join(__dirname, '../..'),
  });
}

export async function deleteMedia(req: Request, res: Response) {
  res.send('dele');
}
