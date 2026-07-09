import express from 'express';
import { 
  shortenUrl, 
  redirectUrl, 
  getUrlAnalytics,
  listUrls,
  getUrlByCode,
  updateUrl,
  deleteUrl
} from '../controllers/url.controller.js';
import { validateUrl } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Route to shorten URL (Create) - Protected
router.post('/api/shorten', auth, validateUrl, shortenUrl);

// Route to list all URLs (Read list) - Protected
router.get('/api/urls', auth, listUrls);

// Route to get a single URL mapping (Read single) - Protected
router.get('/api/urls/:code', auth, getUrlByCode);

// Route to update a URL mapping (Update) - Protected
router.put('/api/urls/:code', auth, updateUrl);

// Route to delete a URL mapping (Delete) - Protected
router.delete('/api/urls/:code', auth, deleteUrl);

// Route to get analytics for a specific code - Protected
router.get('/api/analytics/:code', auth, getUrlAnalytics);

// Route to redirect to original URL (keep this last) - Public
router.get('/:code', redirectUrl);

export default router;
