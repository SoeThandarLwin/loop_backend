import { Request, Response, NextFunction } from 'express';
import multer from 'multer'; // Example usage of multer for file uploads
import path from 'path';
import User from './auth_model';
import { IUser } from './auth_model';
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import fs from 'fs';
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads/profiles'); // Directory where uploaded files will be stored
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, uuidv4() + ext); // Generate unique filename using UUID
//   },
// });

// const upload = multer({ storage });

// // Route for uploading profile photo
// export const uploadProfilePhoto = async (req: Request, res: Response) => {
//   try {
//     upload.single('file')(req, res, async function (err: any) {
//       if (err instanceof multer.MulterError) {
//         // A Multer error occurred when uploading.
//         console.error('Multer error:', err);
//         return res.status(500).json({ error: 'Error uploading file' });
//       } else if (err) {
//         // An unknown error occurred when uploading.
//         console.error('Unknown error:', err);
//         return res.status(500).json({ error: 'Unknown error uploading file' });
//       }

//       // File uploaded successfully.
//       const file = req.file;
//       if (!file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//       }

//       // Update user profile image URL in the database
//       //const userId = req.params.userId; // Adjust this based on your route and userId handling
//       const user = await User.findById(req.params.userId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//       // Assuming you've added profileImage field in your User model
//       const profileImageUrl = `/uploads/profiles/${file.filename}`; // Store relative path or full URL as per your setup
//       user.profileImage = profileImageUrl;
//       await user.save();

//       return res.status(200).json({ message: 'Profile photo uploaded successfully', url: profileImageUrl });
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };
//upload profile photo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fss = fs.promises;
export const uploadProfilePhoto = async(req : Request, res : Response) => {
  console.log(req);
  console.log('hello prifole');
}
// Check if email exists
export const checkEmail = async (email: string) => {
  const existingUser = await User.findOne({ email });
  return !!existingUser;
}

// Register a new user
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

// Login user
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

// Edit user profile
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

// Change user password
export async function updatePassword(email: string, password: string){
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  user.password = password;
  await user.save();
  return user;
}

// Get user by ID
export async function getUserById(userId: string) {
  const user = await User.findOne({ _id: userId });
  return user;
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "error: " });
  }
};

// Exporting the User model for use in other parts of the application
export default User;
