#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../lib/supabase');

async function setupAdmin() {
    try {
        console.log('🔧 Setting up FinClick.AI admin account...');

        const adminEmail = process.env.ADMIN_EMAIL || 'Razan@FinClick.AI';
        const adminPassword = process.env.ADMIN_PASSWORD || 'RazanFinClickAI@056300';
        const guestEmail = process.env.GUEST_EMAIL || 'Guest@FinClick.AI';
        const guestPassword = process.env.GUEST_PASSWORD || 'GuestFinClickAI@123321';

        // Hash passwords
        const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
        const guestPasswordHash = await bcrypt.hash(guestPassword, 12);

        // Check if admin already exists
        const { data: existingAdmin } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', adminEmail)
            .single();

        if (existingAdmin) {
            console.log('⚠️  Admin account already exists');
        } else {
            // Create admin account
            const { data: adminUser, error: adminError } = await supabaseAdmin
                .from('users')
                .insert({
                    email: adminEmail,
                    password: adminPasswordHash,
                    first_name: 'Razan',
                    last_name: 'Ahmed Tawfik',
                    company_name: 'FinClick.AI',
                    role: 'admin',
                    is_verified: true,
                    subscription_type: 'premium',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (adminError) {
                throw adminError;
            }

            console.log('✅ Admin account created successfully');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
        }

        // Check if guest account exists
        const { data: existingGuest } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', guestEmail)
            .single();

        if (existingGuest) {
            console.log('⚠️  Guest account already exists');
        } else {
            // Create guest account
            const { data: guestUser, error: guestError } = await supabaseAdmin
                .from('users')
                .insert({
                    email: guestEmail,
                    password: guestPasswordHash,
                    first_name: 'Guest',
                    last_name: 'User',
                    company_name: 'Demo Company',
                    role: 'user',
                    is_verified: true,
                    subscription_type: 'free',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (guestError) {
                throw guestError;
            }

            console.log('✅ Guest account created successfully');
            console.log(`   Email: ${guestEmail}`);
            console.log(`   Password: ${guestPassword}`);
        }

        // Verify system settings exist
        const { data: settings } = await supabaseAdmin
            .from('system_settings')
            .select('*')
            .limit(1);

        if (!settings || settings.length === 0) {
            console.log('🔧 Creating system settings...');

            const systemSettings = [
                {
                    key: 'platform_name',
                    value: 'FinClick.AI',
                    description: 'Platform name',
                    category: 'general'
                },
                {
                    key: 'default_language',
                    value: 'ar',
                    description: 'Default platform language',
                    category: 'localization'
                },
                {
                    key: 'supported_languages',
                    value: JSON.stringify(['ar', 'en']),
                    description: 'Supported platform languages',
                    category: 'localization'
                },
                {
                    key: 'max_file_size',
                    value: '52428800',
                    description: 'Maximum file upload size in bytes',
                    category: 'uploads'
                },
                {
                    key: 'allowed_file_types',
                    value: JSON.stringify(['.pdf', '.xlsx', '.xls', '.csv', '.jpg', '.png', '.jpeg']),
                    description: 'Allowed file types for upload',
                    category: 'uploads'
                },
                {
                    key: 'ai_enabled',
                    value: 'true',
                    description: 'Enable AI analysis features',
                    category: 'features'
                },
                {
                    key: 'payment_enabled',
                    value: 'true',
                    description: 'Enable payment processing',
                    category: 'features'
                },
                {
                    key: 'email_notifications',
                    value: 'true',
                    description: 'Enable email notifications',
                    category: 'notifications'
                },
                {
                    key: 'maintenance_mode',
                    value: 'false',
                    description: 'Enable maintenance mode',
                    category: 'system'
                }
            ];

            const { error: settingsError } = await supabaseAdmin
                .from('system_settings')
                .insert(systemSettings);

            if (settingsError) {
                console.warn('Warning: Could not create system settings:', settingsError.message);
            } else {
                console.log('✅ System settings created successfully');
            }
        }

        // Verify analysis types exist
        const { data: analysisTypes } = await supabaseAdmin
            .from('analysis_types')
            .select('id')
            .limit(1);

        if (!analysisTypes || analysisTypes.length === 0) {
            console.log('⚠️  No analysis types found. Run database seeding:');
            console.log('   node scripts/migrate.js seed');
        } else {
            console.log('✅ Analysis types verified');
        }

        // Create basic subscription plans if they don't exist
        const { data: plans } = await supabaseAdmin
            .from('subscription_plans')
            .select('id')
            .limit(1);

        if (!plans || plans.length === 0) {
            console.log('🔧 Creating subscription plans...');

            const subscriptionPlans = [
                {
                    name_ar: 'مجاني',
                    name_en: 'Free',
                    description_ar: 'خطة مجانية أساسية',
                    description_en: 'Basic free plan',
                    price: 0,
                    currency: 'SAR',
                    billing_period: 'monthly',
                    max_analyses: 5,
                    max_reports: 2,
                    features: JSON.stringify({
                        basic_analysis: true,
                        pdf_reports: true,
                        ai_insights: false,
                        priority_support: false
                    }),
                    is_active: true
                },
                {
                    name_ar: 'أساسي',
                    name_en: 'Basic',
                    description_ar: 'خطة أساسية للشركات الصغيرة',
                    description_en: 'Basic plan for small businesses',
                    price: 99,
                    currency: 'SAR',
                    billing_period: 'monthly',
                    max_analyses: 20,
                    max_reports: 10,
                    features: JSON.stringify({
                        basic_analysis: true,
                        pdf_reports: true,
                        excel_reports: true,
                        ai_insights: true,
                        priority_support: false
                    }),
                    is_active: true
                },
                {
                    name_ar: 'متقدم',
                    name_en: 'Premium',
                    description_ar: 'خطة متقدمة للشركات المتوسطة',
                    description_en: 'Premium plan for medium businesses',
                    price: 299,
                    currency: 'SAR',
                    billing_period: 'monthly',
                    max_analyses: 100,
                    max_reports: 50,
                    features: JSON.stringify({
                        basic_analysis: true,
                        pdf_reports: true,
                        excel_reports: true,
                        word_reports: true,
                        powerpoint_reports: true,
                        ai_insights: true,
                        priority_support: true,
                        api_access: true
                    }),
                    is_active: true
                },
                {
                    name_ar: 'المؤسسة',
                    name_en: 'Enterprise',
                    description_ar: 'حلول شاملة للمؤسسات الكبيرة',
                    description_en: 'Complete solutions for large enterprises',
                    price: 999,
                    currency: 'SAR',
                    billing_period: 'monthly',
                    max_analyses: -1, // Unlimited
                    max_reports: -1,  // Unlimited
                    features: JSON.stringify({
                        basic_analysis: true,
                        pdf_reports: true,
                        excel_reports: true,
                        word_reports: true,
                        powerpoint_reports: true,
                        ai_insights: true,
                        priority_support: true,
                        api_access: true,
                        white_labeling: true,
                        custom_integrations: true
                    }),
                    is_active: true
                }
            ];

            const { error: plansError } = await supabaseAdmin
                .from('subscription_plans')
                .insert(subscriptionPlans);

            if (plansError) {
                console.warn('Warning: Could not create subscription plans:', plansError.message);
            } else {
                console.log('✅ Subscription plans created successfully');
            }
        }

        console.log('\n🎉 Admin setup completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('1. Access admin panel: https://your-domain.com/admin');
        console.log('2. Run migrations: node scripts/migrate.js up');
        console.log('3. Seed data: node scripts/migrate.js seed');
        console.log('4. Start application: npm start or pm2 start ecosystem.config.js');

    } catch (error) {
        console.error('❌ Admin setup failed:', error);
        process.exit(1);
    }
}

// Run setup if called directly
if (require.main === module) {
    setupAdmin().catch(error => {
        console.error('Setup script error:', error);
        process.exit(1);
    });
}

module.exports = setupAdmin;