import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINRAY_CLOUD_NAME,
  api_key: process.env.CLOUDINRAY_API_KEY,
  api_secret: process.env.CLOUDINRAY_API_SECRET,
});

const uploadToCloudinary = async function (localFilePath) {
  if (localFilePath?.trim() == "") {
    return null;
  }

  // Always resolve the full path
  const fullPath = path.resolve(
    "public/temp",
    localFilePath
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(
      fullPath,
      {
        resource_type: "auto",
      }
    );
    fs.unlinkSync(fullPath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(fullPath);
    return null;
  }
};

export { uploadToCloudinary };
