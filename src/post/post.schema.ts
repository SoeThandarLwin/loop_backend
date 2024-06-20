// {  id: UUID,  user: User,  before_photos: Media[],  after_photos: Media[],  description: string,  winner: User,  bidders: User[]}
import { Schema } from 'mongoose';

export const postSchema = new Schema ({
    _id: {type: Schema.Types.UUID, required: true}, 
    user: { type: Schema.Types.UUID, ref: 'User'},
    artist_post: Boolean,
    name: String,
    price: String,
    original_photo: { type: Schema.Types.UUID, ref: 'Media', required: true},
    reference_photo: { type: Schema.Types.UUID, ref: 'Media', required: true},
    description: String,
    show_post: { type: Boolean, default: true }
})

postSchema.methods.toJSON = function () {
    const postObject = this.toObject();
    postObject._id = this._id.toString();
    postObject.user = this.user.toString();
    postObject.original_photo = this.original_photo.toString();
    postObject.reference_photo = this.reference_photo.toString();
    return postObject;
}