const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Create Express app
const app = express();
const port = process.env.PORT || 4000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Serverless function URL
const RESIZE_SERVICE_URL = process.env.RESIZE_SERVICE_URL || 'http://localhost:3000/resize';

// Serve static HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Image Resize Service</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        form { margin-bottom: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        #result { margin-top: 20px; }
        img { max-width: 100%; border: 1px solid #ddd; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>Image Resize Service</h1>
      <form id="upload-form" enctype="multipart/form-data">
        <div>
          <label for="image">Select image:</label>
          <input type="file" id="image" name="image" accept="image/*" required>
        </div>
        <div style="margin-top: 10px;">
          <label for="width">Width:</label>
          <input type="number" id="width" name="width" value="300" min="1" max="2000">
          
          <label for="height" style="margin-left: 20px;">Height:</label>
          <input type="number" id="height" name="height" value="300" min="1" max="2000">
        </div>
        <button type="submit" style="margin-top: 15px;">Resize Image</button>
      </form>
      
      <div id="result">
        <div id="loading" style="display: none;">Processing...</div>
        <div id="original" style="display: none;">
          <h3>Original Image</h3>
          <img id="original-img" src="">
        </div>
        <div id="resized" style="display: none;">
          <h3>Resized Image</h3>
          <img id="resized-img" src="">
          <p id="resize-details"></p>
        </div>
      </div>
      
      <script>
        document.getElementById('upload-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const fileInput = document.getElementById('image');
          const width = document.getElementById('width').value;
          const height = document.getElementById('height').value;
          
          if (!fileInput.files[0]) {
            alert('Please select an image file');
            return;
          }
          
          // Show loading
          document.getElementById('loading').style.display = 'block';
          document.getElementById('original').style.display = 'none';
          document.getElementById('resized').style.display = 'none';
          
          const formData = new FormData();
          formData.append('image', fileInput.files[0]);
          formData.append('width', width);
          formData.append('height', height);
          
          try {
            const response = await fetch('/resize', {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) {
              throw new Error('Server error');
            }
            
            const result = await response.json();
            
            // Show original image
            const reader = new FileReader();
            reader.onload = (e) => {
              document.getElementById('original-img').src = e.target.result;
              document.getElementById('original').style.display = 'block';
            };
            reader.readAsDataURL(fileInput.files[0]);
            
            // Show resized image
            document.getElementById('resized-img').src = result.data.url;
            document.getElementById('resize-details').textContent = 
              \`Resized to \${result.data.width}x\${result.data.height} (\${result.data.format})\`;
            document.getElementById('resized').style.display = 'block';
          } catch (error) {
            alert('Error: ' + error.message);
          } finally {
            document.getElementById('loading').style.display = 'none';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Endpoint to handle image resizing request
app.post('/resize', upload.single('image'), async (req, res) => {
  try {
    // Read the uploaded file
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Delete the temporary file
    fs.unlinkSync(imagePath);
    
    // Call the serverless function
    const response = await axios.post(RESIZE_SERVICE_URL, {
      image: base64Image,
      width: parseInt(req.body.width) || undefined,
      height: parseInt(req.body.height) || undefined
    });
    
    // Return the response from the serverless function
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing image',
      error: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Client application running at http://localhost:${port}`);
  console.log(`Using resize service at: ${RESIZE_SERVICE_URL}`);
});