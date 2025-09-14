-- Row Level Security (RLS) Policies for FinClick.AI
-- This migration adds comprehensive security policies for all tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Users can only see their own record
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own record
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Only admins can insert users (for admin registration)
CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Admins can see all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Admins can update any user
CREATE POLICY "Admins can update any user" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for subscriptions table
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- System can insert subscriptions
CREATE POLICY "System can insert subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (true);

-- Admins can see all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for documents table
-- Users can view their own documents
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents" ON documents
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update their own documents
CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Admins can see all documents
CREATE POLICY "Admins can view all documents" ON documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for analyses table
-- Users can view their own analyses
CREATE POLICY "Users can view own analyses" ON analyses
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses" ON analyses
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update their own analyses
CREATE POLICY "Users can update own analyses" ON analyses
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses" ON analyses
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Admins can see all analyses
CREATE POLICY "Admins can view all analyses" ON analyses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for analysis_results table
-- Users can view results for their own analyses
CREATE POLICY "Users can view own analysis results" ON analysis_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = analysis_results.analysis_id
            AND analyses.user_id::text = auth.uid()::text
        )
    );

-- System can insert analysis results
CREATE POLICY "System can insert analysis results" ON analysis_results
    FOR INSERT WITH CHECK (true);

-- Users can update results for their own analyses
CREATE POLICY "Users can update own analysis results" ON analysis_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = analysis_results.analysis_id
            AND analyses.user_id::text = auth.uid()::text
        )
    );

-- Admins can see all analysis results
CREATE POLICY "Admins can view all analysis results" ON analysis_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for reports table
-- Users can view reports for their own analyses
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reports.analysis_id
            AND analyses.user_id::text = auth.uid()::text
        )
    );

-- System can insert reports
CREATE POLICY "System can insert reports" ON reports
    FOR INSERT WITH CHECK (true);

-- Users can update reports for their own analyses
CREATE POLICY "Users can update own reports" ON reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reports.analysis_id
            AND analyses.user_id::text = auth.uid()::text
        )
    );

-- Users can delete reports for their own analyses
CREATE POLICY "Users can delete own reports" ON reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reports.analysis_id
            AND analyses.user_id::text = auth.uid()::text
        )
    );

-- Admins can see all reports
CREATE POLICY "Admins can view all reports" ON reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for payments table
-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- System can insert payments
CREATE POLICY "System can insert payments" ON payments
    FOR INSERT WITH CHECK (true);

-- System can update payments
CREATE POLICY "System can update payments" ON payments
    FOR UPDATE USING (true);

-- Admins can see all payments
CREATE POLICY "Admins can view all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for user_sessions table
-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- System can insert sessions
CREATE POLICY "System can insert sessions" ON user_sessions
    FOR INSERT WITH CHECK (true);

-- System can update sessions
CREATE POLICY "System can update sessions" ON user_sessions
    FOR UPDATE USING (true);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON user_sessions
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Admins can see all sessions
CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for audit_log table
-- Only admins can see audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_log
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for ai_agent_logs table
-- Users can view AI logs for their own analyses
CREATE POLICY "Users can view own AI logs" ON ai_agent_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = ai_agent_logs.analysis_id
            AND analyses.user_id::text = auth.uid()::text
        )
    );

-- System can insert AI logs
CREATE POLICY "System can insert AI logs" ON ai_agent_logs
    FOR INSERT WITH CHECK (true);

-- Admins can see all AI logs
CREATE POLICY "Admins can view all AI logs" ON ai_agent_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create RLS policies for market_data table
-- Market data is public (read-only)
CREATE POLICY "Anyone can view market data" ON market_data
    FOR SELECT USING (true);

