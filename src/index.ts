import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import { postRouter } from './post/post.router';
import cors from "cors";
import "./auth/connection";
import authRoutes from "./auth/auth_routes";
import { mediaRouter } from "./media/media.router";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "./auth/auth_model";
import { z } from "zod";
import { sendMediaMessage, sendMessage } from './chat/chat.controller';

const msgSchema = z.object({
  to: z.string().uuid({message: "Must be 5 or more characters long"}),
  content: z.string(),
})

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CONNECTION_URL}/Loop?retryWrites=true&w=majority&appName=Cluster0`;

const connection = await mongoose.connect(uri);
console.log('connection successful');

const app: Express = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;
app.get("/", (req: Request, res: Response) => {
  res.send("our server");
}); 

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/post', postRouter);
app.use('/media', mediaRouter)

// app.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });

const io = new Server(httpServer);

io.engine.use((req : IncomingMessage & {user: any, _query:{sid: any}}, res: ServerResponse, next: Function) => {
  console.log('hello');
  const isHandshake = req._query.sid === undefined;
  if (!isHandshake) {
    return next();
  }

  const header = req.headers["authorization"];

  if (!header) {
    return next(new Error("no token"));
  }

  if (!header.startsWith("bearer ")) {
    return next(new Error("invalid token"));
  }

  const token = header.substring(7);

  const user: string | JwtPayload = jwt.verify(
    token!,
    process.env.JWT_KEY as string,
  ) as typeof User;

  if (!user) return next(new Error("invalid token"));
  req.user = user;
  next();
});

io.on("connection", async (socket) => {
  const req = socket.request as Request & { user: Express.User };
  const user: Express.User = req.user;

  console.group(`user: ${req.user.id} connected`)

  socket.join(`user:${req.user.id}`);

  socket.on("whoami", (cb) => {
    io.sockets.emit('whoami', req.user.username);
  });

  socket.on('send:message', sendMessage({ io, socket, user }));
  socket.on('send:media_message', sendMediaMessage({ io, socket, user }));
});

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});

export default app;

 