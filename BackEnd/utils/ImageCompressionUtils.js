import sharp from "sharp";
export const imageComp = async function compressAndResizeImage(
  inputImagePath,
  outputImagePath,
  quality = 80,
  resizeWidth = 800
) {
  try {
    await sharp(inputImagePath)
      .resize(resizeWidth) // Resize the image to a new width
      .jpeg({ quality: quality }) // Compress as a JPEG with specified quality
      .toFile(outputImagePath); // Save the compressed image to a file

    console.log(`Image compressed and saved to ${outputImagePath}`);
  } catch (error) {
    console.error("Error during image compression:", error);
    throw error;
  }
}
