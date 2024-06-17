import { Schema } from 'mongoose';

export const messageSchema = new Schema({
  _id: { type: Schema.Types.UUID, required: true },
  from: {type: Schema.Types.UUID, ref: 'User'},
  to: {type: Schema.Types.UUID, ref: 'User'},
  type: {type: String, required: true},
  content: {type: String},
  media: {type: Schema.Types.UUID, ref: 'Media'},
  timestamp: { type : Date, default: Date.now }
});

messageSchema.methods.toJSON = function () {
  const messageObject = this.toObject();
  messageObject._id = this._id.toString();
  messageObject.from = this.from.toString();
  messageObject.to = this.to.toString();
  messageObject.media = this.media.toString();
  return messageObject;
};