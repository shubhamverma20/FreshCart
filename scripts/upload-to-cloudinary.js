const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drscamscp',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGES_DIR = path.join(__dirname, '../frontend/assets/images');
const CLOUDINARY_FOLDER = 'FreshCart_Products';

async function uploadImages() {
  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      console.error(`Images directory not found: ${IMAGES_DIR}`);
      process.exit(1);
    }

    const files = fs.readdirSync(IMAGES_DIR);
    console.log(`Found ${files.length} files to upload.`);

    for (const file of files) {
      const filePath = path.join(IMAGES_DIR, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const ext = path.extname(file);
        const nameWithoutExt = path.basename(file, ext);
        
        console.log(`Uploading ${file}...`);
        
        // Upload with options to preserve original name as public ID
        const result = await cloudinary.uploader.upload(filePath, {
          folder: CLOUDINARY_FOLDER,
          public_id: nameWithoutExt,
          use_filename: true,
          unique_filename: false,
          overwrite: true
        });

        console.log(`Successfully uploaded: ${file} -> URL: ${result.secure_url}`);
      }
    }

    console.log('\nAll uploads completed successfully!');
  } catch (error) {
    console.error('Error uploading images:', error);
    process.exit(1);
  }
}

uploadImages();
