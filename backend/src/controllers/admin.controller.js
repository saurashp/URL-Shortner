import User from '../models/User.js';
import Url from '../models/Url.js';
import Click from '../models/Click.js';
import ExpiredCode from '../models/ExpiredCode.js';
import { deleteCache } from '../config/redis.js';

/**
 * Controller to fetch system statistics for the Admin Dashboard.
 * GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
  try {
    const now = new Date();

    // 1. Fetch total users
    const totalUsers = await User.countDocuments();

    // 2. Fetch total shortened URLs (excluding soft deleted ones)
    const totalUrls = await Url.countDocuments({ isDeleted: { $ne: true } });

    // 3. Aggregate sum of clicks from all active (non-deleted) URLs
    const clickData = await Url.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);
    const totalClicks = clickData[0]?.total || 0;

    // 4. Fetch count of active URLs (isActive is true AND not expired AND not deleted)
    const activeLinks = await Url.countDocuments({
      isActive: true,
      isDeleted: { $ne: true },
      expiresAt: { $gt: now }
    });

    // 5. Fetch count of inactive URLs (either manually disabled OR expired OR soft-deleted)
    const inactiveLinks = await Url.countDocuments({
      $or: [
        { isActive: false },
        { isDeleted: true },
        { expiresAt: { $lte: now } }
      ]
    });

    return res.json({
      totalUsers,
      totalUrls,
      totalClicks,
      activeLinks,
      inactiveLinks
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return res.status(500).json({ error: 'Server error while aggregating admin stats' });
  }
};

/**
 * Controller to list all platform shortened URLs with creator metadata, support pagination, sorting, search, and filtering.
 * GET /api/admin/urls
 */
export const listAllUrls = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      isActive, 
      isDeleted, 
      isExpired,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    // 1. Build Query Filters
    const query = {};

    // Filter by isActive status
    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }

    // Filter by isDeleted status
    if (isDeleted === 'true') {
      query.isDeleted = true;
    } else if (isDeleted === 'false') {
      query.isDeleted = false;
    }

    // Filter by expiration status
    const now = new Date();
    if (isExpired === 'true') {
      query.expiresAt = { $lte: now };
    } else if (isExpired === 'false') {
      query.expiresAt = { $gt: now };
    }

    // Search term matching shortCode, originalUrl, or user username/email
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Find user IDs matching username/email search
      const matchedUsers = await User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      const matchedUserIds = matchedUsers.map(u => u._id);

      query.$or = [
        { shortCode: searchRegex },
        { originalUrl: searchRegex },
        { userId: { $in: matchedUserIds } }
      ];
    }

    // 2. Build Sorting options
    const sort = {};
    const allowedSortFields = ['createdAt', 'clicks', 'expiresAt', 'lastVisited'];
    const field = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;
    sort[field] = order;

    // 3. Query Database with count
    const totalCount = await Url.countDocuments(query);
    const urls = await Url.find(query)
      .populate('userId', 'username email role')
      .sort(sort)
      .skip(skipNum)
      .limit(limitNum);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.json({
      urls,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error listing all URLs for admin:', error);
    return res.status(500).json({ error: 'Server error while fetching URLs' });
  }
};

/**
 * Controller to enable/disable a shortened URL mapping.
 * PATCH /api/admin/urls/:code/status
 */
export const toggleUrlStatus = async (req, res) => {
  const { code } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive status must be a boolean value' });
  }

  try {
    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({ error: 'Link not found' });
    }

    url.isActive = isActive;
    await url.save();

    // Invalidate Redis cache to ensure new status propagates immediately
    await deleteCache(`url:${code}`);

    return res.json({
      message: `URL status updated successfully to ${isActive ? 'active' : 'disabled'}`,
      code,
      isActive: url.isActive
    });
  } catch (error) {
    console.error('Error toggling URL status:', error);
    return res.status(500).json({ error: 'Server error while toggling URL status' });
  }
};

/**
 * Controller to delete a suspicious URL mapping (Administration override soft delete).
 * DELETE /api/admin/urls/:code
 */
export const deleteSuspiciousUrl = async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ shortCode: code, isDeleted: { $ne: true } });

    if (!url) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // 1. Purge associated visitor click logs first (free database storage)
    await Click.deleteMany({ urlId: url._id });

    // 2. Perform soft deletion on the URL mapping
    url.isDeleted = true;
    url.deletedAt = new Date();
    await url.save();

    // 3. Log in ExpiredCode to return 410 Gone for 30 days
    await ExpiredCode.updateOne(
      { shortCode: code },
      { $set: { createdAt: new Date() } },
      { upsert: true }
    );

    // 4. Invalidate Redis cache
    await deleteCache(`url:${code}`);

    return res.json({
      message: 'Suspicious URL deleted successfully by Administrator',
      code
    });
  } catch (error) {
    console.error('Error deleting suspicious URL:', error);
    return res.status(500).json({ error: 'Server error while deleting suspicious URL' });
  }
};

/**
 * Controller to list all platform registered users with URLs & click telemetry counts.
 * GET /api/admin/users
 */
export const listAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = '' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const query = {};
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { username: searchRegex },
        { email: searchRegex }
      ];
    }

    const totalCount = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    // Fetch URL counts and click stats per user
    const userIds = users.map(u => u._id);
    const urlStats = await Url.aggregate([
      { $match: { userId: { $in: userIds }, isDeleted: { $ne: true } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, clicks: { $sum: '$clicks' } } }
    ]);

    const statsMap = {};
    urlStats.forEach(stat => {
      statsMap[stat._id.toString()] = {
        totalUrls: stat.count,
        totalClicks: stat.clicks
      };
    });

    const usersWithStats = users.map(u => {
      const stats = statsMap[u._id.toString()] || { totalUrls: 0, totalClicks: 0 };
      return {
        ...u.toObject(),
        totalUrls: stats.totalUrls,
        totalClicks: stats.totalClicks
      };
    });

    return res.json({
      users: usersWithStats,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error listing users for admin:', error);
    return res.status(500).json({ error: 'Server error while fetching users' });
  }
};

/**
 * Controller to enable/disable a user account.
 * PATCH /api/admin/users/:id/status
 */
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive status must be a boolean value' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent disabling own admin account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot disable your own administrator account' });
    }

    user.isActive = isActive;
    await user.save();

    return res.json({
      message: `User status updated successfully to ${isActive ? 'active' : 'disabled'}`,
      user: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({ error: 'Server error while toggling user status' });
  }
};

/**
 * Controller to delete a user account and purge all their shortened links/click logs.
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting own admin account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own administrator account' });
    }

    // 1. Find all URLs owned by this user
    const userUrls = await Url.find({ userId: user._id });
    const urlIds = userUrls.map(u => u._id);
    const shortCodes = userUrls.map(u => u.shortCode);

    // 2. Delete visitor click logs for these URLs
    await Click.deleteMany({ urlId: { $in: urlIds } });

    // 3. Delete the URLs mappings
    await Url.deleteMany({ userId: user._id });

    // 4. Invalidate Redis caches for these short codes
    for (const code of shortCodes) {
      await deleteCache(`url:${code}`);
    }

    // 5. Delete the User document
    await User.findByIdAndDelete(id);

    return res.json({
      message: 'User and all associated short URLs/analytics deleted successfully by Administrator'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Server error while deleting user' });
  }
};
