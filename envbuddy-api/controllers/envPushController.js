const { supabaseAdmin } = require('../config/supabase');
const crypto = require('crypto');

// Push individual environment variables
exports.pushEnvVars = async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ 
        error: 'Service role key not configured',
        message: 'SUPABASE_SERVICE_ROLE_KEY is required for this operation'
      });
    }

    const { projectId, environment = 'development', variables } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!variables || typeof variables !== 'object') {
      return res.status(400).json({ error: 'Variables object is required' });
    }

    // Validate that variables is not empty
    const varKeys = Object.keys(variables);
    if (varKeys.length === 0) {
      return res.status(400).json({ error: 'No variables provided' });
    }

    // Generate a batch ID for this push operation
    const batchId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Prepare variables for insertion
    const envVarsToInsert = varKeys.map(key => ({
      id: crypto.randomUUID(),
      project_id: projectId,
      environment,
      key,
      value: variables[key] || '',
      batch_id: batchId,
      created_at: timestamp,
      updated_at: timestamp
    }));

    // First, get existing variables for this project and environment
    const { data: existingVars, error: fetchError } = await supabaseAdmin
      .from('env_vars')
      .select('key, id')
      .eq('project_id', projectId)
      .eq('environment', environment);

    if (fetchError) {
      console.error('Error fetching existing variables:', fetchError);
      return res.status(500).json({ 
        error: 'Failed to check existing variables',
        details: fetchError.message 
      });
    }

    // Create a map of existing variables
    const existingVarMap = {};
    if (existingVars) {
      existingVars.forEach(v => {
        existingVarMap[v.key] = v.id;
      });
    }

    // Separate variables into updates and inserts
    const varsToUpdate = [];
    const varsToInsert = [];

    envVarsToInsert.forEach(varData => {
      if (existingVarMap[varData.key]) {
        // Update existing variable
        varsToUpdate.push({
          id: existingVarMap[varData.key],
          value: varData.value,
          batch_id: varData.batch_id,
          updated_at: varData.updated_at
        });
      } else {
        // Insert new variable
        varsToInsert.push(varData);
      }
    });

    let insertedCount = 0;
    let updatedCount = 0;
    const errors = [];

    // Insert new variables
    if (varsToInsert.length > 0) {
      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('env_vars')
        .insert(varsToInsert)
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        errors.push(`Insert failed: ${insertError.message}`);
      } else {
        insertedCount = insertedData ? insertedData.length : 0;
      }
    }

    // Update existing variables
    for (const varToUpdate of varsToUpdate) {
      const { error: updateError } = await supabaseAdmin
        .from('env_vars')
        .update({
          value: varToUpdate.value,
          batch_id: varToUpdate.batch_id,
          updated_at: varToUpdate.updated_at
        })
        .eq('id', varToUpdate.id);

      if (updateError) {
        console.error('Update error:', updateError);
        errors.push(`Update failed for variable: ${updateError.message}`);
      } else {
        updatedCount++;
      }
    }

    // Prepare response
    const response = {
      message: 'Environment variables pushed successfully',
      data: {
        batch_id: batchId,
        project_id: projectId,
        environment,
        total_variables: varKeys.length,
        inserted: insertedCount,
        updated: updatedCount,
        timestamp
      }
    };

    if (errors.length > 0) {
      response.warnings = errors;
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('Push error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Get all variables for a project and environment
exports.getEnvVars = async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ 
        error: 'Service role key not configured',
        message: 'SUPABASE_SERVICE_ROLE_KEY is required for this operation'
      });
    }

    const { projectId, environment } = req.params;

    let query = supabaseAdmin
      .from('env_vars')
      .select('*')
      .eq('project_id', projectId)
      .order('key', { ascending: true });

    if (environment) {
      query = query.eq('environment', environment);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch environment variables',
        details: error.message 
      });
    }

    // Group variables by environment if no specific environment was requested
    const groupedData = {};
    if (!environment && data) {
      data.forEach(variable => {
        if (!groupedData[variable.environment]) {
          groupedData[variable.environment] = {};
        }
        groupedData[variable.environment][variable.key] = variable.value;
      });
    }

    res.json({
      message: 'Environment variables retrieved successfully',
      data: environment ? data : groupedData,
      count: data ? data.length : 0
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Export environment variables as .env file
exports.exportEnvVars = async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ 
        error: 'Service role key not configured',
        message: 'SUPABASE_SERVICE_ROLE_KEY is required for this operation'
      });
    }

    const { projectId, environment } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!environment) {
      return res.status(400).json({ error: 'Environment is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('env_vars')
      .select('key, value')
      .eq('project_id', projectId)
      .eq('environment', environment)
      .order('key', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch environment variables',
        details: error.message 
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ 
        error: 'No environment variables found',
        message: `No variables found for project ${projectId} in ${environment} environment`
      });
    }

    // Convert variables to .env format
    const envContent = data
      .map(variable => `${variable.key}=${variable.value || ''}`)
      .join('\n');

    // Add header comment
    const header = `# Environment variables for ${projectId} (${environment})\n# Generated at ${new Date().toISOString()}\n\n`;
    const fullContent = header + envContent;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${projectId}-${environment}.env"`);
    
    res.send(fullContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}; 