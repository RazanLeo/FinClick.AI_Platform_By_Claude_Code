const mongoose = require('mongoose');
const winston = require('winston');

class DatabaseService {
    constructor() {
        this.connection = null;
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
                new winston.transports.File({ filename: './logs/database.log' })
            ]
        });
    }

    async connect() {
        try {
            if (this.isConnected) {
                this.logger.info('Database already connected');
                return this.connection;
            }

            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finclick-ai';

            // MongoDB connection options
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                bufferMaxEntries: 0, // Disable mongoose buffering
                bufferCommands: false, // Disable mongoose buffering
                maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
                retryWrites: true,
                retryReads: true
            };

            // Connect to MongoDB
            this.connection = await mongoose.connect(mongoUri, options);

            this.isConnected = true;
            this.logger.info(`MongoDB connected: ${this.connection.connection.host}`);

            // Connection event listeners
            mongoose.connection.on('connected', () => {
                this.logger.info('Mongoose connected to MongoDB');
            });

            mongoose.connection.on('error', (err) => {
                this.logger.error('Mongoose connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                this.logger.warn('Mongoose disconnected from MongoDB');
                this.isConnected = false;
            });

            // Handle application termination
            process.on('SIGINT', () => {
                this.disconnect();
            });

            process.on('SIGTERM', () => {
                this.disconnect();
            });

            return this.connection;

        } catch (error) {
            this.logger.error('Error connecting to MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.connection.close();
                this.logger.info('MongoDB connection closed');
                this.isConnected = false;
                this.connection = null;
            }
        } catch (error) {
            this.logger.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    async reconnect() {
        try {
            await this.disconnect();
            await this.connect();
            this.logger.info('MongoDB reconnected successfully');
        } catch (error) {
            this.logger.error('Error reconnecting to MongoDB:', error);
            throw error;
        }
    }

    getConnection() {
        return this.connection;
    }

    isHealthy() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }

    async healthCheck() {
        try {
            if (!this.isConnected) {
                throw new Error('Database not connected');
            }

            // Ping the database
            await mongoose.connection.db.admin().ping();

            return {
                status: 'healthy',
                connected: true,
                readyState: mongoose.connection.readyState,
                host: mongoose.connection.host,
                name: mongoose.connection.name,
                collections: Object.keys(mongoose.connection.collections).length
            };
        } catch (error) {
            this.logger.error('Database health check failed:', error);
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message
            };
        }
    }

    async getStats() {
        try {
            if (!this.isConnected) {
                throw new Error('Database not connected');
            }

            const stats = await mongoose.connection.db.stats();

            return {
                database: mongoose.connection.name,
                collections: stats.collections,
                documents: stats.objects,
                avgObjSize: stats.avgObjSize,
                dataSize: this.formatBytes(stats.dataSize),
                storageSize: this.formatBytes(stats.storageSize),
                indexSize: this.formatBytes(stats.indexSize),
                fileSize: this.formatBytes(stats.fileSize)
            };
        } catch (error) {
            this.logger.error('Error getting database stats:', error);
            throw error;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Transaction helper methods
    async withTransaction(callback) {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // Backup helper method
    async backup(outputPath) {
        try {
            const { exec } = require('child_process');
            const util = require('util');
            const execAsync = util.promisify(exec);

            const mongoUri = process.env.MONGODB_URI;
            const dbName = mongoose.connection.name;

            const command = `mongodump --uri="${mongoUri}" --db=${dbName} --out=${outputPath}`;

            await execAsync(command);
            this.logger.info(`Database backup completed: ${outputPath}`);

            return {
                success: true,
                path: outputPath,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error('Database backup failed:', error);
            throw error;
        }
    }

    // Index management
    async ensureIndexes() {
        try {
            const models = mongoose.models;

            for (const modelName in models) {
                const model = models[modelName];
                await model.createIndexes();
                this.logger.info(`Indexes ensured for model: ${modelName}`);
            }

            this.logger.info('All indexes ensured successfully');
        } catch (error) {
            this.logger.error('Error ensuring indexes:', error);
            throw error;
        }
    }

    // Collection utilities
    async dropCollection(collectionName) {
        try {
            await mongoose.connection.db.dropCollection(collectionName);
            this.logger.info(`Collection dropped: ${collectionName}`);
        } catch (error) {
            if (error.codeName === 'NamespaceNotFound') {
                this.logger.warn(`Collection not found: ${collectionName}`);
            } else {
                throw error;
            }
        }
    }

    async listCollections() {
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            return collections.map(col => col.name);
        } catch (error) {
            this.logger.error('Error listing collections:', error);
            throw error;
        }
    }

    // Aggregation helpers
    async aggregate(model, pipeline) {
        try {
            return await model.aggregate(pipeline);
        } catch (error) {
            this.logger.error('Aggregation error:', error);
            throw error;
        }
    }

    // Bulk operations
    async bulkWrite(model, operations) {
        try {
            return await model.bulkWrite(operations);
        } catch (error) {
            this.logger.error('Bulk write error:', error);
            throw error;
        }
    }

    // Data seeding
    async seedDatabase() {
        try {
            // Check if data already exists
            const User = require('../models/User');
            const adminExists = await User.findOne({ role: 'admin' });

            if (!adminExists) {
                // Create admin user
                const adminUser = new User({
                    email: process.env.ADMIN_EMAIL || 'Razan@FinClick.AI',
                    password: process.env.ADMIN_PASSWORD || 'RazanFinClickAI@056300',
                    firstName: 'Razan',
                    lastName: 'Ahmed Tawfik',
                    phone: '+966544827213',
                    companyName: 'FinClick.AI',
                    role: 'admin',
                    subscription: {
                        type: 'yearly',
                        status: 'active',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                    },
                    verification: {
                        emailVerified: true
                    },
                    isActive: true
                });

                await adminUser.save();
                this.logger.info('Admin user created successfully');
            }

            // Create guest user
            const guestExists = await User.findOne({ role: 'guest' });

            if (!guestExists) {
                const guestUser = new User({
                    email: process.env.GUEST_EMAIL || 'Guest@FinClick.AI',
                    password: process.env.GUEST_PASSWORD || 'GuestFinClickAI@123321',
                    firstName: 'Guest',
                    lastName: 'User',
                    phone: '+966000000000',
                    companyName: 'Guest Access',
                    role: 'guest',
                    subscription: {
                        type: 'guest',
                        status: 'active'
                    },
                    verification: {
                        emailVerified: true
                    },
                    isActive: true
                });

                await guestUser.save();
                this.logger.info('Guest user created successfully');
            }

            this.logger.info('Database seeding completed');
        } catch (error) {
            this.logger.error('Error seeding database:', error);
            throw error;
        }
    }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;