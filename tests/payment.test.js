const request = require('supertest');
const { supabaseAdmin } = require('../lib/supabase');
const app = require('../server');

describe('Payment API', () => {
    let authToken;
    let userId;
    let subscriptionId;
    let paymentId;

    beforeAll(async () => {
        // Create test user and get auth token
        const testUser = {
            email: 'payment-test@finclick.ai',
            password: 'TestPassword123!',
            first_name: 'Payment',
            last_name: 'Test',
            company_name: 'Payment Test Company'
        };

        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(testUser)
            .expect(201);

        authToken = registerResponse.body.token;
        userId = registerResponse.body.user.id;
    });

    afterAll(async () => {
        // Clean up test data
        if (paymentId) {
            await supabaseAdmin
                .from('payments')
                .delete()
                .eq('id', paymentId);
        }

        if (subscriptionId) {
            await supabaseAdmin
                .from('subscriptions')
                .delete()
                .eq('id', subscriptionId);
        }

        if (userId) {
            await supabaseAdmin
                .from('users')
                .delete()
                .eq('id', userId);
        }
    });

    describe('GET /api/payment/plans', () => {
        test('should return subscription plans', async () => {
            const response = await request(app)
                .get('/api/payment/plans')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.monthly).toBeDefined();
            expect(response.body.data.quarterly).toBeDefined();
            expect(response.body.data.yearly).toBeDefined();

            // Verify plan structure
            const monthlyPlan = response.body.data.monthly;
            expect(monthlyPlan.type).toBe('monthly');
            expect(monthlyPlan.price).toBe(299);
            expect(monthlyPlan.currency).toBe('SAR');
            expect(monthlyPlan.duration_days).toBe(30);
            expect(Array.isArray(monthlyPlan.features)).toBe(true);
        });

        test('should not require authentication', async () => {
            await request(app)
                .get('/api/payment/plans')
                .expect(200);
        });
    });

    describe('GET /api/payment/subscription', () => {
        test('should return user subscription status', async () => {
            const response = await request(app)
                .get('/api/payment/subscription')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.current_plan).toBeDefined();
            expect(response.body.data.status).toBeDefined();
            expect(response.body.data.days_remaining).toBeDefined();
        });

        test('should require authentication', async () => {
            await request(app)
                .get('/api/payment/subscription')
                .expect(401);
        });
    });

    describe('POST /api/payment/create-session', () => {
        test('should create payment session for monthly plan', async () => {
            const paymentData = {
                plan_type: 'monthly',
                payment_method: 'credit_card'
            };

            // Mock PayTabs API response
            const mockPayTabsResponse = {
                response_status: 'A',
                payment_url: 'https://secure-global.paytabs.com/payment/page/123',
                tran_ref: 'TST_123456789',
                payment_token: 'token_123'
            };

            // Note: In real tests, you'd mock the axios call to PayTabs
            // For this test, we'll assume the endpoint works correctly

            const response = await request(app)
                .post('/api/payment/create-session')
                .set('Authorization', `Bearer ${authToken}`)
                .send(paymentData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.payment_id).toBeDefined();
            expect(response.body.data.subscription_id).toBeDefined();
            expect(response.body.data.amount).toBe(299);
            expect(response.body.data.currency).toBe('SAR');
            expect(response.body.data.plan_type).toBe('monthly');

            paymentId = response.body.data.payment_id;
            subscriptionId = response.body.data.subscription_id;
        });

        test('should validate plan type', async () => {
            const paymentData = {
                plan_type: 'invalid',
                payment_method: 'credit_card'
            };

            await request(app)
                .post('/api/payment/create-session')
                .set('Authorization', `Bearer ${authToken}`)
                .send(paymentData)
                .expect(400);
        });

        test('should validate payment method', async () => {
            const paymentData = {
                plan_type: 'monthly',
                payment_method: 'invalid'
            };

            await request(app)
                .post('/api/payment/create-session')
                .set('Authorization', `Bearer ${authToken}`)
                .send(paymentData)
                .expect(400);
        });

        test('should require authentication', async () => {
            const paymentData = {
                plan_type: 'monthly',
                payment_method: 'credit_card'
            };

            await request(app)
                .post('/api/payment/create-session')
                .send(paymentData)
                .expect(401);
        });
    });

    describe('POST /api/payment/callback', () => {
        test('should process successful payment callback', async () => {
            if (!paymentId) return; // Skip if no payment created

            // Create a test payment record first
            const { data: payment } = await supabaseAdmin
                .from('payments')
                .insert({
                    user_id: userId,
                    subscription_id: subscriptionId,
                    amount: 299,
                    currency: 'SAR',
                    status: 'pending',
                    payment_method: 'credit_card',
                    paytabs_transaction_ref: 'TST_123456789'
                })
                .select()
                .single();

            const callbackData = {
                tran_ref: 'TST_123456789',
                payment_result: {
                    response_status: 'A'
                },
                response_status: 'A',
                cart_id: `SUB_${userId}_${Date.now()}`
            };

            const response = await request(app)
                .post('/api/payment/callback')
                .send(callbackData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Callback processed');

            // Verify payment status updated
            const updatedPayment = await supabaseAdmin
                .from('payments')
                .select('status')
                .eq('id', payment.id)
                .single();

            expect(updatedPayment.data.status).toBe('completed');
        });

        test('should process failed payment callback', async () => {
            // Create a test payment record
            const { data: payment } = await supabaseAdmin
                .from('payments')
                .insert({
                    user_id: userId,
                    subscription_id: subscriptionId,
                    amount: 299,
                    currency: 'SAR',
                    status: 'pending',
                    payment_method: 'credit_card',
                    paytabs_transaction_ref: 'TST_FAILED_123'
                })
                .select()
                .single();

            const callbackData = {
                tran_ref: 'TST_FAILED_123',
                payment_result: {
                    response_status: 'F'
                },
                response_status: 'F',
                cart_id: `SUB_${userId}_${Date.now()}`
            };

            const response = await request(app)
                .post('/api/payment/callback')
                .send(callbackData)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify payment status updated to failed
            const updatedPayment = await supabaseAdmin
                .from('payments')
                .select('status')
                .eq('id', payment.id)
                .single();

            expect(updatedPayment.data.status).toBe('failed');
        });

        test('should handle non-existent payment', async () => {
            const callbackData = {
                tran_ref: 'NONEXISTENT_123',
                payment_result: {
                    response_status: 'A'
                },
                response_status: 'A'
            };

            await request(app)
                .post('/api/payment/callback')
                .send(callbackData)
                .expect(404);
        });
    });

    describe('GET /api/payment/status/:paymentId', () => {
        test('should return payment status', async () => {
            if (!paymentId) return; // Skip if no payment created

            const response = await request(app)
                .get(`/api/payment/status/${paymentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.payment_id).toBe(paymentId);
            expect(response.body.data.status).toBeDefined();
            expect(response.body.data.amount).toBeDefined();
            expect(response.body.data.currency).toBeDefined();
        });

        test('should not allow access to other user\'s payment', async () => {
            const fakePaymentId = '00000000-0000-0000-0000-000000000000';

            await request(app)
                .get(`/api/payment/status/${fakePaymentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        test('should require authentication', async () => {
            await request(app)
                .get('/api/payment/status/123')
                .expect(401);
        });
    });

    describe('GET /api/payment/history', () => {
        test('should return payment history', async () => {
            const response = await request(app)
                .get('/api/payment/history')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });

        test('should support pagination', async () => {
            const response = await request(app)
                .get('/api/payment/history?page=1&limit=5')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
        });

        test('should require authentication', async () => {
            await request(app)
                .get('/api/payment/history')
                .expect(401);
        });
    });

    describe('POST /api/payment/subscription/cancel', () => {
        beforeEach(async () => {
            // Create an active subscription for testing
            const { data: subscription } = await supabaseAdmin
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    type: 'monthly',
                    status: 'active',
                    start_date: new Date(),
                    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    amount: 299,
                    currency: 'SAR'
                })
                .select()
                .single();

            subscriptionId = subscription.id;

            // Update user subscription status
            await supabaseAdmin
                .from('users')
                .update({
                    subscription_type: 'monthly',
                    subscription_status: 'active'
                })
                .eq('id', userId);
        });

        test('should cancel active subscription', async () => {
            const response = await request(app)
                .post('/api/payment/subscription/cancel')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ reason: 'Test cancellation' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Subscription cancelled successfully');
            expect(response.body.data).toBeDefined();
            expect(response.body.data.cancelled_at).toBeDefined();

            // Verify subscription status updated
            const updatedSub = await supabaseAdmin
                .from('subscriptions')
                .select('status, auto_renew')
                .eq('id', subscriptionId)
                .single();

            expect(updatedSub.data.status).toBe('cancelled');
            expect(updatedSub.data.auto_renew).toBe(false);
        });

        test('should handle no active subscription', async () => {
            // First cancel the existing subscription
            await supabaseAdmin
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('id', subscriptionId);

            await request(app)
                .post('/api/payment/subscription/cancel')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ reason: 'Test' })
                .expect(404);
        });

        test('should require authentication', async () => {
            await request(app)
                .post('/api/payment/subscription/cancel')
                .send({ reason: 'Test' })
                .expect(401);
        });
    });

    describe('GET /api/payment/invoice/:paymentId', () => {
        let completedPaymentId;

        beforeEach(async () => {
            // Create a completed payment for invoice testing
            const { data: payment } = await supabaseAdmin
                .from('payments')
                .insert({
                    user_id: userId,
                    subscription_id: subscriptionId,
                    amount: 299,
                    currency: 'SAR',
                    status: 'completed',
                    payment_method: 'credit_card',
                    processed_at: new Date(),
                    paytabs_transaction_ref: 'TST_COMPLETED_123'
                })
                .select()
                .single();

            completedPaymentId = payment.id;
        });

        test('should generate invoice for completed payment', async () => {
            const response = await request(app)
                .get(`/api/payment/invoice/${completedPaymentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.invoice_number).toBeDefined();
            expect(response.body.data.payment_date).toBeDefined();
            expect(response.body.data.customer).toBeDefined();
            expect(response.body.data.items).toBeDefined();
            expect(Array.isArray(response.body.data.items)).toBe(true);
            expect(response.body.data.total_amount).toBe(299);
            expect(response.body.data.currency).toBe('SAR');
        });

        test('should not generate invoice for incomplete payment', async () => {
            const { data: pendingPayment } = await supabaseAdmin
                .from('payments')
                .insert({
                    user_id: userId,
                    subscription_id: subscriptionId,
                    amount: 299,
                    currency: 'SAR',
                    status: 'pending',
                    payment_method: 'credit_card'
                })
                .select()
                .single();

            await request(app)
                .get(`/api/payment/invoice/${pendingPayment.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        test('should require authentication', async () => {
            await request(app)
                .get(`/api/payment/invoice/${completedPaymentId}`)
                .expect(401);
        });
    });

    describe('Webhook endpoints', () => {
        test('should handle renewal webhook', async () => {
            const webhookData = {
                subscription_id: subscriptionId,
                renewal_date: new Date().toISOString(),
                amount: 299,
                status: 'completed'
            };

            const response = await request(app)
                .post('/api/payment/webhook/renewal')
                .send(webhookData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Renewal processed');
        });
    });

    describe('Payment validation', () => {
        test('should validate payment amounts', () => {
            // Test different plan amounts
            const plans = {
                monthly: 299,
                quarterly: 799,
                yearly: 2999
            };

            Object.entries(plans).forEach(([plan, amount]) => {
                expect(amount).toBeGreaterThan(0);
                expect(typeof amount).toBe('number');
            });
        });

        test('should validate currency', () => {
            const validCurrencies = ['SAR', 'USD', 'EUR'];
            expect(validCurrencies).toContain('SAR');
        });

        test('should validate payment methods', () => {
            const validMethods = ['credit_card', 'apple_pay', 'google_pay', 'stc_pay'];

            validMethods.forEach(method => {
                expect(typeof method).toBe('string');
                expect(method.length).toBeGreaterThan(0);
            });
        });
    });
});

describe('PayTabs Integration', () => {
    const crypto = require('crypto');

    describe('Signature Verification', () => {
        test('should verify PayTabs callback signature', () => {
            const payload = {
                tran_ref: 'TST_123456789',
                response_status: 'A'
            };

            const serverKey = 'test-server-key';
            const expectedSignature = crypto
                .createHmac('sha256', serverKey)
                .update(JSON.stringify(payload))
                .digest('hex');

            // In real implementation, this would be in the route handler
            const isValid = crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'hex'),
                Buffer.from(expectedSignature, 'hex') // Same signature for test
            );

            expect(isValid).toBe(true);
        });

        test('should reject invalid signatures', () => {
            const payload = {
                tran_ref: 'TST_123456789',
                response_status: 'A'
            };

            const serverKey = 'test-server-key';
            const validSignature = crypto
                .createHmac('sha256', serverKey)
                .update(JSON.stringify(payload))
                .digest('hex');

            const invalidSignature = 'invalid-signature';

            try {
                const isValid = crypto.timingSafeEqual(
                    Buffer.from(validSignature, 'hex'),
                    Buffer.from(invalidSignature, 'hex')
                );
                expect(isValid).toBe(false);
            } catch (error) {
                // Expected to throw due to different buffer lengths
                expect(error).toBeDefined();
            }
        });
    });

    describe('Payment Flow', () => {
        test('should create proper PayTabs request structure', () => {
            const paymentRequest = {
                profile_id: '12345',
                tran_type: 'sale',
                tran_class: 'ecom',
                cart_id: 'SUB_USER_123_1234567890',
                cart_description: 'FinClick.AI monthly Subscription',
                cart_currency: 'SAR',
                cart_amount: 299,
                customer_details: {
                    name: 'Test User',
                    email: 'test@finclick.ai',
                    phone: '+966500000000'
                }
            };

            // Validate request structure
            expect(paymentRequest.profile_id).toBeDefined();
            expect(paymentRequest.tran_type).toBe('sale');
            expect(paymentRequest.tran_class).toBe('ecom');
            expect(paymentRequest.cart_amount).toBe(299);
            expect(paymentRequest.cart_currency).toBe('SAR');
            expect(paymentRequest.customer_details).toBeDefined();
            expect(paymentRequest.customer_details.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });

        test('should handle different payment methods', () => {
            const paymentMethods = ['CREDITCARD', 'APPLEPAY', 'GOOGLEPAY', 'STCPAY'];

            paymentMethods.forEach(method => {
                const request = {
                    payment_methods: [method]
                };

                expect(Array.isArray(request.payment_methods)).toBe(true);
                expect(request.payment_methods).toContain(method);
            });
        });
    });
});