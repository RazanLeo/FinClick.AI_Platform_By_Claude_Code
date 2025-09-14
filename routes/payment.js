const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');
const winston = require('winston');

const router = express.Router();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/payment.log' })
    ]
});

// PayTabs configuration
const PAYTABS_CONFIG = {
    profile_id: process.env.PAYTABS_PROFILE_ID,
    server_key: process.env.PAYTABS_SERVER_KEY,
    base_url: process.env.PAYTABS_BASE_URL || 'https://secure-global.paytabs.com',
    region: process.env.PAYTABS_REGION || 'GLOBAL'
};

// Subscription plans
const SUBSCRIPTION_PLANS = {
    monthly: {
        type: 'monthly',
        price: 299,
        currency: 'SAR',
        duration_days: 30,
        features: ['Basic Analysis', '10 Reports/Month', 'Email Support']
    },
    quarterly: {
        type: 'quarterly',
        price: 799,
        currency: 'SAR',
        duration_days: 90,
        features: ['Advanced Analysis', '50 Reports/Quarter', 'Priority Support', '10% Savings']
    },
    yearly: {
        type: 'yearly',
        price: 2999,
        currency: 'SAR',
        duration_days: 365,
        features: ['Premium Analysis', 'Unlimited Reports', '24/7 Support', '20% Savings', 'Custom Templates']
    }
};

// Get subscription plans
router.get('/plans', async (req, res) => {
    try {
        res.json({
            success: true,
            data: SUBSCRIPTION_PLANS
        });
    } catch (error) {
        logger.error('Error fetching subscription plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription plans',
            error: error.message
        });
    }
});

