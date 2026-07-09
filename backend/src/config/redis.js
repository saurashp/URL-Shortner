import { createClient } from 'redis';

let redisClient = null;
let isRedisEnabled = false;

/**
 * Connect to Redis server with graceful fallback.
 * If Redis is offline, the app continues to operate using direct MongoDB lookups.
 */
export const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  redisClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 3000, // Timeout after 3 seconds
      reconnectStrategy: (retries) => {
        // Stop attempting automatic reconnects after 3 failed attempts to prevent log flood
        if (retries > 3) {
          console.warn('Redis reconnection limit reached. Operating in MongoDB-only mode.');
          isRedisEnabled = false;
          return false;
        }
        return Math.min(retries * 500, 2000); // Backoff strategy
      }
    }
  });

  redisClient.on('error', (err) => {
    // Suppress crash by catching error events
    console.warn('Redis Client Notice:', err.message);
    isRedisEnabled = false;
  });

  try {
    await redisClient.connect();
    console.log('Redis Connected Successfully.');
    isRedisEnabled = true;
  } catch (error) {
    console.warn('Failed to connect to Redis. Gracefully falling back to MongoDB-only operation.');
    isRedisEnabled = false;
    redisClient = null;
  }
};

/**
 * Retrieve a value from Redis cache.
 * @param {string} key - Redis key to lookup
 * @returns {Promise<string|null>} Cached string value or null
 */
export const getCache = async (key) => {
  if (!isRedisEnabled || !redisClient) return null;
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis GET error:', error.message);
    return null;
  }
};

/**
 * Write a key-value mapping to Redis cache.
 * @param {string} key - Redis key
 * @param {string} value - String value to store
 * @param {number} expirationSeconds - TTL duration in seconds (default: 3600s / 1hr)
 */
export const setCache = async (key, value, expirationSeconds = 3600) => {
  if (!isRedisEnabled || !redisClient) return;
  try {
    await redisClient.set(key, value, {
      EX: expirationSeconds
    });
  } catch (error) {
    console.error('Redis SET error:', error.message);
  }
};

/**
 * Delete a key-value mapping from Redis cache (invalidation).
 * @param {string} key - Redis key
 */
export const deleteCache = async (key) => {
  if (!isRedisEnabled || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis DEL error:', error.message);
  }
};
