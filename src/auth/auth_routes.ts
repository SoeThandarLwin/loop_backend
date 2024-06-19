import express from 'express';
import { IUser } from './auth_model';
import { loginUser, registerUser, checkEmail, updatePassword, editProfile, getUserById, editProfileImage} from './auth_controller';
import auth, { CustomRequest } from './auth';
import User from './auth_model';

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
router.get('/me', auth, async (req: CustomRequest, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

// Logout user
router.post('/logout', auth, async (req: CustomRequest, res) => {
  try {
    if (req.user) {
      req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token;
      });
      await req.user.save();

      return res.status(200).json({
        message: 'User logged out successfully.',
      });
    } else {
      return res.status(400).json({
        error: 'User not found.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Server error.',
    });
  }
});


// Update password
router.put('/updatePassword', async (req: CustomRequest, res) => {
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
router.put('/editProfile', async(req: CustomRequest, res) => {
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
  console.log('hello');
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

export default router;


