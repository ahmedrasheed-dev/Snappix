import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
dotenv.config({
  path: "./.env",
});
const app = express();

// Define allowed origins (NO trailing slashes here)
const ALLOWED_ORIGINS = [
  "http://localhost:5173", // Localhost Vite default
  "http://localhost:3000", // Localhost CRA default
  "http://snappix-frontend.s3-website.eu-north-1.amazonaws.com", // Production
  "https://dkkddb5r8mwn7.cloudfront.net", // Cloudfront URL for frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    // 2. Normalize the incoming origin (Remove trailing slash if present)
    const normalizedOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;

    // 3. Check if the normalized origin is in our allowed list
    if (ALLOWED_ORIGINS.includes(normalizedOrigin)) {
      // 4. Send back the SPECIFIC origin that was requested (normalized)
      // This tricks the browser into seeing an exact match.
      callback(null, normalizedOrigin);
    } else {
      console.error(`CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Vital for cookies/JWT
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
// 3. Apply the CORS middleware globally
app.use(cors(corsOptions));

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import`
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use(errorHandler);
export default app;
