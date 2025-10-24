import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

let isConnected = false; // This variable is used to track the connection status

const dbConnect = async () => {
  // If the connection is already established, just return
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    console.log("Connecting to DB...");
    const start = Date.now();
    console.log("connection string: ",process.env.MONGODB_URI)
    // Establish a new connection to the database if not connected
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    // Once connected, set isConnected to true to avoid reconnecting on subsequent calls
    isConnected = mongoose.connection.readyState === 1; // 1 indicates a connected state

    const end = Date.now();
    console.log(`DB connected in ${end - start}ms`);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Database connection failed");
  }
};

export default dbConnect;
