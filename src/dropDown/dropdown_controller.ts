import User from "../auth/auth_model";
import { Media } from "../media/media.model";
import { Post } from "../post/post.model";

//get all post data
export async function getShowOnFeedPost() {
  //get all post
  const posts = await Post.find();
  //filter only artist post
  const onFeedPosts = posts.filter(post => post.show_post);
  // Extract user UUIDs from artist posts
  const userIds = onFeedPosts.map(post => post.user);
  // Fetch corresponding user details
  const users = await User.find({ _id: { $in: userIds } });
  // Create a map for quick lookup
  const userMap = users.reduce((map, user) => {
    map[user._id.toString()] = user;
    return map;
  }, {} as { [key: string]: any });

  // Combine post data with media and user data, but only include filenames and username
  const combinedPosts = onFeedPosts.map(post => ({
    ...post.toJSON(),
    user_name: userMap[post.user!.toString()].username
  }));  
  return combinedPosts;

}


//return userId from post data
export async function getUserId(postId: string) {
  const post = await Post.findById(postId);
  //console.log(post?.user);
    return post?.user;

}

//get user data by userId
export async function getUser(userId: string) {
  const user = await User.findById(userId);
  //console.log(user);
    return user;
}

