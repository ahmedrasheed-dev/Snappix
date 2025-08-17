import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  getSubscriptionStatus
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validateRequest.middleware.js";
import {
  channelIdParamValidator,
  subscriberIdParamValidator,
} from "../validators/subscription.validators.js";

const router = Router();

router.get("/status/:channelId", verifyJWT, channelIdParamValidator, getSubscriptionStatus )
router.post("/toggle/:channelId", verifyJWT, channelIdParamValidator, validate, toggleSubscription);

router.get("/:channelId", channelIdParamValidator, validate, getUserChannelSubscribers);

router.get("/channels/:subscriberId", subscriberIdParamValidator, validate, getSubscribedChannels);

export default router;
