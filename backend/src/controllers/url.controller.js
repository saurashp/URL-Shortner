import Url from '../models/Url.js';
import Click from '../models/Click.js';
import ExpiredCode from '../models/ExpiredCode.js';
import { generateShortId } from '../utils/shortId.js';
import { parseUserAgent } from '../utils/uaParser.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';

/**
 * Controller to handle URL shortening.
 * POST /api/shorten
 */
export const shortenUrl = async (req, res) => {
  const { originalUrl, customAlias } = req.body;

  // 1. Check if URL is provided
  if (!originalUrl || originalUrl.trim() === '') {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  // 2. Validate URL format (must be valid HTTP or HTTPS URL)
  try {
    const parsedUrl = new URL(originalUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'URL protocol must be HTTP or HTTPS' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format. Please provide a full URL starting with http:// or https://' });
  }

  try {
    let url;
    // 3. Check if the URL has already been shortened by this user in the database (only when customAlias is NOT provided)
    if (!customAlias || customAlias.trim() === '') {
      url = await Url.findOne({ originalUrl, userId: req.user.id });
      if (url) {
        return res.json({
          message: 'URL already shortened',
          originalUrl: url.originalUrl,
          shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
          code: url.shortCode
        });
      }
    }

    let code;

    // 4. Handle custom alias if provided
    if (customAlias && customAlias.trim() !== '') {
      const alias = customAlias.trim();

      // Check if alias is a reserved system word (case-insensitive)
      const reservedAliases = ['login', 'register', 'dashboard', 'admin', 'api', 'health'];
      if (reservedAliases.includes(alias.toLowerCase())) {
        return res.status(400).json({ error: `Custom alias cannot be a reserved system word (${reservedAliases.join(', ')})` });
      }

      // Validate custom alias format (3 to 30 alphanumeric characters, dashes, or underscores)
      const aliasRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      if (!aliasRegex.test(alias)) {
        return res.status(400).json({ error: 'Custom alias must be between 3 and 30 alphanumeric characters, dashes, or underscores' });
      }

      // Check if alias is already in use by an active URL
      const existingUrl = await Url.findOne({ shortCode: alias });
      if (existingUrl) {
        return res.status(400).json({ error: 'Custom alias already exists. Please choose a different one.' });
      }

      // Check if alias was recently used (preventing hijacking of expired/deleted links)
      const existingExpired = await ExpiredCode.findOne({ shortCode: alias });
      if (existingExpired) {
        return res.status(400).json({ error: 'Custom alias was recently used. Please choose a different one.' });
      }

      code = alias;
    } else {
      // 5. Generate unique 6-character alphanumeric short code with collision handling
      let isUnique = false;

      while (!isUnique) {
        code = generateShortId(6);

        // Verify the generated code is exactly 6 characters and alphanumeric
        const codeRegex = /^[a-zA-Z0-9]{6}$/;
        if (!codeRegex.test(code)) {
          continue; // If it fails regex validation, regenerate
        }

        // Check for collision in active and expired databases
        const existing = await Url.findOne({ shortCode: code });
        const existingExpired = await ExpiredCode.findOne({ shortCode: code });
        if (!existing && !existingExpired) {
          isUnique = true; // No collision, code is safe to use!
        } else {
          console.log(`Collision detected for code: ${code}. Regenerating...`);
        }
      }
    }

    // 5. Calculate expiration date (exactly 7 days / 168 hours from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 6. Save mapping to database
    url = new Url({
      originalUrl,
      shortCode: code,
      userId: req.user.id,
      expiresAt
    });
    await url.save();

    // 7. Register code in expired lookup index so we can identify past existence
    await ExpiredCode.create({ shortCode: code });

    return res.status(201).json({
      message: 'URL shortened successfully',
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
      code,
      expiresAt: url.expiresAt
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    return res.status(500).json({ error: 'Server error while shortening URL' });
  }
};

/**
 * Controller to handle redirection from short URL.
 * GET /:code
 */
export const redirectUrl = async (req, res) => {
  const { code } = req.params;

  try {
    // 1. Check Redis cache first
    const cachedData = await getCache(`url:${code}`);
    let originalUrl;
    let urlId;

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      originalUrl = parsed.originalUrl;
      urlId = parsed.id;
      const expiresAt = new Date(parsed.expiresAt);
      const isActive = parsed.isActive;
      const isDeleted = parsed.isDeleted;

      // Check if the URL has been soft-deleted
      if (isDeleted === true) {
        return res.status(410).json({ error: 'Link has expired and is no longer available' });
      }

      // Check if the URL has been disabled by the administrator
      if (isActive === false) {
        return res.status(403).json({ error: 'This link has been disabled by the administrator' });
      }

      // Check if cache has already expired (just in case Redis TTL is slightly delayed)
      if (expiresAt < new Date()) {
        await deleteCache(`url:${code}`);
        return res.status(410).json({ error: 'Link has expired and is no longer available' });
      }

      // Asynchronously record click analytics to MongoDB
      (async () => {
        try {
          const userAgent = req.get('User-Agent');
          const { browser, os, device } = parseUserAgent(userAgent);
          const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || req.ip || 'Unknown';
          const referrer = req.get('Referrer') || req.get('Referer') || 'Direct';

          const clickLog = new Click({
            urlId,
            ip,
            browser,
            os,
            device,
            referrer,
            expiresAt
          });
          await clickLog.save();

          await Url.updateOne(
            { _id: urlId },
            {
              $inc: { clicks: 1 },
              $set: { lastVisited: new Date() }
            }
          );
        } catch (err) {
          console.error('Async click logging failed:', err);
        }
      })();

      return res.redirect(originalUrl);
    }

    // 2. Cache Miss: Query MongoDB
    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      // Differentiate between "never existed" (404) and "deleted/expired" (410)
      const expired = await ExpiredCode.findOne({ shortCode: code });
      if (expired) {
        return res.status(410).json({ error: 'Link has expired and is no longer available' });
      }
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check if the URL has been soft-deleted
    if (url.isDeleted === true) {
      return res.status(410).json({ error: 'Link has expired and is no longer available' });
    }

    // Check if the URL has been disabled by the administrator
    if (url.isActive === false) {
      return res.status(403).json({ error: 'This link has been disabled by the administrator' });
    }

    // Check if the URL has dynamically expired (before background MongoDB TTL index runs)
    if (url.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Link has expired and is no longer available' });
    }

    originalUrl = url.originalUrl;
    urlId = url._id;

    // Calculate remaining seconds for Redis TTL (capped at 1 hour or remaining lifetime)
    const remainingMs = url.expiresAt.getTime() - Date.now();
    const remainingSeconds = Math.max(Math.floor(remainingMs / 1000), 0);
    const redisTtl = Math.min(3600, remainingSeconds);

    // Cache the mapping in Redis with expiration, status, and deletion details
    await setCache(
      `url:${code}`, 
      JSON.stringify({ id: urlId, originalUrl, expiresAt: url.expiresAt, isActive: url.isActive, isDeleted: url.isDeleted }), 
      redisTtl
    );

    // Extract client details
    const userAgent = req.get('User-Agent');
    const { browser, os, device } = parseUserAgent(userAgent);

    // Handle proxy setups when reading IP address
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || req.ip || 'Unknown';
    const referrer = req.get('Referrer') || req.get('Referer') || 'Direct';

    // Create and save visitor click details in Click collection
    const clickLog = new Click({
      urlId: url._id,
      ip,
      browser,
      os,
      device,
      referrer,
      expiresAt: url.expiresAt
    });
    await clickLog.save();

    // Increment click analytics and update last visited timestamp
    url.clicks += 1;
    url.lastVisited = new Date();
    await url.save();

    // Redirect to original destination
    return res.redirect(originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    return res.status(500).json({ error: 'Server error during redirection' });
  }
};

/**
 * Controller to fetch URL analytics.
 * GET /api/analytics/:code
 */
export const getUrlAnalytics = async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ shortCode: code, isDeleted: { $ne: true } });

    if (!url) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this URL analytics' });
    }

    // Fetch associated visits from Click collection
    const clicksHistory = await Click.find({ urlId: url._id }).sort({ timestamp: -1 });

    return res.json({
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
      lastVisited: url.lastVisited,
      clicksHistory
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Server error while fetching analytics' });
  }
};

/**
 * Controller to list all shortened URLs.
 * GET /api/urls
 */
export const listUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user.id, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    return res.json(urls);
  } catch (error) {
    console.error('Error listing URLs:', error);
    return res.status(500).json({ error: 'Server error while listing URLs' });
  }
};

