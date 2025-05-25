const { supabase } = require('../config/supabase');
const crypto = require('crypto');

// Helper function to parse env file content
const parseEnvContent = (content) => {
  const lines = content.split('\n');
  const envVars = {};
  
  lines.forEach(line => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
};

// Upload a new env file
exports.uploadEnvFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectId, environment = 'development', description } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Read file content
    const content = req.file.buffer.toString('utf-8');
    const variables = parseEnvContent(content);
    
    // Generate unique file ID
    const fileId = crypto.randomUUID();
    
    // Store in Supabase
    const { data, error } = await supabase
      .from('env_files')
      .insert({
        id: fileId,
        project_id: projectId,
        environment,
        file_name: req.file.originalname,
        content,
        variables,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to save env file', details: error.message });
    }

    res.status(201).json({
      message: 'Env file uploaded successfully',
      data
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Get all env files for a project
exports.getEnvFilesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { environment } = req.query;

    let query = supabase
      .from('env_files')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (environment) {
      query = query.eq('environment', environment);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch env files', details: error.message });
    }

    res.json({
      message: 'Env files retrieved successfully',
      data
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Get a specific env file
exports.getEnvFile = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('env_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Env file not found' });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch env file', details: error.message });
    }

    res.json({
      message: 'Env file retrieved successfully',
      data
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Update an env file
exports.updateEnvFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { environment, description } = req.body;

    let updateData = {
      updated_at: new Date().toISOString()
    };

    if (environment) updateData.environment = environment;
    if (description !== undefined) updateData.description = description;

    // If a new file is uploaded
    if (req.file) {
      const content = req.file.buffer.toString('utf-8');
      const variables = parseEnvContent(content);
      
      updateData.content = content;
      updateData.variables = variables;
      updateData.file_name = req.file.originalname;
    }

    const { data, error } = await supabase
      .from('env_files')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Env file not found' });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update env file', details: error.message });
    }

    res.json({
      message: 'Env file updated successfully',
      data
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Delete an env file
exports.deleteEnvFile = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('env_files')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete env file', details: error.message });
    }

    res.json({
      message: 'Env file deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Download env file content
exports.downloadEnvFile = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('env_files')
      .select('content, file_name')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Env file not found' });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch env file', details: error.message });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${data.file_name || '.env'}"`);
    
    res.send(data.content);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}; 