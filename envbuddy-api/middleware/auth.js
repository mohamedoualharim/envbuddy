const axios = require('axios');

const authenticateUser = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No authorization header provided' 
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Use: Bearer <token>' 
      });
    }

    const token = parts[1];

    // Get Supabase project URL from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('SUPABASE_URL not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Authentication service not configured' 
      });
    }

    // Extract project ref from URL (https://<project-ref>.supabase.co)
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) {
      console.error('Invalid SUPABASE_URL format');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Invalid authentication service URL' 
      });
    }

    // Verify token with Supabase
    const verifyUrl = `https://${projectRef}.supabase.co/auth/v1/user`;
    
    try {
      const response = await axios.get(verifyUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.SUPABASE_ANON_KEY
        }
      });

      // Token is valid, extract user information
      const user = response.data;
      
      if (!user || !user.id) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid user data' 
        });
      }

      // Set user ID on request object
      req.userId = user.id;
      req.user = user; // Store full user object if needed
      
      // Continue to next middleware
      next();
      
    } catch (verifyError) {
      // Token verification failed
      if (verifyError.response) {
        if (verifyError.response.status === 401) {
          return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Invalid or expired token' 
          });
        }
      }
      
      console.error('Token verification error:', verifyError.message);
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Token verification failed' 
      });
    }

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication failed' 
    });
  }
};

// Optional: Create a middleware that allows authenticated or anonymous access
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // No auth header, continue without authentication
    return next();
  }
  
  // Auth header present, try to authenticate
  return authenticateUser(req, res, next);
};

module.exports = {
  authenticateUser,
  optionalAuth
}; 