/**
 * Controller to fetch a single shortened URL by its code.
 * GET /api/urls/:code
 */
export const getUrlByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ shortCode: code, isDeleted: { $ne: true } });

    if (!url) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this URL details' });
    }

    return res.json(url);
  } catch (error) {
    console.error('Error fetching URL details:', error);
    return res.status(500).json({ error: 'Server error while fetching URL details' });
  }
};

/**
 * Controller to update a shortened URL mapping.
 * PUT /api/urls/:code
 */
export const updateUrl = async (req, res) => {
  const { code } = req.params;
  const { originalUrl } = req.body;

  // 1. Validate presence of URL
  if (!originalUrl || originalUrl.trim() === '') {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  // 2. Validate URL protocol/format
  try {
    const parsedUrl = new URL(originalUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'URL protocol must be HTTP or HTTPS' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format. Please provide a full URL starting with http:// or https://' });
  }

  try {
    // 3. Find and update URL mapping
    const url = await Url.findOne({ shortCode: code, isDeleted: { $ne: true } });

    if (!url) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this URL' });
    }

    url.originalUrl = originalUrl;
    await url.save();

    // Invalidate Redis cache
    await deleteCache(`url:${code}`);

    return res.json({
      message: 'URL updated successfully',
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
      code: url.shortCode
    });
  } catch (error) {
    console.error('Error updating URL:', error);
    return res.status(500).json({ error: 'Server error while updating URL' });
  }
};

/**
 * Controller to delete a shortened URL mapping.
 * DELETE /api/urls/:code
 */
export const deleteUrl = async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ shortCode: code, isDeleted: { $ne: true } });

    if (!url) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this URL' });
    }

    // Clean up associated visitor click logs first
    await Click.deleteMany({ urlId: url._id });

    // Perform soft deletion
    url.isDeleted = true;
    url.deletedAt = new Date();
    await url.save();

    // Register/refresh the expired code index to ensure 410 Gone is returned for 30 days
    await ExpiredCode.updateOne(
      { shortCode: code },
      { $set: { createdAt: new Date() } },
      { upsert: true }
    );

    // Invalidate Redis cache
    await deleteCache(`url:${code}`);

    return res.json({
      message: 'URL deleted successfully',
      code
    });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return res.status(500).json({ error: 'Server error while deleting URL' });
  }
};
