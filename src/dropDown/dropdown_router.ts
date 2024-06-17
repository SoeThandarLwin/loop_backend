import express from "express";
import { getShowOnFeedPost } from "./dropdown_controller";
//get router for show all post
const router = express.Router();
router.get('/showOnFeed', async (req, res) => {
    const posts = await getShowOnFeedPost();
    return res.status(200).json(posts);
 });

 export default router;

