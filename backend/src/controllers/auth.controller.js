import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Controller to handle user registration.
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Validate inputs presence
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // 3. Create new user document (password will be automatically hashed by pre-save hook)
    const user = new User({
      username,
      email: email.toLowerCase(),
      password
    });
    await user.save();

    // 4. Generate JWT access token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * Controller to handle user login.
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate inputs presence
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 2. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if the user is disabled
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Your account has been disabled by the administrator' });
    }

    // 3. Verify user's password using the model helper method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // 4. Generate JWT access token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
};
