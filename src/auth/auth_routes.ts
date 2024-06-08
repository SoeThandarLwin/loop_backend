import express from 'express';
import { IUser } from './auth_model';
import { loginUser, registerUser, followUser, unfollowUser } from './auth_controller';
import auth, { CustomRequest } from './auth';

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

// Logout user from all devices
router.post('/logoutall', auth, async (req: CustomRequest, res) => {
  if (req.user) {
    req.user.tokens = [];
    await req.user.save();
  }
  return res.status(200).json({
    message: 'User logged out from all devices successfully.',
  });
});

// Follow user
router.post('/follow', auth, async (req: CustomRequest, res) => {
  const { followeeId } = req.body;
  const result = await followUser(req.user?._id as string, followeeId);
  if (result.error) {
    return res.status(400).json(result);
  }
  return res.status(200).json(result);
});

// Unfollow user
router.post('/unfollow', auth, async (req: CustomRequest, res) => {
  const { followeeId } = req.body;
  const result = await unfollowUser(req.user?._id as string, followeeId);
  if (result.error) {
    return res.status(400).json(result);
  }
  return res.status(200).json(result);
});

export default router;

