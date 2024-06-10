// {  id: UUID,  user: User,  before_photos: Media[],  after_photos: Media[],  description: string,  winner: User,  bidders: User[]}
import { Schema } from 'mongoose';
import User from '../auth/auth_model';

export const postSchema = new Schema ({
    _id: {type: Schema.Types.UUID, required: true}, 
    user: { type: Schema.Types.UUID, ref: 'User'},
    original_photo: { type: Schema.Types.UUID, ref: 'Media', required: true},
    after_photo: { type: Schema.Types.UUID, ref: 'Media'},
    reference_photo: { type: Schema.Types.UUID, ref: 'Media', required: true},
    description: String,
    winner: {type: Schema.Types.UUID, ref: 'User'},
    bidders: [{ type: Schema.Types.UUID, ref: 'User'}],
})

postSchema.methods.toJSON = function () {
    const postObject = this.toObject();
    postObject._id = this._id.toString();
    postObject.user = this.user.toString();
    postObject.original_photo = this.original_photo.toString();
    postObject.reference_photo = this.reference_photo.toString();
    if (this.winner) {
        postObject.winner = this.winner.toString();
    }
    postObject.bidders = this.bidders.map((bidder: typeof User) => bidder.toString())
    return postObject;
}