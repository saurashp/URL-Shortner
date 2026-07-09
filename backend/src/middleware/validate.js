/**
 * Middleware to validate whether originalUrl is present and formatted correctly.
 */
export const validateUrl = (req, res, next) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'originalUrl is required' });
  }

  try {
    const parsedUrl = new URL(originalUrl);
    // Ensure protocol is valid HTTP or HTTPS
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'URL protocol must be HTTP or HTTPS' });
    }
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format. Please provide a full URL starting with http:// or https://' });
  }
};
