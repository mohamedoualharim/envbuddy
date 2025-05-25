const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Routes (all protected by authentication)
// Create a new project
router.post('/', projectController.createProject);

// Get all projects
router.get('/', projectController.getProjects);

// Get a project by ID
router.get('/:id', projectController.getProject);

// Get a project by name
router.get('/name/:name', projectController.getProjectByName);

// Update a project
router.put('/:id', projectController.updateProject);

// Delete a project
router.delete('/:id', projectController.deleteProject);

module.exports = router; 