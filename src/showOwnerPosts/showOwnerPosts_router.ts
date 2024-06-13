import express from "express";
import { getAllPost } from "./showOwnerPosts_controller";
//get router for show all post
const router = express.Router();
router.get('/allPost', async (req, res) => {
    const posts = await getAllPost();
    return res.status(200).json(posts);
 });

 export default router;

