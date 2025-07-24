const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");
 // 👈 already created
require("dotenv").config();

const UPLOADS_DIR = path.join(__dirname, "../uploads"); // local uploads path

// Helper to upload a file to Cloudinary
const uploadToCloudinary = async (filePath, filename) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "taskmanager_uploads",
    //  public_id: filename.split(".")[0], // optional: remove extension
    public_id: filename.split(".")[0].replace(/[^\w-]/g, "_"), // replaces invalid chars with underscore
  
    use_filename: true,
      unique_filename: false,
    });

    console.log(`✅ Uploaded: ${filename}`);
    console.log(`🌐 URL: ${result.secure_url}\n`);
    return result.secure_url;
  } catch (err) {
    console.error(`❌ Failed to upload ${filename}:`, err.message);
    return null;
  }
};

const migrate = async () => {
  console.log("📦 Starting migration...\n");

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log("❌ uploads folder not found.");
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  if (files.length === 0) {
    console.log("📂 uploads folder is empty.");
    return;
  }

  for (const filename of files) {
    const filePath = path.join(UPLOADS_DIR, filename);

    if (fs.statSync(filePath).isFile()) {
      await uploadToCloudinary(filePath, filename);
    }
  }

  console.log("🎉 Migration complete.");
};

migrate();
