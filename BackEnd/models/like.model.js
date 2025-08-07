import mongoose, { Mongoose } from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = mongoose.Schema(
  {
    comment: {
      type: Mongoose.Schema.types.ObjectId,
      ref: "comment",
    },
    video: {
      type: Mongoose.Schema.types.ObjectId,
      ref: "video",
    },
    likedBy: {
      type: Mongoose.Schema.types.ObjectId,
      ref: "user",
    },
    tweets: {
      type: Mongoose.Schema.types.ObjectId,
      ref: "tweet",
    },
  },
  { timestamps: true }
);
likeSchema.plugin(mongoosePaginate);

export const Like = mongoose.model("like", likeSchema);
