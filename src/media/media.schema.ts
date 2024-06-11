import { Schema } from 'mongoose';

export const mediaSchema = new Schema({
  _id: { type: Schema.Types.UUID, required: true },
  user: { type: Schema.Types.UUID, ref: 'User' },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  path: { type: String, required: true },
});

mediaSchema.methods.toJSON = function () {
  const mediaObject = this.toObject();
  mediaObject._id = this._id.toString();
  mediaObject.user = this.user.toString();
  return mediaObject;
};
