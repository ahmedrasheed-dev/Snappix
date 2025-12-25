import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validateRequest.middleware.js";
import {
  createTweetValidator,
  tweetIdParamValidator,
  updateTweetValidator,
} from "../validators/tweet.validators.js";

const router = Router();

router.get("/", getUserTweets);

router.post("/", verifyJWT, createTweetValidator, validate, createTweet);

router.patch("/:tweetId", verifyJWT, updateTweetValidator, validate, updateTweet);

router.delete("/:tweetId", verifyJWT, tweetIdParamValidator, validate, deleteTweet);

export default router;
