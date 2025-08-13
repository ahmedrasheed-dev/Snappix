import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/toggle/:channelId", verifyJWT, toggleSubscription);

router.get("/:channelId", getUserChannelSubscribers);

router.get("/channels/:subscriberId", getSubscribedChannels);

export default router;
