import express from "express";
import { getAllPost, getUserId } from "./showAll_controller";
import { Post } from "../post/post.model";
import User from "../auth/auth_model";

//get router for show all post
const router = express.Router();
router.get('/allPost', async (req, res) => {
    const posts = await getAllPost();
    return res.status(200).json(posts);
 });
//return userId from post data
router.get('/userId/:postId', async (req, res) => {
   const userId = await getUserId(req.params.postId);
   return res.status(200).json(userId);
}
);
//get user data by userId
router.get('/user/:userId', async (req, res) => {
   const user = await User.findById(req.params.userId);
    return res.status(200).json(user!['username']);
}
);
 export default router;

