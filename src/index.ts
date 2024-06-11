import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import { postRouter } from './post/post.router';
import cors from "cors";
import "./auth/connection";
import authRoutes from "./auth/auth_routes";
import { mediaRouter } from "./media/media.router";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CONNECTION_URL}/Loop?retryWrites=true&w=majority&appName=Cluster0`;

const connection = await mongoose.connect(uri);
console.log('connection successful');

const app: Express = express();
const port = process.env.PORT || 3000;
app.get("/", (req: Request, res: Response) => {
  res.send("our server");
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/post', postRouter);
app.use('/media', mediaRouter)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;

