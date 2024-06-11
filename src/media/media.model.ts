import { model } from "mongoose";
import { mediaSchema } from "./media.schema";

export const Media = model('Media', mediaSchema);