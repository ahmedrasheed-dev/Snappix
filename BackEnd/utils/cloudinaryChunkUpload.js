import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { upload } from "../middlewares/multer.middleware";
import { actions } from "../constants";

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
  const CHUNK_SIZE = process.env.VIDEO_UPLOAD_CHUNK_SIZE || 5 * 1024 * 1024;

  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
  const uploadId = `${Date.now()}-${path.basename(filePath)}`;

  let uploadedBytes = 0;
  let partNumber = 0;
  let uploadResult = null;

  const readStream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE });

  for await (const chunk of readStream) {
    partNumber++;
    try {
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_chunked_stream(
          {
            ...options,
            resource_type: options.resource_type || "video",
            public_id: uploadId,
            chunk_size: CHUNK_SIZE,
          },
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(chunk);

        uploadedBytes += chunk.length;

        const percent = Math.min(100, Math.round((uploadedBytes / totalBytes) * 100));

        io.to(socketId).emit(actions.UPLOAD_PROGRESS, {
         uploaded: uploadedBytes,
         total: totalBytes,
         percent,
         partNumber,
         totalChunks,
        });
      });
    } catch (error) {

        
    }
  }
}
