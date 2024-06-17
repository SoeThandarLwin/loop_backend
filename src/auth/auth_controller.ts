import User from './auth_model';
import { IUser } from './auth_model';
import { v4 as uuidv4 } from "uuid";

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

export async function changePw (password: string) {
  const user = await User.findOne({password});
  if (!user) {
    return {
      error: 'Wrong Current Password',
    };
  }
  user.password = password;
  await user.save();
  return user;
};

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





