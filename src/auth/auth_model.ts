import { Schema, model, Document, Model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  _id: string| Schema.Types.UUID;
  username: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

export interface IUserMethods {
  generateAuthToken(): Promise<string>;
  toJSON(): IUser;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByCredentials(email: string, password: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  _id: {type: Schema.Types.UUID, required : true},
  username: { type: String, required: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  profileImage: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: true },
  tokens: [{ token: { type: String, required: true } }],
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ id: user._id?.toString(), username: user.username }, process.env.JWT_KEY as string);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this as IUser;
  const userObject = user.toObject();
  userObject._id = this._id.toString();
  delete userObject.profileImage;
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }
  return user;
};

const User = model<IUser, UserModel>('User', userSchema);

export default User;
