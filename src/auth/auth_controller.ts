import { fileURLToPath } from 'url';
import User from './auth_model';
import { IUser } from './auth_model';
import { v4 as uuidv4 } from "uuid";
import path from 'path';
import fs from 'fs';
import { privateEncrypt } from 'crypto';
import { Media } from '../media/media.model';
import mime from 'mime';
import { Request, Response } from 'express';
import { Post } from '../post/post.model';



export const checkEmail = async (email: string) => {
  const existingUser = await User.findOne({ email });
  return !!existingUser;
}

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
  const newUser = new User({ _id: uuidv4(), username, email, password, followers: [], following: [] });
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

export async function updatePassword(email: string, password: string){
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  user.password = password;
  await user.save();
  return user;
}


//fetch user data by id
export async function getUserById(userId: string) {
  const user = await User.findOne({ _id: userId });
  return user;
}

/* // Handle POST request to change password
export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Check if user is authenticated (you can use middleware for this)
    const user = await User.findById(req._id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if current password matches user's saved password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid current password' });
    }

    // Update user's password
    user.password = newPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('error');
    res.status(500).send('Server Error');
  }
}; */

export async function changePassword(email: string, currentPassword: string, newPassword: string) {
  // Find the user based on the provided email
  const user = await User.findOne({ email });

  // Check if any required field is missing
  if (!email || !currentPassword || !newPassword) {
    return 'required';
  }

  // If no user found with the provided email, return null
  if (!user) {
    return null;
  }

  // Validate the current password with the found user
  const existingUser = await User.findByCredentials(email, currentPassword);
  if (!existingUser) {
    return 'Wrong Password';
      //res.status(401).json({message: 'Wrong Password'});
    
  }

  // If current password is correct, update the password to newPassword
  user.password = newPassword;
  await user.save();

  // Return the updated user object
  return user;
}


/* export const changePw = async (user: Partial<IUser>) => {
  const {password } = user;
  if (!password) {
    return {
      error: 'Please provide all the required fields',
    };
  }
  const existingUser = await User.findOne({password});
  if (!existingUser) {
    return {
      error: 'Wrong Current Password',
    };
  } else if (existingUser){
    return{

    }
  }
  const token = await existingUser.generateAuthToken();
  return {
    user: existingUser,
    token,
  };
}; */

export async function editProfile(firstName: string, lastName: string, username: string, email: string){
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  user.username = username;
  user.firstName = firstName;
  user.lastName = lastName;
  await user.save();
  return user;
}

//edit profile image
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fss = fs.promises;
export async function editProfileImage(image: string, userId: string, mimeType: string){
  console.log('hello');
  console.log(image);
  console.log(userId);
  console.log(mimeType);
  const user = await User.findOne({ _id: userId
  });
  if (!user) {
    return null;
  }
  // Decode base64 image
  const imageBuffer = Buffer.from(image, 'base64');
  console.log(imageBuffer);
  
  // Define a unique filename for the image
  const imageFileName = `${userId}_${Date.now()}`;
  const imagePath = path.join('uploads', imageFileName); // Update 'path_to_save_images' to your desired directory
  try {
    await fs.promises.writeFile(imagePath, imageBuffer);
    
    // Create a Media object with information from the saved file
    const media =  await new Media({
      _id: uuidv4(),
      user: user.id,
      filename: imageFileName, // Use the generated filename
      mimetype:  mimeType,
      path: imagePath,
    }).save();
    
    await user.updateOne({profileImage: media._id}).exec();
    // await user.save();
    // Save the Media object to the database
    console.log('Saved media:');
    console.log('Saved media:', media);
   
  } catch (error) {
    console.error('Error saving image:', error);
    // Handle the error appropriately, e.g., return an error response
  }
  // Save the decoded image to the filesystem
 // await fs.promises.writeFile(imagePath, imageBuffer);

  // Update user's profile image path
 
  //user.profileImage = image;
  

  return user;
}

/* export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "error: " });
  }
}; */
//

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'error message' });
  }
};

// Delete account function
export const deleteAccount = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all posts by the user
    const delPost = await Post.deleteMany({ user: userId });
    console.log(delPost);

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error });
  }
};

/* export const deleteAccount = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error });
  }
}; */



