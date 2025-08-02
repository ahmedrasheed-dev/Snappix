import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINRAY_CLOUD_NAME,
  api_key: process.env.CLOUDINRAY_API_KEY,
  api_secret: process.env.CLOUDINRAY_API_SECRET,
});

const uploadToCloudinary = async function (localFilePath) {
  if (localFilePath?.trim() == "") {
    return null;
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: "auto",
      }
    );
    //delete file from db after saving
    fs.unlinkSync(localFilePath);

    return uploadResult.url;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export {uploadToCloudinary}