// Get user's subscription status
router.get('/subscription', authenticate, async (req, res) => {
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('subscription_type, subscription_status, subscription_start_date, subscription_end_date')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        const { data: currentSubscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        res.json({
            success: true,
            data: {
                current_plan: user.subscription_type,
                status: user.subscription_status,
                start_date: user.subscription_start_date,
                end_date: user.subscription_end_date,
                subscription_details: currentSubscription || null,
                days_remaining: user.subscription_end_date ?
                    Math.max(0, Math.ceil((new Date(user.subscription_end_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0
            }
        });

    } catch (error) {
        logger.error('Error fetching subscription status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription status',
            error: error.message
        });
    }
});

// Create payment session
router.post('/create-session', authenticate, async (req, res) => {
    try {
        const { plan_type, payment_method } = req.body;

        if (!plan_type || !SUBSCRIPTION_PLANS[plan_type]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription plan'
            });
        }

        if (!payment_method || !['credit_card', 'apple_pay', 'google_pay', 'stc_pay'].includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }

        const plan = SUBSCRIPTION_PLANS[plan_type];
        const orderId = `SUB_${req.user.id}_${Date.now()}`;

        // Create subscription record
        const subscriptionData = {
            user_id: req.user.id,
            type: plan.type,
            status: 'inactive',
            start_date: new Date(),
            end_date: new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000),
            amount: plan.price,
            currency: plan.currency,
            auto_renew: true
        };

        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .insert(subscriptionData)
            .select()
            .single();

        if (subError) throw subError;

        // Create payment record
        const paymentData = {
            user_id: req.user.id,
            subscription_id: subscription.id,
            amount: plan.price,
            currency: plan.currency,
            status: 'pending',
            payment_method: payment_method,
            transaction_id: orderId
        };

        const { data: payment, error: payError } = await supabaseAdmin
            .from('payments')
            .insert(paymentData)
            .select()
            .single();

        if (payError) throw payError;

        // Create PayTabs payment session
        const paymentRequest = {
            profile_id: PAYTABS_CONFIG.profile_id,
            tran_type: 'sale',
            tran_class: 'ecom',
            cart_id: orderId,
            cart_description: `FinClick.AI ${plan.type} Subscription`,
            cart_currency: plan.currency,
            cart_amount: plan.price,
            callback: `${process.env.BASE_URL}/api/payment/callback`,
            return: `${process.env.BASE_URL}/payment/success?payment_id=${payment.id}`,
            customer_details: {
                name: `${req.user.first_name} ${req.user.last_name}`,
                email: req.user.email,
                phone: req.user.phone || '+966500000000',
                street1: 'N/A',
                city: 'Riyadh',
                state: 'Riyadh',
                country: 'SA',
                zip: '11564'
            },
            payment_methods: [payment_method.toUpperCase()],
            hide_shipping: true,
            framed: false
        };

        // Add payment method specific configurations
        if (payment_method === 'apple_pay') {
            paymentRequest.apple_pay = {
                merchant_id: process.env.APPLE_PAY_MERCHANT_ID
            };
        } else if (payment_method === 'google_pay') {
            paymentRequest.google_pay = {
                merchant_id: process.env.GOOGLE_PAY_MERCHANT_ID
            };
        }

        const paytabsResponse = await axios.post(
            `${PAYTABS_CONFIG.base_url}/payment/request`,
            paymentRequest,
            {
                headers: {
                    'Authorization': PAYTABS_CONFIG.server_key,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (paytabsResponse.data.response_status !== 'A') {
            throw new Error(`PayTabs error: ${paytabsResponse.data.result}`);
        }

        // Update payment with PayTabs response
        await supabaseAdmin
            .from('payments')
            .update({
                paytabs_transaction_ref: paytabsResponse.data.tran_ref,
                paytabs_payment_token: paytabsResponse.data.payment_token || null,
                payment_data: paytabsResponse.data
            })
            .eq('id', payment.id);

        logger.info(`Payment session created: ${payment.id} for user ${req.user.id}`);

        res.json({
            success: true,
            data: {
                payment_id: payment.id,
                subscription_id: subscription.id,
                payment_url: paytabsResponse.data.payment_url,
                tran_ref: paytabsResponse.data.tran_ref,
                amount: plan.price,
                currency: plan.currency,
                plan_type: plan.type
            }
        });

    } catch (error) {
        logger.error('Error creating payment session:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment session',
            error: error.message
        });
    }
});

// Payment callback from PayTabs
router.post('/callback', async (req, res) => {
    try {
        const paymentResponse = req.body;
        logger.info('PayTabs callback received:', paymentResponse);

        // Verify the callback signature
        const signature = req.headers['signature'] || req.headers['x-paytabs-signature'];
        if (signature && !verifyPayTabsSignature(req.body, signature)) {
            logger.warn('Invalid PayTabs signature');
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const { tran_ref, payment_result, response_status, cart_id } = paymentResponse;

        // Find the payment record
        const { data: payment, error: paymentError } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                subscriptions(*)
            `)
            .eq('paytabs_transaction_ref', tran_ref)
            .single();

        if (paymentError || !payment) {
            logger.error('Payment record not found for tran_ref:', tran_ref);
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        let paymentStatus = 'failed';
        let subscriptionStatus = 'inactive';

        // Process payment result
        if (response_status === 'A' && payment_result?.response_status === 'A') {
            paymentStatus = 'completed';
            subscriptionStatus = 'active';
            logger.info(`Payment successful: ${payment.id}`);
        } else {
            logger.warn(`Payment failed: ${payment.id}, status: ${response_status}, result: ${payment_result?.response_status}`);
        }

        // Update payment status
        await supabaseAdmin
            .from('payments')
            .update({
                status: paymentStatus,
                payment_data: { ...payment.payment_data, callback_response: paymentResponse },
                processed_at: new Date()
            })
            .eq('id', payment.id);

        // Update subscription status
        if (paymentStatus === 'completed') {
            await supabaseAdmin
                .from('subscriptions')
                .update({
                    status: subscriptionStatus
                })
                .eq('id', payment.subscription_id);

            // Update user subscription
            await supabaseAdmin
                .from('users')
                .update({
                    subscription_type: payment.subscriptions.type,
                    subscription_status: subscriptionStatus,
                    subscription_start_date: payment.subscriptions.start_date,
                    subscription_end_date: payment.subscriptions.end_date
                })
                .eq('id', payment.user_id);

            logger.info(`Subscription activated: ${payment.subscription_id} for user ${payment.user_id}`);
        }

        res.json({ success: true, message: 'Callback processed' });

    } catch (error) {
        logger.error('Error processing PayTabs callback:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing callback',
            error: error.message
        });
    }
});

// Get payment status
router.get('/status/:paymentId', authenticate, async (req, res) => {
    try {
        const { paymentId } = req.params;

        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                subscriptions(*)
            `)
            .eq('id', paymentId)
            .eq('user_id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: {
                payment_id: payment.id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                payment_method: payment.payment_method,
                created_at: payment.created_at,
                processed_at: payment.processed_at,
                subscription: payment.subscriptions
            }
        });

    } catch (error) {
        logger.error('Error fetching payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment status',
            error: error.message
        });
    }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { data: payments, error } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                subscriptions(type, start_date, end_date)
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                has_more: payments.length === parseInt(limit)
            }
        });

    } catch (error) {
        logger.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history',
            error: error.message
        });
    }
});

