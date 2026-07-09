/**
 * Custom middleware to parse JSON request bodies from the raw request stream.
 * Express by default does not parse JSON bodies, so this middleware handles
 * buffering the request stream, parsing it to a JavaScript object, and
 * handling malformed JSON errors gracefully.
 */
export const bodyJsonParser = (req, res, next) => {
  // If the request has already been parsed (e.g., by another middleware)
  if (req.body && Object.keys(req.body).length > 0) {
    return next();
  }

  // Only parse requests that have a JSON content-type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    req.body = {};
    return next();
  }

  let rawData = '';

  // Read data chunks as they arrive from the request stream
  req.on('data', (chunk) => {
    rawData += chunk;
  });

  // Once the entire body stream has been received
  req.on('end', () => {
    try {
      if (rawData.trim()) {
        req.body = JSON.parse(rawData);
      } else {
        req.body = {};
      }
      next();
    } catch (error) {
      // Return a clean error response for malformed JSON instead of crashing
      res.status(400).json({
        error: 'Malformed JSON payload. Please verify your JSON format.'
      });
    }
  });

  // Handle stream errors
  req.on('error', (err) => {
    console.error('Request stream error:', err);
    res.status(500).json({ error: 'Error reading request payload' });
  });
};
