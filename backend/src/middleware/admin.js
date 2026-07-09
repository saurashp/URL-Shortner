import User from '../models/User.js';

/**
 * Authorization middleware that permits access only to users with the 'admin' role.
 * Queries MongoDB dynamically to ensure instant propagation of role changes.
 */
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user && user.role === 'admin') {
      req.user.role = 'admin'; // sync role locally
      return next();
    }
    
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  } catch (error) {
    console.error('Admin middleware authorization error:', error);
    return res.status(500).json({ error: 'Server error during admin authorization check' });
  }
};
