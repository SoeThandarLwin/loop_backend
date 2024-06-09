// {  id: UUID,  user: User,  before_photos: Media[],  after_photos: Media[],  description: string,  winner: User,  bidders: User[]}
import { Schema } from 'mongoose';

export const postSchema = new Schema ({
    _id: {type: Schema.Types.UUID, required: true}, 
    user: { type: Schema.Types.UUID, ref: 'User'},
    before_photos: [{ type: Schema.Types.UUID, ref: 'Media'}],
    after_photos: [{ type: Schema.Types.UUID, ref: 'Media'}],
    description: String,
    winner: {type: Schema.Types.UUID, ref: 'User'},
    bidders: [{ type: Schema.Types.UUID, ref: 'User'}],
})

postSchema.methods.toJSON = function () {
    const postObject = this.toObject();
    postObject._id = this._id.toString();
    postObject.user = this.user.toString();
    return postObject;
}