const { supabase, supabaseAdmin } = require('../config/supabase');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId; // Get from auth middleware
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Use supabaseAdmin to bypass RLS for service operations
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('projects')
      .insert({
        name,
        owner_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ 
          error: 'Project already exists',
          details: error.message 
        });
      }
      return res.status(500).json({ 
        error: 'Failed to create project',
        details: error.message 
      });
    }

    res.status(201).json({
      message: 'Project created successfully',
      data
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Get all projects for authenticated user
exports.getProjects = async (req, res) => {
  try {
    const userId = req.userId; // Get from auth middleware
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch projects',
        details: error.message 
      });
    }

    res.json({
      message: 'Projects retrieved successfully',
      data,
      count: data ? data.length : 0
    });
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Get a single project (verify ownership)
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Get from auth middleware
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId) // Ensure user owns this project
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch project',
        details: error.message 
      });
    }

    res.json({
      message: 'Project retrieved successfully',
      data
    });
  } catch (error) {
    console.error('Fetch project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Get project by name (verify ownership)
exports.getProjectByName = async (req, res) => {
  try {
    const { name } = req.params;
    const userId = req.userId; // Get from auth middleware
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('name', name)
      .eq('owner_id', userId) // Ensure user owns this project
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch project',
        details: error.message 
      });
    }

    res.json({
      message: 'Project retrieved successfully',
      data
    });
  } catch (error) {
    console.error('Fetch project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Update a project (verify ownership)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.userId; // Get from auth middleware
    const client = supabaseAdmin || supabase;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // First verify ownership
    const { data: project, error: checkError } = await client
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('owner_id', userId)
      .single();

    if (checkError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update the project
    const { data, error } = await client
      .from('projects')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to update project',
        details: error.message 
      });
    }

    res.json({
      message: 'Project updated successfully',
      data
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Delete a project (verify ownership, cascades to env_files and env_vars)
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Get from auth middleware
    const client = supabaseAdmin || supabase;

    // Delete only if user owns the project
    const { error } = await client
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to delete project',
        details: error.message 
      });
    }

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}; 