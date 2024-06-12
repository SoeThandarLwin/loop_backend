import User from "../auth/auth_model";
import { Media } from "../media/media.model";
import { Post } from "../post/post.model";

//get all post data
export async function getAllPost() {
  //get all post
  const posts = await Post.find();
  //filter only artist post
  const artistPosts = posts.filter(post => post.artist_post);
  //get photo ids from artist post
  const photoIds = artistPosts.flatMap(post => [post.original_photo, post.reference_photo]);
// Fetch corresponding media details
  const media = await Media.find({ _id: { $in: photoIds } });
// Create a map for quick lookup
const mediaMap = media.reduce((map, item) => {
    map[item._id.toString()] = item;
    return map;
  }, {} as { [key: string] : any });
  // Extract user UUIDs from artist posts
  const userIds = artistPosts.map(post => post.user);
  // Fetch corresponding user details
  const users = await User.find({ _id: { $in: userIds } });
  // Create a map for quick lookup
  const userMap = users.reduce((map, user) => {
    map[user._id.toString()] = user;
    return map;
  }, {} as { [key: string]: any });

  // Combine post data with media and user data, but only include filenames and username
  const combinedPosts = artistPosts.map(post => ({
    ...post.toJSON(),
    original_photo: mediaMap[post.original_photo.toString()]?.path,
    orginal_photoType : mediaMap[post.original_photo.toString()]?.mimetype.split('/')[1],
    reference_photo: mediaMap[post.reference_photo.toString()]?.path,
    reference_photoType : mediaMap[post.reference_photo.toString()]?.mimetype.split('/')[1],
    user_name: userMap[post.user!.toString()].username
  }));
console.log(combinedPosts);
return combinedPosts;

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

