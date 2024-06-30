// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import User, { IUser } from './auth_model';

// export interface CustomRequest extends Request {
//   user?: IUser;
//   token?: string;
// }

// const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) {
//       throw new Error('No token provided');
//     }

//     const decoded = jwt.verify(token, process.env.JWT_KEY as string) as { id: string };
//     const user = await User.findOne({ _id: decoded.id, 'tokens.token': token });

//     if (!user) {
//       throw new Error('User not found');
//     }

//     req.token = token;
//     req.user = user;
//     return next();
//   } catch (error) {
//     res.status(401).json({ error: 'Authentication failed.' });
//   }
// };

// export default auth;