// Cancel subscription
router.post('/subscription/cancel', authenticate, async (req, res) => {
    try {
        const { reason } = req.body;

        // Get current active subscription
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (subError || !subscription) {
            return res.status(404).json({
                success: false,
                message: 'No active subscription found'
            });
        }

        // Update subscription to cancelled
        await supabaseAdmin
            .from('subscriptions')
            .update({
                status: 'cancelled',
                auto_renew: false,
                updated_at: new Date()
            })
            .eq('id', subscription.id);

        // Update user subscription status
        await supabaseAdmin
            .from('users')
            .update({
                subscription_status: 'cancelled'
            })
            .eq('id', req.user.id);

        logger.info(`Subscription cancelled: ${subscription.id} for user ${req.user.id}, reason: ${reason || 'Not specified'}`);

        res.json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: {
                cancelled_at: new Date(),
                access_until: subscription.end_date,
                reason: reason || 'User requested cancellation'
            }
        });

    } catch (error) {
        logger.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling subscription',
            error: error.message
        });
    }
});

// Verify PayTabs callback signature
function verifyPayTabsSignature(payload, signature) {
    try {
        if (!PAYTABS_CONFIG.server_key || !signature) {
            return false;
        }

        const expectedSignature = crypto
            .createHmac('sha256', PAYTABS_CONFIG.server_key)
            .update(JSON.stringify(payload))
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (error) {
        logger.error('Error verifying PayTabs signature:', error);
        return false;
    }
}

// Webhook for subscription renewals (for future implementation)
router.post('/webhook/renewal', async (req, res) => {
    try {
        // This would handle automatic subscription renewals
        // Implementation would depend on PayTabs webhook configuration

        const { subscription_id, renewal_date, amount, status } = req.body;

        logger.info(`Renewal webhook received for subscription: ${subscription_id}`);

        // Process renewal logic here

        res.json({ success: true, message: 'Renewal processed' });

    } catch (error) {
        logger.error('Error processing renewal webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing renewal',
            error: error.message
        });
    }
});

// Get invoice
router.get('/invoice/:paymentId', authenticate, async (req, res) => {
    try {
        const { paymentId } = req.params;

        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                subscriptions(*),
                users(first_name, last_name, email, company_name)
            `)
            .eq('id', paymentId)
            .eq('user_id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Invoice not available for incomplete payments'
            });
        }

        // Generate invoice data
        const invoiceData = {
            invoice_number: `INV-${payment.id}-${new Date(payment.created_at).getFullYear()}`,
            payment_date: payment.processed_at || payment.created_at,
            customer: {
                name: `${payment.users.first_name} ${payment.users.last_name}`,
                email: payment.users.email,
                company: payment.users.company_name
            },
            items: [{
                description: `FinClick.AI ${payment.subscriptions.type} Subscription`,
                period: `${new Date(payment.subscriptions.start_date).toLocaleDateString()} - ${new Date(payment.subscriptions.end_date).toLocaleDateString()}`,
                amount: payment.amount,
                currency: payment.currency
            }],
            total_amount: payment.amount,
            currency: payment.currency,
            payment_method: payment.payment_method,
            transaction_ref: payment.paytabs_transaction_ref
        };

        res.json({
            success: true,
            data: invoiceData
        });

    } catch (error) {
        logger.error('Error generating invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating invoice',
            error: error.message
        });
    }
});

module.exports = router;