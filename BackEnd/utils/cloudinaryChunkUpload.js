import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { actions } from "../constants.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file in 5MB chunks to Cloudinary
 * Emits progress via Socket.IO
 *
 * @param {string} filePath - path to local file
 * @param {string} socketId - socket.id of client
 * @param {object} io - socket.io server instance
 * @param {object} options - { resource_type: "video" | "image", folder: "..." }
 */

export async function uploadFileInChunks(filePath, socketId, io, options = {}) {
  const fileStat = fs.statSync(filePath);
  const totalBytes = fileStat.size;
  const CHUNK_SIZE = Number(process.env.VIDEO_UPLOAD_CHUNK_SIZE) || 5 * 1024 * 1024;

  const uploadId = `${Date.now()}-${path.basename(filePath)}`;
  let uploadedBytes = 0;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_chunked_stream(
      {
        ...options,
        resource_type: options.resource_type || "video",
        public_id: uploadId,
        chunk_size: CHUNK_SIZE,
        folder: options.folder || "uploads",
      },
      (error, result) => {
        if (error) {
          io.to(socketId).emit(actions.UPLOAD_ERROR, { message: error.message });
          return reject(error);
        }
        io.to(socketId).emit(actions.UPLOAD_COMPLETE, result);
        resolve(result);
      }
    );

    // Track progress manually
    const readStream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE });
    readStream.on("data", (chunk) => {
      uploadedBytes += chunk.length;
      const percent = Math.min(100, Math.round((uploadedBytes / totalBytes) * 100));

      io.to(socketId).emit(actions.UPLOAD_PROGRESS, {
        uploaded: uploadedBytes,
        total: totalBytes,
        percent,
      });

      uploadStream.write(chunk);
    });
    readStream.on("end", () => {
      uploadStream.end();
    });
    readStream.on("error", (err) => {
      io.to(socketId).emit(actions.UPLOAD_ERROR, { message: "Read stream error" });
      reject(err);
    });

  });
}
