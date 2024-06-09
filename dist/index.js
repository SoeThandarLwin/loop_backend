import express from "express";
import mongoose from "mongoose";
import { postRouter } from './post/post.router';
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CONNECTION_URL}/?retryWrites=true&w=majority&appName=Cluster0`;
const connection = await mongoose.connect(uri);
console.log('connection successful');
const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("our server");
});
app.use('/posts', postRouter);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
export default app;
