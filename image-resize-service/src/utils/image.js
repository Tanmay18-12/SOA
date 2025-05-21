const sharp = require('sharp');
const config = require('../config');

/**
 * Resize an image using the Sharp library
 * 
 * @param {Buffer} imageBuffer - The original image buffer
 * @param {Object} options - Resize options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height
 * @returns {Promise<Buffer>} - Resized image buffer
 */
async function resizeImage(imageBuffer, options = {}) {
  const width = options.width || config.defaultSizes.width;
  const height = options.height || config.defaultSizes.height;
  
  console.log(`Resizing image to ${width}x${height}`);
  
  try {
    return await sharp(imageBuffer)
      .resize({
        width,
        height,
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat(config.outputFormat, { quality: config.quality })
      .toBuffer();
  } catch (error) {
    console.error('Error resizing image:', error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

module.exports = {
  resizeImage
};