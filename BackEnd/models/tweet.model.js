import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            minlength: [3, "Tweet must be at least 3 characters long"],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
    },
    { timestamps: true }
);
export const Tweet = mongoose.model("tweet", tweetSchema);