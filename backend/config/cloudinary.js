import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

const uploadOnCloudinary = async (file, resourceType = 'auto', options = {}) => {
    try {
      cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const uploadOptions = {
        resource_type: resourceType,
        timeout: 120000,
        ...options
      };

      const result = await cloudinary.uploader.upload(file, uploadOptions);
      fs.unlinkSync(file);

      return result.secure_url
    } catch (error) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
      console.log('Cloudinary upload error:', error);
      throw error;
    }
   
}

export default uploadOnCloudinary

// Helper function specifically for reel uploads with 2-minute duration limit
export const uploadReelVideo = async (file) => {
  try {
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'video',
      timeout: 300000, // 5 minutes timeout for large files
      chunk_size: 6000000, // 6MB chunks for large file uploads
      // Eager transformation to trim video to 120 seconds (2 minutes)
      eager: [
        { 
          duration: '120',  // Trim to first 120 seconds
          format: 'mp4',    // Ensure consistent format
          quality: 'auto'   // Optimize quality
        }
      ],
      eager_async: false  // Wait for transformation to complete
    });
    
    // Delete file after upload
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (unlinkError) {
      console.log('Warning: Could not delete temp file:', unlinkError.message);
    }

    // Return the transformed (trimmed) video URL if available, otherwise original
    return result.eager && result.eager[0] ? result.eager[0].secure_url : result.secure_url;
  } catch (error) {
    // Try to delete temp file on error
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (unlinkError) {
      console.log('Warning: Could not delete temp file:', unlinkError.message);
    }
    console.log('Cloudinary reel video upload error:', error);
    throw error;
  }
}