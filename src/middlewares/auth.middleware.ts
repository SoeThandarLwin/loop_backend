import User from '../auth/auth_model';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send();
  }

  if (!authHeader.startsWith('Bearer')) {
    return res.status(401).send();
  }

  const token = authHeader.substring(7);

  const user: string | JwtPayload = jwt.verify(
    token!,
    process.env.JWT_KEY as string,
  ) as typeof User;

  if (!user) return next(new Error('invalid token'));

  req.user = { id: user.id, username: user.username, iat: user.iat! };

  return next();
}
