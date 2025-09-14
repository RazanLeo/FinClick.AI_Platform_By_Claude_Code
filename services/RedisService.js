const redis = require('redis');
const winston = require('winston');

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;

        // Configure logger
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: './logs/redis.log' })
            ]
        });
    }

    async connect() {
        try {
            if (this.isConnected) {
                this.logger.info('Redis already connected');
                return this.client;
            }

            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

            // Create Redis client
            this.client = redis.createClient({
                url: redisUrl,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        return new Error('Redis server refused connection');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        return undefined;
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            // Event listeners
            this.client.on('connect', () => {
                this.logger.info('Redis client connected');
            });

            this.client.on('ready', () => {
                this.logger.info('Redis client ready');
                this.isConnected = true;
            });

            this.client.on('error', (err) => {
                this.logger.error('Redis client error:', err);
                this.isConnected = false;
            });

            this.client.on('end', () => {
                this.logger.info('Redis client disconnected');
                this.isConnected = false;
            });

            this.client.on('reconnecting', () => {
                this.logger.info('Redis client reconnecting');
            });

            // Connect to Redis
            await this.client.connect();

            // Handle application termination
            process.on('SIGINT', () => {
                this.disconnect();
            });

            process.on('SIGTERM', () => {
                this.disconnect();
            });

            this.logger.info('Redis connected successfully');
            return this.client;

        } catch (error) {
            this.logger.error('Error connecting to Redis:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.client) {
                await this.client.quit();
                this.logger.info('Redis connection closed');
                this.isConnected = false;
                this.client = null;
            }
        } catch (error) {
            this.logger.error('Error disconnecting from Redis:', error);
            throw error;
        }
    }

    async reconnect() {
        try {
            await this.disconnect();
            await this.connect();
            this.logger.info('Redis reconnected successfully');
        } catch (error) {
            this.logger.error('Error reconnecting to Redis:', error);
            throw error;
        }
    }

    getClient() {
        return this.client;
    }

    isHealthy() {
        return this.isConnected && this.client.isReady;
    }

    async healthCheck() {
        try {
            if (!this.isConnected || !this.client) {
                throw new Error('Redis not connected');
            }

            await this.client.ping();

            return {
                status: 'healthy',
                connected: true,
                ready: this.client.isReady
            };
        } catch (error) {
            this.logger.error('Redis health check failed:', error);
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message
            };
        }
    }

    // String operations
    async set(key, value, expiration = null) {
        try {
            const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;

            if (expiration) {
                return await this.client.setEx(key, expiration, serializedValue);
            } else {
                return await this.client.set(key, serializedValue);
            }
        } catch (error) {
            this.logger.error(`Error setting key ${key}:`, error);
            throw error;
        }
    }

    async get(key) {
        try {
            const value = await this.client.get(key);

            if (value === null) {
                return null;
            }

            try {
                return JSON.parse(value);
            } catch (parseError) {
                return value;
            }
        } catch (error) {
            this.logger.error(`Error getting key ${key}:`, error);
            throw error;
        }
    }

    async del(key) {
        try {
            return await this.client.del(key);
        } catch (error) {
            this.logger.error(`Error deleting key ${key}:`, error);
            throw error;
        }
    }

    async exists(key) {
        try {
            return await this.client.exists(key);
        } catch (error) {
            this.logger.error(`Error checking existence of key ${key}:`, error);
            throw error;
        }
    }

    async expire(key, seconds) {
        try {
            return await this.client.expire(key, seconds);
        } catch (error) {
            this.logger.error(`Error setting expiration for key ${key}:`, error);
            throw error;
        }
    }

    async ttl(key) {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            this.logger.error(`Error getting TTL for key ${key}:`, error);
            throw error;
        }
    }

    // Hash operations
    async hset(key, field, value) {
        try {
            const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
            return await this.client.hSet(key, field, serializedValue);
        } catch (error) {
            this.logger.error(`Error setting hash field ${field} in key ${key}:`, error);
            throw error;
        }
    }

    async hget(key, field) {
        try {
            const value = await this.client.hGet(key, field);

            if (value === null) {
                return null;
            }

            try {
                return JSON.parse(value);
            } catch (parseError) {
                return value;
            }
        } catch (error) {
            this.logger.error(`Error getting hash field ${field} from key ${key}:`, error);
            throw error;
        }
    }

    async hgetall(key) {
        try {
            const hash = await this.client.hGetAll(key);
            const result = {};

            for (const [field, value] of Object.entries(hash)) {
                try {
                    result[field] = JSON.parse(value);
                } catch (parseError) {
                    result[field] = value;
                }
            }

            return result;
        } catch (error) {
            this.logger.error(`Error getting all hash fields from key ${key}:`, error);
            throw error;
        }
    }

    async hdel(key, field) {
        try {
            return await this.client.hDel(key, field);
        } catch (error) {
            this.logger.error(`Error deleting hash field ${field} from key ${key}:`, error);
            throw error;
        }
    }

    // List operations
    async lpush(key, value) {
        try {
            const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
            return await this.client.lPush(key, serializedValue);
        } catch (error) {
            this.logger.error(`Error left pushing to key ${key}:`, error);
            throw error;
        }
    }

    async rpush(key, value) {
        try {
            const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
            return await this.client.rPush(key, serializedValue);
        } catch (error) {
            this.logger.error(`Error right pushing to key ${key}:`, error);
            throw error;
        }
    }

    async lpop(key) {
        try {
            const value = await this.client.lPop(key);

            if (value === null) {
                return null;
            }

            try {
                return JSON.parse(value);
            } catch (parseError) {
                return value;
            }
        } catch (error) {
            this.logger.error(`Error left popping from key ${key}:`, error);
            throw error;
        }
    }

    async rpop(key) {
        try {
            const value = await this.client.rPop(key);

            if (value === null) {
                return null;
            }

            try {
                return JSON.parse(value);
            } catch (parseError) {
                return value;
            }
        } catch (error) {
            this.logger.error(`Error right popping from key ${key}:`, error);
            throw error;
        }
    }

    async llen(key) {
        try {
            return await this.client.lLen(key);
        } catch (error) {
            this.logger.error(`Error getting list length for key ${key}:`, error);
            throw error;
        }
    }

    // Set operations
    async sadd(key, member) {
        try {
            const serializedMember = typeof member === 'object' ? JSON.stringify(member) : member;
            return await this.client.sAdd(key, serializedMember);
        } catch (error) {
            this.logger.error(`Error adding member to set ${key}:`, error);
            throw error;
        }
    }

    async srem(key, member) {
        try {
            const serializedMember = typeof member === 'object' ? JSON.stringify(member) : member;
            return await this.client.sRem(key, serializedMember);
        } catch (error) {
            this.logger.error(`Error removing member from set ${key}:`, error);
            throw error;
        }
    }

    async smembers(key) {
        try {
            const members = await this.client.sMembers(key);
            return members.map(member => {
                try {
                    return JSON.parse(member);
                } catch (parseError) {
                    return member;
                }
            });
        } catch (error) {
            this.logger.error(`Error getting set members for key ${key}:`, error);
            throw error;
        }
    }

    // Cache helper methods
    async cache(key, fetchFunction, expiration = 3600) {
        try {
            const cached = await this.get(key);

            if (cached !== null) {
                return cached;
            }

            const result = await fetchFunction();
            await this.set(key, result, expiration);

            return result;
        } catch (error) {
            this.logger.error(`Error in cache method for key ${key}:`, error);
            throw error;
        }
    }

    async invalidatePattern(pattern) {
        try {
            const keys = await this.client.keys(pattern);

            if (keys.length > 0) {
                return await this.client.del(keys);
            }

            return 0;
        } catch (error) {
            this.logger.error(`Error invalidating pattern ${pattern}:`, error);
            throw error;
        }
    }

    // Rate limiting helper
    async rateLimit(key, limit, window) {
        try {
            const current = await this.client.incr(key);

            if (current === 1) {
                await this.expire(key, window);
            }

            return {
                current,
                limit,
                remaining: Math.max(0, limit - current),
                resetTime: await this.ttl(key)
            };
        } catch (error) {
            this.logger.error(`Error in rate limiting for key ${key}:`, error);
            throw error;
        }
    }

    // Session management
    async setSession(sessionId, sessionData, expiration = 3600) {
        try {
            const key = `session:${sessionId}`;
            return await this.set(key, sessionData, expiration);
        } catch (error) {
            this.logger.error(`Error setting session ${sessionId}:`, error);
            throw error;
        }
    }

    async getSession(sessionId) {
        try {
            const key = `session:${sessionId}`;
            return await this.get(key);
        } catch (error) {
            this.logger.error(`Error getting session ${sessionId}:`, error);
            throw error;
        }
    }

    async destroySession(sessionId) {
        try {
            const key = `session:${sessionId}`;
            return await this.del(key);
        } catch (error) {
            this.logger.error(`Error destroying session ${sessionId}:`, error);
            throw error;
        }
    }

    // Statistics and monitoring
    async getStats() {
        try {
            const info = await this.client.info();

            return {
                connected_clients: this.parseInfoValue(info, 'connected_clients'),
                used_memory: this.parseInfoValue(info, 'used_memory_human'),
                total_commands_processed: this.parseInfoValue(info, 'total_commands_processed'),
                keyspace_hits: this.parseInfoValue(info, 'keyspace_hits'),
                keyspace_misses: this.parseInfoValue(info, 'keyspace_misses'),
                uptime_in_seconds: this.parseInfoValue(info, 'uptime_in_seconds')
            };
        } catch (error) {
            this.logger.error('Error getting Redis stats:', error);
            throw error;
        }
    }

    parseInfoValue(info, key) {
        const regex = new RegExp(`${key}:(.+)`);
        const match = info.match(regex);
        return match ? match[1].trim() : null;
    }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;