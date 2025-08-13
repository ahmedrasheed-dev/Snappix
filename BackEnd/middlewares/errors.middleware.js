import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"; 
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'; 

const errorMiddleware = (err, req, res, next) => {
  console.error("Caught by Error Middleware:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } 
  else if (err instanceof TokenExpiredError) {
    statusCode = 401; // Unauthorized
    message = "Access token expired. Please refresh your session.";
    errors = [];
  } 
  else if (err instanceof JsonWebTokenError) {
    // Handle other JWT errors (e.g., malformed token, invalid signature)
    statusCode = 401; // Unauthorized
    message = "Invalid access token. Please log in again.";
    errors = [];
  } 
  else if (err instanceof mongoose.Error.ValidationError) {
    // Handle Mongoose validation errors
    statusCode = 400; // Bad Request
    message = "Validation failed";
    errors = Object.values(err.errors).map(error => error.message);
  } 
  else if (err.name === "CastError" && err.kind === "ObjectId") {
    // Handle Mongoose CastError (invalid ObjectId format)
    statusCode = 400;
    message = `Invalid ID format for ${err.path}: ${err.value}`;
    errors = [];
  }
  else {
    statusCode = 500;
    message = "An unexpected server error occurred.";
    errors = [];
  }

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      null,
      message,
      errors
    )
  );
};

export { errorMiddleware };
