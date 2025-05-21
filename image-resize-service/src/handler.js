const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { resizeImage } = require('./utils/image');
const { monitorHandler, recordImageSizes } = require('./utils/monitoring');
const config = require('./config');

// Initialize S3 client
const s3 = new AWS.S3();

/**
 * Lambda function to resize images
 * 
 * @param {Object} event - HTTP event from API Gateway
 * @returns {Object} - HTTP response
 */
const resizeImageHandler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate input
    if (!body.image) {
      return errorResponse(400, 'Missing image data');
    }
    
    // Decode base64 image
    const imageBuffer = Buffer.from(body.image, 'base64');
    
    // Get resize options
    const options = {
      width: body.width,
      height: body.height
    };
    
    // Process the image
    const resizedImageBuffer = await resizeImage(imageBuffer, options);
    
    // Record image sizes for monitoring
    await recordImageSizes(imageBuffer.length, resizedImageBuffer.length);
    
    // Generate unique filename
    const filename = `${uuidv4()}.${config.outputFormat}`;
    
    // Upload to S3
    await s3.putObject({
      Bucket: config.storageBucket,
      Key: filename,
      Body: resizedImageBuffer,
      ContentType: `image/${config.outputFormat}`
    }).promise();
    
    // Generate S3 URL
    const imageUrl = `https://${config.storageBucket}.s3.amazonaws.com/${filename}`;
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Image resized successfully',
        data: {
          url: imageUrl,
          width: options.width || config.defaultSizes.width,
          height: options.height || config.defaultSizes.height,
          format: config.outputFormat
        }
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, `Error processing image: ${error.message}`);
  }
};

/**
 * Helper function to create error responses
 */
function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: false,
      message
    })
  };
};

// Export the monitored handler
exports.resizeImage = monitorHandler(resizeImageHandler);