/**
 * Configuration parameters for the image resize service
 */
module.exports = {
  // S3 bucket for storing resized images
  storageBucket: process.env.STORAGE_BUCKET,
  
  // Default image sizes if not specified
  defaultSizes: {
    width: 300,
    height: 300
  },
  
  // Output image format
  outputFormat: 'jpeg',
  
  // Quality for JPEG compression (1-100)
  quality: 80
};