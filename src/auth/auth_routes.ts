import express from 'express';
import { IUser } from './auth_model';
import { loginUser, registerUser, checkEmail, updatePassword, editProfile, getUserById, editProfileImage, changePassword, deleteAccount} from './auth_controller';
//import auth, { CustomRequest } from './auth';
import User from './auth_model';
import authMiddleware from '../middlewares/auth.middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/register', async (req, res) => {
  const userData: Partial<IUser> = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  const registeredUser = await registerUser(userData);
  if (registeredUser.error) {
    return res.status(400).json({
      error: registeredUser.error,
    });
  }
  return res.status(201).json(registeredUser);
});

router.post('/login', async (req, res) => {
  const userData: Partial<IUser> = {
    email: req.body.email,
    password: req.body.password,
  };
  const loggedInUser = await loginUser(userData);
  if (loggedInUser.error) {
    return res.status(400).json({
      error: loggedInUser.error,
    });
  }
  return res.status(200).json(loggedInUser);
});

router.post('/checkEmail', async (req, res) => {
  const { email } = req.body;
  const existingUser = await checkEmail(email);
  return res.status(200).json(existingUser);
});

// Fetch logged in user
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  //console.log(req.user);
  return res.status(200).json({
    user: req.user,
  });
});
const tokenBlacklist = new Set();
// Logout user
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  if (!req.headers || !req.headers.authorization) {
    return res.status(400).send('No authorization header provided');
  }

  const authHeader = req.headers.authorization;
  if (!authHeader.startsWith('Bearer')) {
    return res.status(400).send('Invalid authorization header format');
  }

  const token = authHeader.substring(7);
  tokenBlacklist.add(token);
  
  return res.status(200).json({
    message: 'Logged out successfully',
  });

});


// Update password
router.put('/updatePassword',async (req: Request, res: Response) => {
  const {email, password} = req.body;
  const user = await updatePassword(email, password);
  if (!user) {
    return res.status(400).json({
      error: 'User not found.',
    });
  }
  return res.status(200).json({
    message: 'Password updated successfully.',
  });
});

// Edit profile
router.put('/editProfile', async (req: Request, res: Response) => {
  const {firstName, lastName, username, email } = req.body;
  const user = await editProfile(firstName, lastName, username, email);
  if (!user) {
    return res.status(400).json({
      error: 'User not found.',
    });
  }
  return res.status(200).json({
    message: 'Profile updated successfully.',
  })
});

//get user by id 
router.get('/getUserById/:id', async (req, res) => {
  const user = await getUserById(req.params.id);
  return res.status(200).json(user);
});

//uplaod profile image
router.put('/editProfileImage', async (req, res) => {
  const { image, userId, mimeType } = req.body;
  const user = await editProfileImage(image, userId, mimeType);
  if (!user) {
    return res.status(400).json({
      error: 'User not found.',
    });
  }
  return res.status(200).json({
    message: 'true',
  });
});

//get users
router.get('/users', async (req, res) => {
  const users = await User.find();
  return res.status(200).json(users);
});

//change Password
router.put('/changePassword', async (req: Request, res: Response) => {
  const {email, currentPassword, newPassword} = req.body;
  const user = await changePassword(email, currentPassword, newPassword);
  //json parse user
  //const msg = user['error'];
  //console.log(user);
  //console.log('auth_routes');
  if(user == 'Wrong Password'){
    return res.status(400).json({message : 'false'});
  }
  else if(user == "required"){
    return res.status(400).json({message : 'false'});
  }
  return res.status(200).json({message : 'true'});
  // if (!user) {
  //   return res.status(400).json({
  //     error: 'User not found.',
  //   });
  // }
  // return res.status(200).json({
  //   message: 'Password updated successfully.',
  // });
});

router.delete('/deleteAccount/:userId', deleteAccount);
export default router;


