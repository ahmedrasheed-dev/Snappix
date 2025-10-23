import serverless from "serverless-http";
import dbConnect from "./db/dbUtil.js";
import app from "./app.js";

// Ensure DB connection before handling any request
await dbConnect();

export const handler = serverless(app);
