import { Router } from "express";
import { createTweet, getUserTweets, updateTweet, deleteTweet } from '../controllers/tweet.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getUserTweets);
router.post("/", verifyJWT, createTweet);
router.patch("/:tweetId", verifyJWT, updateTweet);
router.delete("/:tweetId", verifyJWT, deleteTweet);

export default router;
