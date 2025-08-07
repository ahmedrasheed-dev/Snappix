import mongoose from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new mongoose.Schema({
  //will be stored in cloudinary
  videoFile: {
    type: String,
    required: [true, "Video file is required"],
  },
  thumbnail: {
    type: String,
    required: [true, "Thumbnail image is required"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "Owner is required"],
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [3, "Title must be at least 3 characters long"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"],
  },
  duration: {
    type: Number,
    required: [true, "Duration is required"],
    min: [0, "Duration cannot be negative"],
  },
  views: {
    type: Number,
    default: 0,
    min: [0, "Views cannot be negative"],
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
},{timestamps: true});

VideoSchema.plugin(mongoosePaginate);
export const Video = mongoose.model("video", VideoSchema);
