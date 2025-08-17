import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_COMPASS_URI}/${DB_NAME}`
    );
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default dbConnect;
