const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const baseFolder = path.join(__dirname, "public");

function uploadRecursive(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.lstatSync(fullPath).isDirectory()) {
      uploadRecursive(fullPath);
    } else {
      const relativePath = path.relative(baseFolder, fullPath);
      const publicId = relativePath
        .replace(/\\/g, "/")
        .replace(/\.[^/.]+$/, "");

      // Check if file already exists in Cloudinary
      cloudinary.api
        .resource(publicId)
        .then(() => {
          console.log("⏭️ Already exists, skipping:", relativePath);
        })
        .catch((err) => {
          const status =
            err?.error?.http_code || err?.http_code || err?.statusCode;

          if (status === 404) {
            cloudinary.uploader
              .upload(fullPath, { public_id: publicId })
              .then((result) => {
                console.log(
                  "✅ Uploaded:",
                  relativePath,
                  "→",
                  result.secure_url
                );
              })
              .catch((uploadErr) => {
                console.error(
                  "❌ Upload failed:",
                  relativePath,
                  uploadErr.message
                );
              });
          } else {
            console.error(`❌ Unexpected error checking: ${relativePath}`);
            console.error(err.message || err.error?.message || err);
          }
        });
    }
  });
}

uploadRecursive(baseFolder);
