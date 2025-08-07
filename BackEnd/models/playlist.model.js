import mongoose from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    description: {
      type: String,
      required: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "video",
      },
    ],
  },
  { timestamps: true }
);

likeSchema.plugin(playlistSchema);

export const Playlist = mongoose.model("playlist", playlistSchema);
