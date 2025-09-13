const { createClient } = require('redis');
require('dotenv').config();

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    throw error;
  }
};

// Cache helper functions
const cache = {
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  },

  async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }
};

module.exports = { connectRedis, cache };