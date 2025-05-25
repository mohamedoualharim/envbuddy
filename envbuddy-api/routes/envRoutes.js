const express = require('express');
const multer = require('multer');
const router = express.Router();
const envController = require('../controllers/envController');
const envPushController = require('../controllers/envPushController');
const { upload: envParserUpload, parseEnvFile } = require('../middleware/envParser');
const { authenticateUser } = require('../middleware/auth');

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

// Routes
// Protected routes - require authentication
// Upload a new .env file
router.post('/upload', authenticateUser, upload.single('envFile'), envController.uploadEnvFile);

// Push individual environment variables (supports both JSON body and file upload)
router.post('/push', authenticateUser, envParserUpload.single('envFile'), parseEnvFile, envPushController.pushEnvVars);

// Get environment variables for a project
router.get('/vars/:projectId/:environment?', authenticateUser, envPushController.getEnvVars);

// Export environment variables as .env file
router.get('/export/:projectId/:environment', authenticateUser, envPushController.exportEnvVars);

// Get all env files for a project
router.get('/project/:projectId', authenticateUser, envController.getEnvFilesByProject);

// Get a specific env file
router.get('/:id', authenticateUser, envController.getEnvFile);

// Update an env file
router.put('/:id', authenticateUser, upload.single('envFile'), envController.updateEnvFile);

// Delete an env file
router.delete('/:id', authenticateUser, envController.deleteEnvFile);

// Download env file content
router.get('/:id/download', authenticateUser, envController.downloadEnvFile);

module.exports = router; 