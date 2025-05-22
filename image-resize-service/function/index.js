const AWS = require('aws-sdk');
const sharp = require('sharp');

// Initialize the S3 client
const s3 = new AWS.S3();

exports.handler = async (event) => {
    try {
        // Parse the incoming event
        const body = JSON.parse(event.body || '{}');
        
        // Get parameters from the request
        const { bucket, key, width, height, outputBucket, outputKey } = body;
        
        if (!bucket || !key || !width || !height || !outputBucket || !outputKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required parameters. Please provide bucket, key, width, height, outputBucket, and outputKey.'
                })
            };
        }
        
        // Get the image from S3
        const imageData = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();
        
        // Resize the image using Sharp
        const resizedImageBuffer = await sharp(imageData.Body)
            .resize(parseInt(width), parseInt(height))
            .toBuffer();
        
        // Upload the resized image back to S3
        await s3.putObject({
            Bucket: outputBucket,
            Key: outputKey,
            Body: resizedImageBuffer,
            ContentType: 'image/jpeg' // Adjust based on your needs
        }).promise();
        
        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Image resized successfully',
                source: {
                    bucket,
                    key
                },
                destination: {
                    bucket: outputBucket,
                    key: outputKey
                },
                dimensions: {
                    width,
                    height
                }
            })
        };
    } catch (error) {
        console.error('Error processing image:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error resizing image',
                error: error.message
            })
        };
    }
};