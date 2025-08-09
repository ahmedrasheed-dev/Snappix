import {
  sendEmailVerifyOtp,
  verifyEmailOtp,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/send-verification-code", verifyJWT, sendEmailVerifyOtp);
router.post("/verify-email", verifyJWT, verifyEmailOtp);
router.post("/send-password-reset-code", verifyJWT, sendPasswordResetOtp);
router.post("/reset-password", verifyJWT, verifyPasswordResetOtp);

export default router;
