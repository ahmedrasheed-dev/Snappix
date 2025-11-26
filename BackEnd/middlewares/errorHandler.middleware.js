import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  console.log("ErrorHandler caught ApiError:", err.message);
  return res.status(500).json({
    success: false,
    message: err?.message,
    errors: [],
  });

  // .set({
  //   'Access-Control-Allow-Origin': 'http://snappix-frontend.s3-website.eu-north-1.amazonaws.com',
  //   'Access-Control-Allow-Credentials': 'true' 
  // })
};
