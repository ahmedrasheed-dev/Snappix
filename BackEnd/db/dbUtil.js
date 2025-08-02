import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI,
      {}
    );
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default dbConnect;