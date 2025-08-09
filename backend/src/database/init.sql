-- KRYONIX Platform Database Schema
-- PostgreSQL Multi-Tenant Architecture
-- Production-ready with indexes and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    interest_type VARCHAR(100) DEFAULT 'general',
    message TEXT,
    position INTEGER,
    notified BOOLEAN DEFAULT FALSE,
    priority_score INTEGER DEFAULT 0,
    source VARCHAR(100) DEFAULT 'website',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'new',
    priority VARCHAR(20) DEFAULT 'normal',
    assigned_to INTEGER,
    response_sent BOOLEAN DEFAULT FALSE,
    response_date TIMESTAMP,
    source VARCHAR(100) DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    partnership_type VARCHAR(100) NOT NULL,
    investment_range VARCHAR(100),
    message TEXT,
    revenue VARCHAR(100),
    employees VARCHAR(50),
    status VARCHAR(20) DEFAULT 'new',
    priority VARCHAR(20) DEFAULT 'high',
    assigned_to INTEGER,
    meeting_scheduled TIMESTAMP,
    follow_up_date TIMESTAMP,
    estimated_value DECIMAL(15,2),
    probability_score INTEGER DEFAULT 50,
    source VARCHAR(100) DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for JWT management
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    refresh_token VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    source VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuration settings
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON waitlist(priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);

CREATE INDEX IF NOT EXISTS idx_partnerships_email ON partnerships(email);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_type ON partnerships(partnership_type);
CREATE INDEX IF NOT EXISTS idx_partnerships_created ON partnerships(created_at);
CREATE INDEX IF NOT EXISTS idx_partnerships_priority ON partnerships(priority);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_source ON system_logs(source);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);

-- Insert default settings
INSERT INTO settings (key, value, type, description, is_public) VALUES 
('site_name', 'KRYONIX', 'string', 'Site name', true),
('site_description', 'Plataforma SaaS 100% Autônoma por IA', 'string', 'Site description', true),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode flag', false),
('max_login_attempts', '5', 'integer', 'Maximum login attempts before lockout', false),
('lockout_duration', '30', 'integer', 'Lockout duration in minutes', false),
('jwt_expiry', '7d', 'string', 'JWT token expiry time', false),
('registration_enabled', 'true', 'boolean', 'Allow new user registration', false),
('email_verification_required', 'false', 'boolean', 'Require email verification', false),
('waitlist_enabled', 'true', 'boolean', 'Enable waitlist functionality', true),
('partnership_inquiries_enabled', 'true', 'boolean', 'Enable partnership inquiries', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (name, subject, body_html, body_text, variables) VALUES 
('welcome', 'Bem-vindo ao KRYONIX!', 
 '<h1>Bem-vindo, {{name}}!</h1><p>Obrigado por se registrar no KRYONIX.</p>', 
 'Bem-vindo, {{name}}! Obrigado por se registrar no KRYONIX.',
 '{"name": "string"}'::jsonb),
('waitlist_confirmation', 'Você está na nossa lista de espera!', 
 '<h1>Obrigado, {{name}}!</h1><p>Você está na posição #{{position}} da nossa lista de espera.</p>', 
 'Obrigado, {{name}}! Você está na posição #{{position}} da nossa lista de espera.',
 '{"name": "string", "position": "number"}'::jsonb),
('partnership_inquiry', 'Nova consulta de parceria', 
 '<h1>Nova consulta de parceria</h1><p>De: {{name}} ({{email}})</p><p>Tipo: {{partnership_type}}</p>', 
 'Nova consulta de parceria de {{name}} ({{email}}) - Tipo: {{partnership_type}}',
 '{"name": "string", "email": "string", "partnership_type": "string"}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON partnerships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate waitlist position
CREATE OR REPLACE FUNCTION update_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
    -- Update position for new entries
    NEW.position = (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist WHERE id != NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for waitlist position
CREATE TRIGGER update_waitlist_position_trigger BEFORE INSERT ON waitlist 
    FOR EACH ROW EXECUTE FUNCTION update_waitlist_position();

-- Views for analytics
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events 
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW daily_stats AS
SELECT 
    DATE(created_at) as date,
    'users' as metric,
    COUNT(*) as value
FROM users 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)

UNION ALL

SELECT 
    DATE(created_at) as date,
    'waitlist' as metric,
    COUNT(*) as value
FROM waitlist 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)

UNION ALL

SELECT 
    DATE(created_at) as date,
    'contacts' as metric,
    COUNT(*) as value
FROM contacts 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)

UNION ALL

SELECT 
    DATE(created_at) as date,
    'partnerships' as metric,
    COUNT(*) as value
FROM partnerships 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)

ORDER BY date DESC, metric;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kryonix_admin;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kryonix_admin;

-- Final verification
SELECT 'Database schema initialized successfully' as status;
