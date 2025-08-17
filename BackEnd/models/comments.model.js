import mongoose from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: [3, "Comment must be at least 3 characters long"],
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "video",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    //used for nested replies/comments
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, //for top level comments parent is null
    },
  },
  { timestamps: true }
);
commentSchema.plugin(mongoosePaginate);
export const Comment = mongoose.model("comment", commentSchema);
