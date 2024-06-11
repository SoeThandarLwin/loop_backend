import User from "../auth/auth_model";
import { Post } from "../post/post.model";

//get all post data
export async function getAllPost() {
  const posts = await Post.find();
  return posts;
}

//return userId from post data
export async function getUserId(postId: string) {
  const post = await Post.findById(postId);
  console.log(post?.user);
    return post?.user;

}

//get user data by userId
export async function getUser(userId: string) {
  const user = await User.findById(userId);
  console.log(user);
    return user;
}

