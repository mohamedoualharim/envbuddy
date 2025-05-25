const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only .env files or text files
    if (file.originalname.match(/\.(env|txt)$/) || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only .env or text files are allowed'), false);
    }
  }
});

// Middleware to parse env file content into variables
const parseEnvFile = (req, res, next) => {
  // If a file is uploaded, parse it
  if (req.file) {
    try {
      const content = req.file.buffer.toString('utf-8');
      const variables = {};
      const lines = content.split('\n');
      
      lines.forEach(line => {
        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('#')) return;
        
        const [key, ...valueParts] = line.split('=');
        if (key) {
          variables[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      // Add parsed variables to request body
      req.body.variables = variables;
      req.body.originalFileName = req.file.originalname;
    } catch (error) {
      return res.status(400).json({ 
        error: 'Failed to parse env file',
        message: error.message 
      });
    }
  }
  
  next();
};

module.exports = {
  upload,
  parseEnvFile
}; 