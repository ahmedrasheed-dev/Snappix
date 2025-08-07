import mongoose from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "video",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tweet",
    },
  },
  { timestamps: true }
);
likeSchema.plugin(mongoosePaginate);

export const Like = mongoose.model("like", likeSchema);
