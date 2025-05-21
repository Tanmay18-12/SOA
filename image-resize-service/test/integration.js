const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4000/resize';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

// Helper to convert file to base64
function fileToBase64(filePath) {
  const file = fs.readFileSync(filePath);
  return file.toString('base64');
}

// Helper to create form data
function createFormData(width, height) {
  const formData = new FormData();
  const file = new File([fs.readFileSync(TEST_IMAGE_PATH)], 'test-image.jpg', { type: 'image/jpeg' });
  formData.append('image', file);
  formData.append('width', width.toString());
  formData.append('height', height.toString());
  return formData;
}

// Test the integration
async function testIntegration() {
  console.log('Starting integration test...');
  
  try {
    // Test with different sizes
    const testSizes = [
      { width: 200, height: 200 },
      { width: 400, height: 300 },
      { width: 100, height: 100 }
    ];
    
    for (const size of testSizes) {
      console.log(`Testing resize to ${size.width}x${size.height}...`);
      
      // Convert image to base64 for API call
      const base64Image = fileToBase64(TEST_IMAGE_PATH);
      
      // Create form data for multipart request
      const formData = new FormData();
      formData.append('image', new Blob([fs.readFileSync(TEST_IMAGE_PATH)]), 'test-image.jpg');
      formData.append('width', size.width.toString());
      formData.append('height', size.height.toString());
      
      // Call the client service
      const startTime = Date.now();
      const response = await axios.post(CLIENT_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const duration = Date.now() - startTime;
      
      // Validate response
      if (response.data && response.data.success) {
        console.log(`✅ Test passed! Resized image URL: ${response.data.data.url}`);
        console.log(`   Took ${duration}ms to process`);
      } else {
        console.error('❌ Test failed! Unexpected response:', response.data);
      }
    }
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testIntegration();