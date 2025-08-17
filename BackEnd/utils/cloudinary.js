import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError.js";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async function (localFilePath) {
  try {
    const uploadResult = await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: "auto",
      }
    );
    // fs.unlinkSync(localFilePath);

    // console.log("upload result: ", uploadResult);
    //     upload result:  {
    //   asset_id: 'd1ce7a00f08056318a59f97c4b7fe7bb',
    //   public_id: 'qkjnsa92mqrf4gyw9sar',
    //   version: 1754212931,
    //   version_id: 'b1b05903c581132ef331a5bd06f1dc23',
    //   signature: '706aa7efd3ac92234a480bd520b9cac76e5d787a',
    //   width: 225,
    //   height: 225,
    //   format: 'jpg',
    //   resource_type: 'image',
    //   created_at: '2025-08-03T09:22:11Z',
    //   tags: [],
    //   bytes: 7402,
    //   type: 'upload',
    //   etag: 'ccc6915d01fa9dd1566693c985e8d6ef',
    //   placeholder: false,
    //   url: 'http://res.cloudinary.com/dvghuhy2x/image/upload/v1754212931/qkjnsa92mqrf4gyw9sar.jpg',
    //   secure_url: 'https://res.cloudinary.com/dvghuhy2x/image/upload/v1754212931/qkjnsa92mqrf4gyw9sar.jpg',
    //   asset_folder: '',
    //   display_name: 'qkjnsa92mqrf4gyw9sar',
    //   original_filename: 'images'
    // }
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    throw new ApiError(
      500,
      "Something went wrong while uploading image to cloudinary"
    );
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while deleting image from cloudinary"
    );
  }
};

function extractPublicId(url) {
  const parts = url.split("/");
  const filename = parts[parts.length - 1]; // hzolidxtxqijwdwzcvhq.jpg
  const publicId = filename.split(".")[0]; // hzolidxtxqijwdwzcvhq
  return publicId;
}

export { uploadToCloudinary, deleteFromCloudinary, extractPublicId };
