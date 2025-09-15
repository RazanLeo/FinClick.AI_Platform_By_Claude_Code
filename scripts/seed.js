const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.SUPABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Create default users as specified in the prompt
const createDefaultUsers = async () => {
  try {
    console.log('Creating default users...');

    // 1. Admin Account - exactly as specified in the prompt
    const adminExists = await User.findOne({ email: 'Razan@FinClick.AI' });
    if (!adminExists) {
      const adminUser = new User({
        email: 'Razan@FinClick.AI',
        password: 'RazanFinClickAI@056300', // Will be hashed automatically by the schema
        firstName: 'Razan',
        lastName: 'Tawfik',
        phone: '+966544827213',
        companyName: 'FinClick.AI',
        role: 'admin',
        subscription: {
          type: 'yearly',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        },
        preferences: {
          language: 'ar',
          currency: 'SAR',
          timezone: 'Asia/Riyadh'
        },
        profile: {
          sector: 'التكنولوجيا المالية',
          activity: 'تطوير منصات التحليل المالي',
          legalEntity: 'شركة مساهمة مبسطة',
          comparisonLevel: 'global'
        },
        verification: {
          emailVerified: true
        },
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Admin account created successfully');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    // 2. Guest Account - exactly as specified in the prompt
    const guestExists = await User.findOne({ email: 'Guest@FinClick.AI' });
    if (!guestExists) {
      const guestUser = new User({
        email: 'Guest@FinClick.AI',
        password: 'GuestFinClickAI@123321', // Will be hashed automatically by the schema
        firstName: 'Guest',
        lastName: 'User',
        phone: '+966000000000',
        companyName: 'Guest Demo Company',
        role: 'guest',
        subscription: {
          type: 'guest',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years (permanent)
        },
        preferences: {
          language: 'ar',
          currency: 'SAR',
          timezone: 'Asia/Riyadh'
        },
        profile: {
          sector: 'تجريبي',
          activity: 'حساب ضيف للتجربة',
          legalEntity: 'شركة تجريبية',
          comparisonLevel: 'local_saudi'
        },
        verification: {
          emailVerified: true
        },
        isActive: true
      });

      await guestUser.save();
      console.log('✅ Guest account created successfully');
      console.log(`   Email: ${guestUser.email}`);
      console.log(`   Role: ${guestUser.role}`);
    } else {
      console.log('ℹ️  Guest account already exists');
    }

    // 3. Sample regular user account for testing
    const testUserExists = await User.findOne({ email: 'test@finclick.ai' });
    if (!testUserExists) {
      const testUser = new User({
        email: 'test@finclick.ai',
        password: 'TestUser123@', // Will be hashed automatically by the schema
        firstName: 'Test',
        lastName: 'User',
        phone: '+966555555555',
        companyName: 'Test Company Ltd',
        role: 'user',
        subscription: {
          type: 'monthly',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        preferences: {
          language: 'ar',
          currency: 'SAR',
          timezone: 'Asia/Riyadh'
        },
        profile: {
          sector: 'التجارة والتجزئة',
          activity: 'تجارة إلكترونية',
          legalEntity: 'شركة ذات مسؤولية محدودة',
          comparisonLevel: 'local_saudi'
        },
        verification: {
          emailVerified: true
        },
        isActive: true
      });

      await testUser.save();
      console.log('✅ Test user account created successfully');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Role: ${testUser.role}`);
    } else {
      console.log('ℹ️  Test user account already exists');
    }

    console.log('\n🎉 All default users have been processed successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('👤 Admin Account:');
    console.log('   Email: Razan@FinClick.AI');
    console.log('   Password: RazanFinClickAI@056300');
    console.log('   Role: admin');
    console.log('');
    console.log('🎯 Guest Account:');
    console.log('   Email: Guest@FinClick.AI');
    console.log('   Password: GuestFinClickAI@123321');
    console.log('   Role: guest');
    console.log('');
    console.log('🧪 Test User Account:');
    console.log('   Email: test@finclick.ai');
    console.log('   Password: TestUser123@');
    console.log('   Role: user');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('Error creating default users:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    await createDefaultUsers();

    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  createDefaultUsers
};