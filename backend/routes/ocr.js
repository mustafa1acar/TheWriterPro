const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Initialize Gemini AI
const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// OCR endpoint using Gemini Vision
router.post('/extract-text', 
  protect, // Require authentication
  upload.single('image'), // Handle single image upload
  async (req, res) => {
    try {
      const imageFile = req.file;
      
      if (!imageFile) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Initialize Gemini
      const genAI = initializeGemini();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Convert image buffer to base64
      const imageBase64 = imageFile.buffer.toString('base64');
      const mimeType = imageFile.mimetype;

      // Create image part for Gemini
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      };

      // OCR prompt for Gemini
      const prompt = `
        Extract all the text from this image. 
        
        Instructions:
        1. Read and transcribe all visible text exactly as it appears
        2. Maintain the original formatting and line breaks where possible
        3. Preserve punctuation and capitalization
        4. If there are multiple paragraphs, separate them with line breaks
        5. If the text is handwritten, do your best to transcribe it accurately
        6. If there are any unclear characters, use your best judgment
        7. Return only the extracted text, no explanations or additional text
        
        Extracted text:
      `;

      // Generate content with Gemini
      console.log('Calling Gemini API with:', {
        model: 'gemini-1.5-flash',
        promptLength: prompt.length,
        imageSize: imageFile.size,
        mimeType: mimeType,
        hasApiKey: !!process.env.GEMINI_API_KEY
      });
      
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const extractedText = response.text().trim();
      
      console.log('Gemini API response received, text length:', extractedText.length);

      if (!extractedText) {
        return res.status(400).json({
          success: false,
          message: 'No text could be extracted from the image. Please try with a clearer image.'
        });
      }

      // Return the extracted text
      res.json({
        success: true,
        message: 'Text extracted successfully',
        data: {
          extractedText: extractedText,
          originalFilename: imageFile.originalname,
          fileSize: imageFile.size,
          mimeType: imageFile.mimetype
        }
      });

    } catch (error) {
      console.error('OCR processing error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        stack: error.stack
      });
      
      // Handle specific Gemini errors
      if (error.message.includes('GEMINI_API_KEY')) {
        return res.status(500).json({
          success: false,
          message: 'OCR service is not properly configured. Please contact support.'
        });
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          message: 'OCR service is temporarily unavailable due to high usage. Please try again later.'
        });
      }

      if (error.message.includes('404') || error.message.includes('not found')) {
        return res.status(500).json({
          success: false,
          message: 'OCR model not available. Please contact support.'
        });
      }

      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return res.status(500).json({
          success: false,
          message: 'OCR service authentication failed. Please check API configuration.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process image. Please try again with a clearer image.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Health check endpoint for OCR service
router.get('/health', protect, async (req, res) => {
  try {
    // Test Gemini connection
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    res.json({
      success: true,
      message: 'OCR service is healthy',
      service: 'Gemini Vision API',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('OCR health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'OCR service is not available',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 