import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import { postRouter } from './post/post.router';
import cors from "cors";
import "./auth/connection";
import authRoutes from "./auth/auth_routes";
import showAllPost from "./showAllPost/showAll_router";
import { mediaRouter } from "./media/media.router";
import showOwnerRouter from "./showOwnerPosts/showOwnerPosts_router";
import showOnFeedRouter from "./dropDown/dropdown_router";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CONNECTION_URL}/Loop?retryWrites=true&w=majority&appName=Cluster0`;

const app: Express = express();
const port = process.env.PORT || 3000;
app.get("/", (req: Request, res: Response) => {
  res.send("our server");
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api/auth', authRoutes);
app.use('/show', showAllPost );
app.use('/post', postRouter);
app.use('/media', mediaRouter);
app.use('/owner', showOwnerRouter);
app.use('/showOnFeed',showOnFeedRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;

