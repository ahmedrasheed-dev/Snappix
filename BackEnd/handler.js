import serverless from "serverless-http";
import dbConnect from "./db/dbUtil.js";
import app from "./app.js"; 
import dotenv from 'dotenv';

dotenv.config();

// Initialize serverless handler outside the main function for cold start performance
const lambdaHandler = serverless(app);

export const handler = async (event, context) => {
    console.log('Lambda cold start', new Date().toISOString());
    
    // --- Database connection check ---
    try {
        await dbConnect();
    } catch (error) {
        console.error("Database connection error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Database connection failed" }),
        };
    }
    
    // Process the request through Express. 
    // ALL CORS HANDLING MUST NOW BE IN app.js OR API GATEWAY.
    return lambdaHandler(event, context);
};