-- Only admins can modify market data
CREATE POLICY "Only admins can modify market data" ON market_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Analysis types, company sectors, legal entities are public read-only
-- Users can read these reference tables but not modify
ALTER TABLE analysis_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables
CREATE POLICY "Anyone can view analysis types" ON analysis_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view company sectors" ON company_sectors FOR SELECT USING (true);
CREATE POLICY "Anyone can view legal entities" ON legal_entities FOR SELECT USING (true);
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can view system settings" ON system_settings FOR SELECT USING (true);

-- Only admins can modify reference tables
CREATE POLICY "Only admins can modify analysis types" ON analysis_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify company sectors" ON company_sectors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify legal entities" ON legal_entities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify subscription plans" ON subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create security functions
CREATE OR REPLACE FUNCTION auth.uid() RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('request.jwt.claim.sub', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id::text = auth.uid()::text
        AND role = 'admin'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    table_name TEXT,
    action_type TEXT,
    record_id UUID,
    old_values JSONB DEFAULT NULL,
    new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_log (
        user_id,
        table_name,
        action_type,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        auth.uid()::UUID,
        table_name,
        action_type,
        record_id,
        old_values,
        new_values,
        current_setting('request.headers.x-forwarded-for', true),
        current_setting('request.headers.user-agent', true),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging on sensitive tables
CREATE OR REPLACE FUNCTION audit_trigger_function() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM log_audit_event(TG_TABLE_NAME, 'DELETE', OLD.id, row_to_json(OLD)::jsonb, NULL);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_event(TG_TABLE_NAME, 'UPDATE', NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM log_audit_event(TG_TABLE_NAME, 'INSERT', NEW.id, NULL, row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
DROP TRIGGER IF EXISTS audit_trigger_users ON users;
CREATE TRIGGER audit_trigger_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_trigger_subscriptions ON subscriptions;
CREATE TRIGGER audit_trigger_subscriptions
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_trigger_payments ON payments;
CREATE TRIGGER audit_trigger_payments
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_trigger_analyses ON analyses;
CREATE TRIGGER audit_trigger_analyses
    AFTER INSERT OR UPDATE OR DELETE ON analyses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create function to validate user permissions
CREATE OR REPLACE FUNCTION validate_user_access(user_id UUID, resource_type TEXT, resource_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    subscription_status TEXT;
BEGIN
    -- Get user role and subscription status
    SELECT u.role, u.subscription_status INTO user_role, subscription_status
    FROM users u
    WHERE u.id = user_id AND u.is_active = true;

    -- Admin can access everything
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;

    -- Check if user exists and is active
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check subscription status for premium features
    IF resource_type IN ('ai_analysis', 'advanced_reports', 'bulk_analysis')
       AND subscription_status NOT IN ('active', 'trial') THEN
        RETURN FALSE;
    END IF;

    -- Additional resource-specific checks
    CASE resource_type
        WHEN 'analysis' THEN
            RETURN EXISTS (
                SELECT 1 FROM analyses
                WHERE id = resource_id AND analyses.user_id = user_id
            );
        WHEN 'document' THEN
            RETURN EXISTS (
                SELECT 1 FROM documents
                WHERE id = resource_id AND documents.user_id = user_id
            );
        WHEN 'report' THEN
            RETURN EXISTS (
                SELECT 1 FROM reports r
                JOIN analyses a ON r.analysis_id = a.id
                WHERE r.id = resource_id AND a.user_id = user_id
            );
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for RLS performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_auth_uid ON users(id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analysis_results_analysis_id ON analysis_results(analysis_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_analysis_id ON reports(analysis_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_agent_logs_analysis_id ON ai_agent_logs(analysis_id);

-- Grant necessary permissions to application role
-- These would be set up in your application's database user
COMMENT ON SCHEMA public IS 'FinClick.AI Database Schema with Row Level Security';
COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin privileges';
COMMENT ON FUNCTION validate_user_access(UUID, TEXT, UUID) IS 'Validate user access to specific resources';
COMMENT ON FUNCTION log_audit_event(TEXT, TEXT, UUID, JSONB, JSONB) IS 'Log audit events for security tracking';