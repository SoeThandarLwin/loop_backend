import express from "express";
import { getAllPost, getOtherProfilePost } from "./showAll_controller";
//get router for show all post
const router = express.Router();
router.get('/allPost', async (req, res) => {
    const posts = await getAllPost();
    return res.status(200).json(posts);
 });
router.get('/otherProfilePost/:id', async (req, res) => {
    const posts = await getOtherProfilePost(req.params.id);
    return res.status(200).json(posts);
});
 export default router;

