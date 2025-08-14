import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWTOptional = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
  if (!token) return next(); 

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded._id).select("-password");
  } catch (error) {

  }
  next();
});
