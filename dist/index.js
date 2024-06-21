import express from "express";
import { postRouter } from './post/post.router';
import cors from "cors";
import "./auth/connection";
import authRoutes from "./auth/auth_routes";
import showAllPost from "./showAllPost/showAll_router";
import { mediaRouter } from "./media/media.router";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { sendMediaMessage, sendMessage } from './chat/chat.controller';
import showOwnerRouter from "./showOwnerPosts/showOwnerPosts_router";
const msgSchema = z.object({
    to: z.string().uuid({ message: "Must be 5 or more characters long" }),
    content: z.string(),
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CONNECTION_URL}/Loop?retryWrites=true&w=majority&appName=Cluster0`;
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("our server");
});
app.use(cors());
app.use(express.json({ limit: '50mb' }));
//app.use(express.json({limit: '59mb'}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/show', showAllPost);
app.use('/post', postRouter);
app.use('/media', mediaRouter);
app.use('/owner', showOwnerRouter);
app.use(postRouter);
// app.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });
const io = new Server(httpServer);
io.engine.use((req, res, next) => {
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
    const user = jwt.verify(token, process.env.JWT_KEY);
    if (!user)
        return next(new Error("invalid token"));
    req.user = user;
    next();
});
io.on("connection", async (socket) => {
    const req = socket.request;
    const user = req.user;
    console.group(`user: ${req.user.id} connected`);
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
