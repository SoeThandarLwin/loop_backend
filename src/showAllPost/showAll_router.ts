import express from "express";
import { getAllPost, getOtherProfilePost, updatePostStatus } from "./showAll_controller";
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
router.put('/updatePost', async (req, res) => {
    const { postId, dropdownValue } = req.body;
    console.log(dropdownValue);
    const posts = await updatePostStatus(postId, dropdownValue);
    return res.status(200).json(posts);
});
 export default router;

