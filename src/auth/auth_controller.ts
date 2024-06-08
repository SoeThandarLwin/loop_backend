import User from './auth_model';
import { IUser } from './auth_model';

export const registerUser = async (user: Partial<IUser>) => {
  const { username, email, password } = user;
  if (!username || !email || !password) {
    return {
      error: 'Please provide all the required fields',
    };
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return {
      error: 'User with that email already exists.',
    };
  }
  const newUser = new User({ username, email, password, followers: [], following: [] });
  await newUser.save();
  const token = await newUser.generateAuthToken();
  return {
    user: newUser,
    token,
  };
};

export const loginUser = async (user: Partial<IUser>) => {
  const { email, password } = user;
  if (!email || !password) {
    return {
      error: 'Please provide all the required fields',
    };
  }
  const existingUser = await User.findByCredentials(email, password);
  if (!existingUser) {
    return {
      error: 'Wrong Password or Email',
    };
  }
  const token = await existingUser.generateAuthToken();
  return {
    user: existingUser,
    token,
  };
};

export const followUser = async (followerId: string, followeeId: string) => {
  const follower = await User.findById(followerId);
  const followee = await User.findById(followeeId);

  if (!follower || !followee) {
    return { error: 'User not found' };
  }

  if (follower.following.includes(followeeId)) {
    return { error: 'Already following this user' };
  }

  follower.following.push(followeeId);
  followee.followers.push(followerId);

  await follower.save();
  await followee.save();

  // Add notification logic here (if needed)

  return { message: 'Followed successfully' };
};

export const unfollowUser = async (followerId: string, followeeId: string) => {
  const follower = await User.findById(followerId);
  const followee = await User.findById(followeeId);

  if (!follower || !followee) {
    return { error: 'User not found' };
  }

  follower.following = follower.following.filter(id => id !== followeeId);
  followee.followers = followee.followers.filter(id => id !== followerId);

  await follower.save();
  await followee.save();

  // Add notification logic here (if needed)

  return { message: 'Unfollowed successfully' };
};

