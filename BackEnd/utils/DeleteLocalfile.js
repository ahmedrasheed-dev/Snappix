import fs from "fs/promises";
import asyncHandler from "../utils/asyncHandler.js";

export const deleteLocalFile = asyncHandler(async (filePath) => {
  if (!filePath || typeof filePath !== "string") {
    console.warn("Invalid file path provided for deletion.");
    return;
  }

  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`File deleted successfully: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file at ${filePath}:`, error.message);
  }
});