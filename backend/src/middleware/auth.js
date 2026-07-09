import jwt from 'jsonwebtoken';

/**
 * Authentication middleware that verifies JWT access tokens.
 * Intercepts protected requests, checks for a valid Bearer token in the
 * Authorization header, and attaches the authenticated user's ID to req.user.
 */
export const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if header is missing or does not follow Bearer format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided, authorization denied' });
  }

  // Extract token string
  const token = authHeader.split(' ')[1];

  try {
    // Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user payload to request object (contains user id)
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ error: 'Token is invalid or has expired' });
  }
};
