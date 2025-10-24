import serverless from "serverless-http";
import dbConnect from "./db/dbUtil.js";
import app from "./app.js"; 
import dotenv from 'dotenv';
dotenv.config();;  

export const handler = async (event, context) => {
  console.log('Lambda cold start', new Date().toISOString());

  try {
    await dbConnect();
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Database connection failed" }),
    };
  }

  return serverless(app)(event, context);
};

