// {  id: UUID,  user: User,  before_photos: Media[],  after_photos: Media[],  description: string,  winner: User,  bidders: User[]}
import { Schema } from 'mongoose';

export const postSchema = new Schema ({
    _id: Schema.Types.UUID,
    user: { type: Schema.Types.UUID, ref: 'User'},
    before_photos: [{ type: Schema.Types.UUID, ref: 'Media'}],
    after_photos: [{ type: Schema.Types.UUID, ref: 'Media'}],
    description: String,
    winner: {type: Schema.Types.UUID, ref: 'User'},
    bidders: [{ type: Schema.Types.UUID, ref: 'User'}],
})