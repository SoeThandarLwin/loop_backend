import { UUID } from "crypto";
import User from "../auth/auth_model";
import { Media } from "../media/media.model";
import { Post } from "../post/post.model";

export async function getAllPost() {
  try {
    // Get all posts
    const posts = await Post.find();
    // Filter only artist posts //false == aritist post
    //const artistPosts = posts.filter(post => !post.artist_post);
 
   // Extract user UUIDs from artist posts
   const userIds = posts.map(post => post.user);
   // Fetch corresponding user details
    const users = await User.find({ _id: { $in: userIds } });
 
    //Create a map for quick lookup
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {} as { [key: string]: any });
 
    //Combine post data with user data, but only include filenames and username
   const combinedPosts = posts.map(post => {
      const user = userMap[post.user!.toString()];
     return {
        ...post.toJSON(),
        user_name: user ? user.username : 'Unknown User', // Handle case where user might not be found
        profileImage: user ? user.profileImage : 'Unknown User',
      };
   });
 
    console.log(combinedPosts);
    return combinedPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
 

//get other post data
export async function getOtherProfilePost(userId: String) {
  //get post by user id
  const posts = await Post.find({user: userId});
  //filter only artist_post value is true == by me
  const artistPosts = posts.filter(post => post.artist_post);
  //filter show post only true
  const showPosts = artistPosts.filter(post => post.show_post);
  //fetch user corresponding data
  const userIds = showPosts.map(post => post.user);
  const users = await User.find({ _id: { $in: userIds } });
  // Create a map for quick lookup
  const userMap = users.reduce((map, user) => {
    map[user._id.toString()] = user;
    return map;
  }, {} as { [key: string]: any });
  // Combine post data with media and user data, but only include filenames and username
  const combinedPosts = artistPosts.map(post => ({
    ...post.toJSON(),
    user_name: userMap[post.user!.toString()].username,
    profileImage: userMap[post.user!.toString()].profileImage,
  }));  
  console.log(combinedPosts);
  return combinedPosts;

}

