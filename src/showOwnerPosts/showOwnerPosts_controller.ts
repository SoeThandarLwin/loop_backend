import User from "../auth/auth_model";
import { Media } from "../media/media.model";
import { Post } from "../post/post.model";

//get all post data
export async function getAllPost() {
  //get all post
  const posts = await Post.find();
  /* //filter only artist post
  const artistPosts = posts.filter(post => post.artist_post); */
  // Extract user UUIDs from artist posts
  const userIds = posts.map(post => post.user);
  // Fetch corresponding user details
  const users = await User.find({ _id: { $in: userIds } });
  // Create a map for quick lookup
  const userMap = users.reduce((map, user) => {
    map[user._id.toString()] = user;
    return map;
  }, {} as { [key: string]: any });

  // Combine post data with media and user data, but only include filenames and username
  const combinedPosts = posts.map(post => ({
    ...post.toJSON(),
    user_name: userMap[post.user!.toString()].username
  }));
console.log(combinedPosts);
return combinedPosts;

}


